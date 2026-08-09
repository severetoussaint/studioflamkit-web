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
}

const defaultSteps: TimelineStep[] = [
  {
    id: 'recibido',
    title: 'Recibido',
    description: 'Manuscrito resguardado',
    status: 'completado',
  },
  {
    id: 'analisis',
    title: 'En Análisis',
    description: 'Evaluación técnica de voz',
    status: 'activo',
  },
  {
    id: 'propuesta',
    title: 'Propuesta',
    description: 'Desglose y plan técnico',
    status: 'pendiente',
  },
  {
    id: 'produccion',
    title: 'Producción',
    description: 'Grabación y sonido',
    status: 'pendiente',
  },
  {
    id: 'revision',
    title: 'Revisión',
    description: 'Escucha de muestras',
    status: 'pendiente',
  },
  {
    id: 'entrega',
    title: 'Entrega Final',
    description: 'Máster de publicación',
    status: 'pendiente',
  },
];

export function ProgressTimeline({ steps = defaultSteps, currentState }: ProgressTimelineProps) {
  const activeSteps = React.useMemo(() => {
    if (steps !== defaultSteps) return steps;

    if (currentState === 'none') {
      return defaultSteps.map((s) => ({
        ...s,
        status: 'pendiente' as const,
      }));
    }

    if (currentState === 'pending') {
      return defaultSteps.map((s, idx) => {
        if (idx === 0) return { ...s, status: 'completado' as const };
        if (idx === 1) return { ...s, status: 'activo' as const };
        return { ...s, status: 'pendiente' as const };
      });
    }

    if (currentState === 'active') {
      return defaultSteps.map((s, idx) => {
        if (idx < 3) return { ...s, status: 'completado' as const };
        if (idx === 3) return { ...s, status: 'activo' as const };
        return { ...s, status: 'pendiente' as const };
      });
    }

    return steps;
  }, [steps, currentState]);

  return (
    <div className="relative overflow-hidden rounded-3xl border-edge/50 bg-surface-elevated/95 p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.20)] backdrop-blur-xs">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />

      {/* Header compact section */}
      <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-edge/40 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent border-accent/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-medium tracking-tight text-ink">
              Ruta Editorial de la Obra
            </h2>
            <p className="text-xs text-ink-muted/80 font-light">
              Fase actual del manuscrito en el proceso de producción de audio
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border-edge/60 bg-surface px-3 py-1 text-[11px] font-mono font-medium text-ink-muted">
          Etapa {activeSteps.findIndex((s) => s.status === 'activo') + 1 || 1} de {activeSteps.length}
        </span>
      </div>

      {/* Horizontal Stepper Line Layout */}
      <div className="relative pt-2 pb-1">
        {/* Progress Bar background connector line (hidden on small mobile, flex on desktop) */}
        <div className="hidden md:block absolute top-[22px] left-[3%] right-[3%] h-[2px] bg-edge/60 z-0" />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-2 relative z-10">
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
                className={`relative flex flex-col items-center text-center p-3.5 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'border-accent/40 bg-accent/12 shadow-[0_4px_16px_rgba(255,116,24,0.12)]'
                    : isDone
                    ? 'border-edge/60 bg-surface/60'
                    : 'border-edge/30 bg-surface/30 opacity-70'
                }`}
              >
                {/* Node Icon Circle */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition-all duration-300 z-10 ${
                    isDone
                      ? 'bg-accent text-white shadow-xs'
                      : isActive
                      ? 'border-2 border-accent bg-surface text-accent shadow-[0_0_12px_rgba(219,96,33,0.22)]'
                      : isBlocked
                      ? 'border-edge/60 bg-surface-elevated text-ink-muted/50'
                      : 'border-edge/80 bg-surface text-ink-muted/60'
                  }`}
                >
                  {isDone ? (
                    <Check className="h-4 w-4 stroke-[2.5]" />
                  ) : isActive ? (
                    <Disc className="h-4 w-4 animate-spin text-accent" />
                  ) : isBlocked ? (
                    <Lock className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                </div>

                {/* Step labels - tightly constrained to avoid overflow */}
                <div className="mt-2.5 w-full space-y-0.5">
                  <span className="block text-[9px] font-mono uppercase tracking-widest text-ink-muted/70">
                    Paso 0{index + 1}
                  </span>
                  <p className="font-serif text-sm font-medium tracking-tight text-ink truncate px-1">
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-[10px] text-ink-muted/70 line-clamp-1 font-light px-0.5">
                      {step.description}
                    </p>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mt-2.5 pt-1.5 border-t border-edge/30 w-full flex justify-center">
                  {isDone ? (
                    <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider text-accent">
                      Completado
                    </span>
                  ) : isActive ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      En Curso
                    </span>
                  ) : isBlocked ? (
                    <span className="inline-flex items-center text-[10px] font-medium uppercase tracking-wider text-ink-muted/50">
                      Bloqueado
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-medium uppercase tracking-wider text-ink-muted/60">
                      Pendiente
                    </span>
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
