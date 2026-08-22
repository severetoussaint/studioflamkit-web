'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, FileText, Loader2, MessageSquare, ShieldCheck, XCircle } from 'lucide-react';
import { getUser } from '@/services/auth.service';
import { acceptProposal, listProposalsForAuthor, rejectProposal } from '@/services/proposal.service';
import type { Proposal } from '@/types/domain.types';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

type PricingLine = {
  serviceCode: string;
  name: string;
  quantity: number;
  unitLabel: string | null;
  price: number;
  estimatedMinutes: number;
};

type ProposalPricingSnapshot = {
  complexity?: 'standard' | 'medium' | 'high' | 'cinematic';
  commercialAdjustment?: number;
  calculation?: {
    durationMinutes?: number;
    basePrice?: number;
    serviceSubtotal?: number;
    recommendedPrice?: number;
    finalPrice?: number;
    estimatedWorkMinutes?: number;
    lines?: PricingLine[];
    pricingVersion?: string;
  };
};

function formatDate(value: string | null): string {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function currency(value: number | undefined, currencyCode = 'USD'): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  return value.toLocaleString('en-US', { style: 'currency', currency: currencyCode });
}

function complexityLabel(value: ProposalPricingSnapshot['complexity']): string {
  switch (value) {
    case 'medium': return 'Media';
    case 'high': return 'Alta';
    case 'cinematic': return 'Cinematográfica';
    default: return 'Estándar';
  }
}

function parsePricingSnapshot(value: unknown): ProposalPricingSnapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const calculation = record.calculation && typeof record.calculation === 'object' && !Array.isArray(record.calculation)
    ? record.calculation as Record<string, unknown>
    : null;

  const lines = calculation && Array.isArray(calculation.lines)
    ? calculation.lines.flatMap((line) => {
        if (!line || typeof line !== 'object' || Array.isArray(line)) return [];
        const candidate = line as Record<string, unknown>;
        if (typeof candidate.name !== 'string') return [];
        return [{
          serviceCode: typeof candidate.serviceCode === 'string' ? candidate.serviceCode : candidate.name,
          name: candidate.name,
          quantity: typeof candidate.quantity === 'number' ? candidate.quantity : 1,
          unitLabel: typeof candidate.unitLabel === 'string' ? candidate.unitLabel : null,
          price: typeof candidate.price === 'number' ? candidate.price : 0,
          estimatedMinutes: typeof candidate.estimatedMinutes === 'number' ? candidate.estimatedMinutes : 0,
        }];
      })
    : undefined;

  return {
    complexity: ['standard', 'medium', 'high', 'cinematic'].includes(String(record.complexity))
      ? String(record.complexity) as ProposalPricingSnapshot['complexity']
      : undefined,
    commercialAdjustment: typeof record.commercialAdjustment === 'number' ? record.commercialAdjustment : undefined,
    calculation: calculation
      ? {
          durationMinutes: typeof calculation.durationMinutes === 'number' ? calculation.durationMinutes : undefined,
          basePrice: typeof calculation.basePrice === 'number' ? calculation.basePrice : undefined,
          serviceSubtotal: typeof calculation.serviceSubtotal === 'number' ? calculation.serviceSubtotal : undefined,
          recommendedPrice: typeof calculation.recommendedPrice === 'number' ? calculation.recommendedPrice : undefined,
          finalPrice: typeof calculation.finalPrice === 'number' ? calculation.finalPrice : undefined,
          estimatedWorkMinutes: typeof calculation.estimatedWorkMinutes === 'number' ? calculation.estimatedWorkMinutes : undefined,
          lines,
          pricingVersion: typeof calculation.pricingVersion === 'string' ? calculation.pricingVersion : undefined,
        }
      : undefined,
  };
}

function fallbackServiceLines(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function statusLabel(status: Proposal['status']): string {
  switch (status) {
    case 'pending': return 'Pendiente de decisión';
    case 'accepted': return 'Aceptada';
    case 'rejected': return 'Rechazada';
    case 'expired': return 'Expirada';
    case 'superseded': return 'Reemplazada por versión posterior';
  }
}

export default function DashboardPropuestasPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const user = await getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setProposals(await listProposalsForAuthor(user.id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar tus propuestas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = await getUser();
        if (!user) {
          router.replace('/login');
          return;
        }
        setProposals(await listProposalsForAuthor(user.id));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar tus propuestas.');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [router]);

  const currentProposal = useMemo(
    () => proposals.find((proposal) => proposal.status === 'pending') ?? null,
    [proposals],
  );

  async function handleAccept(proposal: Proposal) {
    setBusyId(proposal.id);
    setError(null);
    try {
      await acceptProposal(proposal.id);
      await load();
    } catch (acceptError) {
      setError(acceptError instanceof Error ? acceptError.message : 'No se pudo aceptar la propuesta.');
    } finally {
      setBusyId(null);
      setConfirmingId(null);
    }
  }

  async function handleReject(proposal: Proposal) {
    setBusyId(proposal.id);
    setError(null);
    try {
      await rejectProposal(proposal.id);
      await load();
    } catch (rejectError) {
      setError(rejectError instanceof Error ? rejectError.message : 'No se pudo rechazar la propuesta.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-surface text-ink">
      <Navbar />
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <button type="button" onClick={() => router.push('/dashboard')} className="inline-flex items-center gap-2 text-xs font-semibold text-ink-muted hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
        </button>

        <div className="mt-8 rounded-3xl border border-edge/50 bg-surface-elevated p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Propuestas</p>
              <h1 className="mt-1 font-serif text-3xl font-semibold">Tu propuesta editorial</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">Aquí puedes revisar exactamente qué contempla la producción, la inversión y las condiciones de Studio FLAMKIT antes de decidir si quieres continuar con la obra.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-48 items-center justify-center text-ink-muted"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
          ) : error ? (
            <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">{error}</div>
          ) : proposals.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-edge/60 p-10 text-center">
              <Clock3 className="mx-auto h-9 w-9 text-ink-muted/50" />
              <p className="mt-3 font-medium">No hay propuestas disponibles.</p>
              <p className="mt-1 text-xs text-ink-muted">Cuando Studio FLAMKIT prepare una propuesta, aparecerá aquí.</p>
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {proposals.map((proposal) => {
                const isPending = proposal.status === 'pending';
                const canAct = isPending && !busyId;
                const snapshot = parsePricingSnapshot(proposal.services);
                const pricingLines = snapshot?.calculation?.lines ?? [];
                const fallbackLines = pricingLines.length === 0 ? fallbackServiceLines(proposal.services) : [];
                const estimatedHours = typeof snapshot?.calculation?.estimatedWorkMinutes === 'number'
                  ? snapshot.calculation.estimatedWorkMinutes / 60
                  : null;
                return (
                  <article key={proposal.id} className="rounded-3xl border border-edge/60 bg-surface/70 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-edge/60 bg-surface px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink-muted">
                          {proposal.status === 'accepted' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : proposal.status === 'rejected' ? <XCircle className="h-3.5 w-3.5 text-rose-600" /> : proposal.status === 'expired' ? <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> : <Clock3 className="h-3.5 w-3.5 text-accent" />}
                          {statusLabel(proposal.status)}
                        </div>
                        <h2 className="mt-3 font-serif text-2xl font-semibold">Oferta para tu obra (v{proposal.version ?? 1})</h2>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs uppercase tracking-wide text-ink-muted">Inversión</p>
                        <p className="mt-1 font-serif text-3xl font-semibold text-accent">{currency(proposal.amount, proposal.currency || 'USD')}</p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-2xl border border-edge/50 bg-surface p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Revisiones incluidas</p><p className="mt-1 text-sm font-medium">{proposal.revisionsIncluded ?? 0}</p></div>
                      <div className="rounded-2xl border border-edge/50 bg-surface p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Plazo</p><p className="mt-1 text-sm font-medium">{formatDate(proposal.deadline)}</p></div>
                      <div className="rounded-2xl border border-edge/50 bg-surface p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Expira</p><p className="mt-1 text-sm font-medium">{formatDate(proposal.expiresAt)}</p></div>
                      <div className="rounded-2xl border border-edge/50 bg-surface p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Complejidad</p><p className="mt-1 text-sm font-medium">{complexityLabel(snapshot?.complexity)}</p></div>
                    </div>

                    {snapshot?.calculation && (
                      <div className="mt-6 rounded-2xl border border-edge/50 bg-surface p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-accent" /> Resumen de producción</div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                          <div><p className="text-[10px] uppercase tracking-wide text-ink-muted">Audio estimado</p><p className="mt-1 text-sm font-medium">{typeof snapshot.calculation.durationMinutes === 'number' ? `${snapshot.calculation.durationMinutes.toFixed(1)} min` : '—'}</p></div>
                          <div><p className="text-[10px] uppercase tracking-wide text-ink-muted">Trabajo estimado</p><p className="mt-1 text-sm font-medium">{estimatedHours !== null ? `${estimatedHours.toFixed(1)} h` : '—'}</p></div>
                          <div><p className="text-[10px] uppercase tracking-wide text-ink-muted">Precio propuesto</p><p className="mt-1 text-sm font-medium">{currency(proposal.amount, proposal.currency || 'USD')}</p></div>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 rounded-2xl border border-edge/50 bg-surface p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-accent" /> Qué incluye la producción</div>
                      {pricingLines.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {pricingLines.map((line, index) => (
                            <div key={`${line.serviceCode}-${index}`} className="flex flex-col gap-1 rounded-xl border border-edge/40 bg-surface-elevated px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-medium">{line.name}</p>
                                <p className="text-[11px] text-ink-muted">{line.quantity} {line.unitLabel ?? 'unidad(es)'}</p>
                              </div>
                              <p className="text-sm font-medium">{currency(line.price, proposal.currency || 'USD')}</p>
                            </div>
                          ))}
                        </div>
                      ) : fallbackLines.length > 0 ? (
                        <ul className="mt-3 space-y-2 text-sm text-ink-muted">
                          {fallbackLines.map((service, index) => <li key={`${service}-${index}`} className="flex gap-2"><span className="text-accent">•</span><span className="whitespace-pre-wrap">{service}</span></li>)}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-ink-muted">El alcance detallado aparecerá aquí.</p>
                      )}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-edge/40 pt-4">
                      <button
                        type="button"
                        onClick={() => router.push('/dashboard?tab=mensajes')}
                        className="inline-flex items-center gap-2 text-xs font-medium text-accent hover:underline cursor-pointer"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Abrir y conversar en Mensajes</span>
                      </button>

                      {isPending && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                          <button type="button" disabled={!canAct} onClick={() => void handleReject(proposal)} className="rounded-xl border border-rose-500/30 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-500/10 disabled:opacity-50 cursor-pointer">Rechazar</button>
                          <button type="button" disabled={!canAct} onClick={() => setConfirmingId(proposal.id)} className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50 cursor-pointer">Aceptar propuesta</button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {currentProposal && confirmingId === currentProposal.id && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !busyId && setConfirmingId(null)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-edge/60 bg-surface-elevated p-6 shadow-2xl">
            <h3 className="font-serif text-2xl font-semibold">Confirmar aceptación</h3>
            <p className="mt-2 text-sm leading-6 text-ink-muted">¿Estás seguro de aceptar esta propuesta? Al confirmar, Studio FLAMKIT podrá activar formalmente el proyecto de producción según las condiciones ofrecidas.</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setConfirmingId(null)} disabled={!!busyId} className="rounded-xl border border-edge px-4 py-2.5 text-sm font-medium text-ink-muted">Cancelar</button>
              <button type="button" onClick={() => void handleAccept(currentProposal)} disabled={!!busyId} className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busyId ? 'Procesando…' : 'Confirmar aceptación'}</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
