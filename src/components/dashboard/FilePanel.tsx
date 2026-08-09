'use client';

import React, { useState } from 'react';
import { FileText, Download, Lock, CheckCircle2, FileCheck, UploadCloud, Eye, X, DollarSign, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface FileItemProps {
  id: string;
  name: string;
  size?: string;
  date?: string;
  status: 'bloqueado' | 'disponible' | 'en_revision' | 'aprobado' | 'en_analisis';
  downloadUrl?: string;
  acceptedPrice?: number;
  currency?: string;
  adminNotes?: string;
  deliverablesCount?: number;
}

interface FilePanelProps {
  files: FileItemProps[];
  isLocked?: boolean;
  onUploadReplacement?: () => void;
  projectTitle?: string | null;
  acceptedPaymentAmount?: number;
  currency?: string;
}

function getStatusChip(fileStatus: FileItemProps['status'], isLocked: boolean) {
  if (fileStatus === 'bloqueado' || (isLocked && fileStatus !== 'en_revision' && fileStatus !== 'aprobado' && fileStatus !== 'en_analisis')) {
    return {
      tone: 'border-edge/60 bg-surface/75 text-ink-muted/90',
      icon: <Lock className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300 shrink-0" />,
      label: 'En custodia / evaluación',
    };
  }

  if (fileStatus === 'en_analisis') {
    return {
      tone: 'border-blue-500/20 bg-blue-500/8 text-blue-800 dark:text-blue-300',
      icon: <Clock className="h-3.5 w-3.5 text-blue-500 shrink-0" />,
      label: 'En análisis',
    };
  }

  if (fileStatus === 'aprobado') {
    return {
      tone: 'border-emerald-500/20 bg-emerald-500/8 text-emerald-800 dark:text-emerald-300',
      icon: <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />,
      label: 'Aprobado',
    };
  }

  if (fileStatus === 'en_revision') {
    return {
      tone: 'border-amber-500/20 bg-amber-500/8 text-amber-800 dark:text-amber-300',
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

export function FilePanel({ files, isLocked = false, onUploadReplacement, projectTitle, acceptedPaymentAmount, currency = 'USD' }: FilePanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFileDetail, setSelectedFileDetail] = useState<FileItemProps | null>(null);

  return (
    <>
      <div 
        onClick={() => setModalOpen(true)}
        className="relative overflow-hidden rounded-3xl border-edge/70 bg-surface-elevated/95 p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.025)] backdrop-blur-xs cursor-pointer transition-all duration-300 hover:border-accent/30 hover:shadow-[0_16px_48px_rgba(0,0,0,0.04)]"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-edge/40 pb-5">
          <div className="max-w-2xl">
            <h3 className="font-serif text-xl font-normal tracking-tight text-ink flex items-center gap-2">
              <span>Documentación y Archivos</span>
              <span className="inline-flex items-center justify-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                {files.length} {files.length === 1 ? 'archivo' : 'archivos'}
              </span>
            </h3>
            <p className="mt-1 text-xs font-light leading-relaxed text-ink-muted/80">
              Manuscritos en custodia, versiones de trabajo y entregables finales. Haz clic para ver detalles completos y metadatos de administración.
            </p>
          </div>

          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFileDetail(file);
                    setModalOpen(true);
                  }}
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

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-edge/60 bg-surface-elevated text-ink transition-all duration-300 hover:border-accent/30 hover:text-accent">
                      <Eye className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalle Completo de Archivos y Metadatos */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-edge bg-surface-elevated p-6 sm:p-8 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-edge/50 pb-4">
              <div>
                <h3 className="font-serif text-2xl text-ink">Expediente de Archivos y Custodia Editorial</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  {projectTitle ? `Proyecto: «${projectTitle}»` : 'Información y metadatos oficiales'}
                </p>
              </div>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setSelectedFileDetail(null);
                }}
                className="rounded-full p-2 text-ink-muted hover:bg-surface hover:text-ink transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 overflow-y-auto space-y-4 pr-1">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-edge/60 bg-surface p-4">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-accent" /> Presupuesto / Pago Aceptado
                  </span>
                  <p className="font-serif text-xl font-semibold text-ink mt-1">
                    {acceptedPaymentAmount ? `${acceptedPaymentAmount} ${currency}` : 'Pendiente de aprobación'}
                  </p>
                  <p className="text-xs text-ink-muted mt-1">Aprobado y registrado por la dirección administrativa del estudio.</p>
                </div>

                <div className="rounded-2xl border border-edge/60 bg-surface p-4">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-ink-muted flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-accent" /> Resguardo y Custodia
                  </span>
                  <p className="font-serif text-xl font-semibold text-ink mt-1">
                    {files.length} {files.length === 1 ? 'Documento Activo' : 'Documentos Activos'}
                  </p>
                  <p className="text-xs text-ink-muted mt-1">Cifrado de propiedad intelectual garantizado.</p>
                </div>
              </div>

              <h4 className="font-serif text-lg text-ink pt-2">Listado Detallado de Archivos</h4>

              {files.map((file) => (
                <div key={file.id} className="rounded-2xl border border-edge/60 bg-surface p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h5 className="font-serif text-base text-ink">{file.name}</h5>
                        <p className="text-xs text-ink-muted">
                          {file.size || 'Manuscrito oficial'} · Cargado: {file.date || 'Reciente'}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider border border-accent/25 bg-accent/10 text-accent">
                      {file.status}
                    </span>
                  </div>

                  <div className="grid gap-3 pt-3 border-t border-edge/50 sm:grid-cols-2 text-xs text-ink-muted">
                    <div>
                      <span className="font-medium text-ink">Información de pago aceptada:</span>{' '}
                      {acceptedPaymentAmount ? `${acceptedPaymentAmount} ${currency} (Aprobado)` : 'En evaluación por admin'}
                    </div>
                    <div>
                      <span className="font-medium text-ink">Estado de revisión:</span>{' '}
                      {isLocked ? 'En análisis por dirección artística' : 'Liberado / Aprobado'}
                    </div>
                  </div>

                  {file.downloadUrl && !isLocked && (
                    <div className="pt-2 flex justify-end">
                      <a
                        href={file.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-medium text-white transition hover:opacity-90"
                      >
                        <Download className="h-4 w-4" />
                        <span>Descargar Archivo Máster</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-edge/50 pt-4 flex justify-end">
              <Button
                variant="primary"
                onClick={() => setModalOpen(false)}
                className="px-6 py-2.5 text-xs font-medium uppercase tracking-wider"
              >
                Cerrar Ventana
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FilePanel;
