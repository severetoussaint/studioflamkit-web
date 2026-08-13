"use client";

import React from "react";
import { ListMusic, Package, CheckCircle2, Circle, Play, Pause, Trash2 } from "lucide-react";
import type { AdminChapter, AudioDeliverable } from "@/services/admin.service";

interface AdminChaptersDeliverablesPanelProps {
  chapters: AdminChapter[];
  deliverables: AudioDeliverable[];
  onToggleDeliverable?: (deliverableId: string) => void;
  onOpenFeedback?: (deliverable: AudioDeliverable) => void;
  onUpdateChapterStatus?: (chapterId: string, status: "pendiente" | "cotizado" | "pagado" | "en_produccion" | "entregado") => void;
  onDeleteChapter?: (chapterId: string) => void;
}

export function AdminChaptersDeliverablesPanel({
  chapters,
  deliverables,
  onToggleDeliverable,
  onOpenFeedback,
  onUpdateChapterStatus,
  onDeleteChapter,
}: AdminChaptersDeliverablesPanelProps) {
  const completedChapters = chapters.filter((c) => c.status === "entregado").length;
  const completedDeliverables = deliverables.filter((d) => d.completed).length;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-soft)]">
              <ListMusic className="h-4 w-4 text-[var(--color-accent)]" />
            </div>
            <h2 className="font-serif text-lg font-semibold text-[var(--color-text)]">Capítulos</h2>
          </div>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">{completedChapters}/{chapters.length} entregados</span>
        </div>

        {chapters.length === 0 ? (
          <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">No hay capítulos creados en Supabase para este proyecto.</div>
        ) : (
          <div className="space-y-3">
            {chapters.map((ch) => (
              <div key={ch.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-4 transition-all hover:border-[var(--color-accent)]/20 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] text-xs font-bold text-[var(--color-text-muted)]">{ch.chapter_number}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">{ch.title}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{ch.word_count.toLocaleString()} pal · ~{ch.duration_minutes} min · ${ch.price} {ch.currency}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {onUpdateChapterStatus ? (
                    <select
                      value={ch.status}
                      onChange={(e) => onUpdateChapterStatus(ch.id, e.target.value as "pendiente" | "cotizado" | "pagado" | "en_produccion" | "entregado")}
                      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="cotizado">Cotizado</option>
                      <option value="pagado">Pagado</option>
                      <option value="en_produccion">En Producción</option>
                      <option value="entregado">Entregado</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium ${ch.status === "entregado" ? "bg-[var(--color-success-soft)] text-[var(--color-success)]" : ch.status === "en_produccion" ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]" : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"}`}>
                      {ch.status === "entregado" ? <CheckCircle2 className="h-3 w-3" /> : ch.status === "en_produccion" ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                      {ch.status.replace("_", " ")}
                    </span>
                  )}
                  {onDeleteChapter && (
                    <button onClick={() => onDeleteChapter(ch.id)} className="rounded-lg p-1.5 text-[var(--color-error)] transition-colors hover:bg-[var(--color-error-soft)]" title="Eliminar capítulo">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-premium-soft)]">
              <Package className="h-4 w-4 text-[var(--color-premium)]" />
            </div>
            <h2 className="font-serif text-lg font-semibold text-[var(--color-text)]">Deliverables</h2>
          </div>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">{completedDeliverables}/{deliverables.length} completados</span>
        </div>

        {deliverables.length === 0 ? (
          <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">No hay entregables de audio registrados.</div>
        ) : (
          <div className="space-y-3">
            {deliverables.map((del) => (
              <div key={del.id} className="group flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-4 transition-all hover:border-[var(--color-premium)]/20 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={() => onToggleDeliverable?.(del.id)} className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[var(--color-border)] transition-colors hover:border-[var(--color-accent)]">
                    {del.completed ? <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" /> : <Circle className="h-4 w-4 text-[var(--color-text-muted)]" />}
                  </button>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${del.completed ? "line-through text-[var(--color-text-muted)]" : "text-[var(--color-text)]"}`}>{del.title}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">Modificado: {del.updatedAt}</p>
                  </div>
                </div>
                <button onClick={() => onOpenFeedback?.(del)} className="shrink-0 text-xs font-medium text-[var(--color-accent)] transition-opacity hover:opacity-80">
                  Ver feedback
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

