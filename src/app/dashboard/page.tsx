"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/services/auth.service';
import { submitManuscript } from '@/services/manuscript.service';
import { getAuthorProjectData, type AuthorProjectData } from '@/services/project.service';
import { getDashboardFileLibraryData, type DashboardFileLibraryData } from '@/services/file.service';
import { useEditorialWorkspace } from '@/hooks/useEditorialWorkspace';
import { useDashboardWorkspace } from '@/hooks/useDashboardWorkspace';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import {
  LayoutDashboard,
  BookOpen,
  Download,
  Wallet,
  Settings,
  CheckCircle2,
  Clock,
  FileAudio,
  Play,
  Pause,
  Headphones,
  ArrowDownToLine,
  MessageCircle,
  PlusCircle,
  Inbox,
  UploadCloud,
  FileUp,
  FileCheck,
  FolderOpen,
  X,
  Check,
  CreditCard,
  Building2,
  Send,
  MessageSquare,
  DollarSign,
  Lock,
  Disc,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { StatusHero } from '@/components/dashboard/StatusHero';
import { ProgressTimeline } from '@/components/dashboard/ProgressTimeline';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { SupportPanel } from '@/components/dashboard/SupportPanel';
import { FilePanel } from '@/components/dashboard/FilePanel';
import { NextActionCard } from '@/components/dashboard/NextActionCard';
import { AuthorCarousel } from '@/components/dashboard/AuthorCarousel';
import { FilesLibraryModal } from '@/components/dashboard/FilesLibraryModal';
import { ManuscriptSwitcher } from '@/components/dashboard/ManuscriptSwitcher';

type SectionId = 'resumen' | 'capitulos' | 'entregables' | 'pagos' | 'perfil';

interface ChapterItem {
  id: string;
  number?: number;
  title: string;
  progress: number;
  revisions: number;
  maxRevisions: number;
  status: 'Pendiente' | 'Cotizado' | 'Pagado' | 'En Grabación' | 'Entregado' | 'Produccion' | 'Revisiones' | 'Aprobado' | 'Completado';
  rawStatus?: string;
  paymentStatus: 'Pagado' | 'Pendiente' | 'Procesando';
  price: number;
  words: string;
  duration: string;
  sampleUrl?: string;
}

interface CommentItem {
  id: string;
  author: 'Autor' | 'Productor';
  text: string;
  timecode?: string;
  date: string;
}

interface InvoiceItem {
  id: string;
  date: string;
  concept: string;
  method: string;
  amount: string;
  status: 'Pagado' | 'Pendiente' | 'Procesando';
  pdfAvailable: boolean;
}

const initialChapters: ChapterItem[] = [];

const initialComments: Record<string, CommentItem[]> = {};

const deliverables: { title: string; date: string; size: string; format: string }[] = [];

function StatusPill({ status }: { status: string }) {
  const isDone = status === 'Completado' || status === 'Pagado' || status === 'Aprobado';
  const isRevision = status === 'Revisiones';

  let style = 'border-edge bg-surface text-ink-muted';
  if (isDone) {
    style = 'border-accent/40 bg-accent/15 text-accent font-medium';
  } else if (isRevision) {
    style = 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${style}`}>
      {isDone ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-accent" />
      ) : (
        <Clock className="h-3.5 w-3.5 shrink-0" />
      )}
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [selectedManuscriptId, setSelectedManuscriptId] = useState<string | null>(null);
  const [realProject, setRealProject] = useState<AuthorProjectData | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Integración de useDashboardWorkspace (Fase 1B3.6)
  const dashboardWorkspace = useDashboardWorkspace(authorId, selectedManuscriptId);
  const { data: workspaceData } = dashboardWorkspace;
  const requestContext = workspaceData?.requestContext ?? null;
  const projectsOverview = workspaceData?.projectsOverview ?? [];
  const requestState = workspaceData?.requestState ?? 'none';

  // Integración de Workspace Editorial (Fase 1B3.6.A)
  const editorialWorkspace = useEditorialWorkspace(selectedManuscriptId);
  const activeWorkspaceProject = editorialWorkspace.data?.project;

  // Estado del proyecto desde el Workspace Editorial con fallback a la carga legacy
  const activeProjectStatus = activeWorkspaceProject?.status ?? realProject?.status;

  // Estados de la biblioteca de archivos
  const [libraryData, setLibraryData] = useState<DashboardFileLibraryData | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const getManuscriptSelectorInfo = (m: { id: string; title: string; requestStatus: string | null }) => {
    const project = projectsOverview.find((p) => p.manuscriptId === m.id);

    if (project) {
      let label = 'Producción';
      let dotColor = 'bg-emerald-500';
      const statusToUse = (m.id === selectedManuscriptId && activeProjectStatus) ? activeProjectStatus : project.status;
      if (statusToUse === 'planning') {
        label = project.progress <= 30 ? 'En análisis' : 'Propuesta';
        dotColor = 'bg-amber-500';
      } else if (statusToUse === 'production') {
        label = 'Producción';
        dotColor = 'bg-violet-500';
      } else if (statusToUse === 'review') {
        label = 'En revisión';
        dotColor = 'bg-blue-500';
      } else if (statusToUse === 'completed') {
        label = 'Entregado';
        dotColor = 'bg-emerald-500';
      }
      return {
        label,
        progress: project.progress,
        dotColor,
      };
    } else {
      let label = 'Pendiente de evaluación';
      let dotColor = 'bg-zinc-400';
      if (m.requestStatus === 'evaluating') {
        label = 'En análisis';
        dotColor = 'bg-amber-500';
      } else if (m.requestStatus === 'rejected') {
        label = 'Rechazado';
        dotColor = 'bg-rose-500';
      }
      return {
        label,
        progress: null,
        dotColor,
      };
    }
  };

  // Estados de gestión de capítulos y comentarios
  const [chaptersState, setChaptersState] = useState<ChapterItem[]>(initialChapters);
  const [commentsState, setCommentsState] = useState<Record<string, CommentItem[]>>(initialComments);
  const [selectedChapter, setSelectedChapter] = useState<ChapterItem | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentTime, setNewCommentTime] = useState('03:45');

  // Estados de navegación, audio y modales
  const [active, setActive] = useState<SectionId>('resumen');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(35);
  const [uploaderModalOpen, setUploaderModalOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; wordCount: string } | null>(null);
  const [uploadingState, setUploadingState] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSubmitted, setUploadSubmitted] = useState(false);
  const [payingChapter, setPayingChapter] = useState<ChapterItem | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<InvoiceItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'bank'>('paypal');
  const [paypalEmail, setPaypalEmail] = useState('autor@ejemplo.com');
  const [bankIban, setBankIban] = useState('ES91 2100 0418 4502 0005 1234');
  const [bankHolder, setBankHolder] = useState('Joens Don');
  const [deliveryFormat, setDeliveryFormat] = useState<'mp3' | 'm4b' | 'wav'>('m4b');
  const [profileNotification, setProfileNotification] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [manuscriptTitle, setManuscriptTitle] = useState('');
  const [manuscriptWordCount, setManuscriptWordCount] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPostSubmitCarousel, setShowPostSubmitCarousel] = useState(false);

  const hasActiveProject = requestState === 'active' || Boolean(realProject);

  // 1. Efecto para verificar autenticación y obtener el id del autor
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      const u = await getUser();
      if (!isMounted) return;
      if (!u) {
        router.replace('/login');
        return;
      }
      setAuthorId(u.id);
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // 2. Efecto para cargar realProject (capítulos y datos legacy) cuando el estado es 'active'
  useEffect(() => {
    if (!authorId || requestState !== 'active') {
      setRealProject(null);
      setChaptersState([]);
      return;
    }
    const currentAuthorId = authorId;
    const manuscriptIdToLoad = selectedManuscriptId ?? requestContext?.manuscriptId;
    if (!manuscriptIdToLoad) {
      setRealProject(null);
      setChaptersState([]);
      return;
    }

    let isMounted = true;

    async function loadProjectData() {
      try {
        const projectData = await getAuthorProjectData(currentAuthorId, manuscriptIdToLoad);
        if (!isMounted) return;

        if (projectData) {
          setRealProject(projectData);

          if (projectData.chapters && projectData.chapters.length > 0) {
            const mappedChapters: ChapterItem[] = projectData.chapters.map((c) => {
              let progress = 0;
              let statusLabel: ChapterItem['status'] = 'Pendiente';
              let payStatus: ChapterItem['paymentStatus'] = 'Pendiente';

              if (c.status === 'pendiente') {
                progress = 0;
                statusLabel = 'Pendiente';
                payStatus = 'Pendiente';
              } else if (c.status === 'cotizado') {
                progress = 20;
                statusLabel = 'Cotizado';
                payStatus = 'Pendiente';
              } else if (c.status === 'pagado') {
                progress = 40;
                statusLabel = 'Pagado';
                payStatus = 'Pagado';
              } else if (c.status === 'en_produccion') {
                progress = 75;
                statusLabel = 'En Grabación';
                payStatus = 'Pagado';
              } else if (c.status === 'entregado') {
                progress = 100;
                statusLabel = 'Entregado';
                payStatus = 'Pagado';
              }

              return {
                id: c.id,
                number: c.chapter_number,
                title: c.title,
                progress,
                revisions: 0,
                maxRevisions: projectData.maxRevisions || 3,
                status: statusLabel,
                rawStatus: c.status,
                paymentStatus: payStatus,
                price: c.price,
                words: `${c.word_count.toLocaleString()} palabras`,
                duration: `~${c.duration_minutes} min`,
              };
            });
            setChaptersState(mappedChapters);
          } else {
            setChaptersState([]);
          }
        } else {
          setRealProject(null);
          setChaptersState([]);
        }
      } catch (err) {
        console.error('Error al cargar datos del proyecto:', err);
      } finally {
        if (isMounted) setIsChecking(false);
      }
    }

    loadProjectData();

    return () => {
      isMounted = false;
    };
  }, [authorId, selectedManuscriptId, requestState, requestContext?.manuscriptId]);

  // 3. Efecto para cargar datos completos de la biblioteca de archivos
  useEffect(() => {
    if (!authorId) return;
    const currentAuthorId = authorId;
    let isMounted = true;

    async function loadLibrary() {
      try {
        const data = await getDashboardFileLibraryData(
          currentAuthorId,
          realProject?.id ?? null,
          selectedManuscriptId ?? requestContext?.manuscriptId ?? null
        );
        if (isMounted) setLibraryData(data);
      } catch (err) {
        console.error('Error al cargar la biblioteca de archivos:', err);
        if (isMounted) setLibraryData(null);
      }
    }

    loadLibrary();

    return () => {
      isMounted = false;
    };
  }, [authorId, realProject?.id, selectedManuscriptId, requestContext?.manuscriptId]);

  // Sincronización de estado para migración 1B3.6:
  // Cuando selectedManuscriptId es null y workspaceData?.manuscriptId existe,
  // se establece como manuscrito seleccionado. No sobrescribe si ya hay selección manual.
  useEffect(() => {
    if (selectedManuscriptId === null && workspaceData?.manuscriptId) {
      setSelectedManuscriptId(workspaceData.manuscriptId);
    }
  }, [selectedManuscriptId, workspaceData?.manuscriptId]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const sections: { id: SectionId; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
    { id: 'capitulos', label: 'Capítulos', icon: BookOpen, badge: hasActiveProject ? `${chaptersState.length}` : undefined },
    { id: 'entregables', label: 'Entregables', icon: Download },
    { id: 'pagos', label: 'Pagos & Facturas', icon: Wallet },
    { id: 'perfil', label: 'Perfil & Preferencias', icon: Settings },
  ];

  const handleFileSelect = (fileName: string, fileSize: string, file?: File) => {
    if (file) {
      setPendingFile(file);
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      if (!manuscriptTitle) {
        setManuscriptTitle(nameWithoutExt);
      }
    }
    setUploadedFile({ name: fileName, size: fileSize, wordCount: '' });
  };

  // Enviar manuscrito real: sube el archivo y crea las filas reales en Supabase
  const handleSubmitManuscript = async () => {
    if (!authorId || !pendingFile) {
      setSubmitError('Falta el archivo o no hay sesión activa.');
      return;
    }
    const wordCountNumber = Number(manuscriptWordCount);
    if (!manuscriptTitle.trim() || !wordCountNumber || wordCountNumber <= 0) {
      setSubmitError('Completa el título y un número de palabras válido.');
      return;
    }

    setSubmitError(null);
    setUploadingState(true);
    setUploadProgress(50);

    try {
      const res = await submitManuscript({
        authorId,
        title: manuscriptTitle.trim(),
        wordCount: wordCountNumber,
        file: pendingFile,
      });
      setUploadSubmitted(true);
      setTimeout(async () => {
        setUploaderModalOpen(false);
        setUploadSubmitted(false);
        setUploadedFile(null);
        setPendingFile(null);
        setManuscriptTitle('');
        setManuscriptWordCount('');
        if (authorId && res && res.id) {
          setSelectedManuscriptId(res.id);
          await dashboardWorkspace.reload();
          setShowPostSubmitCarousel(true);
        } else {
          setShowPostSubmitCarousel(true);
        }
      }, 1500);
    } catch (err) {
      console.error('Error al enviar el manuscrito:', JSON.stringify(err, null, 2));
      if (err && typeof err === 'object' && 'message' in err) {
        const error = err as { message: string; code?: string; details?: string; hint?: string };
        console.error('message:', error.message);
        console.error('code:', error.code);
        console.error('details:', error.details);
        console.error('hint:', error.hint);
      }
      setSubmitError('No se pudo enviar el manuscrito. Intenta de nuevo.');
    } finally {
      setUploadingState(false);
    }
  };

  // Agregar comentario en la revisión
  const handleAddComment = (chapterId: string) => {
    if (!newCommentText.trim()) return;

    const currentChap = chaptersState.find((c) => c.id === chapterId);
    if (!currentChap) return;

    // Verificar si queda cupo de revisiones si el estado cambia
    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: 'Autor',
      text: newCommentText.trim(),
      timecode: newCommentTime,
      date: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCommentsState((prev) => ({
      ...prev,
      [chapterId]: [...(prev[chapterId] || []), newComment],
    }));

    // Actualizar conteo de revisiones del capítulo
    setChaptersState((prev) =>
      prev.map((c) => {
        if (c.id === chapterId) {
          const updatedRevisions = Math.min(c.maxRevisions, c.revisions + 1);
          return {
            ...c,
            revisions: updatedRevisions,
            status: 'Revisiones',
          };
        }
        return c;
      })
    );

    // Actualizar capítulo seleccionado en modal
    setSelectedChapter((prev) =>
      prev
        ? {
            ...prev,
            revisions: Math.min(prev.maxRevisions, prev.revisions + 1),
            status: 'Revisiones',
          }
        : null
    );

    setNewCommentText('');
  };

  // Aprobar capítulo
  const handleApproveChapter = (chapterId: string) => {
    setChaptersState((prev) =>
      prev.map((c) => (c.id === chapterId ? { ...c, status: 'Aprobado', progress: 100 } : c))
    );
    if (selectedChapter?.id === chapterId) {
      setSelectedChapter((prev) => (prev ? { ...prev, status: 'Aprobado', progress: 100 } : null));
    }
  };

  // Ejecutar pago simulado de capítulo
  const handleConfirmChapterPayment = (chapterId: string) => {
    setPaymentProcessing(true);
    setTimeout(() => {
      setChaptersState((prev) =>
        prev.map((c) => (c.id === chapterId ? { ...c, paymentStatus: 'Pagado' } : c))
      );
      setPaymentProcessing(false);
      setPayingChapter(null);
      if (selectedChapter?.id === chapterId) {
        setSelectedChapter((prev) => (prev ? { ...prev, paymentStatus: 'Pagado' } : null));
      }
    }, 1500);
  };

  // Guardar ajustes de perfil
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileNotification('Preferencia guardada correctamente. Tu director asignado adaptará los entregables a tus especificaciones.');
    setTimeout(() => {
      setProfileNotification(null);
    }, 4000);
  };

  if (isChecking) {
    return <LoadingScreen message="Verificando acceso al Centro del Autor..." />;
  }

  return (
    <main className="min-h-screen bg-surface text-ink transition-colors duration-200">
      <Navbar />

      {/* Contenido principal con Sidebar */}
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr]">

          {/* Sidebar de Navegación */}
          <aside className="space-y-6 lg:sticky lg:top-20 self-start">
            <div className="rounded-3xl border-edge bg-surface-elevated p-3 shadow-xs">
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
                Navegación
              </p>
              <nav className="mt-1 flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = active === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActive(section.id)}
                      className={`group relative flex shrink-0 items-center justify-between rounded-2xl px-3.5 py-3 text-sm font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'border-accent/30 bg-accent/10 text-accent shadow-2xs'
                          : 'border-transparent text-ink-muted hover:border-edge hover:bg-surface hover:text-ink'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? 'text-accent' : 'text-ink-muted'}`} strokeWidth={1.75} />
                        <span>{section.label}</span>
                      </div>
                      {section.badge ? (
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          isActive ? 'bg-accent/20 text-accent' : 'bg-surface border-edge text-ink-muted'
                        }`}>
                          {section.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Widget informativo de soporte en la columna izquierda */}
            <div className="hidden rounded-3xl border-edge bg-surface-elevated p-5 shadow-xs lg:block">
              <div className="flex items-center gap-2 text-accent">
                <Headphones className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Atención Directa</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                ¿Tienes alguna consulta sobre la locución o edición? Tu productor asignado está disponible.
              </p>
              <Link
                href="/contacto"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-edge bg-surface px-3 py-2.5 text-xs font-medium text-ink transition hover:border-accent/40 hover:text-accent shadow-2xs"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Contactar Productor
              </Link>
            </div>
          </aside>

          {/* Contenido de la Sección Activa */}
          <div className="min-w-0 space-y-8">
            {/* Header unificado de la vista */}
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
                      ID: {requestContext?.projectId ? `#PROJ-${requestContext.projectId.slice(0, 8).toUpperCase()}` : requestContext?.requestId ? `#REQ-${requestContext.requestId.slice(0, 8).toUpperCase()}` : '#SOLICITUD'}
                    </span>
                  )}
                </div>

                <div className="mt-3 relative inline-block text-left w-full">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-accent/90 mb-1">
                    Obra Consultada
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                    className="group inline-flex items-center gap-2.5 rounded-2xl border border-edge bg-surface-elevated px-4 py-2 text-xl sm:text-2xl font-serif font-medium text-ink shadow-2xs hover:bg-surface transition cursor-pointer select-none max-w-full"
                  >
                    <span className="truncate">
                      {requestState === 'active'
                        ? (realProject?.title || requestContext?.title || 'Tu Obra en Grabación')
                        : requestState === 'pending'
                        ? (requestContext?.title || 'Manuscrito en Evaluación Editorial')
                        : 'Bienvenido a Studio Flamkit'}
                    </span>
                    <span className="text-xs text-ink-muted/80 transition-transform duration-200 group-hover:translate-y-0.5 shrink-0">▼</span>
                  </button>

                  {isSelectorOpen && (
                    <>
                      {/* Invisible backdrop to capture outside clicks and close the selector safely in iframes */}
                      <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsSelectorOpen(false)} />

                      <div className="absolute left-0 mt-2 w-72 sm:w-80 origin-top-left rounded-3xl border border-edge bg-surface-elevated/95 p-3 shadow-xl z-50 backdrop-blur-md">
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-muted/70 border-b border-edge/40 pb-2 mb-2">
                          Mis obras
                        </div>
                        <div className="space-y-1">
                          {requestContext?.manuscripts && requestContext.manuscripts.length > 0 ? (
                            requestContext.manuscripts.map((m) => {
                              const info = getManuscriptSelectorInfo(m);
                              const isSelected = m.id === selectedManuscriptId;
                              return (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedManuscriptId(m.id);
                                    setIsSelectorOpen(false);
                                  }}
                                  className={`w-full text-left rounded-2xl p-2.5 transition flex flex-col gap-0.5 cursor-pointer ${
                                    isSelected
                                      ? 'bg-accent/10 text-accent font-medium'
                                      : 'hover:bg-surface text-ink'
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
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsLibraryOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-edge/80 bg-surface-elevated px-4 py-2.5 text-xs font-medium text-ink transition hover:border-accent/40 hover:text-accent shadow-2xs cursor-pointer"
                >
                  <FolderOpen className="h-4 w-4 text-accent" />
                  <span>Biblioteca de archivos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploaderModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2.5 text-xs font-medium text-surface transition hover:bg-accent-hover shadow-xs cursor-pointer"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>{requestState === 'none' ? 'Subir Manuscrito' : 'Enviar Nueva Versión'}</span>
                </button>
              </div>
            </div>
            {active === 'resumen' && (
              <div className="space-y-6">
                {/* Switcher de obras si hay múltiples manuscritos */}
                {requestContext?.manuscripts && requestContext.manuscripts.length > 1 && (
                  <ManuscriptSwitcher
                    manuscripts={requestContext.manuscripts}
                    selectedManuscriptId={selectedManuscriptId}
                    onSelect={(id) => setSelectedManuscriptId(id)}
                  />
                )}

                {/* Carrusel interactivo post-envío opcional (3:2) */}
                {(showPostSubmitCarousel || (requestState === 'pending' && showPostSubmitCarousel)) && (
                  <AuthorCarousel
                    manuscriptTitle={requestContext?.title || 'Tu Obra'}
                    onClose={() => setShowPostSubmitCarousel(false)}
                  />
                )}

                {/* Grid Superior: Siguiente Acción Principal + Estado del Manuscrito */}
                <div className="grid gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-12">
                    <NextActionCard
                      state={requestState}
                      pendingActionTitle={
                        requestState === 'pending'
                          ? 'Análisis Técnico y Desglose Editorial'
                          : requestState === 'active'
                          ? 'Revisión y Aprobación de Capítulos'
                          : undefined
                      }
                      pendingActionDesc={
                        requestState === 'pending'
                          ? 'Nuestro equipo está evaluando la obra. Recibirás el desglose y la cotización en tu cabina.'
                          : requestState === 'active'
                          ? 'Escucha las muestras de audio grabadas, deja comentarios o aprueba los capítulos.'
                          : undefined
                      }
                      buttonLabel={requestState === 'active' ? 'Ver Capítulos Registrados' : undefined}
                      onActionClick={
                        requestState === 'none'
                          ? () => setUploaderModalOpen(true)
                          : requestState === 'active'
                          ? () => setActive('capitulos')
                          : undefined
                      }
                    />
                  </div>
                </div>

                {/* Hero / Estado de Obra */}
                <StatusHero
                  state={requestState}
                  projectTitle={realProject?.title || requestContext?.title}
                  submittedDate={requestContext?.createdAt ? new Date(requestContext.createdAt).toLocaleDateString() : undefined}
                  progress={realProject?.progress || 0}
                  statusLabel={requestState === 'active' ? 'Producción Audiocinematográfica' : undefined}
                  journey={editorialWorkspace.data?.journey ?? null}
                  onUploadClick={() => setUploaderModalOpen(true)}
                  onViewFilesClick={() => setIsLibraryOpen(true)}
                  onToggleCarousel={() => setShowPostSubmitCarousel((prev) => !prev)}
                />

                {/* Stepper Compacto Horizontal de Trayecto Editorial */}
                <ProgressTimeline
                  currentState={requestState}
                  journey={editorialWorkspace.data?.journey ?? null}
                />

                {/* KPIs Compactos de la Obra (Métricas Reales) */}
                {(hasActiveProject || requestState === 'pending') && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <KpiCard
                      icon={BookOpen}
                      label="Capítulos de la Obra"
                      value={chaptersState.length}
                      subtext={hasActiveProject ? `${chaptersState.filter(c => c.paymentStatus === 'Pagado').length} pagados / en producción` : 'Pendiente de cotización'}
                      statusBadge={{ text: requestState === 'active' ? 'Activo' : 'En Evaluación', type: requestState === 'active' ? 'success' : 'warning' }}
                    />
                    <KpiCard
                      icon={Clock}
                      label="Estado de Producción"
                      value={requestState === 'active' ? `${realProject?.progress || 0}%` : 'En Lectura'}
                      subtext="Seguimiento por capítulos"
                      statusBadge={{ text: requestState === 'active' ? 'En Curso' : 'SLA < 48h', type: 'neutral' }}
                    />
                    <KpiCard
                      icon={Wallet}
                      label="Revisiones Incluidas"
                      value={realProject?.maxRevisions || 3}
                      subtext="Garantía de calidad editorial"
                      statusBadge={{ text: 'Pactado', type: 'success' }}
                    />
                  </div>
                )}

                {/* Archivos Guardados & Soporte Editorial */}
                <div className="grid gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-8">
                    <FilePanel
                      projectTitle={realProject?.title || requestContext?.title}
                      acceptedPaymentAmount={realProject?.chapters?.reduce((acc, c) => acc + (c.price || 0), 0) || 0}
                      files={
                        requestContext?.manuscripts && requestContext.manuscripts.length > 0
                          ? [
                              ...requestContext.manuscripts.map((m) => {
                                let status: 'bloqueado' | 'disponible' | 'en_revision' | 'aprobado' | 'en_analisis' = 'bloqueado';
                                if (m.requestStatus === 'evaluating') {
                                  status = 'en_analisis';
                                } else if (m.requestStatus === 'pending') {
                                  status = 'bloqueado';
                                } else if (m.requestStatus === 'en_revision' || m.requestStatus === 'active') {
                                  status = 'en_revision';
                                } else if (m.requestStatus === 'completed' || m.requestStatus === 'approved') {
                                  status = 'aprobado';
                                } else {
                                  status = 'disponible';
                                }
                                return {
                                  id: `manuscript-${m.id}`,
                                  name: `${m.title}.docx`,
                                  size: 'Manuscrito Original',
                                  date: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recientemente',
                                  status,
                                };
                              }),
                              ...(realProject?.deliverables || []).map((d) => ({
                                id: d.id,
                                name: d.title,
                                size: 'Entregable de Producción',
                                date: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Reciente',
                                status: d.completed ? 'aprobado' as const : 'en_revision' as 'aprobado' | 'en_revision',
                              })),
                            ]
                          : []
                      }
                      isLocked={false}
                      onUploadReplacement={requestState !== 'pending' ? () => setUploaderModalOpen(true) : undefined}
                    />
                  </div>

                  <div className="lg:col-span-4">
                    <SupportPanel
                      onOpenMessageModal={() => {
                        router.push('/contacto');
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {active === 'capitulos' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {!hasActiveProject ? (
                  <Card title="Capítulos del Audiolibro" description="Grabación, edición y muestras por capítulo.">
                    <div className="mt-8 rounded-2xl border-dashed border-edge/50 bg-surface p-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated text-ink-muted border-edge/50">
                        <Inbox className="h-6 w-6" />
                      </div>
                      <p className="mt-3 font-medium text-ink">No hay capítulos asignados a producción</p>
                      <p className="mt-1 text-xs text-ink-muted max-w-md mx-auto">
                        Sube tu manuscrito para recibir el desglose por capítulos y las muestras de locución.
                      </p>
                      <button
                        type="button"
                        onClick={() => setUploaderModalOpen(true)}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-medium text-surface transition hover:bg-accent-hover cursor-pointer"
                      >
                        <FileUp className="h-4 w-4" />
                        <span>Subir Manuscrito</span>
                      </button>
                    </div>
                  </Card>
                ) : chaptersState.length === 0 ? (
                  <Card title="Capítulos del Audiolibro" description="Grabación, edición y muestras por capítulo.">
                    <div className="mt-8 rounded-2xl border-dashed border-edge/50 bg-surface p-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated text-accent border-edge/50">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <p className="mt-3 font-semibold text-ink">Obra Activa en Producción</p>
                      <p className="mt-1 text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
                        Tu obra está activa. Tu editor está configurando los capítulos reales en Supabase con la duración y tarifa calculada. En cuanto se agreguen, los verás listados aquí para seguimiento paso a paso.
                      </p>
                    </div>
                  </Card>
                ) : (
                  <Card title="Capítulos del Audiolibro" description="Haz clic en cualquier capítulo para escuchar, enviar revisiones en chat, aprobar o realizar el pago.">
                    <div className="mt-6 space-y-4">
                      {chaptersState.map((chapter, index) => (
                        <motion.div
                          key={chapter.id}
                          initial={{ opacity: 0, y: 16, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
                          whileHover={{ scale: 1.01, transition: { duration: 0.2, ease: 'easeOut' } }}
                          onClick={() => setSelectedChapter(chapter)}
                          className="group rounded-2xl border-edge/50 bg-surface-elevated p-5 transition-colors hover:border-accent/40 hover:shadow-md cursor-pointer"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3.5">
                              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-edge/50 bg-surface text-accent group-hover:border-accent/30 group-hover:bg-accent/10">
                                <FileAudio className="h-5 w-5" strokeWidth={1.75} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-accent">#0{index + 1}</span>
                                  <p className="text-base font-semibold text-ink group-hover:text-accent transition-colors">{chapter.title}</p>
                                </div>
                                <p className="mt-1 text-xs text-ink-muted">
                                  {chapter.words} · Duración estimada: {chapter.duration}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-auto">
                              <StatusPill status={chapter.status} />

                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                                chapter.paymentStatus === 'Pagado'
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              }`}>
                                <Wallet className="h-3 w-3" />
                                {chapter.paymentStatus === 'Pagado' ? 'Pagado' : `$${chapter.price}.00 Pend.`}
                              </span>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedChapter(chapter);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border-edge/50 bg-surface px-3 py-1.5 text-xs font-medium text-ink transition hover:border-accent/40 hover:text-accent cursor-pointer"
                              >
                                <Play className="h-3.5 w-3.5 text-accent" />
                                <span>Abrir Panel</span>
                              </button>
                            </div>
                          </div>

                          {/* Barra de progreso del capítulo */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-ink-muted">Avance de producción</span>
                              <span className="font-semibold text-ink">{chapter.progress}%</span>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface border-edge/40">
                              <div
                                className="h-full rounded-full bg-accent transition-all duration-300"
                                style={{ width: `${chapter.progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-edge/40 pt-3 text-xs text-ink-muted">
                            <span>Cupo pactado: {chapter.maxRevisions} revisiones</span>
                            <span className="font-medium text-ink">
                              {chapter.revisions} de {chapter.maxRevisions} revisiones utilizadas
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                )}
              </motion.div>
            )}

            {active === 'entregables' && (
              <Card title="Entregables y Muestras de Audio" description="Descarga masters, muestras de evaluación y materiales finales.">
                {!hasActiveProject ? (
                  <div className="mt-8 rounded-2xl border-dashed border-edge/50 bg-surface p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated text-ink-muted border-edge/50">
                      <Download className="h-6 w-6" />
                    </div>
                    <p className="mt-3 font-medium text-ink">Sin entregables disponibles</p>
                    <p className="mt-1 text-xs text-ink-muted max-w-md mx-auto">
                      Los archivos procesados, muestras preliminares y masters M4B/WAV/MP3 listos para distribución se publicarán en esta sección.
                    </p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {deliverables.map((item) => (
                      <div
                        key={item.title}
                        className="group flex flex-col gap-3 rounded-2xl border-edge/50 bg-surface-elevated p-4 transition hover:border-accent/40 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-edge/50 bg-surface text-accent group-hover:border-accent/30">
                            <Download className="h-5 w-5" strokeWidth={1.75} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-ink">{item.title}</p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-ink-muted">
                              <span>{item.format}</span>
                              <span>·</span>
                              <span>{item.size}</span>
                              <span>·</span>
                              <span>{item.date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {item.date !== 'Pendiente' ? (
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-medium text-surface transition hover:bg-accent-hover shadow-sm cursor-pointer"
                            >
                              <ArrowDownToLine className="h-3.5 w-3.5" />
                              <span>Descargar</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border-edge/50 bg-surface px-3 py-1 text-xs text-ink-muted">
                              <Clock className="h-3.5 w-3.5" />
                              En proceso
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {active === 'pagos' && (
              <div className="space-y-6">
                <Card title="Pagos por Capítulo" description="Registro transparente de costos por fragmento y opción de pago directo.">
                  {!hasActiveProject ? (
                    <div className="mt-6 space-y-6">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border-edge/50 bg-surface p-4">
                          <p className="text-xs uppercase tracking-wider text-ink-muted">Inversión Total</p>
                          <p className="mt-1 text-xl font-semibold text-ink">$0.00</p>
                        </div>
                        <div className="rounded-2xl border-edge/50 bg-surface p-4">
                          <p className="text-xs uppercase tracking-wider text-ink-muted">Total Pagado</p>
                          <p className="mt-1 text-xl font-semibold text-ink">$0.00</p>
                        </div>
                        <div className="rounded-2xl border-edge/50 bg-surface p-4">
                          <p className="text-xs uppercase tracking-wider text-ink-muted">Pendiente</p>
                          <p className="mt-1 text-xl font-semibold text-ink">$0.00</p>
                        </div>
                      </div>
                      <div className="rounded-2xl border-dashed border-edge/50 bg-surface p-8 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated text-ink-muted border-edge/50">
                          <Wallet className="h-6 w-6" />
                        </div>
                        <p className="mt-3 font-medium text-ink">No hay facturas ni pagos pendientes</p>
                        <p className="mt-1 text-xs text-ink-muted max-w-md mx-auto">
                          Al aprobar una cotización, el plan de pagos por capítulos aparecerá desglosado aquí.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Resumen financiero en la parte superior */}
                {/* Aquí se cargarán los datos financieros reales del proyecto */}

                <div className="space-y-3">
                  {/* Aquí se listarán los capítulos con su estado de pago real */}
                </div>
              </>
            )}
          </Card>

          {/* TABLA DE HISTORIAL DE FACTURAS */}
          <Card title="Historial de Facturación" description="Tabla completa de comprobantes, recibos y facturas oficiales emitidas.">
            <div className="mt-4 overflow-x-auto">
              {/* Aquí se listará el historial de facturas reales */}
            </div>
          </Card>
        </div>
      )}

            {active === 'perfil' && (
              <Card title="Perfil de Autor & Configuración" description="Gestiona tu método de pago preferido y el formato de entregables finales para tu obra.">
                <form onSubmit={handleSaveProfile} className="mt-6 space-y-8">

                  {/* Banner de perfil de autor */}
                  <div className="flex items-center gap-4 rounded-2xl border-edge/50 bg-surface p-4 shadow-sm">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent font-serif text-xl font-bold text-surface shadow-md">
                      AU
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-ink">Cuenta de Autor Verificada</h3>
                      <p className="text-xs text-ink-muted">
                        {hasActiveProject
                          ? `Proyecto Activo: ${realProject?.title || requestContext?.title || 'Obra en producción'}`
                          : 'Sin obras en producción activa'}
                      </p>
                    </div>
                  </div>

                  {profileNotification && (
                    <div className="rounded-2xl border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{profileNotification}</span>
                    </div>
                  )}

                  {/* SECCIÓN 1: MÉTODOS DE PAGO */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-edge/60 pb-2">
                      <Wallet className="h-4 w-4 text-accent" />
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-ink">Método de Pago Preferido</h4>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Opción PayPal */}
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                          paymentMethod === 'paypal'
                            ? 'border-accent bg-accent/5 shadow-sm'
                            : 'border-edge/50 bg-surface hover:border-accent/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="paypal"
                          checked={paymentMethod === 'paypal'}
                          onChange={() => setPaymentMethod('paypal')}
                          className="mt-1 accent-accent"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-accent" />
                            <span className="text-sm font-semibold text-ink">PayPal</span>
                          </div>
                          <p className="text-xs text-ink-muted leading-relaxed">
                            Pago seguro y rápido en dólares o euros. Recibe solicitudes directas de cobro.
                          </p>
                        </div>
                      </label>

                      {/* Opción Banco / Transferencia */}
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                          paymentMethod === 'bank'
                            ? 'border-accent bg-accent/5 shadow-sm'
                            : 'border-edge/50 bg-surface hover:border-accent/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank"
                          checked={paymentMethod === 'bank'}
                          onChange={() => setPaymentMethod('bank')}
                          className="mt-1 accent-accent"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-accent" />
                            <span className="text-sm font-semibold text-ink">Transferencia Bancaria (IBAN / Banco)</span>
                          </div>
                          <p className="text-xs text-ink-muted leading-relaxed">
                            Abona directamente a nuestra cuenta bancaria empresarial con la factura adjunta.
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Campos de configuración del método elegido */}
                    {paymentMethod === 'paypal' ? (
                      <div className="rounded-2xl border-edge/50 bg-surface/50 p-4 space-y-2">
                        <label className="text-xs font-medium text-ink-muted">Correo electrónico registrado en PayPal</label>
                        <input
                          type="email"
                          value={paypalEmail}
                          onChange={(e) => setPaypalEmail(e.target.value)}
                          className="w-full rounded-xl border-edge/50 bg-surface px-3.5 py-2 text-xs font-mono text-ink focus:border-accent focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div className="rounded-2xl border-edge/50 bg-surface/50 p-4 space-y-3">
                        <div>
                          <label className="text-xs font-medium text-ink-muted">Titular de la cuenta</label>
                          <input
                            type="text"
                            value={bankHolder}
                            onChange={(e) => setBankHolder(e.target.value)}
                            className="w-full rounded-xl border-edge/50 bg-surface px-3.5 py-2 text-xs text-ink focus:border-accent focus:outline-none mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-ink-muted">IBAN / Número de Cuenta Bancaria</label>
                          <input
                            type="text"
                            value={bankIban}
                            onChange={(e) => setBankIban(e.target.value)}
                            className="w-full rounded-xl border-edge/50 bg-surface px-3.5 py-2 text-xs font-mono text-ink focus:border-accent focus:outline-none mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SECCIÓN 2: PREFERENCIA DE ENTREGA DEL AUDIOLIBRO */}
                  <div className="space-y-4 pt-4 border-t border-edge/60">
                    <div className="flex items-center gap-2 border-b border-edge/60 pb-2">
                      <Disc className="h-4 w-4 text-accent" />
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-ink">Preferencia de Entrega de Master</h4>
                    </div>

                    <div className="space-y-3">
                      {/* Opción 1: MP3 Estándar */}
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                          deliveryFormat === 'mp3'
                            ? 'border-accent bg-accent/5 shadow-sm'
                            : 'border-edge/50 bg-surface hover:border-accent/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryFormat"
                          value="mp3"
                          checked={deliveryFormat === 'mp3'}
                          onChange={() => setDeliveryFormat('mp3')}
                          className="mt-1 accent-accent"
                        />
                        <div>
                          <p className="text-sm font-semibold text-ink">Opción 1: MP3 Alta Calidad (320 kbps)</p>
                          <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                            Archivos comprimidos por capítulo listos para reproducción rápida, sitios web personales o distribución independiente flexible.
                          </p>
                        </div>
                      </label>

                      {/* Opción 2: El Formato Nativo de Audiolibro Premium (.M4B) */}
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                          deliveryFormat === 'm4b'
                            ? 'border-accent bg-accent/5 shadow-sm'
                            : 'border-edge/50 bg-surface hover:border-accent/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryFormat"
                          value="m4b"
                          checked={deliveryFormat === 'm4b'}
                          onChange={() => setDeliveryFormat('m4b')}
                          className="mt-1 accent-accent"
                        />
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-ink">Opción 2: El Formato Nativo de Audiolibro Premium (.M4B)</span>
                            <span className="rounded-full border-accent/30 bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
                              Recomendado
                            </span>
                          </div>
                          <p className="text-xs text-ink leading-relaxed">
                            <strong>Qué entregas:</strong> Un único archivo de audio integrado en formato AAC/M4B que contiene el libro completo.
                          </p>
                          <p className="text-xs text-ink-muted leading-relaxed">
                            <strong>Por qué es una opción única:</strong> Es el verdadero formato diseñado exclusivamente para audiolibros. Permite meter dentro del mismo archivo la portada del libro, los metadatos y los marcadores de capítulos interactivos. El usuario puede pausar, cambiar de capítulo y el reproductor de Apple Books o Google Play recordará exactamente el segundo donde se quedó.
                          </p>
                        </div>
                      </label>

                      {/* Opción 3: El Máster de Preservación Editorial (WAV de 24 bits / 44.1 kHz o 48 kHz) */}
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                          deliveryFormat === 'wav'
                            ? 'border-accent bg-accent/5 shadow-sm'
                            : 'border-edge/50 bg-surface hover:border-accent/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryFormat"
                          value="wav"
                          checked={deliveryFormat === 'wav'}
                          onChange={() => setDeliveryFormat('wav')}
                          className="mt-1 accent-accent"
                        />
                        <div className="space-y-1.5">
                          <p className="text-sm font-semibold text-ink">Opción 3: El Máster de Preservación Editorial (WAV 24 bits / 44.1 kHz o 48 kHz)</p>
                          <p className="text-xs text-ink leading-relaxed">
                            <strong>Qué entregas:</strong> Los archivos puros y pesados sin compresión (un archivo por capítulo).
                          </p>
                          <p className="text-xs text-ink-muted leading-relaxed">
                            <strong>Por qué es una opción única:</strong> Es el formato que te exigen las editoriales tradicionales o grandes distribuidoras (como Planeta o Penguin Random House). Ellos no quieren que tú comprimas el audio; quieren el máster de estudio en máxima resolución para que sus propios ingenieros hagan el proceso de distribución y archivo histórico.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 text-right">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs font-medium text-surface transition hover:bg-accent-hover shadow-sm cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>Guardar Preferencias de Perfil</span>
                    </button>
                  </div>
                </form>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Uploader de Manuscritos para Presupuesto (.docx, .odt, .pdf) */}
      <AnimatePresence>
        {uploaderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg rounded-3xl border-edge/50 bg-surface p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setUploaderModalOpen(false)}
                className="absolute top-5 right-5 rounded-full p-1 text-ink-muted hover:bg-surface-elevated hover:text-ink transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-accent/30 bg-accent/10 text-accent">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-ink">Subir Manuscrito para Cotización</h3>
                  <p className="text-xs text-ink-muted">Admite formatos .DOCX, .ODT y .PDF</p>
                </div>
              </div>

              {!uploadSubmitted ? (
                <div className="mt-6 space-y-4">
                  {/* Zona de Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file) handleFileSelect(file.name, `${(file.size / 1024 / 1024).toFixed(1)} MB`, file);
                    }}
                    className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
                      dragOver
                        ? 'border-accent bg-accent/10'
                        : 'border-edge/50 bg-surface-elevated hover:border-accent/40'
                    }`}
                  >
                    <FileUp className="h-10 w-10 text-accent animate-bounce" />
                    <p className="mt-3 text-sm font-medium text-ink">
                      Arrastra tu manuscrito aquí o explora tus archivos
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      Formatos compatibles: Microsoft Word (.docx), OpenDocument (.odt), PDF (.pdf)
                    </p>

                    <input
                      type="file"
                      accept=".docx,.odt,.pdf"
                      id="manuscript-upload-input"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file.name, `${(file.size / 1024 / 1024).toFixed(1)} MB`, file);
                      }}
                    />

                    <label
                      htmlFor="manuscript-upload-input"
                      className="mt-4 inline-flex items-center gap-2 rounded-xl border-edge/50 bg-surface px-4 py-2 text-xs font-medium text-ink transition hover:border-accent/40 hover:text-accent cursor-pointer"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Seleccionar Archivo</span>
                    </label>
                  </div>

                  {/* Estado de Carga / Archivo subido */}
                  {uploadingState && (
                    <div className="rounded-2xl border-edge/50 bg-surface-elevated p-4">
                      <div className="flex items-center justify-between text-xs text-ink-muted">
                        <span>Analizando estructura del archivo...</span>
                        <span className="font-medium text-accent">{uploadProgress}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface border-edge/40">
                        <div
                          className="h-full bg-accent transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadedFile && (
                    <div className="rounded-2xl border-accent/30 bg-accent/5 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileCheck className="h-6 w-6 text-accent" />
                        <div>
                          <p className="text-xs font-semibold text-ink">{uploadedFile.name}</p>
                          <p className="text-[11px] text-ink-muted">{uploadedFile.size} · {uploadedFile.wordCount}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="text-xs text-ink-muted hover:text-amber-500"
                      >
                        Quitar
                      </button>
                    </div>
                  )}

                  {uploadedFile && !uploadSubmitted && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="text-xs uppercase tracking-wider text-ink-muted">Titulo de la obra</label>
                        <input
                          type="text"
                          value={manuscriptTitle}
                          onChange={(e) => setManuscriptTitle(e.target.value)}
                          placeholder="El titulo de tu libro"
                          className="mt-1 w-full rounded-xl border-edge/50 bg-surface px-3 py-2 text-sm text-ink"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider text-ink-muted">Numero de palabras aproximado</label>
                        <input
                          type="number"
                          value={manuscriptWordCount}
                          onChange={(e) => setManuscriptWordCount(e.target.value)}
                          placeholder="Ej. 45000"
                          className="mt-1 w-full rounded-xl border-edge/50 bg-surface px-3 py-2 text-sm text-ink"
                        />
                      </div>
                      {submitError && <p className="text-xs text-red-400">{submitError}</p>}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setUploaderModalOpen(false)}
                      className="rounded-xl border-edge/50 bg-surface px-4 py-2.5 text-xs font-medium text-ink hover:bg-surface-elevated cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={!uploadedFile}
                      onClick={handleSubmitManuscript}
                      className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-medium transition cursor-pointer ${
                        uploadedFile
                          ? 'bg-accent text-surface hover:bg-accent-hover shadow-sm'
                          : 'bg-surface-elevated border-edge/50 text-ink-muted cursor-not-allowed'
                      }`}
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Enviar para Presupuesto</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-accent">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="text-lg font-medium text-ink">¡Manuscrito Recibido!</h4>
                  <p className="text-xs text-ink-muted max-w-xs mx-auto">
                    Tu manuscrito ha sido registrado en el sistema. El director técnico procesará el deslose en breve.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Panel de Revisión, Chat/Comentarios, Aprobación y Pago por Capítulo */}
      <AnimatePresence>
        {selectedChapter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border-edge/50 bg-surface p-6 shadow-2xl space-y-6"
            >
              {/* Header del modal */}
              <div className="flex items-start justify-between border-b border-edge/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-accent/30 bg-accent/10 text-accent">
                    <FileAudio className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-accent">ID: {selectedChapter.id}</span>
                      <StatusPill status={selectedChapter.status} />
                    </div>
                    <h3 className="mt-1 font-serif text-xl font-semibold text-ink">{selectedChapter.title}</h3>
                    <p className="text-xs text-ink-muted">
                      {selectedChapter.words} · Duración: {selectedChapter.duration}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedChapter(null)}
                  className="rounded-full p-1 text-ink-muted hover:bg-surface-elevated hover:text-ink transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Reproductor interactivo de audio dentro del modal */}
              <div className="rounded-2xl border-accent/30 bg-surface-elevated p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-surface shadow-sm hover:bg-accent-hover transition cursor-pointer"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" fill="currentColor" />}
                    </button>
                    <div>
                      <p className="text-xs font-semibold text-ink">Muestra de Audio Oficial</p>
                      <p className="text-[11px] text-ink-muted font-mono">03:45 / {selectedChapter.duration}</p>
                    </div>
                  </div>
                  <span className="rounded-full border-edge/50 bg-surface px-3 py-1 text-[11px] text-ink-muted">
                    {selectedChapter.revisions} de {selectedChapter.maxRevisions} revisiones utilizadas
                  </span>
                </div>

                {/* Barra de progreso interactiva */}
                <div
                  className="relative mt-3 h-2.5 w-full cursor-pointer overflow-hidden rounded-full bg-surface border-edge/60"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const pct = Math.round((clickX / rect.width) * 100);
                    setAudioProgress(Math.max(0, Math.min(100, pct)));
                  }}
                >
                  <div
                    className="h-full bg-accent transition-all duration-150 rounded-full"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
              </div>

              {/* Hilo de Comentarios / Chat de Revisión */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-ink flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-accent" />
                    Chat de Revisión con el Productor Asignado
                  </h4>
                  <span className="text-[11px] text-ink-muted">
                    Límite pactado en contrato: {selectedChapter.maxRevisions} revisiones
                  </span>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto rounded-2xl border-edge/50 bg-surface-elevated p-4">
                  {(commentsState[selectedChapter.id] || []).map((comm) => (
                    <div
                      key={comm.id}
                      className={`flex flex-col gap-1 rounded-xl p-3 text-xs ${
                        comm.author === 'Autor'
                          ? 'ml-auto max-w-[85%] border-accent/30 bg-accent/10 text-ink'
                          : 'mr-auto max-w-[85%] border-edge/50 bg-surface text-ink'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 text-[10px] text-ink-muted font-medium">
                        <span className="text-accent font-semibold">{comm.author}</span>
                        <div className="flex items-center gap-2">
                          {comm.timecode && (
                            <span className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-ink">
                              ⏱️ {comm.timecode}
                            </span>
                          )}
                          <span>{comm.date}</span>
                        </div>
                      </div>
                      <p className="mt-1 leading-relaxed">{comm.text}</p>
                    </div>
                  ))}
                </div>

                {/* Caja para redactar observación/comentario */}
                <div className="flex flex-col gap-2.5 rounded-2xl border-edge/50 bg-surface p-3">
                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <label className="font-medium text-ink">Escribir observación o solicitud de cambio:</label>
                    <div className="flex items-center gap-1.5">
                      <span>Marca de tiempo (min):</span>
                      <input
                        type="text"
                        value={newCommentTime}
                        onChange={(e) => setNewCommentTime(e.target.value)}
                        className="w-16 rounded-md border-edge/50 bg-surface-elevated px-2 py-0.5 font-mono text-center text-xs text-ink focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Describe los detalles de locución, ruido o música a corregir..."
                    className="w-full rounded-xl border-edge/50 bg-surface-elevated p-3 text-xs text-ink focus:border-accent focus:outline-none resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleAddComment(selectedChapter.id)}
                      disabled={selectedChapter.revisions >= selectedChapter.maxRevisions}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition cursor-pointer ${
                        selectedChapter.revisions < selectedChapter.maxRevisions
                          ? 'bg-accent text-surface hover:bg-accent-hover'
                          : 'bg-surface-elevated border-edge/50 text-ink-muted cursor-not-allowed'
                      }`}
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>
                        {selectedChapter.revisions < selectedChapter.maxRevisions
                          ? 'Enviar Nota de Revisión'
                          : 'Límite de Revisiones Alcanzado'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* TRES ACCIONES PRINCIPALES DEL CAPÍTULO */}
              <div className="pt-4 border-t border-edge/60 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-ink-muted">
                  Estado de pago: {' '}
                  <span className={`font-semibold ${selectedChapter.paymentStatus === 'Pagado' ? 'text-accent' : 'text-amber-600 dark:text-amber-400'}`}>
                    {selectedChapter.paymentStatus === 'Pagado' ? 'Saldado' : `$${selectedChapter.price}.00 Pendiente`}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Accion 1: Aprobar capitulo */}
                  <button
                    type="button"
                    onClick={() => handleApproveChapter(selectedChapter.id)}
                    disabled={selectedChapter.status === 'Aprobado'}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-medium transition cursor-pointer ${
                      selectedChapter.status === 'Aprobado'
                        ? 'border-accent/40 bg-accent/20 text-accent cursor-default'
                        : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{selectedChapter.status === 'Aprobado' ? 'Capítulo Aprobado' : 'Aprobar Capítulo'}</span>
                  </button>

                  {/* Accion 2: Pagar capitulo */}
                  {selectedChapter.paymentStatus === 'Pendiente' && (
                    <button
                      type="button"
                      onClick={() => {
                        setPayingChapter(selectedChapter);
                        setSelectedChapter(null);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-xs font-medium text-surface transition hover:bg-accent-hover shadow-sm cursor-pointer"
                    >
                      <DollarSign className="h-4 w-4" />
                      <span>Pagar Monto (${selectedChapter.price}.00)</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: Pasarela Simulada de Pago de Capítulo */}
      <AnimatePresence>
        {payingChapter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md rounded-3xl border-edge/50 bg-surface p-6 shadow-2xl space-y-5"
            >
              <button
                type="button"
                onClick={() => setPayingChapter(null)}
                className="absolute top-5 right-5 rounded-full p-1 text-ink-muted hover:bg-surface-elevated hover:text-ink transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent border-accent/30">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-ink">Pagar Capítulo</h3>
                  <p className="text-xs text-ink-muted">{payingChapter.title}</p>
                </div>
              </div>

              <div className="rounded-2xl border-edge/50 bg-surface-elevated p-4 space-y-2 text-xs">
                <div className="flex justify-between text-ink-muted">
                  <span>Concepto:</span>
                  <span className="font-medium text-ink">Grabación & Edición Master</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Método Seleccionado:</span>
                  <span className="font-medium text-ink capitalize">
                    {paymentMethod === 'paypal' ? `PayPal (${paypalEmail})` : 'Transferencia Bancaria'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-edge/60 pt-2 text-sm font-semibold text-ink">
                  <span>Monto a abonar:</span>
                  <span className="text-accent">${payingChapter.price}.00 USD</span>
                </div>
              </div>

              {!paymentProcessing ? (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPayingChapter(null)}
                    className="rounded-xl border-edge/50 bg-surface px-4 py-2.5 text-xs font-medium text-ink hover:bg-surface-elevated cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmChapterPayment(payingChapter.id)}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-medium text-surface transition hover:bg-accent-hover shadow-sm cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Confirmar Pago (${payingChapter.price}.00)</span>
                  </button>
                </div>
              ) : (
                <div className="py-6 text-center space-y-3">
                  <div className="mx-auto h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                  <p className="text-xs font-medium text-ink">Procesando pago seguro...</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: Visualizador de Factura Emitida */}
      <AnimatePresence>
        {viewInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg rounded-3xl border-edge/50 bg-surface p-6 shadow-2xl space-y-5"
            >
              <button
                type="button"
                onClick={() => setViewInvoice(null)}
                className="absolute top-5 right-5 rounded-full p-1 text-ink-muted hover:bg-surface-elevated hover:text-ink transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="border-b border-edge/60 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">Studio Flamkit</span>
                  <h3 className="font-serif text-2xl font-semibold text-ink">Comprobante Oficial</h3>
                  <p className="text-xs text-ink-muted font-mono">{viewInvoice.id}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  viewInvoice.status === 'Pagado' ? 'bg-accent/15 text-accent border-accent/30' : 'bg-amber-500/15 text-amber-600'
                }`}>
                  {viewInvoice.status}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-4 rounded-xl border-edge/50 bg-surface-elevated p-3.5">
                  <div>
                    <span className="text-[11px] text-ink-muted uppercase">Fecha de emisión</span>
                    <p className="font-medium text-ink mt-0.5">{viewInvoice.date}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-ink-muted uppercase">Cliente / Autor</span>
                    <p className="font-medium text-ink mt-0.5">{bankHolder}</p>
                  </div>
                </div>

                <div className="rounded-xl border-edge/50 bg-surface-elevated p-3.5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Concepto:</span>
                    <span className="font-medium text-ink">{viewInvoice.concept}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Método:</span>
                    <span className="font-medium text-ink">{viewInvoice.method}</span>
                  </div>
                  <div className="flex justify-between border-t border-edge/60 pt-2 font-semibold text-sm">
                    <span className="text-ink">Total Facturado:</span>
                    <span className="text-accent">{viewInvoice.amount}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setViewInvoice(null)}
                  className="rounded-xl border-edge/50 bg-surface px-4 py-2 text-xs font-medium text-ink hover:bg-surface-elevated cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-medium text-surface transition hover:bg-accent-hover shadow-sm cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Descargar PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <FilesLibraryModal open={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} data={libraryData} />

      <Footer />
    </main>
  );
}