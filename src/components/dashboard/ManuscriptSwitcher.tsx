'use client';

import React from 'react';
import { ChevronRight, Clock, Sparkles } from 'lucide-react';
import type { AuthorRequestContext } from '@/services/manuscript.service';

function formatDate(value: string | null | undefined): string {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export interface ManuscriptSwitcherProps {
  manuscripts: AuthorRequestContext['manuscripts'];
  selectedManuscriptId: string | null;
  onSelect: (id: string) => void;
}

export function ManuscriptSwitcher({
  manuscripts,
  selectedManuscriptId,
  onSelect,
}: ManuscriptSwitcherProps) {
  if (!manuscripts || manuscripts.length <= 1) return null;

  return (
    <div className="rounded-3xl border border-edge/70 bg-surface-elevated/90 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-muted/80">Manuscrito activo</p>
          <h2 className="mt-1 font-serif text-xl font-normal tracking-tight text-ink">Selecciona qué obra quieres revisar</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/8 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{manuscripts.length} archivos disponibles</span>
        </span>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {manuscripts.map((manuscript, index) => {
          const isActive = manuscript.id === selectedManuscriptId;
          return (
            <button
              key={manuscript.id}
              type="button"
              onClick={() => onSelect(manuscript.id)}
              className={`group min-w-[220px] rounded-2xl border px-4 py-3 text-left transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${
                isActive
                  ? 'border-accent/30 bg-accent/8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]'
                  : 'border-edge/60 bg-surface/70 hover:border-accent/20 hover:bg-surface'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted/70">Archivo {index + 1}</p>
                  <p className="mt-1 line-clamp-2 font-serif text-base font-normal tracking-tight text-ink">{manuscript.title}</p>
                  <p className="mt-1 text-xs font-light text-ink-muted/80">Subido el {formatDate(manuscript.createdAt)}</p>
                </div>
                <span className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${isActive ? 'border-accent/30 bg-accent/15 text-accent' : 'border-edge/60 bg-surface-elevated text-ink-muted'}`}>
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${isActive ? 'border-accent/20 bg-accent/8 text-accent' : 'border-edge/60 bg-surface text-ink-muted'}`}>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{manuscript.requestStatus || 'sin estado'}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
