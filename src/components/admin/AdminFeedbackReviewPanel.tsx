"use client";

import React from "react";
import { MessageSquareWarning, CheckCircle2, AlertCircle } from "lucide-react";
import type { AudioDeliverable } from "@/services/admin.service";

interface AdminFeedbackReviewPanelProps {
  deliverables: AudioDeliverable[];
  hasOpenReviews: boolean;
  onOpenFeedback?: (deliverable: AudioDeliverable) => void;
}

export function AdminFeedbackReviewPanel({ deliverables, hasOpenReviews, onOpenFeedback }: AdminFeedbackReviewPanelProps) {
  const deliverablesWithComments = deliverables.filter((d) => d.comments && d.comments.length > 0);
  const totalComments = deliverablesWithComments.reduce((sum, d) => sum + (d.comments?.length ?? 0), 0);

  return (
    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-warning-soft)]">
            <MessageSquareWarning className="h-4 w-4 text-[var(--color-warning)]" />
          </div>
          <h2 className="font-serif text-lg font-semibold text-[var(--color-text)]">Feedback / Revisión</h2>
        </div>
        {hasOpenReviews && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
            <AlertCircle className="h-3.5 w-3.5" />Abiertas
          </span>
        )}
      </div>

      {deliverablesWithComments.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">No hay comentarios de feedback registrados en los entregables.</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Los reviews abiertos se detectan desde el workspace de dominio.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deliverablesWithComments.map((del) => (
            <div key={del.id} onClick={() => onOpenFeedback?.(del)} className="cursor-pointer rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-4 transition-all hover:border-[var(--color-warning)]/20 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--color-text)]">{del.title}</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-accent)]">
                  {del.comments?.length} comentario{(del.comments?.length ?? 0) > 1 ? "s" : ""}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {del.comments?.slice(0, 2).map((comm) => (
                  <div key={comm.id} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${comm.sender === "admin" ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]" : "bg-[var(--color-premium-soft)] text-[var(--color-premium)]"}`}>
                      {comm.sender === "admin" ? "Admin" : "Autor"}
                    </span>
                    <span className="line-clamp-1">{comm.text}</span>
                  </div>
                ))}
                {(del.comments?.length ?? 0) > 2 && <p className="text-xs text-[var(--color-text-muted)]">+{(del.comments!.length - 2)} más…</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-3">
        <CheckCircle2 className="h-4 w-4 text-[var(--color-text-muted)]" />
        <p className="text-xs text-[var(--color-text-secondary)]">
          Estado de reviews desde dominio: <strong className={hasOpenReviews ? "text-amber-600 dark:text-amber-300" : "text-[var(--color-success)]"}>
            {hasOpenReviews ? "Hay reviews abiertas pendientes" : "Sin reviews abiertas"}
          </strong>
        </p>
      </div>
    </div>
  );
}
