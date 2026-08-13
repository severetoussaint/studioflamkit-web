"use client";

import React from "react";
import { BarChart3, Layers, TrendingUp } from "lucide-react";
import type { ProjectProgress } from "@/types/domain.types";

interface AdminProgressPanelProps {
  progress: ProjectProgress | null;
  legacyProgress?: number;
  currentStageName?: string | null;
}

export function AdminProgressPanel({ progress, legacyProgress, currentStageName }: AdminProgressPanelProps) {
  const effectivePercentage = progress?.percentage ?? legacyProgress ?? 0;
  const completed = progress?.completedStages ?? 0;
  const total = progress?.totalStages ?? 0;

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
          <BarChart3 className="h-4 w-4 text-[var(--color-accent)]" />
        </div>
        <h2 className="font-serif text-lg font-semibold text-[var(--color-text)]">Progreso de Producción</h2>
      </div>

      <div className="flex items-end justify-between">
        <span className="font-serif text-4xl font-semibold text-[var(--color-accent)]">{effectivePercentage}%</span>
        <span className="mb-1 text-xs font-medium text-[var(--color-text-muted)]">{completed} de {total} etapas completadas</span>
      </div>

      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
        <div className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-700 ease-out" style={{ width: `${effectivePercentage}%` }} />
      </div>

      {currentStageName && (
        <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
          <Layers className="h-4 w-4 text-[var(--color-text-muted)]" />
          <span>Etapa actual: <strong className="text-[var(--color-text)]">{currentStageName}</strong></span>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-4">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <TrendingUp className="h-3.5 w-3.5" />Completadas
          </div>
          <p className="mt-1 font-serif text-2xl font-semibold text-[var(--color-premium)]">{completed}</p>
        </div>
        <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-4">
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <Layers className="h-3.5 w-3.5" />Pendientes
          </div>
          <p className="mt-1 font-serif text-2xl font-semibold text-[var(--color-text)]">{Math.max(0, total - completed)}</p>
        </div>
      </div>
    </div>
  );
}
