'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowDownToLine, Clock, FileText, Layers3, X } from 'lucide-react';
import type { DashboardFileLibraryData } from '@/services/file.service';

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

function formatMoney(amount: number | null | undefined): string {
  const value = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function Metric({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-2xl border border-edge/60 bg-surface/70 px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted/80">{label}</p>
      <p className="mt-1 font-serif text-xl font-normal tracking-tight text-ink">{value}</p>
      {helper ? <p className="mt-1 text-xs font-light leading-relaxed text-ink-muted/80">{helper}</p> : null}
    </div>
  );
}

export interface FilesLibraryModalProps {
  open: boolean;
  onClose: () => void;
  data: DashboardFileLibraryData | null;
}

export function FilesLibraryModal({ open, onClose, data }: FilesLibraryModalProps) {
  const groups = [
    { key: 'manuscripts', label: 'Manuscritos', items: data?.manuscripts ?? [] },
    { key: 'projectFiles', label: 'Archivos del proyecto', items: data?.projectFiles ?? [] },
    { key: 'deliverables', label: 'Entregables', items: data?.deliverables ?? [] },
  ];

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="relative z-10 flex w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border border-edge/70 bg-surface-elevated shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-edge/50 px-5 py-5 sm:px-6">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-accent">
                  <Layers3 className="h-3.5 w-3.5" />
                  <span>Biblioteca de archivos</span>
                </div>
                <h3 className="mt-3 font-serif text-2xl font-normal tracking-tight text-ink">Todos los archivos del manuscrito seleccionado</h3>
                <p className="mt-2 text-xs font-light leading-relaxed text-ink-muted/80">
                  Manuscritos, archivos del proyecto y entregables asociados a la obra activa.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-edge/60 bg-surface text-ink-muted transition hover:border-accent/30 hover:text-accent cursor-pointer"
                aria-label="Cerrar biblioteca de archivos"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-3 border-b border-edge/50 px-5 py-5 sm:grid-cols-2 xl:grid-cols-4 sm:px-6">
              <Metric label="Archivos visibles" value={String(data?.allItems.length ?? 0)} helper={`${data?.manuscripts.length ?? 0} manuscritos · ${data?.projectFiles.length ?? 0} archivos · ${data?.deliverables.length ?? 0} entregables`} />
              <Metric label="Monto aprobado" value={formatMoney(data?.acceptedAmount ?? 0)} helper="Importe validado por admin" />
              <Metric label="Monto pagado" value={formatMoney(data?.paidAmount ?? 0)} helper="Pagos registrados" />
              <Metric label="Etapa actual" value={data?.currentStage || 'Sin etapa'} helper={data?.projectStatus || 'Sin proyecto activo'} />
            </div>

            <div className="max-h-[72vh] overflow-y-auto px-5 py-5 sm:px-6">
              <div className="space-y-8">
                {groups.map((group) => (
                  <section key={group.key} className="space-y-4">
                    <div>
                      <h4 className="font-serif text-xl font-normal tracking-tight text-ink">{group.label}</h4>
                      <p className="mt-1 text-xs text-ink-muted/80">{group.items.length} elemento{group.items.length === 1 ? '' : 's'} en esta sección</p>
                    </div>

                    {group.items.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-edge/60 bg-surface/30 p-6 text-center text-xs text-ink-muted/80">
                        No hay elementos para mostrar.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {group.items.map((file) => (
                          <div key={file.id} className="rounded-2xl border border-edge/60 bg-surface/75 p-4 sm:p-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="flex min-w-0 items-start gap-3.5">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-edge/60 bg-surface-elevated text-accent">
                                  <FileText className="h-4 w-4" strokeWidth={1.8} />
                                </div>

                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-serif text-base font-normal tracking-tight text-ink sm:text-lg">{file.name}</p>
                                    <span className="inline-flex items-center rounded-full border border-edge/60 bg-surface-elevated px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                                      {file.kind === 'deliverable' ? 'Entregable' : file.kind === 'project_file' ? 'Archivo de proyecto' : 'Manuscrito'}
                                    </span>
                                  </div>

                                  <p className="mt-1 text-xs font-light leading-relaxed text-ink-muted/80">
                                    {file.sourceLabel} · {formatDate(file.createdAt)}
                                  </p>

                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-edge/60 bg-surface px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                                      <span>{file.statusLabel}</span>
                                    </span>
                                    {file.sizeLabel ? (
                                      <span className="inline-flex items-center gap-1.5 rounded-full border border-edge/60 bg-surface px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                                        <span>{file.sizeLabel}</span>
                                      </span>
                                    ) : null}
                                    {file.amountLabel ? (
                                      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/8 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-accent">
                                        <span>Monto: {file.amountLabel}</span>
                                      </span>
                                    ) : null}
                                    {file.stageLabel ? (
                                      <span className="inline-flex items-center gap-1.5 rounded-full border border-edge/60 bg-surface px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                                        <span>{file.stageLabel}</span>
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-start lg:self-center">
                                {file.downloadUrl ? (
                                  <a
                                    href={file.downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-10 items-center gap-2 rounded-full border border-edge/60 bg-surface-elevated px-4 text-xs font-medium text-ink transition hover:border-accent/30 hover:text-accent"
                                  >
                                    <ArrowDownToLine className="h-3.5 w-3.5" />
                                    <span>Abrir</span>
                                  </a>
                                ) : (
                                  <span className="inline-flex h-10 items-center gap-2 rounded-full border border-edge/60 bg-surface-elevated px-4 text-xs font-medium text-ink-muted">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>Sin URL pública</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {file.details && file.details.length > 0 ? (
                              <div className="mt-4 grid gap-2 text-xs text-ink-muted/80 sm:grid-cols-2 xl:grid-cols-3">
                                {file.details.map((detail) => (
                                  <div key={detail} className="rounded-xl border border-edge/50 bg-surface px-3 py-2">
                                    {detail}
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
