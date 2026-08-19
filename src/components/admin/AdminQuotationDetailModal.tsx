'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, BookOpen, Clock, FileText, User, Sparkles, ShieldCheck } from 'lucide-react';
import type { QuotationRequest } from '@/services/admin.service';
import type { ProjectBrief } from '@/types/project-brief.types';
import { AdminProjectBriefPanel } from '@/components/admin/AdminProjectBriefPanel';

interface AdminQuotationDetailModalProps {
  isOpen: boolean;
  request: QuotationRequest | null;
  brief: ProjectBrief | null;
  loadingBrief: boolean;
  briefError: string | null;
  onClose: () => void;
  onRequestUpdated?: () => void;
}

export function AdminQuotationDetailModal({
  isOpen,
  request,
  brief,
  loadingBrief,
  briefError,
  onClose,
  onRequestUpdated,
}: AdminQuotationDetailModalProps) {
  if (!isOpen || !request) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 16 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="quotation-detail-title"
          className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] shadow-2xl"
        >
          {/* Header */}
          <header className="shrink-0 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] px-6 py-5 sm:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent)]/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                    <Sparkles className="h-3.5 w-3.5" /> Expediente de Solicitud
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    Estado: <strong className="font-semibold text-[var(--color-text)]">{request.request.status === 'pending' ? 'Recibido (Pendiente)' : request.request.status === 'evaluating' ? 'En análisis interno' : request.request.status}</strong>
                  </span>
                </div>
                <h2 id="quotation-detail-title" className="font-serif text-2xl font-semibold text-[var(--color-text)]">
                  {request.title || 'Manuscrito sin título'}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-secondary)]">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-[var(--color-text-muted)]" /> Autor: {request.client}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-[var(--color-text-muted)]" /> {request.chapters} capítulos
                  </span>
                  {request.wordCount && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-[var(--color-text-muted)]" /> {request.wordCount.toLocaleString()} palabras
                    </span>
                  )}
                  <span>Cotización: ${request.amount} USD</span>
                </div>
              </div>

              <button
                type="button"
                id="btn-close-quotation-modal"
                onClick={onClose}
                aria-label="Cerrar modal"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Workflow Guidance Banner */}
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-3.5 text-xs text-[var(--color-text-secondary)]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
              <p className="leading-relaxed">
                <strong>Flujo de Análisis Editorial:</strong> Revisa el brief del autor y pulsa <em>«Aceptar solicitud y comenzar análisis»</em> para pasar a la fase de evaluación. La aceptación de la solicitud abre el análisis interno y no crea proyectos en producción ni propuestas automáticas.
              </p>
            </div>
          </header>

          {/* Modal Content Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {loadingBrief ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
                <p className="mt-3 text-sm text-[var(--color-text-muted)]">Cargando información del Brief…</p>
              </div>
            ) : briefError ? (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-700 dark:text-rose-300">
                <p className="font-semibold">Aviso sobre el Brief:</p>
                <p className="mt-1">{briefError}</p>
                <div className="mt-4">
                  <AdminProjectBriefPanel
                    brief={brief}
                    onRequestUpdated={onRequestUpdated}
                  />
                </div>
              </div>
            ) : (
              <AdminProjectBriefPanel
                brief={brief}
                onRequestUpdated={onRequestUpdated}
              />
            )}
          </div>

          {/* Footer */}
          <footer className="shrink-0 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)] px-6 py-4 sm:px-8 flex justify-end">
            <button
              type="button"
              id="btn-close-quotation-modal-footer"
              onClick={onClose}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-5 py-2.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)]"
            >
              Cerrar expediente
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
