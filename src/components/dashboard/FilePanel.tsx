'use client';

import React from 'react';
import { FileText, Download, Lock, CheckCircle2, FileCheck, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface FileItemProps {
  id: string;
  name: string;
  size?: string;
  date?: string;
  status: 'bloqueado' | 'disponible' | 'en_revision' | 'aprobado';
  downloadUrl?: string;
}

interface FilePanelProps {
  files: FileItemProps[];
  isLocked?: boolean;
  onUploadReplacement?: () => void;
}

export function FilePanel({ files, isLocked = false, onUploadReplacement }: FilePanelProps) {
  return (
    <div className="rounded-3xl border border-edge/80 bg-surface-elevated/90 p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-edge/50 pb-5">
        <div>
          <h3 className="font-serif text-xl font-normal text-ink">Documentación y Archivos</h3>
          <p className="text-xs text-ink-muted/80 mt-0.5">Manuscritos en custodia, guiones adaptados y entregables de la obra</p>
        </div>

        {onUploadReplacement && (
          <Button
            variant="secondary"
            className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em]"
            onClick={onUploadReplacement}
          >
            <UploadCloud className="h-4 w-4 text-accent" />
            <span>Subir Nueva Versión</span>
          </Button>
        )}
      </div>

      {files.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-edge/60 p-8 text-center bg-surface/30">
          <FileText className="mx-auto h-8 w-8 text-ink-muted/40" />
          <p className="mt-2 text-xs font-medium uppercase tracking-[0.15em] text-ink">Sin archivos adicionales registrados</p>
          <p className="text-xs text-ink-muted/80 mt-1 font-light">
            Los manuscritos originales y entregables máster se listarás aquí durante la producción.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-edge/70 bg-surface/70 p-4 transition-all duration-300 hover:border-accent/30 hover:bg-surface"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-edge/60 bg-surface-elevated text-accent">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-serif text-sm font-normal text-ink">{file.name}</p>
                  <p className="text-xs text-ink-muted/80 font-light">
                    {file.size ? `${file.size} · ` : ''}
                    {file.date ? `Cargado el ${file.date}` : 'Registrado en custodia'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end">
                {file.status === 'bloqueado' || isLocked ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-edge/60 bg-surface px-3 py-1 text-[11px] text-ink-muted font-light">
                    <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>En Custodia / Evaluación</span>
                  </span>
                ) : file.status === 'aprobado' ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span>Aprobado</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] text-accent">
                    <FileCheck className="h-3.5 w-3.5 shrink-0" />
                    <span>Disponible</span>
                  </span>
                )}

                {file.downloadUrl && !isLocked && (
                  <a
                    href={file.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-edge/60 bg-surface-elevated text-ink hover:text-accent hover:border-accent/30 transition"
                    title="Descargar archivo"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
