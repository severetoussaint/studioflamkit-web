'use client';

import { useEffect, useState } from 'react';
import type { Evaluation, EvaluationResult, ProjectRequest } from '@/types/domain.types';
import { createEvaluation, getEvaluationByRequest, markEvaluationEmailSent, updateEvaluation } from '@/services/evaluation.service';
import { getProjectRequestAuthorContact, updateProjectRequestReviewStatus } from '@/services/request.service';
import { createNotification } from '@/services/notification.service';
import { sendStudioFlamkitEmail } from '@/services/zoho-mail.service';

interface AdminEvaluationPanelProps {
  requestId: string;
  onRequestUpdated?: (updatedRequest: ProjectRequest) => void;
}

const resultOptions: Array<{ value: EvaluationResult; label: string }> = [
  { value: 'approved', label: 'Aprobado' },
  { value: 'approved_with_notes', label: 'Aprobado con observaciones' },
  { value: 'rejected', label: 'Rechazado' },
];

const defaultRejectionMessage =
  'Después de revisar tu manuscrito y la información proporcionada, Studio FLAMKIT ha decidido no continuar con esta solicitud en esta ocasión. Gracias por confiar en nuestro equipo editorial.';

const rejectionSubject = 'Actualización sobre tu proyecto en Studio FLAMKIT';

export function AdminEvaluationPanel({ requestId, onRequestUpdated }: AdminEvaluationPanelProps) {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [feasibility, setFeasibility] = useState('');
  const [narrativeQuality, setNarrativeQuality] = useState('');
  const [technicalDifficulty, setTechnicalDifficulty] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [observations, setObservations] = useState('');
  const [result, setResult] = useState<EvaluationResult | ''>('');
  const [authorMessage, setAuthorMessage] = useState(defaultRejectionMessage);
  const [rejectionConfirmOpen, setRejectionConfirmOpen] = useState(false);
  const [emailComposerOpen, setEmailComposerOpen] = useState(false);
  const [authorEmail, setAuthorEmail] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const current = await getEvaluationByRequest(requestId);
        if (!mounted) return;
        setEvaluation(current);
        setFeasibility(current?.feasibility ?? '');
        setNarrativeQuality(current?.narrativeQuality ?? '');
        setTechnicalDifficulty(current?.technicalDifficulty ?? '');
        setEstimatedTime(current?.estimatedTime ?? '');
        setObservations(current?.observations ?? '');
        setResult(current?.result ?? '');
        setAuthorMessage(current?.authorMessage || defaultRejectionMessage);
        setEmailSent(Boolean(current?.emailSentAt));
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el análisis.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [requestId]);

  async function persistAnalysis() {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const nextInput = {
        feasibility: feasibility.trim() || null,
        narrativeQuality: narrativeQuality.trim() || null,
        technicalDifficulty: technicalDifficulty.trim() || null,
        estimatedTime: estimatedTime.trim() || null,
        observations: observations.trim() || null,
        result: result || null,
        authorMessage: authorMessage.trim() || null,
      };

      const previousResult = evaluation?.result ?? null;
      const next = evaluation
        ? await updateEvaluation(evaluation.id, nextInput)
        : await createEvaluation({ requestId, ...nextInput });

      setEvaluation(next);
      setResult(next.result ?? '');
      setAuthorMessage(next.authorMessage || defaultRejectionMessage);
      setEmailSent(Boolean(next.emailSentAt));

      if (next.result && previousResult !== next.result) {
        const contact = await getProjectRequestAuthorContact(requestId);

        if (contact?.id) {
          if (next.result === 'approved' || next.result === 'approved_with_notes') {
            const acceptedRequest = await updateProjectRequestReviewStatus(requestId, 'accepted');
            onRequestUpdated?.(acceptedRequest);

            await createNotification({
              authorId: contact.id,
              title: next.result === 'approved' ? 'Tu obra avanza a la siguiente etapa' : 'Tu obra avanza con observaciones',
              message: next.result === 'approved'
                ? 'El análisis editorial ha concluido favorablemente. Studio FLAMKIT preparará la siguiente etapa de tu propuesta.'
                : 'El análisis editorial ha concluido y tu obra puede avanzar. Studio FLAMKIT ha registrado observaciones que se tendrán en cuenta en la siguiente etapa.',
            });
          } else if (next.result === 'rejected') {
            const rejectedRequest = await updateProjectRequestReviewStatus(requestId, 'rejected');
            onRequestUpdated?.(rejectedRequest);
            await createNotification({
              authorId: contact.id,
              title: 'Actualización sobre tu solicitud',
              message: authorMessage.trim() || defaultRejectionMessage,
            });
            setAuthorEmail(contact.email);
            setAuthorName(contact.fullName);
          }
        } else if (next.result === 'approved' || next.result === 'approved_with_notes') {
          const acceptedRequest = await updateProjectRequestReviewStatus(requestId, 'accepted');
          onRequestUpdated?.(acceptedRequest);
        } else if (next.result === 'rejected') {
          const rejectedRequest = await updateProjectRequestReviewStatus(requestId, 'rejected');
          onRequestUpdated?.(rejectedRequest);
        }
      }

      if (next.result === 'rejected') {
        const contact = await getProjectRequestAuthorContact(requestId);
        if (contact) {
          setAuthorEmail(contact.email);
          setAuthorName(contact.fullName);
        }
      }

      setSaved(true);
      return next;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el análisis.');
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function confirmRejection() {
    const next = await persistAnalysis();
    if (!next || next.result !== 'rejected') return;

    setRejectionConfirmOpen(false);
    setEmailComposerOpen(true);
  }

  async function handleSendEmail() {
    if (!authorEmail) {
      setError('No encontramos un correo válido para el autor. La decisión ya fue guardada y notificada dentro del Dashboard.');
      return;
    }

    setSendingEmail(true);
    setError(null);
    try {
      await sendStudioFlamkitEmail({
        toAddress: authorEmail,
        subject: rejectionSubject,
        content: authorMessage.trim() || defaultRejectionMessage,
      });
      if (evaluation?.id) {
        await markEvaluationEmailSent(evaluation.id);
        setEvaluation((current) => current ? { ...current, emailSentAt: new Date().toISOString(), authorMessage } : current);
      }
      setEmailSent(true);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'No se pudo enviar el correo por Zoho Mail.');
    } finally {
      setSendingEmail(false);
    }
  }

  function handleSave() {
    if (result === 'rejected' && evaluation?.result !== 'rejected') {
      setError(null);
      setRejectionConfirmOpen(true);
      return;
    }
    void persistAnalysis();
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-4 text-sm text-[var(--color-text-muted)]">
        Cargando análisis interno…
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-5">
      <div className="mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Análisis interno</p>
        <h3 className="mt-1 font-serif text-lg font-semibold text-[var(--color-text)]">Evaluación editorial</h3>
        <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">Este contenido es interno y sirve para decidir si la solicitud puede avanzar a una propuesta.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['Viabilidad', feasibility, setFeasibility],
          ['Calidad narrativa', narrativeQuality, setNarrativeQuality],
          ['Dificultad técnica', technicalDifficulty, setTechnicalDifficulty],
          ['Tiempo estimado', estimatedTime, setEstimatedTime],
        ].map(([label, value, setter]) => (
          <label key={label as string} className="space-y-1.5">
            <span className="block text-xs font-medium text-[var(--color-text-secondary)]">{label as string}</span>
            <input
              value={value as string}
              onChange={(event) => (setter as (next: string) => void)(event.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
            />
          </label>
        ))}
      </div>

      <label className="mt-4 block space-y-1.5">
        <span className="block text-xs font-medium text-[var(--color-text-secondary)]">Observaciones internas</span>
        <textarea
          rows={5}
          value={observations}
          onChange={(event) => setObservations(event.target.value)}
          className="w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
          placeholder="Notas de análisis, viabilidad, riesgos y aspectos a considerar para la propuesta…"
        />
      </label>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="space-y-1.5">
          <span className="block text-xs font-medium text-[var(--color-text-secondary)]">Resultado</span>
          <select
            value={result}
            onChange={(event) => setResult(event.target.value as EvaluationResult | '')}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
          >
            <option value="">Todavía en análisis</option>
            {resultOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar análisis'}
        </button>
      </div>

      {saved && <p className="mt-3 text-xs font-medium text-[var(--color-success)]">Análisis guardado correctamente.</p>}
      {error && <p className="mt-3 text-xs text-[var(--color-error)]">{error}</p>}

      {rejectionConfirmOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && setRejectionConfirmOpen(false)} />
          <div className="relative z-10 w-full max-w-xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-2xl sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-300">Decisión final</p>
            <h4 className="mt-1 font-serif text-2xl font-semibold text-[var(--color-text)]">Confirmar rechazo de la solicitud</h4>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Al confirmar, la solicitud quedará cerrada, el Dashboard del autor reflejará el rechazo y se generará su notificación. Después tendrás una segunda ventana para enviar el correo oficial.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" disabled={saving} onClick={() => setRejectionConfirmOpen(false)} className="rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-50">Cancelar</button>
              <button type="button" disabled={saving} onClick={() => void confirmRejection()} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Confirmando…' : 'Confirmar rechazo'}</button>
            </div>
          </div>
        </div>
      )}

      {emailComposerOpen && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !sendingEmail && setEmailComposerOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-2xl sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Comunicación al autor</p>
            <h4 className="mt-1 font-serif text-2xl font-semibold text-[var(--color-text)]">Enviar correo oficial</h4>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">La decisión ya está guardada. Este correo es un paso independiente y opcional.</p>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"><span className="font-medium text-[var(--color-text)]">Para:</span> {authorEmail || 'Correo del autor no disponible'}{authorName ? <span className="ml-2 text-[var(--color-text-muted)]">({authorName})</span> : null}</div>
              <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"><span className="font-medium text-[var(--color-text)]">Asunto:</span> {rejectionSubject}</div>
              <label className="block space-y-2"><span className="text-xs font-medium text-[var(--color-text-secondary)]">Mensaje</span><textarea rows={8} value={authorMessage} onChange={(event) => setAuthorMessage(event.target.value)} className="w-full resize-y rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm leading-6 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" /></label>
            </div>

            {emailSent && <p className="mt-3 text-xs font-medium text-[var(--color-success)]">Este correo ya fue enviado.</p>}
            {emailSent ? (
              <div className="mt-6 flex justify-end"><button type="button" onClick={() => setEmailComposerOpen(false)} className="rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white">Cerrar</button></div>
            ) : (
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" disabled={sendingEmail} onClick={() => setEmailComposerOpen(false)} className="rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-50">Ahora no</button>
                <button type="button" disabled={sendingEmail || !authorEmail || !authorMessage.trim()} onClick={() => void handleSendEmail()} className="rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50">{sendingEmail ? 'Enviando…' : 'Enviar correo'}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
