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

function getStatusChip(fileStatus: FileItemProps['status'], isLocked: boolean) {
  if (fileStatus === 'bloqueado' || isLocked) {
    return {
      tone:
        'border-edge/60 bg-surface/75 text-ink-muted/90',
      icon: <Lock className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300 shrink-0" />,
      label: 'En custodia / evaluación',
    };
  }

  if (fileStatus === 'aprobado') {
    return {
      tone:
        'border-emerald-500/20 bg-emerald-500/8 text-emerald-800 dark:text-emerald-300',
      icon: <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />,
      label: 'Aprobado',
    };
  }

  if (fileStatus === 'en_revision') {
    return {
      tone:
        'border-amber-500/20 bg-amber-500/8 text-amber-800 dark:text-amber-300',
      icon: <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />,
      label: 'En revisión',
    };
  }

  return {
    tone: 'border-accent/20 bg-accent/8 text-accent',
    icon: <FileCheck className="h-3.5 w-3.5 shrink-0" />,
    label: 'Disponible',
  };
}

export function FilePanel({ files, isLocked = false, onUploadReplacement }: FilePanelProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border-edge/70 bg-surface-elevated/95 p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.025)] backdrop-blur-xs">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-edge/40 pb-5">
        <div className="max-w-2xl">
          <h3 className="font-serif text-xl font-normal tracking-tight text-ink">Documentación y Archivos</h3>
          <p className="mt-1 text-xs font-light leading-relaxed text-ink-muted/80">
            Manuscritos en custodia, versiones de trabajo y entregables finales del proyecto.
          </p>
        </div>

        {onUploadReplacement && (
          <Button
            variant="secondary"
            className="group flex items-center gap-2.5 rounded-full px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-300 hover:-translate-y-0.5"
            onClick={onUploadReplacement}
          >
            <UploadCloud className="h-4 w-4 text-accent transition-transform duration-300 group-hover:-translate-y-0.5" />
            <span>Subir nueva versión</span>
          </Button>
        )}
      </div>

      {files.length === 0 ? (
        <div className="rounded-2xl border-dashed border-edge/60 bg-surface/35 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-edge/60 bg-surface-elevated text-accent/80">
            <FileText className="h-7 w-7" />
          </div>
          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.18em] text-ink">
            Sin archivos adicionales registrados
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs font-light leading-relaxed text-ink-muted/80">
            Los manuscritos originales, notas editoriales y entregables máster aparecerán aquí durante la producción.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => {
            const status = getStatusChip(file.status, isLocked);

            return (
              <div
                key={file.id}
                className="group flex flex-col gap-4 rounded-2xl border-edge/60 bg-surface/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/20 hover:bg-surface hover:shadow-[0_10px_30px_rgba(0,0,0,0.03)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-edge/60 bg-surface-elevated text-accent transition-transform duration-300 group-hover:scale-[1.02]">
                    <FileText className="h-5 w-5" strokeWidth={1.6} />
                  </div>

                  <div className="min-w-0">
                    <p className="font-serif text-sm font-normal tracking-tight text-ink sm:text-base">
                      {file.name}
                    </p>
                    <p className="mt-1 text-xs font-light leading-relaxed text-ink-muted/80">
                      {file.size ? `${file.size} · ` : ''}
                      {file.date ? `Cargado el ${file.date}` : 'Registrado en custodia'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] ${status.tone}`}
                  >
                    {status.icon}
                    <span>{status.label}</span>
                  </span>

                  {file.downloadUrl && !isLocked && (
                    <a
                      href={file.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-edge/60 bg-surface-elevated text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:text-accent"
                      title="Descargar archivo"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
