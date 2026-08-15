'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Headphones,
  Clock,
  ShieldCheck,
  MessageCircle,
  X,
  ArrowLeft,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface AcompanamientoModalProps {
  open: boolean;
  onClose: () => void;
  producerName?: string;
  producerRole?: string;
  responseSLA?: string;
}

export function AcompanamientoModal({
  open,
  onClose,
  producerName = 'Equipo Editorial Flamkit',
  producerRole = 'Dirección de Arte & Sonido',
  responseSLA = 'Atención directa < 24 hrs',
}: AcompanamientoModalProps) {
  const router = useRouter();

  const handleContact = () => {
    onClose();
    router.push('/contacto');
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/65 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-edge/80 bg-surface-elevated p-6 shadow-2xl"
          >
            {/* Header */}
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
                  <Headphones className="h-5 w-5 text-accent" />
                  <h3 className="font-serif text-xl font-medium tracking-tight text-ink">
                    Acompañamiento Editorial
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Activo
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

            <p className="mt-4 text-xs text-ink-muted font-light">
              Atención directa con la dirección de producción y edición sonora.
            </p>

            {/* Equipo asignado card */}
            <div className="mt-4 rounded-2xl border border-edge/60 bg-surface/70 p-5">
              <div className="flex items-center gap-2 text-ink-muted mb-2">
                <Users className="h-4 w-4 text-accent" />
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted">
                  Equipo Asignado
                </p>
              </div>
              <h4 className="font-serif text-xl font-medium text-ink">{producerName}</h4>
              <p className="text-xs text-ink-muted font-light mt-0.5">{producerRole}</p>

              <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-edge/50">
                <div className="flex items-center gap-2 rounded-xl bg-surface p-2.5 text-xs text-ink">
                  <Clock className="h-4 w-4 text-accent shrink-0" />
                  <span className="text-[11px] font-medium leading-tight">{responseSLA}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-surface p-2.5 text-xs text-ink">
                  <ShieldCheck className="h-4 w-4 text-accent shrink-0" />
                  <span className="text-[11px] font-medium leading-tight">Confidencialidad absoluta</span>
                </div>
              </div>
            </div>

            {/* Message info */}
            <div className="mt-4 rounded-2xl border border-edge/40 bg-surface-elevated p-4 text-xs text-ink-muted font-light leading-relaxed">
              Tu equipo te acompañará durante el casting de voz, ajustes de dicción, masterización y entrega final en formatos listos para plataformas.
            </div>

            {/* Action CTA */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleContact}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-surface transition hover:bg-accent-hover active:scale-[0.99] cursor-pointer shadow-xs"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Enviar Consulta Editorial</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
