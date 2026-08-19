"use client";

import React from 'react';
import {
  BookOpen,
  User,
  Calendar,
  Hash,
  Clock,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import type { Project, ProjectProgress } from '@/types/domain.types';
import type { AdminProject } from '@/services/admin.service';

interface AdminProjectHeaderProps {
  workspaceProject: Project | null;
  legacyProject: AdminProject | null;
  progress: ProjectProgress | null;
  hasOpenReviews: boolean;
  currentPhaseLabel: string;
  onDeleteProject?: () => void;
}

export function AdminProjectHeader({
  workspaceProject,
  legacyProject,
  progress,
  hasOpenReviews,
  currentPhaseLabel,
  onDeleteProject,
}: AdminProjectHeaderProps) {
  const title = workspaceProject
    ? legacyProject?.title ?? 'Obra sin título'
    : legacyProject?.title ?? 'Selecciona una obra';
  const author = legacyProject?.client ?? 'Autor no asignado';
  const updatedAt = legacyProject?.lastUpdate ?? '';
  const projectId = workspaceProject?.id ?? legacyProject?.id ?? '';

  const statusColor =
    workspaceProject?.status === 'completed'
      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
      : workspaceProject?.status === 'review'
      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
      : workspaceProject?.status === 'production'
      ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent)]/20'
      : 'bg-[var(--color-premium-soft)] text-[var(--color-premium)] border-[var(--color-premium)]/20';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
      {/* Decorative top line */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-premium)] to-[var(--color-accent)] opacity-60" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Left: Title + Meta */}
        <div className="flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusColor}`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              {currentPhaseLabel}
            </span>
            {hasOpenReviews && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                <AlertCircle className="h-3.5 w-3.5" />
                Reviews abiertas
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--color-text)] lg:text-4xl">
            {title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--color-text-secondary)]">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4 text-[var(--color-text-muted)]" />
              {author}
            </span>
            {updatedAt && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[var(--color-text-muted)]" />
                Actualizado: {updatedAt}
              </span>
            )}
            {projectId && (
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--color-text-muted)]">
                <Hash className="h-3.5 w-3.5" />
                {projectId.slice(0, 8)}…
              </span>
            )}
            {onDeleteProject && projectId && (
              <button
                type="button"
                onClick={onDeleteProject}
                title="Eliminar obra"
                className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] transition hover:text-rose-600 dark:hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Eliminar obra</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Quick Progress */}
        {progress && (
          <div className="flex min-w-[200px] flex-col items-end gap-2 lg:items-start">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <Clock className="h-4 w-4 text-[var(--color-text-muted)]" />
              <span>Progreso real de producción</span>
            </div>
            <div className="w-full">
              <div className="flex items-end justify-between">
                <span className="font-serif text-3xl font-semibold text-[var(--color-accent)]">
                  {progress.percentage}%
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {progress.completedStages}/{progress.totalStages} etapas
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500 ease-out"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
