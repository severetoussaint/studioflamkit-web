'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NextActionCardProps {
  state: 'none' | 'pending' | 'active';
  pendingActionTitle?: string;
  pendingActionDesc?: string;
  buttonLabel?: string;
  onActionClick?: () => void;
}

export function NextActionCard({
  state,
  pendingActionTitle,
  pendingActionDesc,
  buttonLabel,
  onActionClick,
}: NextActionCardProps) {
  if (state === 'none') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-3xl border border-accent/30 bg-accent/8 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3.5 py-1 text-[11px] font-medium tracking-wide text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="uppercase tracking-[0.16em]">Siguiente Paso Recomendado</span>
            </div>
            <h3 className="font-serif text-2xl font-normal text-ink">Envía tu primer manuscrito</h3>
            <p className="text-xs sm:text-sm text-ink-muted/90 font-light leading-relaxed">
              Carga tu archivo en formato PDF o Word (.docx) para recibir una estimación de horas de locución y propuesta de producción sin compromiso.
            </p>
          </div>

          <Button
            variant="primary"
            className="shrink-0 flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs font-medium uppercase tracking-[0.15em] shadow-xs"
            onClick={onActionClick}
          >
            <span>Subir Mi Manuscrito</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  if (state === 'pending') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-3xl border border-amber-500/25 bg-amber-500/8 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3.5 py-1 text-[11px] font-medium tracking-wide text-amber-800 dark:text-amber-300">
              <Clock className="h-3.5 w-3.5" />
              <span className="uppercase tracking-[0.16em]">En Evaluación Editorial</span>
            </div>
            <h3 className="font-serif text-2xl font-normal text-ink">
              {pendingActionTitle || 'Evaluación en proceso por la dirección artística'}
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted/90 font-light leading-relaxed">
              {pendingActionDesc ||
                'No se requiere ninguna acción adicional de tu parte. Te notificaremos cuando el desglose técnico y la muestra de voz estén listos.'}
            </p>
          </div>

          {buttonLabel && onActionClick && (
            <Button
              variant="secondary"
              className="shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-medium uppercase tracking-[0.12em]"
              onClick={onActionClick}
            >
              <span>{buttonLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  // Active state
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-3xl border border-edge/80 bg-surface-elevated/90 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="uppercase tracking-[0.16em]">Producción en Curso</span>
          </div>
          <h3 className="font-serif text-2xl font-normal text-ink">
            {pendingActionTitle || 'Revisión y Aprobación de Capítulos'}
          </h3>
          <p className="text-xs sm:text-sm text-ink-muted/90 font-light leading-relaxed">
            {pendingActionDesc ||
              'Escucha las muestras de audio disponibles de cada capítulo, deja comentarios sobre las voces o aprueba para paso a máster final.'}
          </p>
        </div>

        {buttonLabel && onActionClick && (
          <Button
            variant="primary"
            className="shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-medium uppercase tracking-[0.15em] shadow-xs"
            onClick={onActionClick}
          >
            <span>{buttonLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
