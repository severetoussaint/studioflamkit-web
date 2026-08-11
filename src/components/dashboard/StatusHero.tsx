'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, BookOpen, Clock, UploadCloud, CheckCircle2, Headphones, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RotatingTagline } from '@/components/ui/RotatingTagline';
import { getEditorialJourneyPresentation } from '@/domain/view-models/editorialJourneyPresentation';
import type { EditorialJourney } from '@/types/domain.types';

interface StatusHeroProps {
  state: 'none' | 'pending' | 'active';
  projectTitle?: string | null;
  submittedDate?: string | null;
  progress?: number;
  statusLabel?: string;
  journey?: EditorialJourney | null;
  onUploadClick: () => void;
  onViewFilesClick?: () => void;
  onToggleCarousel?: () => void;
}

export function StatusHero({
  state,
  projectTitle,
  submittedDate,
  progress = 0,
  statusLabel,
  journey,
  onUploadClick,
  onViewFilesClick,
  onToggleCarousel,
}: StatusHeroProps) {
  if (state === 'none') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border-edge/50 bg-surface-elevated/90 p-8 sm:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.03)] backdrop-blur-xs"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,_var(--color-accent)_0%,_transparent_45%)] opacity-[0.07]" />

        <div className="relative z-10 max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border-accent/25 bg-accent/8 px-4 py-1.5 text-[11px] font-medium tracking-wide text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="uppercase tracking-[0.18em]">Centro del Autor · Studio Flamkit</span>
          </div>

          <RotatingTagline className="font-serif text-3xl font-normal tracking-tight text-ink sm:text-4xl lg:text-5xl leading-[1.12]" />

          <p className="mt-5 text-base leading-relaxed text-ink-muted/90 sm:text-lg font-light">
            Envía tu manuscrito a nuestra dirección editorial. Evaluamos el tono, la estructura y la atmósfera dramatúrgica de tu obra en menos de 48 horas.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              variant="primary"
              className="flex items-center gap-2.5 px-6 py-3.5 text-xs font-medium uppercase tracking-[0.15em] shadow-xs hover:shadow-md transition-all duration-300"
              onClick={onUploadClick}
            >
              <UploadCloud className="h-4 w-4" />
              <span>Enviar Manuscrito para Evaluación</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-70" />
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-8 border-t border-edge/50 pt-6 text-xs text-ink-muted/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-accent/90 shrink-0" />
              <span>Resguardo confidencial de propiedad intelectual</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent/90 shrink-0" />
              <span>Diagnóstico técnico en 24–48 horas</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const presentation = getEditorialJourneyPresentation(journey, state);
  const effectiveProgress = progress;
  const effectiveLabel = journey ? presentation.label : (statusLabel || presentation.label);

  if (state === 'pending') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border-amber-500/25 bg-surface-elevated/95 p-8 sm:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.03)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,_#f59e0b_0%,_transparent_40%)] opacity-[0.05]" />

        <div className="relative z-10 max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-[11px] font-medium tracking-wide text-amber-800 dark:text-amber-300">
            <Clock className="h-3.5 w-3.5" />
            <span className="uppercase tracking-[0.16em]">{effectiveLabel === 'Sin manuscrito' ? 'Manuscrito Recibido' : effectiveLabel}</span>
          </div>

          <h1 className="font-serif text-3xl font-normal tracking-tight text-ink sm:text-4xl lg:text-5xl leading-[1.15]">
            {projectTitle ? `«${projectTitle}» está en proceso de lectura.` : 'Tu obra está en lectura por nuestro equipo artístico.'}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-ink-muted font-light">
            {submittedDate ? `Registrado el ${submittedDate}. ` : ''}
            {presentation.nextActionDescription}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {onToggleCarousel && (
              <Button
                variant="primary"
                className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em]"
                onClick={onToggleCarousel}
              >
                <Sparkles className="h-4 w-4" />
                <span>Ver Ruta Editorial (3 Pasos)</span>
              </Button>
            )}
            {onViewFilesClick && (
              <Button
                variant="secondary"
                className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em]"
                onClick={onViewFilesClick}
              >
                <BookOpen className="h-4 w-4 text-accent" />
                <span>Ver Manuscrito en Custodia</span>
              </Button>
            )}
            <div className="inline-flex items-center gap-2 rounded-2xl bg-surface/80 px-4 py-2.5 text-xs text-ink-muted border-edge/60">
              <Clock className="h-3.5 w-3.5 text-accent shrink-0" />
              <span>Siguiente paso: {presentation.nextActionTitle}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Active state
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border-edge/50 bg-surface-elevated/95 p-8 sm:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.03)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,_var(--color-accent)_0%,_transparent_35%)] opacity-[0.07]" />

      <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="uppercase tracking-[0.15em]">{effectiveLabel || statusLabel || 'En Producción Audiocinematográfica'}</span>
            </span>
            <span className="text-xs text-ink-muted/70 tracking-wide font-mono">Obra Activa</span>
          </div>

          <h1 className="font-serif text-3xl font-normal tracking-tight text-ink sm:text-4xl lg:text-5xl">
            {projectTitle || 'Proyecto sin título'}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-ink-muted font-light">
            Monitoreo en tiempo real de grabaciones, edición musical, mezclas y aprobación de capítulos máster.
          </p>
        </div>

        {/* Progress Gauge */}
        <div className="flex shrink-0 flex-col items-start rounded-2xl border-edge/50 bg-surface/80 p-6 sm:min-w-[240px] shadow-2xs backdrop-blur-xs">
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-muted">Avance General</span>
            <span className="font-serif text-xl font-semibold text-accent">{effectiveProgress}%</span>
          </div>

          <div className="h-2 w-full rounded-full bg-edge/60 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: `${effectiveProgress}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-ink-muted/90">
            <Headphones className="h-3.5 w-3.5 text-accent shrink-0" />
            <span>Cabina de producción activa</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
