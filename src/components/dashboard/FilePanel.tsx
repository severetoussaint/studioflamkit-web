'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowDownToLine,
  CheckCircle2,
  ChevronRight,
  Clock3,
  DollarSign,
  FileCheck,
  FileStack,
  FileText,
  FolderOpen,
  Layers3,
  Lock,
  UploadCloud,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getUser } from '@/services/auth.service';
import { getAuthorProjectData } from '@/services/project.service';
import { getAuthorRequestContext } from '@/services/manuscript.service';
import { DashboardFileItem, DashboardFileLibraryData, getDashboardFileLibraryData } from '@/services/file.service';

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

function formatMoney(amount: number | null | undefined): string {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '—';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

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

function mapFallbackFile(file: FileItemProps): DashboardFileItem {
  const tone: DashboardFileItem['statusTone'] =
    file.status === 'bloqueado' ? 'bloqueado' : file.status === 'aprobado' ? 'aprobado' : file.status === 'en_revision' ? 'en_revision' : 'disponible';

  return {
    id: file.id,
    kind: 'manuscript',
    name: file.name,
    sourceLabel: 'Archivo visible en el panel',
    createdAt: file.date || null,
    sizeLabel: file.size || null,
    statusLabel: file.status,
    statusTone: tone,
    amountLabel: null,
    stageLabel: null,
    details: [
      `Archivo: ${file.name}`,
      file.date ? `Fecha: ${file.date}` : 'Fecha: sin registrar',
      file.size ? `Detalle: ${file.size}` : 'Detalle: no disponible',
    ],
    downloadUrl: file.downloadUrl || null,
    rawPath: null,
  };
}

function toneStyles(tone: DashboardFileItem['statusTone']) {
  switch (tone) {
    case 'bloqueado':
      return 'border-edge/60 bg-surface/75 text-ink-muted/90';
    case 'en_revision':
      return 'border-amber-500/20 bg-amber-500/8 text-amber-800 dark:text-amber-300';
    case 'aprobado':
      return 'border-emerald-500/20 bg-emerald-500/8 text-emerald-800 dark:text-emerald-300';
    case 'disponible':
    default:
      return 'border-accent/20 bg-accent/8 text-accent';
  }
}

function kindIcon(kind: DashboardFileItem['kind']) {
  if (kind === 'deliverable') return <FileCheck className="h-4 w-4" strokeWidth={1.8} />;
  if (kind === 'project_file') return <FolderOpen className="h-4 w-4" strokeWidth={1.8} />;
  return <FileText className="h-4 w-4" strokeWidth={1.8} />;
}

function kindLabel(kind: DashboardFileItem['kind']) {
  if (kind === 'deliverable') return 'Entregable';
  if (kind === 'project_file') return 'Archivo de proyecto';
  return 'Manuscrito';
}

function SummaryStat({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="rounded-2xl border border-edge/60 bg-surface/70 px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted/80">{label}</p>
      <p className="mt-1 font-serif text-xl font-normal tracking-tight text-ink">{value}</p>
      {helper ? <p className="mt-1 text-xs font-light leading-relaxed text-ink-muted/80">{helper}</p> : null}
    </div>
  );
}

function FileRow({ file, onOpen }: { file: DashboardFileItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full rounded-2xl border border-edge/60 bg-surface/70 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/25 hover:bg-surface hover:shadow-[0_10px_30px_rgba(0,0,0,0.03)]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-edge/60 bg-surface-elevated text-accent transition-transform duration-300 group-hover:scale-[1.02]">
            {kindIcon(file.kind)}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-serif text-base font-normal tracking-tight text-ink">{file.name}</p>
              <span className="inline-flex items-center rounded-full border border-edge/60 bg-surface-elevated px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                {kindLabel(file.kind)}
              </span>
            </div>

            <p className="mt-1 text-xs font-light leading-relaxed text-ink-muted/80">
              {file.sourceLabel} · {formatDate(file.createdAt)}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${toneStyles(file.statusTone)}`}>
                {file.statusTone === 'aprobado' ? <CheckCircle2 className="h-3.5 w-3.5" /> : file.statusTone === 'bloqueado' ? <Lock className="h-3.5 w-3.5" /> : file.statusTone === 'en_revision' ? <Clock3 className="h-3.5 w-3.5" /> : <FileCheck className="h-3.5 w-3.5" />}
                <span>{file.statusLabel}</span>
              </span>

              {file.sizeLabel ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-edge/60 bg-surface px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                  <Layers3 className="h-3.5 w-3.5" />
                  <span>{file.sizeLabel}</span>
                </span>
              ) : null}

              {file.amountLabel ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/8 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-accent">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>Monto: {file.amountLabel}</span>
                </span>
              ) : null}

              {file.stageLabel ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-edge/60 bg-surface px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                  <FileStack className="h-3.5 w-3.5" />
                  <span>{file.stageLabel}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {file.downloadUrl ? (
            <a
              href={file.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-edge/60 bg-surface-elevated px-3.5 text-xs font-medium text-ink transition hover:border-accent/30 hover:text-accent"
              title="Abrir archivo"
            >
              <ArrowDownToLine className="h-3.5 w-3.5" />
              <span>Abrir</span>
            </a>
          ) : (
            <span className="inline-flex h-9 items-center gap-2 rounded-full border border-edge/60 bg-surface-elevated px-3.5 text-xs font-medium text-ink-muted">
              <Clock3 className="h-3.5 w-3.5" />
              <span>Detalle</span>
            </span>
          )}

          <span className="inline-flex h-9 items-center justify-center rounded-full border border-edge/60 bg-surface-elevated px-3 text-xs text-ink-muted transition group-hover:border-accent/25 group-hover:text-accent">
            <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </button>
  );
}

export function FilePanel({ files, isLocked = false, onUploadReplacement }: FilePanelProps) {
  const [libraryData, setLibraryData] = useState<DashboardFileLibraryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadLibrary() {
      setIsLoading(true);
      try {
        const user = await getUser();
        if (!user) {
          if (mounted) setLibraryData(null);
          return;
        }

        const requestContext = await getAuthorRequestContext(user.id);
        const projectData = await getAuthorProjectData(user.id);
        const resolvedProjectId = projectData?.id ?? requestContext.projectId ?? null;
        const data = await getDashboardFileLibraryData(user.id, resolvedProjectId);

        if (mounted) setLibraryData(data);
      } catch (error) {
        console.error('Error loading dashboard file library:', error);
        if (mounted) setLibraryData(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadLibrary();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleItems = useMemo(() => {
    if (libraryData?.allItems?.length) return libraryData.allItems;
    return files.map(mapFallbackFile);
  }, [files, libraryData]);

  const previewItems = visibleItems.slice(0, 3);
  const manuscriptCount = libraryData?.manuscripts.length ?? previewItems.filter((item) => item.kind === 'manuscript').length;
  const projectCount = libraryData?.projectFiles.length ?? previewItems.filter((item) => item.kind === 'project_file').length;
  const deliverableCount = libraryData?.deliverables.length ?? previewItems.filter((item) => item.kind === 'deliverable').length;
  const acceptedAmountLabel = formatMoney(libraryData?.acceptedAmount);
  const paidAmountLabel = formatMoney(libraryData?.paidAmount);
  const stageLabel = libraryData?.currentStage || (isLocked ? 'En custodia' : 'Sin proyecto activo');

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-edge/70 bg-surface-elevated/95 p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.025)] backdrop-blur-xs">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-edge/40 pb-5">
          <div className="max-w-2xl">
            <h3 className="font-serif text-xl font-normal tracking-tight text-ink">Documentación y Archivos</h3>
            <p className="mt-1 text-xs font-light leading-relaxed text-ink-muted/80">
              Manuscritos en custodia, versiones de trabajo, entregables y material aprobado por administración.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              className="group flex items-center gap-2.5 rounded-full px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-300 hover:-translate-y-0.5"
              onClick={() => setIsOpen(true)}
            >
              <FileStack className="h-4 w-4 text-accent transition-transform duration-300 group-hover:-translate-y-0.5" />
              <span>Ver biblioteca completa</span>
            </Button>

            {onUploadReplacement && (
              <Button
                variant="primary"
                className="group flex items-center gap-2.5 rounded-full px-4 py-2.5 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-300 hover:-translate-y-0.5"
                onClick={onUploadReplacement}
              >
                <UploadCloud className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                <span>Subir nueva versión</span>
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryStat
            label="Archivos visibles"
            value={String(libraryData ? libraryData.allItems.length : visibleItems.length)}
            helper={`${manuscriptCount} manuscritos · ${projectCount} archivos · ${deliverableCount} entregables`}
          />
          <SummaryStat
            label="Monto aprobado"
            value={acceptedAmountLabel}
            helper={libraryData ? 'Importe validado por admin para este proyecto' : 'Disponible al detectar proyecto activo'}
          />
          <SummaryStat
            label="Monto pagado"
            value={paidAmountLabel}
            helper={libraryData ? 'Pagos recibidos asociados al plan' : 'Sin pagos visibles todavía'}
          />
          <SummaryStat
            label="Etapa actual"
            value={stageLabel}
            helper={libraryData?.projectStatus ? `Estado del proyecto: ${libraryData.projectStatus}` : 'Sin proyecto activo'}
          />
        </div>

        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-dashed border-edge/60 bg-surface/30 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-edge/60 bg-surface-elevated text-accent">
              <Layers3 className="h-6 w-6" />
            </div>
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-ink">Cargando biblioteca de archivos</p>
            <p className="mt-1 text-xs font-light leading-relaxed text-ink-muted/80">
              Estamos leyendo manuscritos, archivos de proyecto y entregables reales desde Supabase.
            </p>
          </div>
        ) : previewItems.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-edge/60 bg-surface/30 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-edge/60 bg-surface-elevated text-accent/80">
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
          <div className="mt-6 space-y-3">
            {previewItems.map((file) => (
              <FileRow key={file.id} file={file} onOpen={() => setIsOpen(true)} />
            ))}

            {visibleItems.length > previewItems.length ? (
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-edge/60 bg-surface px-4 py-2 text-xs font-medium text-ink-muted transition hover:border-accent/25 hover:text-accent"
              >
                <span>Ver {visibleItems.length - previewItems.length} archivos más</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
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
                  <h4 className="mt-3 font-serif text-2xl font-normal tracking-tight text-ink">Todos los archivos del proyecto</h4>
                  <p className="mt-2 text-xs font-light leading-relaxed text-ink-muted/80">
                    Manuscritos, archivos cargados al proyecto, entregables y el contexto financiero aprobado por administración.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-edge/60 bg-surface text-ink-muted transition hover:border-accent/30 hover:text-accent"
                  aria-label="Cerrar biblioteca de archivos"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3 border-b border-edge/50 px-5 py-5 sm:grid-cols-2 xl:grid-cols-4 sm:px-6">
                <SummaryStat label="Archivos totales" value={String(libraryData?.allItems.length ?? visibleItems.length)} />
                <SummaryStat label="Monto aprobado" value={acceptedAmountLabel} />
                <SummaryStat label="Monto pagado" value={paidAmountLabel} />
                <SummaryStat label="Etapa actual" value={stageLabel} />
              </div>

              <div className="max-h-[72vh] overflow-y-auto px-5 py-5 sm:px-6">
                <div className="space-y-8">
                  {[
                    { key: 'manuscripts', label: 'Manuscritos subidos', items: libraryData?.manuscripts ?? visibleItems.filter((item) => item.kind === 'manuscript') },
                    { key: 'project_files', label: 'Archivos del proyecto', items: libraryData?.projectFiles ?? visibleItems.filter((item) => item.kind === 'project_file') },
                    { key: 'deliverables', label: 'Entregables', items: libraryData?.deliverables ?? visibleItems.filter((item) => item.kind === 'deliverable') },
                  ].map((group) => (
                    <section key={group.key} className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h5 className="font-serif text-xl font-normal tracking-tight text-ink">{group.label}</h5>
                          <p className="mt-1 text-xs text-ink-muted/80">
                            {group.items.length} elemento{group.items.length === 1 ? '' : 's'} en esta sección
                          </p>
                        </div>
                      </div>

                      {group.items.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-edge/60 bg-surface/30 p-6 text-center text-xs text-ink-muted/80">
                          No hay elementos para mostrar en esta sección.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {group.items.map((file) => (
                            <div key={file.id} className="rounded-2xl border border-edge/60 bg-surface/75 p-4 sm:p-5">
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="flex min-w-0 items-start gap-3.5">
                                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-edge/60 bg-surface-elevated text-accent">
                                    {kindIcon(file.kind)}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="font-serif text-base font-normal tracking-tight text-ink sm:text-lg">{file.name}</p>
                                      <span className="inline-flex items-center rounded-full border border-edge/60 bg-surface-elevated px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                                        {kindLabel(file.kind)}
                                      </span>
                                    </div>

                                    <p className="mt-1 text-xs font-light leading-relaxed text-ink-muted/80">
                                      {file.sourceLabel} · {formatDate(file.createdAt)}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${toneStyles(file.statusTone)}`}>
                                        {file.statusTone === 'aprobado' ? <CheckCircle2 className="h-3.5 w-3.5" /> : file.statusTone === 'bloqueado' ? <Lock className="h-3.5 w-3.5" /> : file.statusTone === 'en_revision' ? <Clock3 className="h-3.5 w-3.5" /> : <FileCheck className="h-3.5 w-3.5" />}
                                        <span>{file.statusLabel}</span>
                                      </span>

                                      {file.sizeLabel ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-edge/60 bg-surface px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                                          <Layers3 className="h-3.5 w-3.5" />
                                          <span>{file.sizeLabel}</span>
                                        </span>
                                      ) : null}

                                      {file.amountLabel ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/8 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-accent">
                                          <DollarSign className="h-3.5 w-3.5" />
                                          <span>Monto aprobado: {file.amountLabel}</span>
                                        </span>
                                      ) : null}

                                      {file.stageLabel ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-edge/60 bg-surface px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-muted">
                                          <FileStack className="h-3.5 w-3.5" />
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
                                      <Clock3 className="h-3.5 w-3.5" />
                                      <span>Sin URL pública</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="mt-4 grid gap-2 text-xs text-ink-muted/80 sm:grid-cols-2 xl:grid-cols-3">
                                {file.details.map((detail) => (
                                  <div key={detail} className="rounded-xl border border-edge/50 bg-surface px-3 py-2">
                                    {detail}
                                  </div>
                                ))}
                              </div>
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
        )}
      </AnimatePresence>
    </>
  );
}
