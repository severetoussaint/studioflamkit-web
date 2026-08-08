'use client';

import React from 'react';
import { Headphones, MessageCircle, Clock, ShieldCheck, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SupportPanelProps {
  producerName?: string;
  producerRole?: string;
  responseSLA?: string;
  contactEmail?: string;
  onOpenMessageModal?: () => void;
}

export function SupportPanel({
  producerName = 'Equipo Editorial Flamkit',
  producerRole = 'Dirección de Arte & Sonido',
  responseSLA = 'Atención directa < 24 hrs',
  contactEmail = 'contacto@studioflamkit.com',
  onOpenMessageModal,
}: SupportPanelProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-edge/80 bg-surface-elevated/90 p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.02)] backdrop-blur-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/20 hover:shadow-[0_16px_48px_rgba(0,0,0,0.035)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(242,107,46,0.07),transparent_35%)]" />

      <div className="relative z-10 mb-5 flex items-start justify-between gap-4 border-b border-edge/40 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/15 bg-accent/5 text-accent shadow-[0_8px_24px_rgba(242,107,46,0.08)]">
            <Headphones className="h-5 w-5" strokeWidth={1.6} />
          </div>
          <div>
            <h3 className="font-serif text-xl font-normal tracking-tight text-ink">Acompañamiento Editorial</h3>
            <p className="mt-0.5 text-xs font-light text-ink-muted/80">
              Atención directa con la dirección de producción
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-300">
          <Clock className="h-3 w-3" />
          <span>Activo</span>
        </span>
      </div>

      <div className="relative z-10 space-y-4 text-sm">
        <div className="rounded-2xl border border-edge/60 bg-surface/60 p-4 sm:p-4.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-muted/75">Equipo Asignado</p>
          <p className="mt-1.5 font-serif text-base font-normal text-ink">{producerName}</p>
          <p className="mt-0.5 text-xs font-light text-ink-muted/80">{producerRole}</p>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 text-xs font-light text-ink-muted/80">
          <div className="flex items-center gap-2 rounded-2xl border border-edge/50 bg-surface/50 p-3">
            <Clock className="h-3.5 w-3.5 shrink-0 text-accent/80" />
            <span>{responseSLA}</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-edge/50 bg-surface/50 p-3">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-accent/80" />
            <span>Confidencialidad absoluta</span>
          </div>
        </div>

        <div className="pt-1">
          {onOpenMessageModal ? (
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-3.5 text-xs font-medium uppercase tracking-[0.14em] transition-all duration-300 hover:-translate-y-0.5"
              onClick={onOpenMessageModal}
            >
              <MessageCircle className="h-4 w-4 text-accent" />
              <span>Enviar Consulta o Nota Editorial</span>
            </Button>
          ) : (
            <a
              href={`mailto:${contactEmail}`}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-edge/60 bg-surface px-4 py-3.5 text-xs font-medium uppercase tracking-[0.14em] text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/25 hover:bg-surface-elevated"
            >
              <Mail className="h-4 w-4 text-accent" />
              <span>Escribir a {contactEmail}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
