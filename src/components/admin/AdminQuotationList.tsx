'use client';

import React, { useMemo, useState } from 'react';
import { Inbox, AlertTriangle, Sparkles, Filter } from 'lucide-react';
import type { QuotationRequest } from '@/services/admin.service';
import { AdminQuotationCard } from './AdminQuotationCard';

interface AdminQuotationListProps {
  requests: QuotationRequest[];
  isLoading: boolean;
  error: string | null;
  onOpenRequest: (request: QuotationRequest) => void;
  onDeleteRequest?: (id: string) => void;
}

type FilterStatus = 'all' | 'pending' | 'evaluating' | 'accepted' | 'rejected';

export function AdminQuotationList({
  requests,
  isLoading,
  error,
  onOpenRequest,
  onDeleteRequest,
}: AdminQuotationListProps) {
  const [filter, setFilter] = useState<FilterStatus>('all');

  const filteredRequests = useMemo(() => {
    if (filter === 'all') return requests;
    return requests.filter((r) => r.request.status === filter);
  }, [requests, filter]);

  const counts = useMemo(() => {
    const pending = requests.filter((r) => r.request.status === 'pending').length;
    const evaluating = requests.filter((r) => r.request.status === 'evaluating').length;
    const accepted = requests.filter((r) => r.request.status === 'accepted').length;
    const rejected = requests.filter((r) => r.request.status === 'rejected').length;
    return { all: requests.length, pending, evaluating, accepted, rejected };
  }, [requests]);

  return (
    <section id="admin-quotations-section" className="space-y-6">
      {/* Header & Description */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
              <Sparkles className="h-3.5 w-3.5" /> Pipeline de Ingreso
            </span>
            <span className="text-xs font-medium text-[var(--color-text-muted)]">
              {requests.length} {requests.length === 1 ? 'solicitud' : 'solicitudes'} totales
            </span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-[var(--color-text)] sm:text-3xl">
            Solicitudes de Cotización y Análisis
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Revisa briefs de autor, inicia el análisis editorial y registra la evaluación técnica de cada obra.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] p-1.5 text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-xl px-3 py-1.5 font-medium transition ${filter === 'all' ? 'bg-[var(--color-accent)] text-white shadow-xs' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}
          >
            Todas ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`rounded-xl px-3 py-1.5 font-medium transition ${filter === 'pending' ? 'bg-[var(--color-accent)] text-white shadow-xs' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}
          >
            Recibidas ({counts.pending})
          </button>
          <button
            type="button"
            onClick={() => setFilter('evaluating')}
            className={`rounded-xl px-3 py-1.5 font-medium transition ${filter === 'evaluating' ? 'bg-[var(--color-accent)] text-white shadow-xs' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}
          >
            En análisis ({counts.evaluating})
          </button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] py-20 text-center shadow-xs">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-[var(--color-accent)] border-t-transparent" />
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">Cargando solicitudes de cotización…</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-6 py-20 text-center shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]">
            <Inbox className="h-8 w-8" />
          </div>
          <h3 className="mt-4 font-serif text-lg font-semibold text-[var(--color-text)]">
            {filter === 'all' ? 'No hay solicitudes de cotización' : `No hay solicitudes en estado «${filter}»`}
          </h3>
          <p className="mt-1 max-w-sm text-xs leading-5 text-[var(--color-text-muted)]">
            {filter === 'all'
              ? 'Cuando los autores envíen un manuscrito para cotizar y analizar, aparecerá aquí su expediente.'
              : 'Prueba seleccionando otro filtro para ver solicitudes en otros estados.'}
          </p>
        </div>
      ) : (
        /* Grid of quotation cards */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <AdminQuotationCard
              key={request.id}
              request={request}
              onOpenDetail={onOpenRequest}
              onDelete={onDeleteRequest}
            />
          ))}
        </div>
      )}
    </section>
  );
}
