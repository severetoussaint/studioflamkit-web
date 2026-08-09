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
  const isNone = state === 'none';
  const isPending = state === 'pending';

  const wrapperClassName = isNone
    ? 'border-accent/25 bg-surface-elevated'
    : isPending
    ? 'border-amber-500/25 bg-surface-elevated'
    : 'border-emerald-500/20 bg-surface-elevated';

  const badgeClassName = isNone
    ? 'border-accent/20 bg-accent/8 text-accent'
    : isPending
    ? 'border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-300'
    : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300';

  const badgeLabel = isNone
    ? 'Siguiente paso recomendado'
    : isPending
    ? 'En evaluación editorial'
    : 'Producción en curso';

  const title =
    pendingActionTitle ||
    (isNone
      ? 'Envía tu primer manuscrito'
      : isPending
      ? 'Evaluación en proceso por la dirección artística'
      : 'Revisión y aprobación de capítulos');

  const description =
    pendingActionDesc ||
    (isNone
      ? 'Carga tu archivo en formato PDF o Word (.docx) para recibir una estimación de horas de locución y propuesta de producción sin compromiso.'
      : isPending
      ? 'No se requiere ninguna acción adicional de tu parte. Te notificaremos cuando el desglose técnico y la muestra de voz estén listos.'
      : 'Escucha las muestras de audio disponibles de cada capítulo, deja comentarios sobre las voces o aprueba para paso a máster final.');

  const buttonVariant = isPending ? 'secondary' : 'primary';
  const buttonClassName = isPending
    ? 'shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-medium uppercase tracking-[0.12em]'
    : 'shrink-0 flex items-center justify-center gap-2.5 px-6 py-3.5 text-xs font-medium uppercase tracking-[0.15em] shadow-xs transition-all duration-300 hover:shadow-md';

  const icon = isNone ? (
    <Sparkles className="h-3.5 w-3.5" />
  ) : isPending ? (
    <Clock className="h-3.5 w-3.5" />
  ) : (
    <CheckCircle2 className="h-3.5 w-3.5" />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden rounded-3xl border p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.025)] backdrop-blur-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.035)] ${wrapperClassName}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(219,96,33,0.08),transparent_40%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <div className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${badgeClassName}`}>
            {icon}
            <span>{badgeLabel}</span>
          </div>

          <h3 className="mt-4 font-serif text-2xl sm:text-[1.65rem] font-normal tracking-tight text-ink leading-[1.12]">
            {title}
          </h3>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted/90 font-light">
            {description}
          </p>
        </div>

        {buttonLabel && onActionClick && (
          <div className="shrink-0">
            <Button variant={buttonVariant} className={buttonClassName} onClick={onActionClick}>
              <span>{buttonLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
