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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-accent/30 bg-accent/10 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Siguiente Acción Requerida</span>
            </div>
            <h3 className="font-serif text-2xl font-medium text-ink">Envía tu primer manuscrito</h3>
            <p className="text-sm text-ink-muted">
              Carga tu archivo PDF o Word para que nuestro equipo realice la primera estimación sin costo.
            </p>
          </div>

          <Button
            variant="primary"
            className="shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium"
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
              <Clock className="h-3.5 w-3.5" />
              <span>Estado Editorial</span>
            </div>
            <h3 className="font-serif text-2xl font-medium text-ink">
              {pendingActionTitle || 'Evaluación en proceso por la dirección artística'}
            </h3>
            <p className="text-sm text-ink-muted">
              {pendingActionDesc ||
                'No se requiere ninguna acción de tu parte en este momento. Te notificaremos cuando tu propuesta técnica esté lista.'}
            </p>
          </div>

          {buttonLabel && onActionClick && (
            <Button
              variant="secondary"
              className="shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium"
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-edge bg-surface-elevated p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Obra en curso</span>
          </div>
          <h3 className="font-serif text-2xl font-medium text-ink">
            {pendingActionTitle || 'Revisión y Aprobación de Capítulos'}
          </h3>
          <p className="text-sm text-ink-muted">
            {pendingActionDesc ||
              'Escucha las muestras de audio disponibles de cada capítulo, deja comentarios sobre las voces o aprueba para paso a máster final.'}
          </p>
        </div>

        {buttonLabel && onActionClick && (
          <Button
            variant="primary"
            className="shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium"
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
