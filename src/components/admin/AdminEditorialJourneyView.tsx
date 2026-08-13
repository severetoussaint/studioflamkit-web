"use client";

import React from 'react';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Radio,
  Inbox,
  Search,
  FileText,
  Mic2,
  MessageSquareWarning,
  PackageCheck,
} from 'lucide-react';
import type { AdminEditorialJourneyModel, AdminEditorialStep, AdminEditorialPhase } from './adminEditorialJourney.model';

interface AdminEditorialJourneyViewProps {
  journey: AdminEditorialJourneyModel | null;
}

const PHASE_ICONS: Record<AdminEditorialPhase, React.ReactNode> = {
  recibido: <Inbox className="h-4 w-4" />,
  analisis: <Search className="h-4 w-4" />,
  propuesta: <FileText className="h-4 w-4" />,
  produccion: <Mic2 className="h-4 w-4" />,
  revision: <MessageSquareWarning className="h-4 w-4" />,
  entrega: <PackageCheck className="h-4 w-4" />,
};

function StepIcon({ status }: { status: AdminEditorialStep['status'] }) {
  if (status === 'completado') {
    return <CheckCircle2 className="h-5 w-5 text-[var(--color-premium)]" />;
  }
  if (status === 'activo') {
    return <Radio className="h-5 w-5 text-[var(--color-accent)]" />;
  }
  if (status === 'bloqueado') {
    return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  }
  return <Circle className="h-5 w-5 text-[var(--color-text-muted)]" />;
}

function StepConnector({ done }: { done: boolean }) {
  return (
    <div className="hidden flex-1 px-2 sm:block">
      <div
        className={`h-0.5 w-full rounded-full transition-colors duration-300 ${
          done ? 'bg-[var(--color-premium)]/40' : 'bg-[var(--color-border)]'
        }`}
      />
    </div>
  );
}

export function AdminEditorialJourneyView({ journey }: AdminEditorialJourneyViewProps) {
  if (!journey) {
    return (
      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <h2 className="font-serif text-xl font-semibold text-[var(--color-text)]">Ruta Editorial</h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">Selecciona una obra para ver su ruta.</p>
      </div>
    );
  }

  const activeIndex = journey.steps.findIndex((s) => s.status === 'activo' || s.status === 'bloqueado');

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold text-[var(--color-text)]">Ruta Editorial de la Obra</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Etapa {activeIndex >= 0 ? activeIndex + 1 : 1} de {journey.steps.length}
          </p>
        </div>
        {journey.isBlocked && (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            Requiere atención
          </span>
        )}
      </div>

      {/* Horizontal Stepper */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {journey.steps.map((step, index) => {
          const isLast = index === journey.steps.length - 1;
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-1 flex-col items-center text-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    step.status === 'completado'
                      ? 'border-[var(--color-premium)] bg-[var(--color-premium-soft)]'
                      : step.status === 'activo'
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                      : step.status === 'bloqueado'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-secondary)]'
                  }`}
                >
                  {PHASE_ICONS[step.id]}
                </div>
                <div className="mt-3 space-y-1">
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      step.status === 'activo' || step.status === 'bloqueado'
                        ? 'text-[var(--color-accent)]'
                        : step.status === 'completado'
                        ? 'text-[var(--color-premium)]'
                        : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    Paso 0{index + 1}
                  </p>
                  <h3 className="text-sm font-semibold text-[var(--color-text)]">{step.title}</h3>
                  <p className="hidden text-xs text-[var(--color-text-secondary)] sm:block">{step.description}</p>
                  {(step.status === 'activo' || step.status === 'bloqueado') && (
                    <p className="text-xs font-medium text-[var(--color-accent)]">{step.adminHint}</p>
                  )}
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                      step.status === 'completado'
                        ? 'bg-[var(--color-premium-soft)] text-[var(--color-premium)]'
                        : step.status === 'activo'
                        ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                        : step.status === 'bloqueado'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300'
                        : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {step.status === 'completado'
                      ? 'Completado'
                      : step.status === 'activo'
                      ? 'En Curso'
                      : step.status === 'bloqueado'
                      ? 'Bloqueado'
                      : 'Pendiente'}
                  </span>
                </div>
              </div>
              {!isLast && <StepConnector done={index < activeIndex} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
