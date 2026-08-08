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
  producerName = 'Equipo de Producción Flamkit',
  producerRole = 'Dirección Editorial & Diseño Sonoro',
  responseSLA = 'Respuesta garantizada en < 24 hrs',
  contactEmail = 'contacto@studioflamkit.com',
  onOpenMessageModal,
}: SupportPanelProps) {
  return (
    <div className="rounded-3xl border border-edge bg-surface-elevated p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      <div className="mb-5 flex items-center justify-between border-b border-edge/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
            <Headphones className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium text-ink">Acompañamiento Creativo</h3>
            <p className="text-xs text-ink-muted">Soporte directo con tu equipo asignado</p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
          <Clock className="h-3.5 w-3.5" />
          <span>Atención Directa</span>
        </span>
      </div>

      <div className="space-y-4 text-sm">
        <div className="rounded-2xl border border-edge bg-surface p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Productor Asignado</p>
          <p className="mt-1 font-serif text-base font-medium text-ink">{producerName}</p>
          <p className="text-xs text-ink-muted">{producerRole}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-xs text-ink-muted">
          <div className="flex items-center gap-2 rounded-xl border border-edge/60 bg-surface/50 p-3">
            <Clock className="h-4 w-4 shrink-0 text-accent" />
            <span>{responseSLA}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-edge/60 bg-surface/50 p-3">
            <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
            <span>Confidencialidad garantizada</span>
          </div>
        </div>

        <div className="pt-2">
          {onOpenMessageModal ? (
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 py-3 text-xs font-medium"
              onClick={onOpenMessageModal}
            >
              <MessageCircle className="h-4 w-4 text-accent" />
              <span>Enviar Observación o Consulta</span>
            </Button>
          ) : (
            <a
              href={`mailto:${contactEmail}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-edge bg-surface px-4 py-3 text-xs font-medium text-ink transition hover:bg-surface-elevated"
            >
              <Mail className="h-4 w-4 text-accent" />
              <span>Contactar a {contactEmail}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
