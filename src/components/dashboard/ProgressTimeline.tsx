'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Check, Clock, Disc, Sparkles } from 'lucide-react';

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: 'completado' | 'activo' | 'pendiente';
}

interface ProgressTimelineProps {
  steps?: TimelineStep[];
  currentState?: 'none' | 'pending' | 'active';
}

const defaultSteps: TimelineStep[] = [
  {
    id: 'recibido',
    title: 'Recibido',
    description: 'Manuscrito cargado y cifrado en cabina',
    status: 'completado',
  },
  {
    id: 'analisis',
    title: 'En análisis',
    description: 'Evaluación de ritmo, voces y tono',
    status: 'activo',
  },
  {
    id: 'propuesta',
    title: 'Propuesta',
    description: 'Presupuesto por capítulos y plan técnico',
    status: 'pendiente',
  },
  {
    id: 'produccion',
    title: 'Producción',
    description: 'Grabación de voz y diseño sonoro',
    status: 'pendiente',
  },
  {
    id: 'revision',
    title: 'Revisión',
    description: 'Escucha de muestras y observaciones del autor',
    status: 'pendiente',
  },
  {
    id: 'entrega',
    title: 'Entrega final',
    description: 'Másters M4B/MP3 listos para publicación',
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
    <div className="rounded-3xl border border-edge/80 bg-surface-elevated/90 p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-edge/50 pb-5">
        <div>
          <h2 className="font-serif text-xl font-normal text-ink">Trayecto Editorial</h2>
          <p className="text-xs text-ink-muted/80 mt-0.5">Evolución de la obra desde el manuscrito preliminar hasta la edición de máster</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-edge/60 bg-surface/70 px-3.5 py-1 text-[11px] font-medium text-ink-muted">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>Garantía de Metodología Flamkit</span>
        </span>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-6">
        {activeSteps.map((step, index) => {
          const isDone = step.status === 'completado';
          const isActive = step.status === 'activo';

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              className={`relative flex flex-col justify-between rounded-2xl border p-4.5 transition-all duration-300 ${
                isActive
                  ? 'border-accent/40 bg-accent/8 shadow-2xs'
                  : isDone
                  ? 'border-edge/70 bg-surface/60'
                  : 'border-edge/40 bg-surface/20 opacity-60'
              }`}
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-muted">
                    Paso 0{index + 1}
                  </span>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs transition-colors ${
                      isDone
                        ? 'bg-accent text-white'
                        : isActive
                        ? 'bg-accent/20 text-accent border border-accent/40'
                        : 'border border-edge/60 bg-surface text-ink-muted/60'
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : isActive ? (
                      <Disc className="h-3.5 w-3.5 animate-spin text-accent" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                  </div>
                </div>

                <h3 className="font-serif text-base font-normal text-ink">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted/80 font-light">{step.description}</p>
              </div>

              <div className="mt-4 border-t border-edge/40 pt-2.5 text-[10px] font-medium uppercase tracking-[0.18em]">
                {isDone ? (
                  <span className="text-accent/90">Completado</span>
                ) : isActive ? (
                  <span className="text-accent font-semibold">En Curso</span>
                ) : (
                  <span className="text-ink-muted/60">Pendiente</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
