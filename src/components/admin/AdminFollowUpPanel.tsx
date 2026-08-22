'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BellRing, CheckCircle2, Clock3, Mail, RotateCcw, Send } from 'lucide-react';
import type { AdminFollowUpItem } from '@/services/follow-up.service';
import { listAdminFollowUps, markFollowUpEmailSent, saveFollowUpNote } from '@/services/follow-up.service';
import { sendStudioFlamkitEmail } from '@/services/zoho-mail.service';
import { AdminProposalComposer } from '@/components/admin/AdminProposalComposer';

interface AdminFollowUpPanelProps {
  refreshKey?: number;
}

type Filter = 'all' | 'pending' | 'proposal' | 'history';
const rejectionSubject = 'Actualización sobre tu proyecto en Studio FLAMKIT';

export function AdminFollowUpPanel({ refreshKey = 0 }: AdminFollowUpPanelProps) {
  const [items, setItems] = useState<AdminFollowUpItem[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [selectedEmailItem, setSelectedEmailItem] = useState<AdminFollowUpItem | null>(null);
  const [selectedProposalItem, setSelectedProposalItem] = useState<AdminFollowUpItem | null>(null);
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const next = await listAdminFollowUps();
      setItems(next);
      setNoteDrafts(Object.fromEntries(next.map((item) => [item.request.id, item.followUpNote ?? ''])));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el seguimiento.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadData(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshKey]);

  const counts = useMemo(() => ({
    all: items.length,
    pending: items.filter((item) => item.category === 'email_pending').length,
    proposal: items.filter((item) => item.category === 'proposal_ready').length,
    history: items.filter((item) => item.category === 'history').length,
  }), [items]);

  const visibleItems = useMemo(() => {
    if (filter === 'pending') return items.filter((item) => item.category === 'email_pending');
    if (filter === 'proposal') return items.filter((item) => item.category === 'proposal_ready');
    if (filter === 'history') return items.filter((item) => item.category === 'history');
    return items;
  }, [filter, items]);

  async function handleSaveNote(item: AdminFollowUpItem) {
    if (!item.evaluationId) return;
    setSavingNoteId(item.request.id);
    setError(null);
    try {
      await saveFollowUpNote(item.evaluationId, noteDrafts[item.request.id] ?? '');
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la nota.');
    } finally {
      setSavingNoteId(null);
    }
  }

  function openEmail(item: AdminFollowUpItem) {
    setSelectedEmailItem(item);
    setEmailBody(item.authorMessage ?? '');
    setEmailError(null);
    setEmailSent(false);
  }

  async function handleSendEmail() {
    if (!selectedEmailItem?.email) {
      setEmailError('No encontramos un correo válido para el autor.');
      return;
    }
    if (!selectedEmailItem.evaluationId) {
      setEmailError('Este expediente no tiene una evaluación persistida.');
      return;
    }

    setSendingEmail(true);
    setEmailError(null);
    try {
      await sendStudioFlamkitEmail({
        toAddress: selectedEmailItem.email,
        subject: rejectionSubject,
        content: emailBody.trim(),
      });
      await markFollowUpEmailSent(selectedEmailItem.evaluationId);
      setEmailSent(true);
      await loadData();
    } catch (sendError) {
      setEmailError(sendError instanceof Error ? sendError.message : 'No se pudo enviar el correo.');
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            <BellRing className="h-3.5 w-3.5" /> Seguimiento
          </div>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">Casos que requieren tu atención</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">Solicitudes que ya salieron de Cotizaciones pero todavía requieren una acción administrativa.</p>
        </div>
        <button type="button" onClick={() => void loadData()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-4 py-2.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-50">
          <RotateCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          ['all', `Todos (${counts.all})`, BellRing],
          ['pending', `Correos pendientes (${counts.pending})`, Mail],
          ['proposal', `Listos para propuesta (${counts.proposal})`, ArrowRight],
          ['history', `Historial (${counts.history})`, CheckCircle2],
        ] as const).map(([value, label, Icon]) => (
          <button key={value} type="button" onClick={() => setFilter(value)} className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition ${filter === value ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]' : 'border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/30'}`}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {error && <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">{error}</div>}

      {loading ? (
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-16 text-center text-sm text-[var(--color-text-muted)]">Cargando seguimiento…</div>
      ) : visibleItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-16 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-[var(--color-text-muted)]" />
          <p className="mt-4 font-medium text-[var(--color-text)]">No hay casos en esta vista.</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Cuando una solicitud necesite seguimiento, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {visibleItems.map((item) => (
            <article key={item.request.id} className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{item.category === 'email_pending' ? 'Comunicación pendiente' : item.category === 'proposal_ready' ? 'Siguiente etapa' : 'Historial'}</p>
                  <h3 className="mt-1 font-serif text-xl font-semibold text-[var(--color-text)]">{item.title}</h3>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{item.client}</p>
                </div>
                <span className="inline-flex shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                  {item.result === 'rejected' ? 'Rechazada' : item.result === 'approved_with_notes' ? 'Aprobada con observaciones' : 'Aprobada'}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {item.category === 'email_pending' && (
                  <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div><p className="font-medium text-[var(--color-text)]">Correo de rechazo pendiente</p><p className="mt-0.5 text-xs leading-5 text-[var(--color-text-muted)]">El rechazo está guardado y este caso permanece disponible para comunicación y para preparar una nueva versión de la propuesta.</p></div>
                  </div>
                )}
                {item.category === 'proposal_ready' && (
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div><p className="font-medium text-[var(--color-text)]">Listo para preparar la propuesta</p><p className="mt-0.5 text-xs leading-5 text-[var(--color-text-muted)]">La evaluación concluyó favorablemente y el siguiente paso es comercial.</p></div>
                  </div>
                )}
                {item.email && <p className="text-xs text-[var(--color-text-muted)]"><span className="font-medium text-[var(--color-text)]">Autor:</span> {item.email}</p>}
                {item.followUpNote && <p className="text-xs leading-5 text-[var(--color-text-muted)]"><span className="font-medium text-[var(--color-text)]">Nota:</span> {item.followUpNote}</p>}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {item.category === 'email_pending' && (
                  <>
                    <button type="button" onClick={() => openEmail(item)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[var(--color-accent-hover)]"><Mail className="h-3.5 w-3.5" /> Enviar correo</button>
                    <button type="button" onClick={() => setSelectedProposalItem(item)} className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent-soft)] px-4 py-2.5 text-xs font-semibold text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white"><Send className="h-3.5 w-3.5" /> Preparar nueva propuesta</button>
                  </>
                )}
                {item.category === 'proposal_ready' && (
                  <button type="button" onClick={() => setSelectedProposalItem(item)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[var(--color-accent-hover)]"><Send className="h-3.5 w-3.5" /> Preparar propuesta</button>
                )}
              </div>

              {item.category === 'email_pending' && item.evaluationId && (
                <div className="mt-4 border-t border-[var(--color-border-subtle)] pt-4">
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)]">Nota interna de seguimiento</label>
                  <textarea rows={2} value={noteDrafts[item.request.id] ?? ''} onChange={(event) => setNoteDrafts((prev: Record<string, string>) => ({ ...prev, [item.request.id]: event.target.value }))} placeholder="Ej.: Revisar con el equipo el jueves…" className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
                  <button type="button" onClick={() => void handleSaveNote(item)} disabled={savingNoteId === item.request.id} className="mt-2 rounded-xl border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] disabled:opacity-50">{savingNoteId === item.request.id ? 'Guardando…' : 'Guardar nota'}</button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {selectedEmailItem && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !sendingEmail && setSelectedEmailItem(null)} />
          <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-2xl sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Comunicación al autor</p>
            <h4 className="mt-1 font-serif text-2xl font-semibold text-[var(--color-text)]">Enviar correo oficial</h4>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">El rechazo ya está registrado; el envío del correo es un paso independiente.</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"><span className="font-medium text-[var(--color-text)]">Para:</span> {selectedEmailItem.email || 'Correo no disponible'}</div>
              <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"><span className="font-medium text-[var(--color-text)]">Asunto:</span> {rejectionSubject}</div>
              <label className="block space-y-2"><span className="text-xs font-medium text-[var(--color-text-secondary)]">Mensaje</span><textarea rows={8} value={emailBody} onChange={(event) => setEmailBody(event.target.value)} className="w-full resize-y rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm leading-6 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" /></label>
            </div>
            {emailError && <p className="mt-3 text-xs text-[var(--color-error)]">{emailError}</p>}
            {emailSent && <p className="mt-3 text-xs font-medium text-[var(--color-success)]">Correo enviado y registrado.</p>}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" disabled={sendingEmail} onClick={() => setSelectedEmailItem(null)} className="rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] disabled:opacity-50">Ahora no</button>
              <button type="button" disabled={sendingEmail || !selectedEmailItem.email || !emailBody.trim()} onClick={() => void handleSendEmail()} className="rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50">{sendingEmail ? 'Enviando…' : 'Enviar correo'}</button>
            </div>
          </div>
        </div>
      )}

      {selectedProposalItem && (
        <AdminProposalComposer
          item={selectedProposalItem}
          onClose={() => setSelectedProposalItem(null)}
          onChanged={() => { void loadData(); }}
        />
      )}
    </section>
  );
}
