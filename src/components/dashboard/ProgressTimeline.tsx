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
    <div className="relative overflow-hidden rounded-3xl border border-edge/80 bg-surface-elevated/95 p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.02)] backdrop-blur-xs">
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-accent/6 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-[#B98C52]/6 blur-3xl" />

      <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-edge/40 pb-5">
        <div>
          <h2 className="font-serif text-xl font-normal tracking-tight text-ink">Trayecto Editorial</h2>
          <p className="mt-0.5 text-xs font-light text-ink-muted/80">
            Evolución de la obra desde el manuscrito preliminar hasta la edición de máster
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-edge/60 bg-surface/80 px-3.5 py-1 text-[11px] font-medium text-ink-muted/90 shadow-[0_4px_14px_rgba(0,0,0,0.02)]">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span>Garantía de Metodología Flamkit</span>
        </span>
      </div>

      <div className="relative grid gap-3.5 sm:grid-cols-2 lg:grid-cols-6">
        {activeSteps.map((step, index) => {
          const isDone = step.status === 'completado';
          const isActive = step.status === 'activo';

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              className={`group relative flex min-h-[178px] flex-col justify-between rounded-2xl border p-4.5 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(0,0,0,0.04)] ${
                isActive
                  ? 'border-accent/35 bg-[linear-gradient(180deg,rgba(242,107,46,0.08),rgba(252,250,246,0.96))]'
                  : isDone
                  ? 'border-edge/70 bg-[linear-gradient(180deg,rgba(252,250,246,0.96),rgba(252,250,246,0.72))]'
                  : 'border-edge/35 bg-surface/25 opacity-70'
              }`}
            >
              <div className={`pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_20%_0%,rgba(242,107,46,0.06),transparent_42%)] opacity-0 transition-opacity duration-300 ${
                isActive ? 'opacity-100' : 'group-hover:opacity-100'
              }`} />

              <div className="relative">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-muted/75">
                    Paso 0{index + 1}
                  </span>

                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs transition-all duration-300 ${
                      isDone
                        ? 'bg-accent text-white shadow-[0_6px_16px_rgba(242,107,46,0.18)]'
                        : isActive
                        ? 'border border-accent/35 bg-accent/12 text-accent'
                        : 'border border-edge/60 bg-surface text-ink-muted/55'
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    ) : isActive ? (
                      <Disc className="h-3.5 w-3.5 animate-spin text-accent" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                  </div>
                </div>

                <h3 className="font-serif text-base font-normal tracking-tight text-ink">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed font-light text-ink-muted/80">
                  {step.description}
                </p>
              </div>

              <div className="relative mt-4 border-t border-edge/35 pt-2.5 text-[10px] font-medium uppercase tracking-[0.18em]">
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
