"use client";

import React from "react";
import { ArrowRight, AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { AdminEditorialJourney } from "./adminEditorialJourney";

interface AdminNextActionCardProps {
  journey: AdminEditorialJourney | null;
  hasOpenReviews: boolean;
  legacyStatus?: string | null;
  onActionClick?: () => void;
}

export function AdminNextActionCard({ journey, hasOpenReviews, legacyStatus, onActionClick }: AdminNextActionCardProps) {
  if (!journey) {
    return (
      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5 text-[var(--color-text-muted)]" />
          <p className="text-sm text-[var(--color-text-secondary)]">Selecciona un proyecto para ver la siguiente acción administrativa.</p>
        </div>
      </div>
    );
  }

  const isBlocked = journey.isBlocked || hasOpenReviews;
  const actionExists = !!journey.nextActionTitle;

  return (
    <div className={`relative overflow-hidden rounded-3xl border bg-[var(--color-bg-elevated)] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] sm:p-8 ${isBlocked ? "border-amber-500/20" : "border-[var(--color-border)]"}`}>
      {isBlocked && <div className="absolute left-0 right-0 top-0 h-1 bg-amber-500/60" />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            {isBlocked ? <AlertCircle className="h-5 w-5 text-amber-500" /> : <CheckCircle2 className="h-5 w-5 text-[var(--color-accent)]" />}
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Siguiente acción administrativa</span>
          </div>
          <h3 className="font-serif text-xl font-semibold text-[var(--color-text)]">{journey.nextActionTitle}</h3>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">{journey.nextActionDescription}</p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          {actionExists && onActionClick ? (
            <button onClick={onActionClick} className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-white transition-all duration-200 ease-out hover:bg-[var(--color-accent-hover)]">
              Ejecutar acción<ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)]">
              <Info className="h-3.5 w-3.5" />Estado informativo — sin acción manual
            </span>
          )}
          {legacyStatus && <span className="text-xs text-[var(--color-text-muted)]">Estado legacy: {legacyStatus}</span>}
        </div>
      </div>
    </div>
  );
}
