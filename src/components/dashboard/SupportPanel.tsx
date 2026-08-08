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
    <div className="rounded-3xl border border-edge/80 bg-surface-elevated/90 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
      <div className="mb-5 flex items-center justify-between border-b border-edge/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/8 text-accent">
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-normal text-ink">Acompañamiento Editorial</h3>
            <p className="text-xs text-ink-muted/80">Atención directa con la dirección de producción</p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-emerald-800 dark:text-emerald-300">
          <Clock className="h-3 w-3" />
          <span>Activo</span>
        </span>
      </div>

      <div className="space-y-4 text-sm">
        <div className="rounded-2xl border border-edge/60 bg-surface/70 p-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted/80">Equipo Asignado</p>
          <p className="mt-1 font-serif text-base font-normal text-ink">{producerName}</p>
          <p className="text-xs text-ink-muted/80 font-light mt-0.5">{producerRole}</p>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 text-xs text-ink-muted/80 font-light">
          <div className="flex items-center gap-2 rounded-xl border border-edge/50 bg-surface/40 p-3">
            <Clock className="h-3.5 w-3.5 shrink-0 text-accent/80" />
            <span>{responseSLA}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-edge/50 bg-surface/40 p-3">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-accent/80" />
            <span>Confidencialidad absoluta</span>
          </div>
        </div>

        <div className="pt-1">
          {onOpenMessageModal ? (
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 py-3 text-xs font-medium uppercase tracking-[0.12em]"
              onClick={onOpenMessageModal}
            >
              <MessageCircle className="h-4 w-4 text-accent" />
              <span>Enviar Consulta o Nota Editorial</span>
            </Button>
          ) : (
            <a
              href={`mailto:${contactEmail}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-edge/60 bg-surface px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-ink transition hover:bg-surface-elevated hover:border-accent/30"
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
