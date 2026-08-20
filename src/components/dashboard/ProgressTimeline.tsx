'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Disc, Lock, Sparkles, Check } from 'lucide-react';
import type { EditorialJourney, EditorialPhase, EditorialStepStatus } from '@/types/domain.types';
import type { DashboardRequestState } from '@/services/dashboard-workspace.service';

export interface TimelineStep { id: string; title: string; description?: string; status: 'completado' | 'activo' | 'pendiente' | 'bloqueado'; }

interface ProgressTimelineProps { steps?: TimelineStep[]; currentState?: DashboardRequestState; journey?: EditorialJourney | null; }

const PHASE_PRESENTATION: Record<EditorialPhase, { title: string; description: string }> = {
  received: { title: 'Recibido', description: 'El manuscrito ya está resguardado en el sistema.' },
  analysis: { title: 'En análisis', description: 'La obra está siendo revisada por el equipo editorial.' },
  proposal: { title: 'Propuesta en preparación', description: 'Se está cerrando el desglose técnico y comercial.' },
  production: { title: 'Producción', description: 'La obra está en grabación, edición o mezcla.' },
  review: { title: 'En revisión', description: 'Hay observaciones, correcciones o aprobaciones pendientes.' },
  completed: { title: 'Entrega final', description: 'El master o paquete final ya está listo para revisión o descarga.' },
};

const FALLBACK_PHASE_BY_STATE: Record<'none' | 'pending' | 'proposal' | 'proposal_sent' | 'active' | 'rejected', EditorialPhase | null> = {
  none: null,
  pending: 'analysis',
  proposal: 'proposal',
  proposal_sent: 'proposal',
  active: 'production',
  rejected: null,
};

const PHASES: EditorialPhase[] = ['received', 'analysis', 'proposal', 'production', 'review', 'completed'];

function mapDomainStatus(status: EditorialStepStatus): TimelineStep['status'] {
  switch (status) {
    case 'completed': return 'completado';
    case 'active': return 'activo';
    case 'blocked': return 'bloqueado';
    default: return 'pendiente';
  }
}

function mapDomainJourney(journey: EditorialJourney): TimelineStep[] {
  return journey.steps.map((step) => ({ id: step.id, title: PHASE_PRESENTATION[step.id].title, description: PHASE_PRESENTATION[step.id].description, status: mapDomainStatus(step.status) }));
}

function buildFallbackSteps(currentState?: DashboardRequestState): TimelineStep[] {
  if (currentState === 'rejected') return PHASES.map((phase, index) => ({ id: phase, title: PHASE_PRESENTATION[phase].title, description: index < 2 ? PHASE_PRESENTATION[phase].description : 'No se continúa en esta solicitud.', status: index < 2 ? 'completado' : 'bloqueado' }));
  const fallbackPhase = currentState ? FALLBACK_PHASE_BY_STATE[currentState] : null;
  const activeIndex = fallbackPhase ? PHASES.indexOf(fallbackPhase) : -1;
  return PHASES.map((phase, index) => ({ id: phase, title: PHASE_PRESENTATION[phase].title, description: PHASE_PRESENTATION[phase].description, status: index < activeIndex ? 'completado' : index === activeIndex ? 'activo' : 'pendiente' }));
}

export function ProgressTimeline({ steps, currentState, journey = null }: ProgressTimelineProps) {
  const router = useRouter();
  const activeSteps = React.useMemo(() => steps && steps.length > 0 ? steps : journey ? mapDomainJourney(journey) : buildFallbackSteps(currentState), [steps, currentState, journey]);
  const subtitle = journey ? 'Fase actual del manuscrito en el proceso editorial' : currentState === 'none' ? 'Aún no hay obra cargada para esta cuenta' : currentState === 'rejected' ? 'La solicitud terminó después del análisis editorial' : 'Fase actual del manuscrito en el proceso editorial';
  const activeIndex = activeSteps.findIndex((s) => s.status === 'activo');
  const proposalIsActive = journey?.currentPhase === 'proposal' || currentState === 'proposal' || currentState === 'proposal_sent';
  const handleStepClick = (stepId: string, status: TimelineStep['status']) => { if (stepId === 'proposal' && proposalIsActive && status === 'activo') router.push('/dashboard/propuestas'); };

  return (
    <div className="relative overflow-hidden rounded-3xl border-edge/50 bg-surface-elevated/95 p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.20)] backdrop-blur-xs">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />
      <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-edge/40 pb-4">
        <div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent border-accent/20"><Sparkles className="h-4 w-4" /></div><div><h2 className="font-serif text-lg font-medium tracking-tight text-ink">Ruta Editorial de la Obra</h2><p className="text-xs text-ink-muted/80 font-light">{subtitle}</p></div></div>
      </div>
      <div className="relative flex items-start justify-between gap-1 sm:gap-2">
        {activeSteps.map((step, index) => {
          const isActive = step.status === 'activo'; const isCompleted = step.status === 'completado'; const isBlocked = step.status === 'bloqueado'; const isProposal = step.id === 'proposal'; const clickable = isProposal && proposalIsActive && isActive;
          return <React.Fragment key={step.id}><button type="button" onClick={() => handleStepClick(step.id, step.status)} disabled={!clickable} className={`relative flex min-w-0 flex-1 flex-col items-center gap-2 text-center ${clickable ? 'cursor-pointer' : 'cursor-default'}`}><span className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition ${isCompleted ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600' : isActive ? 'border-accent/40 bg-accent/10 text-accent shadow-sm' : isBlocked ? 'border-edge/60 bg-surface text-ink-muted/50' : 'border-edge/60 bg-surface text-ink-muted'}`}>{isCompleted ? <Check className="h-4 w-4" /> : isBlocked ? <Lock className="h-3.5 w-3.5" /> : index + 1}</span><span className={`text-[10px] leading-4 sm:text-[11px] ${isActive ? 'font-semibold text-ink' : 'text-ink-muted'}`}>{step.title}</span></button>{index < activeSteps.length - 1 && <div className={`mt-4 h-px flex-1 ${isCompleted ? 'bg-emerald-500/30' : 'bg-edge/50'}`} />}</React.Fragment>;
        })}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-edge/50 bg-surface/60 p-3"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-ink-muted"><Clock className="h-3.5 w-3.5 text-accent" /> Estado</div><p className="mt-1 text-xs text-ink">{activeIndex >= 0 ? activeSteps[activeIndex].title : 'Pendiente'}</p></div>
        <div className="rounded-2xl border border-edge/50 bg-surface/60 p-3"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-ink-muted"><Disc className="h-3.5 w-3.5 text-accent" /> Siguiente</div><p className="mt-1 text-xs text-ink">{activeIndex >= 0 && activeIndex + 1 < activeSteps.length ? activeSteps[activeIndex + 1].title : 'Continuar'}</p></div>
        <div className="rounded-2xl border border-edge/50 bg-surface/60 p-3"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-ink-muted"><Sparkles className="h-3.5 w-3.5 text-accent" /> Acción</div><p className="mt-1 text-xs text-ink">{proposalIsActive ? (currentState === 'proposal_sent' ? 'Revisar propuesta' : 'Esperar envío') : activeIndex >= 0 ? 'Esperar siguiente etapa' : 'Enviar manuscrito'}</p></div>
      </div>
    </div>
  );
}
