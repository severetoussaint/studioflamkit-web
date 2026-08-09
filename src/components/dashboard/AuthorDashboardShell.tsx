'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowDownToLine,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  FolderOpen,
  Layers3,
  Lock,
  MessageCircle,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import { getUser } from '@/services/auth.service';
import {
  getAuthorRequestContext,
  submitManuscript,
  type AuthorRequestContext,
  type AuthorRequestState,
} from '@/services/manuscript.service';
import { type ProjectRow, getAuthorProjectsList } from '@/services/project.service';
import { getDashboardFileLibraryData, type DashboardFileLibraryData } from '@/services/file.service';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { StatusHero } from '@/components/dashboard/StatusHero';
import { ProgressTimeline } from '@/components/dashboard/ProgressTimeline';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { NextActionCard } from '@/components/dashboard/NextActionCard';
import { SupportPanel } from '@/components/dashboard/SupportPanel';
import { Button } from '@/components/ui/Button';

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

function statusLabel(status: string | null | undefined): string {
  if (!status) return 'En análisis';
  if (/completed|complet/i.test(status)) return 'Entrega final';
  if (/review|revis/i.test(status)) return 'Revisión';
  if (/production|producci|grabaci/i.test(status)) return 'Producción';
  if (/proposal|propuesta|cotiz/i.test(status)) return 'Propuesta en preparación';
  if (/planning|analysis|analiz/i.test(status)) return 'En análisis';
  return 'En análisis';
}

function stageIndexFromStatus(status: string | null | undefined, requestState: AuthorRequestState): number | null {
  if (/completed|complet/i.test(status ?? '')) return 5;
  if (/review|revis/i.test(status ?? '')) return 4;
  if (/production|producci|grabaci/i.test(status ?? '')) return 3;
  if (/proposal|propuesta|cotiz/i.test(status ?? '')) return 2;
  if (/planning|analysis|analiz/i.test(status ?? '')) return 1;
  if (requestState === 'pending') return 1;
  if (requestState === 'active') return 3;
  return null;
}

function ManuscriptSwitcher({
  manuscripts,
  selectedManuscriptId,
  onSelect,
}: {
  manuscripts: AuthorRequestContext['manuscripts'];
  selectedManuscriptId: string | null;
  onSelect: (id: string) => void;
}) {
  if (manuscripts.length <= 1) return null;

  return (
    <div className="rounded-3xl border border-edge/70 bg-surface-elevated/90 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.03)] backdrop-blur-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-muted/80">Manuscrito activo</p>
          <h2 className="mt-1 font-serif text-xl font-normal tracking-tight text-ink">Selecciona qué obra quieres revisar</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/8 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{manuscripts.length} archivos disponibles</span>
        </span>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {manuscripts.map((manuscript: { id: string; title: string; createdAt: string | null; requestStatus: string | null }, index: number) => {
          const isActive = manuscript.id === selectedManuscriptId;
          return (
            <button
              key={manuscript.id}
              type="button"
              onClick={() => onSelect(manuscript.id)}
              className={`group min-w-[220px] rounded-2xl border px-4 py-3 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                isActive
                  ? 'border-accent/30 bg-accent/8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]'
                  : 'border-edge/60 bg-surface/70 hover:border-accent/20 hover:bg-surface'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted/70">Archivo {index + 1}</p>
                  <p className="mt-1 line-clamp-2 font-serif text-base font-normal tracking-tight text-ink">{manuscript.title}</p>
                  <p className="mt-1 text-xs font-light text-ink-muted/80">Subido el {formatDate(manuscript.createdAt)}</p>
                </div>
                <span className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${isActive ? 'border-accent/30 bg-accent/15 text-accent' : 'border-edge/60 bg-surface-elevated text-ink-muted'}`}>
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${isActive ? 'border-accent/20 bg-accent/8 text-accent' : 'border-edge/60 bg-surface text-ink-muted'}`}>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{manuscript.requestStatus || 'sin estado'}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilesLibraryModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: DashboardFileLibraryData | null;
}) {
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
                className="flex h-10 w-10 items-center justify-center rounded-full border border-edge/60 bg-surface text-ink-muted transition hover:border-accent/30 hover:text-accent"
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
      ) : null}
    </AnimatePresence>
  );
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

interface AuthorProjectOverview {
  id: string;
  manuscriptId: string | null;
  title: string | null;
  status: string | null;
  progress: number;
  createdAt: string | null;
}

export default function AuthorDashboardShell() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [requestState, setRequestState] = useState<AuthorRequestState>('none');
  const [requestContext, setRequestContext] = useState<AuthorRequestContext | null>(null);
  const [authorProjects, setAuthorProjects] = useState<AuthorProjectOverview[]>([]);
  const [selectedManuscriptId, setSelectedManuscriptId] = useState<string | null>(null);
  const [libraryData, setLibraryData] = useState<DashboardFileLibraryData | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadAuthorContext() {
      setIsLoading(true);
      try {
        const user = await getUser();
        if (!user) {
          router.replace('/login');
          return;
        }

        if (!mounted) return;
        setAuthorId(user.id);

        const context = await getAuthorRequestContext(user.id);
        const projectsList = await getAuthorProjectsList(user.id);

        if (!mounted) return;
        setRequestContext(context);
        setRequestState(context.state);
        setAuthorProjects(projectsList);
        setSelectedManuscriptId((current) => current ?? context.manuscriptId ?? null);
      } catch (error) {
        console.error('Error loading dashboard context:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadAuthorContext();

    return () => {
      mounted = false;
    };
  }, [router]);

  const manuscripts = useMemo(() => requestContext?.manuscripts ?? [], [requestContext]);

  const selectedManuscript = useMemo(() => {
    if (!manuscripts.length) return null;
    return manuscripts.find((manuscript: { id: string; title: string; createdAt: string | null; requestStatus: string | null }) => manuscript.id === selectedManuscriptId) ?? manuscripts[0] ?? null;
  }, [manuscripts, selectedManuscriptId]);

  const selectedProject = useMemo(() => {
    if (!selectedManuscript) return null;
    return authorProjects.find((project) => project.manuscriptId === selectedManuscript.id) ?? null;
  }, [selectedManuscript, authorProjects]);

  const selectedProjectId = selectedProject?.id ?? null;

  useEffect(() => {
    let mounted = true;

    async function loadLibrary() {
      if (!authorId) return;
      try {
        const data = await getDashboardFileLibraryData(authorId, selectedProjectId, selectedManuscript?.id);
        if (mounted) setLibraryData(data);
      } catch (error) {
        console.error('Error loading library data:', error);
        if (mounted) setLibraryData(null);
      }
    }

    loadLibrary();

    return () => {
      mounted = false;
    };
  }, [authorId, selectedProjectId, selectedManuscript?.id]);

  const selectedState: AuthorRequestState = selectedProject
    ? 'active'
    : selectedManuscript?.requestStatus === 'pending' || selectedManuscript?.requestStatus === 'evaluating'
      ? 'pending'
      : requestState;

  const selectedTitle = selectedProject?.title ?? selectedManuscript?.title ?? requestContext?.title ?? 'Bienvenido a Studio Flamkit';
  const selectedDate = selectedProject?.createdAt ?? selectedManuscript?.createdAt ?? requestContext?.createdAt ?? null;
  const selectedProgress = selectedProject?.progress ?? (selectedState === 'pending' ? 25 : 0);
  const selectedStatusText = statusLabel(selectedProject?.status ?? selectedManuscript?.requestStatus ?? selectedState);
  const selectedStageIndex = stageIndexFromStatus(selectedProject?.status ?? selectedManuscript?.requestStatus ?? selectedState, selectedState);
  const selectedStageLabel = selectedProject ? selectedStatusText : selectedState === 'pending' ? 'En evaluación editorial' : 'Sin manuscrito';

  const customSteps = useMemo(() => {
    const stepsConfig = [
      { id: 'recibido', title: 'Recibido', description: 'Manuscrito resguardado' },
      { id: 'analisis', title: 'En Análisis', description: 'Evaluación técnica de voz' },
      { id: 'propuesta', title: 'Propuesta', description: 'Desglose y plan técnico' },
      { id: 'produccion', title: 'Producción', description: 'Grabación y sonido' },
      { id: 'revision', title: 'Revisión', description: 'Escucha de muestras' },
      { id: 'entrega', title: 'Entrega Final', description: 'Máster de publicación' },
    ];

    const activeIdx = selectedStageIndex !== null ? selectedStageIndex : 0;

    return stepsConfig.map((step, idx) => {
      let status: 'completado' | 'activo' | 'pendiente' | 'bloqueado' = 'pendiente';

      if (idx < activeIdx) {
        status = 'completado';
      } else if (idx === activeIdx) {
        if (idx === 5 && selectedProject?.status === 'completed') {
          status = 'completado';
        } else {
          status = 'activo';
        }
      } else {
        status = 'pendiente';
      }

      return {
        ...step,
        status,
      };
    });
  }, [selectedStageIndex, selectedProject?.status]);

  const manuscriptCount = manuscripts.length;
  const projectCount = authorProjects.length;
  const visibleFiles = libraryData?.allItems.length ?? 0;
  const acceptedAmount = libraryData?.acceptedAmount ?? 0;
  const paidAmount = libraryData?.paidAmount ?? 0;
  const currentStage = libraryData?.currentStage ?? selectedStatusText;

  const timelineState: 'none' | 'pending' | 'active' =
    selectedState === 'active' ? 'active' : selectedState === 'pending' ? 'pending' : 'none';

  if (isLoading) {
    return <LoadingScreen message="Verificando acceso al Centro del Autor..." />;
  }

  return (
    <main className="min-h-screen bg-surface text-ink transition-colors duration-200">
      <Navbar />

      <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-10">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr]">
          <aside className="space-y-6 lg:sticky lg:top-20 self-start">
            <div className="rounded-3xl border border-edge bg-surface-elevated p-3 shadow-xs">
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">Navegación</p>
              <nav className="mt-1 flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible">
                {[
                  { id: 'resumen', label: 'Resumen' },
                  { id: 'capitulos', label: 'Capítulos' },
                  { id: 'entregables', label: 'Entregables' },
                  { id: 'pagos', label: 'Pagos' },
                  { id: 'perfil', label: 'Perfil' },
                ].map((section) => (
                  <span key={section.id} className="flex shrink-0 items-center justify-between rounded-2xl border border-transparent px-3.5 py-3 text-sm font-medium text-ink-muted">
                    {section.label}
                  </span>
                ))}
              </nav>
            </div>

            <div className="hidden rounded-3xl border border-edge bg-surface-elevated p-5 shadow-xs lg:block">
              <div className="flex items-center gap-2 text-accent">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Atención Directa</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                ¿Tienes alguna consulta sobre la locución o la edición? Tu productor asignado está disponible.
              </p>
              <Button
                variant="secondary"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-medium"
                onClick={() => router.push('/contacto')}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Contactar Productor
              </Button>
            </div>
          </aside>

          <section className="min-w-0 space-y-8">
            <div className="flex flex-col gap-4 border-b border-edge/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                    Centro del Autor
                  </span>

                  {selectedState === 'active' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Obra Activa
                    </span>
                  )}

                  {selectedState === 'pending' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      En Evaluación Editorial
                    </span>
                  )}
                </div>

                <h1 className="mt-2.5 font-serif text-2xl font-medium tracking-tight text-ink sm:text-3xl lg:text-4xl">
                  {selectedTitle}
                </h1>
              </div>

              <button
                type="button"
                onClick={() => setIsLibraryOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2.5 text-xs font-medium text-surface transition hover:bg-accent-hover shadow-xs"
              >
                <FolderOpen className="h-4 w-4" />
                <span>Ver biblioteca de archivos</span>
              </button>
            </div>

            <ManuscriptSwitcher
              manuscripts={manuscripts}
              selectedManuscriptId={selectedManuscript?.id ?? null}
              onSelect={(id) => setSelectedManuscriptId(id)}
            />

            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-12">
                  <NextActionCard
                    state={timelineState}
                    pendingActionTitle={
                      selectedState === 'pending'
                        ? 'Análisis Técnico y Desglose Editorial'
                        : selectedState === 'active'
                          ? 'Revisión y Aprobación de Capítulos'
                          : 'Sube tu primer manuscrito'
                    }
                    pendingActionDesc={
                      selectedState === 'pending'
                        ? 'Nuestro equipo está evaluando la obra seleccionada. Recibirás el desglose y la cotización en tu cabina.'
                        : selectedState === 'active'
                          ? 'Escucha las muestras de audio, deja comentarios o aprueba los capítulos.'
                          : 'Envía tu obra para iniciar la evaluación editorial.'
                    }
                    buttonLabel={selectedState === 'active' ? 'Ver capítulos' : undefined}
                    onActionClick={selectedState === 'active' ? () => router.push('/dashboard#capitulos') : undefined}
                  />
                </div>
              </div>

              <StatusHero
                state={timelineState}
                projectTitle={selectedTitle}
                submittedDate={selectedDate ? formatDate(selectedDate) : undefined}
                progress={selectedProgress}
                statusLabel={selectedStatusText}
                onUploadClick={() => setIsSubmitting(true)}
                onViewFilesClick={() => setIsLibraryOpen(true)}
              />

              <ProgressTimeline steps={customSteps} currentState={timelineState} />

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  icon={FileText}
                  label="Manuscritos"
                  value={manuscriptCount}
                  subtext="Archivos cargados por el autor"
                  statusBadge={{ text: manuscriptCount > 1 ? 'Múltiples' : 'Único', type: manuscriptCount > 0 ? 'success' : 'neutral' }}
                />
                <KpiCard
                  icon={FolderOpen}
                  label="Proyectos"
                  value={projectCount}
                  subtext="Contextos de producción vinculados"
                  statusBadge={{ text: selectedState === 'active' ? 'Activo' : 'Pendiente', type: selectedState === 'active' ? 'success' : 'warning' }}
                />
                <KpiCard
                  icon={Clock}
                  label="Etapa actual"
                  value={selectedStageLabel}
                  subtext={`Progreso: ${selectedProgress}%`}
                  statusBadge={{ text: currentStage, type: 'neutral' }}
                />
                <KpiCard
                  icon={Layers3}
                  label="Archivos visibles"
                  value={visibleFiles}
                  subtext={`${formatMoney(acceptedAmount)} aprobados · ${formatMoney(paidAmount)} pagados`}
                  statusBadge={{ text: visibleFiles > 0 ? 'Disponible' : 'Sin datos', type: visibleFiles > 0 ? 'success' : 'neutral' }}
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <div className="rounded-3xl border border-edge/70 bg-surface-elevated/90 p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.025)]">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-edge/40 pb-5">
                      <div>
                        <h2 className="font-serif text-xl font-normal text-ink">Documentación y Archivos</h2>
                        <p className="mt-0.5 text-xs text-ink-muted/80">Muestra los expedientes, versiones de producción y entregables oficiales.</p>
                      </div>
                      <Button variant="secondary" className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em]" onClick={() => setIsLibraryOpen(true)}>
                        <FolderOpen className="h-4 w-4 text-accent" />
                        <span>Ver todos los archivos</span>
                      </Button>
                    </div>

                    {libraryData ? (
                      <div className="space-y-5">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <Metric label="Total de archivos" value={String(libraryData.allItems.length)} helper={`${libraryData.manuscripts.length} manuscrito(s) · ${libraryData.projectFiles.length} archivo(s) · ${libraryData.deliverables.length} entregable(s)`} />
                          <Metric label="Monto aprobado" value={formatMoney(libraryData.acceptedAmount)} helper="Importe total validado" />
                          <Metric label="Etapa actual" value={libraryData.currentStage || selectedStatusText} helper={libraryData.projectStatus || 'En evaluación'} />
                        </div>

                        {libraryData.allItems.length > 0 ? (
                          <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted/80">Expediente de Archivos Recientes</p>
                              <span className="text-[10px] text-accent/90 hover:underline cursor-pointer" onClick={() => setIsLibraryOpen(true)}>Explorar biblioteca completa</span>
                            </div>
                            <div className="space-y-2">
                              {libraryData.allItems.slice(0, 3).map((item) => (
                                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-edge/50 bg-surface/40 p-3.5 transition-all duration-300 hover:bg-surface/70 hover:translate-x-0.5">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/8 text-accent">
                                      <FileText className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate font-serif text-sm font-normal text-ink">{item.name}</p>
                                      <p className="text-[10px] font-light text-ink-muted/85 mt-0.5">
                                        {item.kind === 'manuscript' ? 'Manuscrito' : item.kind === 'deliverable' ? 'Entregable' : 'Archivo de proyecto'} · {item.sizeLabel || 'Tamaño no especificado'} · {formatDate(item.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="rounded-full bg-surface-elevated px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-ink-muted border border-edge/50">
                                      {item.statusLabel}
                                    </span>
                                    {item.downloadUrl && (
                                      <a
                                        href={item.downloadUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="rounded-full p-1.5 text-ink-muted hover:bg-accent/10 hover:text-accent transition duration-200"
                                        title="Abrir o descargar archivo"
                                      >
                                        <ArrowDownToLine className="h-4 w-4" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-edge/60 bg-surface/35 p-6 text-center text-xs text-ink-muted">
                            No se encontraron archivos asociados a este manuscrito o proyecto.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-edge/60 bg-surface/30 p-8 text-center">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink">Cargando archivos</p>
                        <p className="mt-1 text-xs font-light leading-relaxed text-ink-muted/80">Estamos leyendo manuscritos, archivos de proyecto y entregables desde Supabase.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <SupportPanel onOpenMessageModal={() => router.push('/contacto')} />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <FilesLibraryModal open={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} data={libraryData} />

      <AnimatePresence>
        {isSubmitting ? (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              className="w-full max-w-lg rounded-3xl border border-edge/70 bg-surface-elevated p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ink-muted/80">Subida de manuscrito</p>
                  <h3 className="mt-1 font-serif text-2xl font-normal text-ink">Conecta aquí tu archivo real</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    Esta interfaz ya está lista para conectar el formulario real de envío. Si quieres, el siguiente paso es reactivar el flujo de carga sobre el manuscrito seleccionado.
                  </p>
                </div>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-edge/60 bg-surface text-ink-muted transition hover:border-accent/30 hover:text-accent"
                  onClick={() => setIsSubmitting(false)}
                >
                  <Lock className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <Button variant="primary" className="flex items-center gap-2" onClick={() => {
                  setIsSubmitting(false);
                  router.push('/contacto');
                }}>
                  <UploadCloud className="h-4 w-4" />
                  <span>Ir al formulario</span>
                </Button>
                <Button variant="secondary" className="flex items-center gap-2" onClick={() => setIsSubmitting(false)}>
                  <span>Cancelar</span>
                </Button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
