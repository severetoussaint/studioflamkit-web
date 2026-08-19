'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Check, Clock, Disc, Lock, Sparkles } from 'lucide-react';
import type { EditorialJourney, EditorialPhase, EditorialStepStatus } from '@/types/domain.types';

export interface TimelineStep {
  id: string;
  title: string;
  description?: string;
  status: 'completado' | 'activo' | 'pendiente' | 'bloqueado';
}

interface ProgressTimelineProps {
  steps?: TimelineStep[];
  currentState?: 'none' | 'pending' | 'active' | 'rejected';
  journey?: EditorialJourney | null;
}

const PHASE_PRESENTATION: Record<EditorialPhase, { title: string; description: string }> = {
  received: { title: 'Recibido', description: 'El manuscrito ya está resguardado en el sistema.' },
  analysis: { title: 'En análisis', description: 'La obra está siendo revisada por el equipo editorial.' },
  proposal: { title: 'Propuesta en preparación', description: 'Se está cerrando el desglose técnico y comercial.' },
  production: { title: 'Producción', description: 'La obra está en grabación, edición o mezcla.' },
  review: { title: 'En revisión', description: 'Hay observaciones, correcciones o aprobaciones pendientes.' },
  completed: { title: 'Entrega final', description: 'El master o paquete final ya está listo para revisión o descarga.' },
};

const FALLBACK_PHASE_BY_STATE: Record<'none' | 'pending' | 'active' | 'rejected', EditorialPhase | null> = {
  none: null,
  pending: 'analysis',
  active: 'production',
  rejected: null,
};

const PHASES: EditorialPhase[] = ['received', 'analysis', 'proposal', 'production', 'review', 'completed'];

function mapDomainStatus(status: EditorialStepStatus): TimelineStep['status'] {
  switch (status) {
    case 'completed': return 'completado';
    case 'active': return 'activo';
    case 'blocked': return 'bloqueado';
    case 'pending':
    default: return 'pendiente';
  }
}

function mapDomainJourney(journey: EditorialJourney): TimelineStep[] {
  return journey.steps.map((step) => ({ id: step.id, title: PHASE_PRESENTATION[step.id].title, description: PHASE_PRESENTATION[step.id].description, status: mapDomainStatus(step.status) }));
}

function buildFallbackSteps(currentState?: 'none' | 'pending' | 'active' | 'rejected'): TimelineStep[] {
  if (currentState === 'rejected') {
    return PHASES.map((phase, index) => ({ id: phase, title: PHASE_PRESENTATION[phase].title, description: index < 2 ? PHASE_PRESENTATION[phase].description : 'No se continúa en esta solicitud.', status: index < 2 ? 'completado' : 'bloqueado' }));
  }

  const fallbackPhase = currentState ? FALLBACK_PHASE_BY_STATE[currentState] : null;
  const activeIndex = fallbackPhase ? PHASES.indexOf(fallbackPhase) : -1;
  return PHASES.map((phase, index) => ({ id: phase, title: PHASE_PRESENTATION[phase].title, description: PHASE_PRESENTATION[phase].description, status: index < activeIndex ? 'completado' : index === activeIndex ? 'activo' : 'pendiente' }));
}

export function ProgressTimeline({ steps, currentState, journey = null }: ProgressTimelineProps) {
  const router = useRouter();
  const activeSteps = React.useMemo(() => {
    if (steps && steps.length > 0) return steps;
    if (journey) return mapDomainJourney(journey);
    return buildFallbackSteps(currentState);
  }, [steps, currentState, journey]);

  const subtitle = journey
    ? 'Fase actual del manuscrito en el proceso editorial'
    : currentState === 'none'
      ? 'Aún no hay obra cargada para esta cuenta'
      : currentState === 'rejected'
        ? 'La solicitud terminó después del análisis editorial'
        : 'Fase actual del manuscrito en el proceso editorial';

  const activeIndex = activeSteps.findIndex((s) => s.status === 'activo');
  const visibleStage = currentState === 'rejected' ? 2 : activeIndex >= 0 ? activeIndex + 1 : 1;
  const proposalIsActive = journey?.currentPhase === 'proposal';

  const handleStepClick = (stepId: string, status: TimelineStep['status']) => {
    if (stepId === 'proposal' && proposalIsActive && status === 'activo') {
      router.push('/dashboard/propuestas');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border-edge/50 bg-surface-elevated/95 p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.20)] backdrop-blur-xs">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-edge/40 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent border-accent/20"><Sparkles className="h-4 w-4" /></div>
          <div>
            <h2 className="font-serif text-lg font-medium tracking-tight text-ink">Ruta Editorial de la Obra</h2>
            <p className="text-xs text-ink-muted/80 font-light">{subtitle}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border-edge/60 bg-surface px-3 py-1 text-[11px] font-mono font-medium text-ink-muted">Etapa {visibleStage} de {activeSteps.length}</span>
      </div>

      <div className="block md:hidden relative pt-2">
        <div className="relative border-l-2 border-edge/60 ml-4 pl-6 space-y-6 my-2">
          {activeSteps.map((step, index) => {
            const isDone = step.status === 'completado';
            const isActive = step.status === 'activo';
            const isBlocked = step.status === 'bloqueado';
            const clickable = step.id === 'proposal' && proposalIsActive && isActive;
            return (
              <motion.div key={step.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: index * 0.04 }} className="relative group">
                <div className={`absolute -left-[35px] top-0 flex h-7 w-7 items-center justify-center rounded-full text-xs transition-all duration-300 ${isDone ? 'bg-accent text-white shadow-xs' : isActive ? 'border-2 border-accent bg-surface text-accent ring-4 ring-accent/15' : isBlocked ? 'border border-edge/70 bg-surface-elevated text-ink-muted/50' : 'border border-edge/80 bg-surface text-ink-muted/60'}`}>
                  {isDone ? <Check className="h-3.5 w-3.5 stroke-[2.5]" /> : isActive ? <span className="h-2 w-2 rounded-full bg-accent animate-ping" /> : isBlocked ? <Lock className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                </div>
                <button type="button" onClick={() => handleStepClick(step.id, step.status)} disabled={!clickable} className={`w-full text-left rounded-2xl border p-4 transition-all ${clickable ? 'cursor-pointer border-accent/50 bg-accent/10 shadow-xs hover:-translate-y-0.5' : isActive ? 'border-accent/40 bg-accent/8 shadow-xs' : isDone ? 'border-edge/60 bg-surface/70' : 'border-edge/30 bg-surface/30 opacity-75'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0"><span className="font-mono text-xs font-semibold text-accent shrink-0">0{index + 1}</span><h4 className="font-serif text-base font-medium text-ink truncate">{step.title}</h4></div>
                    {isDone ? <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-accent">Completado</span> : isActive ? <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent"><span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />{clickable ? 'Ver propuesta' : 'En Curso'}</span> : isBlocked ? <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-ink-muted/50">Bloqueado</span> : <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-ink-muted/60">Pendiente</span>}
                  </div>
                  {step.description && <p className="mt-1.5 text-xs text-ink-muted leading-relaxed font-light">{step.description}</p>}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="hidden md:block relative pt-2 pb-1">
        <div className="absolute top-[22px] left-[3%] right-[3%] h-[2px] bg-edge/60 z-0" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-2 relative z-10">
          {activeSteps.map((step, index) => {
            const isDone = step.status === 'completado';
            const isActive = step.status === 'activo';
            const isBlocked = step.status === 'bloqueado';
            const clickable = step.id === 'proposal' && proposalIsActive && isActive;
            return (
              <motion.button key={step.id} type="button" onClick={() => handleStepClick(step.id, step.status)} disabled={!clickable} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: index * 0.03, ease: 'easeOut' }} className={`relative flex flex-col items-center text-center p-3.5 rounded-2xl transition-all duration-200 ease-out ${clickable ? 'cursor-pointer border-accent/50 bg-accent/10 shadow-[0_4px_16px_rgba(255,116,24,0.16)] hover:-translate-y-1' : isActive ? 'border-accent/40 bg-accent/12 shadow-[0_4px_16px_rgba(255,116,24,0.12)]' : isDone ? 'border-edge/60 bg-surface/60 hover:border-accent/30' : 'border-edge/30 bg-surface/30 opacity-70 hover:opacity-100 hover:border-edge/60'}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition-all duration-300 z-10 ${isDone ? 'bg-accent text-white shadow-xs' : isActive ? 'border-2 border-accent bg-surface text-accent shadow-[0_0_12px_rgba(219,96,33,0.22)]' : isBlocked ? 'border-edge/60 bg-surface-elevated text-ink-muted/50' : 'border-edge/80 bg-surface text-ink-muted/60'}`}>
                  {isDone ? <Check className="h-4 w-4 stroke-[2.5]" /> : isActive ? <Disc className="h-4 w-4 animate-spin text-accent" /> : isBlocked ? <Lock className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                </div>
                <div className="mt-2.5 w-full space-y-0.5"><span className="block text-[9px] font-mono uppercase tracking-widest text-ink-muted/70">Paso 0{index + 1}</span><p className="font-serif text-sm font-medium tracking-tight text-ink truncate px-1">{step.title}</p>{step.description && <p className="text-[10px] text-ink-muted/70 line-clamp-1 font-light px-0.5">{step.description}</p>}</div>
                <div className="mt-2.5 pt-1.5 border-t border-edge/30 w-full flex justify-center">{isDone ? <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider text-accent">Completado</span> : isActive ? <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent animate-pulse"><span className="h-1.5 w-1.5 rounded-full bg-accent" />{clickable ? 'Ver propuesta' : 'En Curso'}</span> : isBlocked ? <span className="inline-flex items-center text-[10px] font-medium uppercase tracking-wider text-ink-muted/50">Bloqueado</span> : <span className="inline-flex items-center text-[10px] font-medium uppercase tracking-wider text-ink-muted/60">Pendiente</span>}</div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
