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
  // Adjust statuses based on overall currentState if steps aren't dynamically passed
  const activeSteps = React.useMemo(() => {
    if (steps !== defaultSteps) return steps;

    if (currentState === 'none') {
      return defaultSteps.map((s, idx) => ({
        ...s,
        status: idx === 0 ? ('pendiente' as const) : ('pendiente' as const),
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
    <div className="rounded-3xl border border-edge bg-surface-elevated p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b border-edge/60 pb-4">
        <div>
          <h2 className="font-serif text-xl font-medium text-ink">Línea del Proceso Editorial</h2>
          <p className="text-xs text-ink-muted">Trayecto desde la recepción del manuscrito hasta el máster final</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface px-3 py-1 text-xs text-ink-muted">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>Proceso Transparente</span>
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {activeSteps.map((step, index) => {
          const isDone = step.status === 'completado';
          const isActive = step.status === 'activo';

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className={`relative flex flex-col justify-between rounded-2xl border p-4 transition ${
                isActive
                  ? 'border-accent bg-accent/10 shadow-sm'
                  : isDone
                  ? 'border-edge bg-surface/80'
                  : 'border-edge/50 bg-surface/30 opacity-70'
              }`}
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                    Etapa 0{index + 1}
                  </span>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isDone
                        ? 'bg-accent text-white'
                        : isActive
                        ? 'bg-accent/20 text-accent border border-accent/40'
                        : 'border border-edge bg-surface text-ink-muted'
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

                <h3 className="font-serif text-base font-medium text-ink">{step.title}</h3>
                <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">{step.description}</p>
              </div>

              <div className="mt-3 border-t border-edge/40 pt-2 text-[10px] font-medium uppercase tracking-[0.15em]">
                {isDone ? (
                  <span className="text-accent">Completado</span>
                ) : isActive ? (
                  <span className="text-accent font-semibold">En Curso</span>
                ) : (
                  <span className="text-ink-muted/70">Pendiente</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
