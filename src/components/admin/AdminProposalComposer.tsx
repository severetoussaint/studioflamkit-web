'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, FileText, Send, X } from 'lucide-react';
import type { Proposal, ProposalStatus } from '@/types/domain.types';
import { createProposal, getCurrentProposalForRequest, sendProposal, updateProposal } from '@/services/proposal.service';
import type { AdminFollowUpItem } from '@/services/follow-up.service';

interface AdminProposalComposerProps {
  item: AdminFollowUpItem;
  onClose: () => void;
  onChanged?: () => void;
}

function toDateInput(value: string | null | undefined): string {
  if (!value) return '';
  return value.slice(0, 10);
}

function statusLabel(status: ProposalStatus): string {
  switch (status) {
    case 'pending': return 'Borrador / pendiente';
    case 'accepted': return 'Aceptada';
    case 'rejected': return 'Rechazada';
    case 'expired': return 'Expirada';
  }
}

export function AdminProposalComposer({ item, onClose, onChanged }: AdminProposalComposerProps) {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [amount, setAmount] = useState('');
  const [services, setServices] = useState('');
  const [revisionsIncluded, setRevisionsIncluded] = useState('3');
  const [deadline, setDeadline] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    void getCurrentProposalForRequest(item.request.id)
      .then((current) => {
        if (!mounted) return;
        setProposal(current);
        setAmount(current ? String(current.amount) : '');
        setServices(current?.services ? JSON.stringify(current.services, null, 2) : '');
        setRevisionsIncluded(String(current?.revisionsIncluded ?? 3));
        setDeadline(toDateInput(current?.deadline));
        setExpiresAt(toDateInput(current?.expiresAt));
      })
      .catch((loadError) => {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la propuesta.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [item.request.id]);

  function parseServices(): unknown {
    const raw = services.trim();
    if (!raw) throw new Error('Describe los servicios incluidos en la propuesta.');
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (proposal?.status && proposal.status !== 'pending') {
        throw new Error('Esta propuesta ya no puede editarse porque salió del estado pendiente.');
      }

      const parsedAmount = Number(amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
        throw new Error('El monto debe ser un número válido mayor o igual a cero.');
      }

      const input = {
        amount: parsedAmount,
        currency: 'USD',
        services: parseServices() as never,
        revisionsIncluded: Number(revisionsIncluded) || 0,
        deadline: deadline ? new Date(`${deadline}T23:59:59`).toISOString() : null,
        expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
      };

      const savedProposal = proposal
        ? await updateProposal(proposal.id, input)
        : await createProposal({ requestId: item.request.id, ...input });

      setProposal(savedProposal);
      setSuccess('Propuesta guardada como pendiente.');
      onChanged?.();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la propuesta.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSend() {
    if (!proposal) {
      setError('Guarda primero la propuesta como borrador.');
      return;
    }
    if (proposal.status !== 'pending') {
      setError('Solo se puede enviar una propuesta pendiente.');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      const sent = await sendProposal(proposal.id);
      setProposal(sent);
      setSuccess('Propuesta enviada al autor.');
      onChanged?.();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'No se pudo enviar la propuesta.');
    } finally {
      setSending(false);
    }
  }

  const locked = !!proposal && proposal.status !== 'pending';

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && !sending && onClose()} />
      <div className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Etapa de propuesta</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-[var(--color-text)]">{item.title}</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Autor: {item.client}</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving || sending} className="rounded-xl border border-[var(--color-border)] p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[var(--color-text-muted)]">Cargando propuesta…</div>
        ) : (
          <>
            <div className="mt-6 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"><FileText className="h-4 w-4" /> Propuesta formal</span>
                {proposal && <span className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">{statusLabel(proposal.status)}</span>}
              </div>
              <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">La propuesta es la oferta comercial para el autor. Guardarla no crea un proyecto; enviarla tampoco crea un proyecto.</p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5"><span className="block text-xs font-medium text-[var(--color-text-secondary)]">Monto (USD)</span><input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={locked} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] disabled:opacity-60" /></label>
              <label className="space-y-1.5"><span className="block text-xs font-medium text-[var(--color-text-secondary)]">Revisiones incluidas</span><input type="number" min="0" value={revisionsIncluded} onChange={(event) => setRevisionsIncluded(event.target.value)} disabled={locked} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] disabled:opacity-60" /></label>
              <label className="space-y-1.5"><span className="block text-xs font-medium text-[var(--color-text-secondary)]">Plazo</span><input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} disabled={locked} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] disabled:opacity-60" /></label>
              <label className="space-y-1.5"><span className="block text-xs font-medium text-[var(--color-text-secondary)]">Fecha de expiración</span><input type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} disabled={locked} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] disabled:opacity-60" /></label>
            </div>

            <label className="mt-4 block space-y-1.5"><span className="block text-xs font-medium text-[var(--color-text-secondary)]">Servicios incluidos</span><textarea rows={8} value={services} onChange={(event) => setServices(event.target.value)} disabled={locked} placeholder='Ej.: ["Producción de audiolibro", "Edición de voz", "Master final"]' className="w-full resize-y rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm leading-6 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] disabled:opacity-60" /><span className="block text-[11px] text-[var(--color-text-muted)]">Puedes escribir una lista JSON o texto libre; la propuesta se guarda en `proposals`.</span></label>

            {error && <p className="mt-4 rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] p-3 text-xs text-[var(--color-error)]">{error}</p>}
            {success && <p className="mt-4 rounded-xl border border-[var(--color-success)]/20 bg-[var(--color-success-soft)] p-3 text-xs font-medium text-[var(--color-success)]"><CheckCircle2 className="mr-1 inline h-4 w-4" />{success}</p>}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} disabled={saving || sending} className="rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] disabled:opacity-50">Cerrar</button>
              {!locked && <button type="button" onClick={() => void handleSave()} disabled={saving || sending} className="rounded-xl border border-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--color-accent)] disabled:opacity-50">{saving ? 'Guardando…' : proposal ? 'Guardar cambios' : 'Guardar borrador'}</button>}
              {proposal?.status === 'pending' && <button type="button" onClick={() => void handleSend()} disabled={saving || sending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Send className="h-4 w-4" />{sending ? 'Enviando…' : 'Enviar propuesta'}</button>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
