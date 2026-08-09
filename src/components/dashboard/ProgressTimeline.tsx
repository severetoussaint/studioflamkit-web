'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Check, Clock, Disc, Lock, Sparkles } from 'lucide-react';

export interface TimelineStep {
  id: string;
  title: string;
  description?: string;
  status: 'completado' | 'activo' | 'pendiente' | 'bloqueado';
}

interface ProgressTimelineProps {
  steps?: TimelineStep[];
  currentState?: 'none' | 'pending' | 'active';
  activeStepIndex?: number | null;
}

const defaultSteps: TimelineStep[] = [
  { id: 'recibido', title: 'Recibido', description: 'Manuscrito resguardado', status: 'completado' },
  { id: 'analisis', title: 'En análisis', description: 'Evaluación editorial y técnica', status: 'activo' },
  { id: 'propuesta', title: 'Propuesta', description: 'Desglose y plan técnico', status: 'pendiente' },
  { id: 'produccion', title: 'Producción', description: 'Grabación y mezcla', status: 'pendiente' },
  { id: 'revision', title: 'Revisión', description: 'Escucha de muestras', status: 'pendiente' },
  { id: 'entrega', title: 'Entrega final', description: 'Máster de publicación', status: 'pendiente' },
];

function resolveSteps(
  steps: TimelineStep[],
  currentState: ProgressTimelineProps['currentState'],
  activeStepIndex: number | null | undefined
): TimelineStep[] {
  if (steps !== defaultSteps) return steps;

  if (typeof activeStepIndex === 'number') {
    return defaultSteps.map((step, index) => ({
      ...step,
      status: index < activeStepIndex ? 'completado' : index === activeStepIndex ? 'activo' : 'pendiente',
    }));
  }

  if (currentState === 'none') {
    return defaultSteps.map((step) => ({ ...step, status: 'pendiente' }));
  }

  if (currentState === 'pending') {
    return defaultSteps.map((step, index) => ({
      ...step,
      status: index === 0 ? 'completado' : index === 1 ? 'activo' : 'pendiente',
    }));
  }

  return defaultSteps.map((step, index) => ({
    ...step,
    status: index < 3 ? 'completado' : index === 3 ? 'activo' : 'pendiente',
  }));
}

export function ProgressTimeline({ steps = defaultSteps, currentState, activeStepIndex }: ProgressTimelineProps) {
  const activeSteps = React.useMemo(() => resolveSteps(steps, currentState, activeStepIndex), [steps, currentState, activeStepIndex]);
  const currentIndex = activeSteps.findIndex((step) => step.status === 'activo');

  return (
    <div className="relative overflow-hidden rounded-3xl border border-edge/70 bg-surface-elevated/95 p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.20)] backdrop-blur-xs">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-edge/40 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-medium tracking-tight text-ink">Ruta Editorial de la Obra</h2>
            <p className="text-xs font-light text-ink-muted/80">Fase actual del manuscrito en el proceso de producción de audio</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-edge/60 bg-surface px-3 py-1 text-[11px] font-mono font-medium text-ink-muted">
          Etapa {currentIndex >= 0 ? currentIndex + 1 : 1} de {activeSteps.length}
        </span>
      </div>

      <div className="relative pt-2 pb-1">
        <div className="hidden md:block absolute top-[22px] left-[3%] right-[3%] h-[2px] bg-edge/60 z-0" />

        <div className="grid grid-cols-2 gap-3 relative z-10 sm:grid-cols-3 md:grid-cols-6 sm:gap-2">
          {activeSteps.map((step, index) => {
            const isDone = step.status === 'completado';
            const isActive = step.status === 'activo';
            const isBlocked = step.status === 'bloqueado';

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.03 }}
                className={`relative flex flex-col items-center rounded-2xl p-3.5 text-center transition-all duration-200 ${
                  isActive
                    ? 'border border-accent/40 bg-accent/12 shadow-[0_4px_16px_rgba(255,116,24,0.12)]'
                    : isDone
                      ? 'border border-edge/60 bg-surface/60'
                      : 'border border-edge/30 bg-surface/30 opacity-70'
                }`}
              >
                <div
                  className={`z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
                    isDone
                      ? 'bg-accent text-white shadow-xs'
                      : isActive
                        ? 'border-2 border-accent bg-surface text-accent shadow-[0_0_12px_rgba(255,116,24,0.22)]'
                        : isBlocked
                          ? 'border border-edge/60 bg-surface-elevated text-ink-muted/50'
                          : 'border border-edge/80 bg-surface text-ink-muted/60'
                  }`}
                >
                  {isDone ? <Check className="h-4 w-4 stroke-[2.5]" /> : isActive ? <Disc className="h-4 w-4 animate-spin text-accent" /> : isBlocked ? <Lock className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                </div>

                <div className="mt-2.5 w-full space-y-0.5">
                  <span className="block text-[9px] font-mono uppercase tracking-widest text-ink-muted/70">Paso 0{index + 1}</span>
                  <p className="truncate px-1 font-serif text-sm font-medium tracking-tight text-ink">{step.title}</p>
                  {step.description ? <p className="line-clamp-1 px-0.5 text-[10px] font-light text-ink-muted/70">{step.description}</p> : null}
                </div>

                <div className="mt-2.5 flex w-full justify-center border-t border-edge/30 pt-1.5">
                  {isDone ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">Completado</span>
                  ) : isActive ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      En Curso
                    </span>
                  ) : isBlocked ? (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted/50">Bloqueado</span>
                  ) : (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted/60">Pendiente</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
