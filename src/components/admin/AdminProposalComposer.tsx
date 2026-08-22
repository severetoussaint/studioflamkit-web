'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, FileText, Send, X } from 'lucide-react';
import type { Proposal } from '@/types/domain.types';
import { createProposal, createProposalVersion, getProposal, listProposals, sendProposal, updateProposal } from '@/services/proposal.service';
import type { AdminFollowUpItem } from '@/services/follow-up.service';
import { listPricingServices, getPricingSettings } from '@/services/pricing.service';
import { calculatePricing } from '@/domain/pricing/pricing.engine';
import type { PricingComplexity, PricingService, PricingSelection, PricingSettings, PricingCalculationResult } from '@/domain/pricing/pricing.types';
import { supabaseClient } from '@/lib/supabase/client';

interface AdminProposalComposerProps {
  item: AdminFollowUpItem;
  onClose: () => void;
  onChanged?: () => void;
}

function toDateInput(value: string | null | undefined): string {
  if (!value) return '';
  return value.slice(0, 10);
}

function statusLabel(proposal: Proposal | null | undefined): string {
  if (!proposal) return '';
  if (proposal.status === 'accepted') return 'Aceptada';
  if (proposal.status === 'rejected') return 'Rechazada';
  if (proposal.status === 'expired') return 'Expirada';
  if (proposal.status === 'superseded') return 'Reemplazada';
  if (proposal.status === 'pending') {
    return proposal.sentAt ? 'Enviada' : 'Borrador';
  }
  return proposal.status;
}

function currency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function getProposalSnapshot(value: unknown): { selections?: PricingSelection[]; complexity?: PricingComplexity; commercialAdjustment?: number } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  const selections = Array.isArray(record.selections)
    ? record.selections.filter((selection): selection is PricingSelection => {
        if (!selection || typeof selection !== 'object') return false;
        const candidate = selection as Record<string, unknown>;
        return typeof candidate.serviceCode === 'string';
      }).map((selection) => ({
        serviceCode: selection.serviceCode,
        quantity: typeof selection.quantity === 'number' ? selection.quantity : undefined,
      }))
    : undefined;

  const complexity = ['standard', 'medium', 'high', 'cinematic'].includes(String(record.complexity))
    ? String(record.complexity) as PricingComplexity
    : undefined;

  const commercialAdjustment = typeof record.commercialAdjustment === 'number' ? record.commercialAdjustment : undefined;

  return { selections, complexity, commercialAdjustment };
}

const complexityLabels: Record<PricingComplexity, string> = {
  standard: 'Estándar',
  medium: 'Media',
  high: 'Alta',
  cinematic: 'Cinematográfica',
};

export function AdminProposalComposer({ item, onClose, onChanged }: AdminProposalComposerProps) {
  const [allProposals, setAllProposals] = useState<Proposal[]>([]);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loadedRequestId, setLoadedRequestId] = useState<string | null>(null);
  const [pricingSettings, setPricingSettings] = useState<PricingSettings | null>(null);
  const [pricingServices, setPricingServices] = useState<PricingService[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const [chapterCount, setChapterCount] = useState(1);
  const [amount, setAmount] = useState('');
  const [revisionsIncluded, setRevisionsIncluded] = useState('3');
  const [deadline, setDeadline] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [complexity, setComplexity] = useState<PricingComplexity>('standard');
  const [commercialAdjustment, setCommercialAdjustment] = useState(0);
  const [selections, setSelections] = useState<PricingSelection[]>([]);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loading = loadedRequestId !== item.request.id;

  function populateFormFromProposal(target: Proposal | null) {
    const snapshot = getProposalSnapshot(target?.services);
    setSelections(snapshot.selections ?? []);
    setComplexity(snapshot.complexity ?? 'standard');
    setCommercialAdjustment(snapshot.commercialAdjustment ?? 0);
    setAmount(target ? String(target.amount) : '');
    setRevisionsIncluded(String(target?.revisionsIncluded ?? 3));
    setDeadline(toDateInput(target?.deadline));
    setExpiresAt(toDateInput(target?.expiresAt));
  }

  function selectProposalVersion(p: Proposal) {
    setProposal(p);
    populateFormFromProposal(p);
    setError(null);
    setSuccess(null);
  }

  async function handleCreateVersion() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const newProposalId = await createProposalVersion(item.request.id, proposal?.id);
      const updatedList = await listProposals(item.request.id);
      setAllProposals(updatedList);
      const newProp = updatedList.find((p) => p.id === newProposalId) ?? await getProposal(newProposalId);
      if (!newProp) throw new Error('No se pudo cargar la nueva versión de la propuesta.');

      setProposal(newProp);
      populateFormFromProposal(newProp);
      setSuccess(`Propuesta v${newProp.version} creada como borrador.`);
      onChanged?.();
    } catch (versionError) {
      setError(versionError instanceof Error ? versionError.message : 'No se pudo crear la nueva versión.');
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    void Promise.all([
      listProposals(item.request.id),
      getPricingSettings(),
      listPricingServices({ activeOnly: true }),
      supabaseClient.from('manuscripts').select('word_count').eq('id', item.request.manuscriptId).maybeSingle(),
    ])
      .then(([proposalsList, settings, servicesResult, manuscriptResult]) => {
        if (!mounted) return;

        setAllProposals(proposalsList);
        const current = proposalsList.find((p) => p.status === 'pending')
          ?? proposalsList.find((p) => p.status === 'accepted')
          ?? proposalsList[0]
          ?? null;

        setProposal(current);
        setPricingSettings(settings);
        setPricingServices(servicesResult);
        setWordCount(Number(manuscriptResult.data?.word_count ?? 0));

        populateFormFromProposal(current);
        setError(null);
        setSuccess(null);
        setLoadedRequestId(item.request.id);
      })
      .catch((loadError) => {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la configuración de la propuesta.');
        setLoadedRequestId(item.request.id);
      });

    return () => { mounted = false; };
  }, [item.request.id, item.request.manuscriptId]);

  const calculation: PricingCalculationResult | null = useMemo(() => {
    if (!pricingSettings) return null;
    return calculatePricing(pricingSettings, pricingServices, {
      wordCount,
      chapterCount,
      complexity,
      selections,
      commercialAdjustment,
    });
  }, [pricingSettings, pricingServices, wordCount, chapterCount, complexity, selections, commercialAdjustment]);

  const groupedServices = useMemo(() => {
    const groups = new Map<string, PricingService[]>();
    for (const service of pricingServices) {
      const bucket = groups.get(service.category) ?? [];
      bucket.push(service);
      groups.set(service.category, bucket);
    }
    return [...groups.entries()];
  }, [pricingServices]);

  function setServiceSelection(service: PricingService, checked: boolean) {
    if (!checked) {
      setSelections((current) => current.filter((selection) => selection.serviceCode !== service.code));
      return;
    }

    setSelections((current) => [
      ...current.filter((selection) => selection.serviceCode !== service.code),
      { serviceCode: service.code, quantity: service.defaultQuantity },
    ]);
  }

  function updateQuantity(serviceCode: string, quantity: number) {
    setSelections((current) => current.map((selection) => (
      selection.serviceCode === serviceCode ? { ...selection, quantity } : selection
    )));
  }

  function isSelected(serviceCode: string): boolean {
    return selections.some((selection) => selection.serviceCode === serviceCode);
  }

  function parseFinalAmount(): number {
    const recommended = calculation?.finalPrice ?? 0;
    const manual = amount.trim() === '' ? recommended : Number(amount);
    if (!Number.isFinite(manual) || manual < 0) throw new Error('El precio final debe ser un número válido mayor o igual a cero.');
    return Math.round(manual * 100) / 100;
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (proposal?.status && proposal.status !== 'pending') {
        throw new Error('Esta propuesta ya no puede editarse porque salió del estado pendiente.');
      }
      if (!calculation) throw new Error('El motor de precios todavía no está disponible.');

      const finalAmount = parseFinalAmount();
      const servicesSnapshot = {
        pricingVersion: calculation.pricingVersion,
        selections,
        complexity,
        commercialAdjustment,
        calculation,
      };

      const input = {
        amount: finalAmount,
        currency: 'USD',
        services: servicesSnapshot,
        revisionsIncluded: Number(revisionsIncluded) || 0,
        deadline: deadline ? new Date(`${deadline}T23:59:59`).toISOString() : null,
        expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
      };

      const savedProposal = proposal
        ? await updateProposal(proposal.id, input)
        : await createProposal({ requestId: item.request.id, ...input });

      setProposal(savedProposal);
      setAmount(String(savedProposal.amount));
      setSuccess('Propuesta guardada como pendiente con su cálculo congelado.');

      const updatedList = await listProposals(item.request.id);
      setAllProposals(updatedList);
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

      const updatedList = await listProposals(item.request.id);
      setAllProposals(updatedList);
      onChanged?.();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'No se pudo enviar la propuesta.');
    } finally {
      setSending(false);
    }
  }

  const locked = !proposal || proposal.status !== 'pending' || !!proposal.sentAt;
  const canCreateNewVersion = !!proposal && proposal.status !== 'accepted';

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && !sending && onClose()} />
      <div className="relative z-10 max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">Etapa de propuesta</p>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-[var(--color-text)]">{item.title}</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Autor: {item.client}</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving || sending} className="rounded-xl border border-[var(--color-border)] p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[var(--color-text-muted)]">Cargando propuesta y motor de precios…</div>
        ) : (
          <>
            <div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
              <div className="space-y-5">
                <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                      <FileText className="h-4 w-4" /> Configurador de producción {proposal ? `(v${proposal.version ?? 1})` : ''}
                    </span>
                    {proposal && <span className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-text-secondary)]">{statusLabel(proposal)}</span>}
                  </div>

                  {allProposals.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-border-subtle)] pt-3">
                      <div className="flex items-center gap-1.5 overflow-x-auto">
                        <span className="text-[11px] font-medium text-[var(--color-text-muted)]">Versiones:</span>
                        {allProposals.map((p) => {
                          const isActive = proposal?.id === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => selectProposalVersion(p)}
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition ${
                                isActive
                                  ? 'bg-[var(--color-accent)] text-white shadow-xs'
                                  : 'border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                              }`}
                            >
                              v{p.version ?? 1} ({statusLabel(p)})
                            </button>
                          );
                        })}
                      </div>

                      {canCreateNewVersion && (
                        <button
                          type="button"
                          disabled={saving || sending}
                          onClick={() => void handleCreateVersion()}
                          className="rounded-xl bg-[var(--color-accent-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--color-accent)] transition hover:bg-[var(--color-accent)] hover:text-white disabled:opacity-50"
                        >
                          + Crear nueva versión
                        </button>
                      )}
                    </div>
                  )}

                  <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">El catálogo global calcula una recomendación. El precio que guardes en la propuesta queda congelado y no volverá a depender de cambios futuros del catálogo.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="space-y-1.5"><span className="block text-xs font-medium text-[var(--color-text-secondary)]">Palabras</span><input type="number" min="0" value={wordCount} readOnly className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text-muted)]" /></label>
                  <label className="space-y-1.5"><span className="block text-xs font-medium text-[var(--color-text-secondary)]">Capítulos</span><input type="number" min="1" value={chapterCount} onChange={(event) => setChapterCount(Math.max(1, Number(event.target.value) || 1))} disabled={locked} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] disabled:opacity-60" /></label>
                  <label className="space-y-1.5"><span className="block text-xs font-medium text-[var(--color-text-secondary)]">Complejidad</span><select value={complexity} onChange={(event) => setComplexity(event.target.value as PricingComplexity)} disabled={locked} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] disabled:opacity-60">{Object.entries(complexityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-[var(--color-text)]">Servicios</h3>
                      <p className="text-xs text-[var(--color-text-muted)]">Selecciona lo que realmente entrará en el alcance de producción.</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    {groupedServices.map(([category, categoryServices]) => (
                      <section key={category} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{category.replace('_', ' ')}</h4>
                        <div className="mt-3 space-y-2">
                          {categoryServices.map((service) => {
                            const selected = isSelected(service.code);
                            const selection = selections.find((candidate) => candidate.serviceCode === service.code);
                            const quantity = selection?.quantity ?? service.defaultQuantity;
                            return (
                              <div key={service.id} className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-3 sm:flex-row sm:items-center sm:justify-between">
                                <label className="flex min-w-0 items-start gap-3">
                                  <input type="checkbox" checked={selected || service.includedByDefault} onChange={(event) => setServiceSelection(service, event.target.checked)} disabled={locked || service.includedByDefault} className="mt-1" />
                                  <span className="min-w-0">
                                    <span className="block text-sm font-medium text-[var(--color-text)]">{service.name}</span>
                                    <span className="block text-[11px] leading-5 text-[var(--color-text-muted)]">{service.description}</span>
                                  </span>
                                </label>
                                <div className="flex items-center gap-3 sm:shrink-0">
                                  <span className="text-xs text-[var(--color-text-muted)]">{service.unitLabel ?? service.pricingModel}</span>
                                  {service.maxQuantity !== 1 && !service.includedByDefault && (
                                    <input type="number" min={service.minQuantity} max={service.maxQuantity ?? undefined} step="1" value={quantity} onChange={(event) => updateQuantity(service.code, Number(event.target.value) || service.minQuantity)} disabled={locked || !selected} className="w-20 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2 py-1.5 text-xs text-[var(--color-text)] disabled:opacity-50" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5"><span className="block text-xs font-medium text-[var(--color-text-secondary)]">Revisiones incluidas</span><input type="number" min="0" value={revisionsIncluded} onChange={(event) => setRevisionsIncluded(event.target.value)} disabled={locked} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] disabled:opacity-60" /></label>
                  <label className="space-y-1.5"><span className="block text-xs font-medium text-[var(--color-text-secondary)]">Ajuste comercial (%)</span><input type="number" min="-20" max="20" step="0.5" value={(commercialAdjustment * 100).toFixed(1)} onChange={(event) => setCommercialAdjustment((Number(event.target.value) || 0) / 100)} disabled={locked} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] disabled:opacity-60" /></label>
                  <label className="space-y-1.5"><span className="block text-xs font-medium text-[var(--color-text-secondary)]">Plazo</span><input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} disabled={locked} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] disabled:opacity-60" /></label>
                  <label className="space-y-1.5"><span className="block text-xs font-medium text-[var(--color-text-secondary)]">Fecha de expiración</span><input type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} disabled={locked} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] disabled:opacity-60" /></label>
                </div>

                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-4">
                  <label className="space-y-1.5 block"><span className="block text-xs font-medium text-[var(--color-text-secondary)]">Precio final de la propuesta</span><input type="number" min="0" step="0.01" value={amount || String(calculation?.finalPrice ?? '')} onChange={(event) => setAmount(event.target.value)} disabled={locked} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-lg font-semibold text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] disabled:opacity-60" /></label>
                  <p className="mt-2 text-[11px] text-[var(--color-text-muted)]">El valor sugerido por el motor es editable. Si lo cambias, queda registrado como precio comercial final.</p>
                </div>
              </div>

              <aside className="lg:sticky lg:top-4 lg:self-start">
                <div className="rounded-3xl border border-[var(--color-accent)]/25 bg-[var(--color-accent-soft)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">Resumen del cálculo</p>
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-4"><span className="text-[var(--color-text-secondary)]">Duración estimada</span><strong className="text-[var(--color-text)]">{calculation ? `${Math.round(calculation.durationMinutes)} min` : '—'}</strong></div>
                    <div className="flex justify-between gap-4"><span className="text-[var(--color-text-secondary)]">Complejidad</span><strong className="text-[var(--color-text)]">{calculation ? complexityLabels[calculation.complexity] : '—'}</strong></div>
                    <div className="flex justify-between gap-4"><span className="text-[var(--color-text-secondary)]">Tiempo de trabajo</span><strong className="text-[var(--color-text)]">{calculation ? `${Math.round(calculation.estimatedWorkMinutes / 60 * 10) / 10} h` : '—'}</strong></div>
                    <div className="border-t border-[var(--color-accent)]/20 pt-3"><div className="flex justify-between gap-4"><span className="text-[var(--color-text-secondary)]">Precio calculado</span><strong className="text-[var(--color-text)]">{calculation ? currency(calculation.recommendedPrice) : '—'}</strong></div></div>
                    <div className="flex items-end justify-between gap-4"><span className="text-sm font-semibold text-[var(--color-text)]">Precio final</span><strong className="text-3xl font-semibold text-[var(--color-text)]">{calculation ? currency(amount === '' ? calculation.finalPrice : Number(amount) || 0) : '—'}</strong></div>
                  </div>

                  {calculation && calculation.lines.length > 0 && (
                    <div className="mt-5 border-t border-[var(--color-accent)]/20 pt-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Desglose</p>
                      <div className="mt-3 space-y-2">
                        {calculation.lines.map((line) => (
                          <div key={line.serviceCode} className="flex justify-between gap-3 text-xs"><span className="min-w-0 truncate text-[var(--color-text-secondary)]">{line.name} × {line.quantity}</span><span className="shrink-0 font-medium text-[var(--color-text)]">{currency(line.price)}</span></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>

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
