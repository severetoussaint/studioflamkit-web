'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Headphones,
  Mic,
  Sliders,
  Sparkles,
  X,
  ArrowLeft,
} from 'lucide-react';

export interface RevisionesModalProps {
  open: boolean;
  onClose: () => void;
  maxRevisions?: number;
}

export function RevisionesModal({
  open,
  onClose,
  maxRevisions = 0,
}: RevisionesModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/65 backdrop-blur-xs"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-edge/80 bg-surface-elevated p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-edge/60 pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-edge bg-surface text-ink-muted hover:text-ink cursor-pointer transition sm:hidden"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                  <h3 className="font-serif text-xl font-medium tracking-tight text-ink">
                    Revisiones Incluidas
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Pactado
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full border border-edge bg-surface text-ink-muted hover:text-ink cursor-pointer transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-edge/60 bg-surface/70 p-5 text-left">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-4xl sm:text-5xl font-normal text-ink">
                  {maxRevisions}
                </span>
                <span className="text-xs text-ink-muted uppercase tracking-wider font-semibold">
                  Rondas completas
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-muted font-light">
                Revisiones incluidas en tu plan de producción de audiolibro.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-start gap-3.5 rounded-2xl border border-edge/50 bg-surface/50 p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Headphones className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">Garantía de calidad editorial</p>
                  <p className="text-xs text-ink-muted font-light">Incluida en tu paquete sin costo extra.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl border border-edge/50 bg-surface/50 p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Mic className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">Corrección de locución</p>
                  <p className="text-xs text-ink-muted font-light">Ajustes menores de pronunciación o entonación incluidos.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl border border-edge/50 bg-surface/50 p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Sliders className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">Mezcla y master</p>
                  <p className="text-xs text-ink-muted font-light">Ajustes dinámicos dentro de los parámetros pactados.</p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-edge/40 bg-surface-elevated p-4">
              <div className="flex items-center gap-2 text-ink-muted">
                <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-xs font-medium text-ink">Revisiones adicionales</p>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-muted font-light">
                Si se requieren revisiones adicionales al plan pactado o cambios estructurales en el texto grabado, se cotizarán por separado según tarifario vigente.
              </p>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-2xl bg-accent py-3 text-center text-xs font-semibold uppercase tracking-wider text-surface transition hover:bg-accent-hover active:scale-[0.99] cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
