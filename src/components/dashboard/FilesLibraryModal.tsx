'use client';

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowDownToLine,
  Clock,
  FileText,
  Layers3,
  X,
  BookOpen,
  FolderOpen,
  Download,
  Filter,
} from 'lucide-react';
import type { DashboardFileLibraryData, DashboardFileItem } from '@/services/file.service';

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

export interface FilesLibraryModalProps {
  open: boolean;
  onClose: () => void;
  data: DashboardFileLibraryData | null;
}

type TabType = 'all' | 'manuscripts' | 'projectFiles' | 'deliverables';

export function FilesLibraryModal({ open, onClose, data }: FilesLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const manuscripts = data?.manuscripts;
  const projectFiles = data?.projectFiles;
  const deliverables = data?.deliverables;
  const allItems = data?.allItems;

  const tabCounts = {
    all: allItems?.length ?? 0,
    manuscripts: manuscripts?.length ?? 0,
    projectFiles: projectFiles?.length ?? 0,
    deliverables: deliverables?.length ?? 0,
  };

  const displayedItems = useMemo<DashboardFileItem[]>(() => {
    switch (activeTab) {
      case 'manuscripts':
        return manuscripts ?? [];
      case 'projectFiles':
        return projectFiles ?? [];
      case 'deliverables':
        return deliverables ?? [];
      case 'all':
      default:
        return allItems ?? [];
    }
  }, [activeTab, manuscripts, projectFiles, deliverables, allItems]);

  const tabs = [
    { id: 'all' as const, label: 'Todos', count: tabCounts.all, icon: Layers3 },
    { id: 'manuscripts' as const, label: 'Manuscritos', count: tabCounts.manuscripts, icon: BookOpen },
    { id: 'projectFiles' as const, label: 'Producción', count: tabCounts.projectFiles, icon: FolderOpen },
    { id: 'deliverables' as const, label: 'Entregables', count: tabCounts.deliverables, icon: Download },
  ];

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xs cursor-pointer"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 flex w-full max-w-3xl max-h-[85vh] sm:max-h-[80vh] flex-col overflow-hidden rounded-3xl border border-edge/80 bg-surface-elevated shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-edge/60 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                  <Layers3 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif text-lg sm:text-xl font-normal tracking-tight text-ink truncate">
                    Biblioteca de Archivos
                  </h3>
                  <p className="text-[11px] text-ink-muted font-light truncate">
                    Archivos, entregables y versiones de la obra activa
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-edge/60 bg-surface text-ink-muted transition hover:border-accent/40 hover:text-accent cursor-pointer"
                aria-label="Cerrar biblioteca"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Compact Metric Bar */}
            <div className="grid grid-cols-3 gap-2 border-b border-edge/50 bg-surface/50 px-5 py-2.5 sm:px-6 text-center text-xs">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Total</p>
                <p className="font-serif text-sm font-medium text-ink mt-0.5">{tabCounts.all} archivos</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Aprobado</p>
                <p className="font-serif text-sm font-medium text-ink mt-0.5">{formatMoney(data?.acceptedAmount ?? 0)}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Etapa</p>
                <p className="font-serif text-sm font-medium text-accent mt-0.5 truncate">{data?.currentStage || 'En proceso'}</p>
              </div>
            </div>

            {/* Segmented Section Tabs */}
            <div className="border-b border-edge/60 bg-surface-elevated px-4 py-2 sm:px-6">
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-accent text-surface shadow-xs'
                          : 'bg-surface/80 text-ink-muted hover:text-ink hover:bg-surface border border-edge/50'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                          isActive ? 'bg-surface/20 text-surface' : 'bg-surface-elevated text-ink-muted'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable File List */}
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-2.5">
              {displayedItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-ink-muted">
                  <Filter className="mx-auto mb-2 h-7 w-7 text-ink-muted/40" />
                  <p className="font-medium text-ink">Sin archivos en esta sección</p>
                  <p className="mt-1 text-[11px] text-ink-muted/80">
                    Los archivos generados durante la producción aparecerán aquí.
                  </p>
                </div>
              ) : (
                displayedItems.map((file) => (
                  <div
                    key={file.id}
                    className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-edge/60 bg-surface/75 p-3.5 transition hover:border-accent/40 hover:bg-surface hover:shadow-xs"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-edge/60 bg-surface-elevated text-accent group-hover:scale-105 transition">
                        <FileText className="h-4 w-4" strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="font-serif text-sm font-medium text-ink group-hover:text-accent transition truncate">
                            {file.name}
                          </p>
                          <span className="rounded-md bg-surface-elevated border border-edge/60 px-1.5 py-0.2 text-[9px] font-medium uppercase tracking-wider text-ink-muted">
                            {file.kind === 'deliverable'
                              ? 'Entregable'
                              : file.kind === 'project_file'
                              ? 'Producción'
                              : 'Manuscrito'}
                          </span>
                        </div>

                        <p className="mt-0.5 text-[11px] text-ink-muted/80 font-light">
                          {file.sourceLabel} · {formatDate(file.createdAt)}
                          {file.sizeLabel ? ` · ${file.sizeLabel}` : ''}
                        </p>

                        {file.statusLabel || file.stageLabel ? (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {file.statusLabel ? (
                              <span className="rounded-full bg-surface border border-edge/60 px-2 py-0.5 text-[9px] font-medium text-ink-muted">
                                {file.statusLabel}
                              </span>
                            ) : null}
                            {file.stageLabel ? (
                              <span className="rounded-full bg-accent/10 border border-accent/20 px-2 py-0.5 text-[9px] font-medium text-accent">
                                {file.stageLabel}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {file.downloadUrl ? (
                        <a
                          href={file.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-edge bg-surface px-3 text-xs font-medium text-ink hover:border-accent/40 hover:text-accent transition shadow-2xs cursor-pointer"
                        >
                          <ArrowDownToLine className="h-3.5 w-3.5" />
                          <span>Descargar</span>
                        </a>
                      ) : (
                        <span className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-edge/50 bg-surface px-3 text-[11px] text-ink-muted">
                          <Clock className="h-3 w-3" />
                          <span>Procesando</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-edge/50 bg-surface-elevated px-5 py-3 text-right">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-edge bg-surface px-4 py-1.5 text-xs font-medium text-ink hover:border-accent/40 transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
