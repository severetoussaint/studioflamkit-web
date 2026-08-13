'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Clock, FolderOpen, UploadCloud, ChevronDown } from 'lucide-react';

export interface ManuscriptItem {
  id: string;
  title: string;
  requestStatus: string | null;
}

export interface SelectorInfo {
  label: string;
  progress: number | null;
  dotColor: string;
}

export interface DashboardHeaderProps {
  requestState: 'none' | 'pending' | 'active';
  hasActiveProject: boolean;
  requestContext: {
    projectId?: string | null;
    requestId?: string | null;
    title?: string | null;
    manuscripts?: ManuscriptItem[];
  } | null;
  projectTitle: string | null;
  activeManuscriptId: string | null;
  isSelectorOpen: boolean;
  onToggleSelector: () => void;
  onCloseSelector: () => void;
  onSelectManuscript: (manuscriptId: string) => void;
  getManuscriptSelectorInfo: (m: ManuscriptItem) => SelectorInfo;
  onOpenLibrary: () => void;
  onOpenUploader: () => void;
}

export function DashboardHeader({
  requestState,
  hasActiveProject,
  requestContext,
  projectTitle,
  activeManuscriptId,
  isSelectorOpen,
  onToggleSelector,
  onCloseSelector,
  onSelectManuscript,
  getManuscriptSelectorInfo,
  onOpenLibrary,
  onOpenUploader,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-edge/60">
      <div className="w-full sm:max-w-xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border-accent/30 bg-accent/10 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Centro del Autor
          </span>

          {requestState === 'active' && (
            <span className="inline-flex items-center gap-1.5 rounded-full border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Producción Activa
            </span>
          )}

          {requestState === 'pending' && (
            <span className="inline-flex items-center gap-1.5 rounded-full border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              En Evaluación Editorial
            </span>
          )}

          {(hasActiveProject || requestState === 'pending') && (
            <span className="inline-flex items-center gap-1 rounded-md bg-surface border-edge/60 px-2.5 py-0.5 text-xs font-mono font-medium text-ink-muted">
              ID:{' '}
              {requestContext?.projectId
                ? `#PROJ-${requestContext.projectId.slice(0, 8).toUpperCase()}`
                : requestContext?.requestId
                ? `#REQ-${requestContext.requestId.slice(0, 8).toUpperCase()}`
                : '#SOLICITUD'}
            </span>
          )}
        </div>

        <div className="mt-3 relative inline-block text-left w-full">
          <div className="text-[10px] font-bold uppercase tracking-wider text-accent/90 mb-1">
            Obra Consultada
          </div>
          <button
            type="button"
            onClick={onToggleSelector}
            className="group inline-flex items-center gap-2.5 rounded-2xl border border-edge bg-surface-elevated px-4 py-2 text-xl sm:text-2xl font-serif font-medium text-ink shadow-2xs hover:bg-surface hover:border-accent/30 transition-all duration-200 ease-out cursor-pointer select-none max-w-full active:scale-[0.99]"
          >
            <span className="truncate">
              {requestState === 'active'
                ? projectTitle || requestContext?.title || 'Tu Obra en Grabación'
                : requestState === 'pending'
                ? requestContext?.title || 'Manuscrito en Evaluación Editorial'
                : 'Bienvenido a Studio Flamkit'}
            </span>
            <ChevronDown className={`h-4 w-4 text-ink-muted/80 transition-transform duration-200 ease-out shrink-0 ${isSelectorOpen ? 'rotate-180 text-accent' : 'group-hover:translate-y-0.5'}`} />
          </button>

          <AnimatePresence>
            {isSelectorOpen && (
              <>
                {/* Invisible backdrop to capture outside clicks and close the selector safely in iframes */}
                <div className="fixed inset-0 z-40 cursor-default" onClick={onCloseSelector} />

                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -6 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute left-0 mt-2 w-72 sm:w-80 origin-top-left rounded-3xl border border-edge bg-surface-elevated/95 p-3 shadow-xl z-50 backdrop-blur-md"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted/70 border-b border-edge/40 pb-2 mb-2">
                    Mis obras
                  </div>
                  <div className="space-y-1">
                    {requestContext?.manuscripts && requestContext.manuscripts.length > 0 ? (
                      requestContext.manuscripts.map((m) => {
                        const info = getManuscriptSelectorInfo(m);
                        const isSelected = m.id === activeManuscriptId;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              onSelectManuscript(m.id);
                              onCloseSelector();
                            }}
                            className={`w-full text-left rounded-2xl p-2.5 transition-all duration-150 ease-out flex flex-col gap-0.5 cursor-pointer active:scale-[0.99] ${
                              isSelected
                                ? 'bg-accent/10 text-accent font-medium'
                                : 'hover:bg-surface hover:translate-x-0.5 text-ink'
                            }`}
                          >
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <span className={`h-2 w-2 rounded-full ${info.dotColor} shrink-0`} />
                              <span className="truncate">{m.title}</span>
                            </div>
                            <div className="pl-4 text-[11px] text-ink-muted/90 font-light">
                              {info.label} {info.progress !== null ? `· ${info.progress}%` : ''}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-3 py-2 text-xs text-ink-muted">
                        No tienes manuscritos registrados.
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenLibrary}
          className="group inline-flex items-center gap-2 rounded-2xl border border-edge/80 bg-surface-elevated px-4 py-2.5 text-xs font-medium text-ink transition-all duration-200 ease-out hover:border-accent/40 hover:text-accent hover:-translate-y-0.5 active:scale-[0.98] shadow-2xs cursor-pointer"
        >
          <FolderOpen className="h-4 w-4 text-accent transition-transform duration-200 ease-out group-hover:scale-110" />
          <span>Biblioteca de archivos</span>
        </button>

        <button
          type="button"
          onClick={onOpenUploader}
          className="group inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2.5 text-xs font-medium text-surface transition-all duration-200 ease-out hover:bg-accent-hover hover:-translate-y-0.5 active:scale-[0.98] shadow-xs cursor-pointer"
        >
          <UploadCloud className="h-4 w-4 transition-transform duration-200 ease-out group-hover:-translate-y-0.5" />
          <span>{requestState === 'none' ? 'Subir Manuscrito' : 'Enviar Nueva Versión'}</span>
        </button>
      </div>
    </div>
  );
}
