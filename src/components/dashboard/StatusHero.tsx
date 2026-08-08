'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, BookOpen, Clock, UploadCloud, CheckCircle2, Headphones, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface StatusHeroProps {
  state: 'none' | 'pending' | 'active';
  projectTitle?: string | null;
  submittedDate?: string | null;
  progress?: number;
  statusLabel?: string;
  onUploadClick: () => void;
  onViewFilesClick?: () => void;
}

export function StatusHero({
  state,
  projectTitle,
  submittedDate,
  progress = 0,
  statusLabel,
  onUploadClick,
  onViewFilesClick,
}: StatusHeroProps) {
  if (state === 'none') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl border border-edge bg-surface-elevated/80 p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-accent)_0%,_transparent_35%)] opacity-[0.08]" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-medium text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Bienvenido a tu Centro del Autor</span>
          </div>

          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Transforma tu libro en una obra sonora inolvidable.
          </h1>

          <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">
            Envía tu manuscrito sin compromiso. Nuestro equipo editorial evaluará el alcance, tono y viabilidad de producción de tu obra en menos de 48 horas.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              variant="primary"
              className="flex items-center gap-2.5 px-6 py-3.5 text-sm font-medium"
              onClick={onUploadClick}
            >
              <UploadCloud className="h-4 w-4" />
              <span>Enviar Manuscrito para Evaluación</span>
              <ArrowRight className="h-4 w-4 opacity-70" />
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-6 border-t border-edge/60 pt-6 text-xs text-ink-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span>Resguardo de propiedad intelectual</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              <span>Evaluación en 24–48 horas</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (state === 'pending') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-surface-elevated/90 p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#f59e0b_0%,_transparent_35%)] opacity-[0.06]" />

        <div className="relative z-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
            <Clock className="h-3.5 w-3.5" />
            <span>Manuscrito Recibido · Evaluación En Curso</span>
          </div>

          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            {projectTitle ? `«${projectTitle}» está siendo analizado.` : 'Tu obra está siendo analizada por nuestro equipo.'}
          </h1>

          <p className="mt-3 text-base leading-relaxed text-ink-muted">
            {submittedDate ? `Recibido el ${submittedDate}. ` : ''}
            Nuestros directores de voz y diseñadores de sonido están revisando la estructura y estilo dramático de tu obra. Recibirás la propuesta técnica y estimación en tu cabina.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {onViewFilesClick && (
              <Button
                variant="secondary"
                className="flex items-center gap-2 text-xs font-medium"
                onClick={onViewFilesClick}
              >
                <BookOpen className="h-4 w-4 text-accent" />
                <span>Ver Manuscrito Subido</span>
              </Button>
            )}
            <div className="inline-flex items-center gap-2 rounded-2xl bg-surface px-4 py-2 text-xs text-ink-muted border border-edge">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>Siguiente paso: Propuesta editorial & cotización</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Active state
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl border border-edge bg-surface-elevated p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-accent)_0%,_transparent_30%)] opacity-[0.08]" />

      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{statusLabel || 'En Producción Audiocinematográfica'}</span>
            </span>
            <span className="text-xs text-ink-muted">· ID Obra Activa</span>
          </div>

          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            {projectTitle || 'Proyecto sin título'}
          </h1>

          <p className="mt-2 text-sm text-ink-muted">
            Avance general de producción y revisión de másters por capítulos.
          </p>
        </div>

        {/* Progress Gauge */}
        <div className="flex shrink-0 flex-col items-start rounded-2xl border border-edge bg-surface p-5 sm:min-w-[220px]">
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">Avance General</span>
            <span className="font-serif text-lg font-semibold text-accent">{progress}%</span>
          </div>

          <div className="h-2.5 w-full rounded-full bg-edge overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-muted">
            <Headphones className="h-3.5 w-3.5 text-accent" />
            <span>Cabina activa de producción</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
