'use client';

import React from 'react';
import { Clock, BookOpen, Trash2, ArrowRight, User, Hash, FileText } from 'lucide-react';
import type { QuotationRequest } from '@/services/admin.service';

interface AdminQuotationCardProps {
  request: QuotationRequest;
  onOpenDetail: (request: QuotationRequest) => void;
  onDelete?: (id: string) => void;
}

export function AdminQuotationCard({ request, onOpenDetail, onDelete }: AdminQuotationCardProps) {
  const isPending = request.request.status === 'pending';
  const isEvaluating = request.request.status === 'evaluating';
  const isAccepted = request.request.status === 'accepted';
  const isRejected = request.request.status === 'rejected';

  const statusBadge = (() => {
    if (isPending) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
          <Clock className="h-3.5 w-3.5" /> Recibido (Pendiente)
        </span>
      );
    }
    if (isEvaluating) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-700 dark:text-sky-300">
          <Clock className="h-3.5 w-3.5" /> En análisis interno
        </span>
      );
    }
    if (isAccepted) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          Aceptada
        </span>
      );
    }
    if (isRejected) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-700 dark:text-rose-300">
          Rechazada
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-text-muted)]">
        {request.request.status}
      </span>
    );
  })();

  return (
    <article
      id={`quotation-card-${request.id}`}
      className="group relative flex flex-col justify-between rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-xs transition-all duration-200 hover:border-[var(--color-accent)]/50 hover:shadow-md"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium text-[var(--color-text-secondary)]">{request.client || 'Autor no especificado'}</span>
          </div>
          {statusBadge}
        </div>

        {/* Title */}
        <h3 className="mt-3 font-serif text-lg font-semibold text-[var(--color-text)] transition group-hover:text-[var(--color-accent)]">
          {request.title || 'Manuscrito sin título'}
        </h3>

        {/* Manuscript Link info */}
        {request.request.manuscriptId && (
          <p className="mt-1 flex items-center gap-1 font-mono text-[11px] text-[var(--color-text-muted)]">
            <Hash className="h-3 w-3 shrink-0" /> ID: {request.request.manuscriptId.slice(0, 16)}…
          </p>
        )}

        {/* Metadata grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-3 text-xs text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
            <span>{request.chapters || 0} capítulos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
            <span>{request.wordCount ? `${request.wordCount.toLocaleString()} pal.` : 'Sin palabras'}</span>
          </div>
          <div className="col-span-2 mt-1 flex items-baseline justify-between border-t border-[var(--color-border-subtle)] pt-2">
            <span className="text-[11px] text-[var(--color-text-muted)]">Cotización solicitada:</span>
            <span className="font-semibold text-[var(--color-text)]">${request.amount || 0} USD</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center justify-between gap-2 border-t border-[var(--color-border-subtle)] pt-4">
        <button
          type="button"
          id={`btn-open-request-${request.id}`}
          onClick={() => onOpenDetail(request)}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 active:scale-[0.99]"
        >
          <span>Ver expediente y Brief</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>

        {onDelete && (
          <button
            type="button"
            id={`btn-delete-request-${request.id}`}
            onClick={() => onDelete(request.id)}
            title="Eliminar solicitud"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </article>
  );
}
