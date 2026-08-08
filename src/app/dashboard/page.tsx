"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/services/auth.service';
import { getAuthorRequestState, getAuthorRequestContext, submitManuscript, type AuthorRequestState, type AuthorRequestContext } from '@/services/manuscript.service';
import { getAuthorProjectData, type AuthorProjectData } from '@/services/project.service';
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
  Volume2,
  Sparkles,
  Headphones,
  FileText,
  ShieldCheck,
  ChevronRight,
  ArrowDownToLine,
  MessageCircle,
  PlusCircle,
  FolderPlus,
  ArrowRight,
  Inbox,
  UploadCloud,
  FileUp,
  FileCheck,
  X,
  Check,
  CreditCard,
  Building2,
  ExternalLink,
  Eye,
  Send,
  MessageSquare,
  DollarSign,
  AlertCircle,
  Lock,
  Disc,
  Layers,
  FileCode,
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Card } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

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

const invoicesList: InvoiceItem[] = [];

const productionSteps = [
  { title: 'Análisis editorial', status: 'Completado', desc: 'Ajuste de guion y tono dramático' },
  { title: 'Locución & Dirección', status: 'Completado', desc: 'Grabación de voces e interpretación' },
  { title: 'Edición & Diseño Sonoro', status: 'En curso', desc: 'Montaje de efectos y música original' },
  { title: 'Mezcla & Master Final', status: 'Pendiente', desc: 'Control de calidad estandarizado' },
];

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
  const [requestState, setRequestState] = useState<AuthorRequestState>('none');
  const [requestContext, setRequestContext] = useState<AuthorRequestContext | null>(null);
  const [realProject, setRealProject] = useState<AuthorProjectData | null>(null);

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
      try {
        const ctx = await getAuthorRequestContext(u.id);
        if (isMounted) {
          setRequestContext(ctx);
          setRequestState(ctx.state);
        }

        // Cargar proyecto real con sus capítulos de Supabase
        const projectData = await getAuthorProjectData(u.id);
        if (isMounted && projectData) {
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
        }
      } catch (err) {
        console.error('Error al cargar datos del proyecto/autor:', err);
      } finally {
        if (isMounted) setIsChecking(false);
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

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

  // Archivo real seleccionado, en espera de que el autor confirme palabras y titulo
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [manuscriptTitle, setManuscriptTitle] = useState('');
  const [manuscriptWordCount, setManuscriptWordCount] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

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

    try {
      await submitManuscript({
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
        if (authorId) {
          try {
            const freshCtx = await getAuthorRequestContext(authorId);
            setRequestContext(freshCtx);
            setRequestState(freshCtx.state);
          } catch {
            setRequestState('pending');
          }
        } else {
          setRequestState('pending');
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

      {/* Header Banner principal */}
      <div className="relative overflow-hidden border-b border-edge/80 bg-surface-elevated/90 backdrop-blur-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_25%_-20%,_var(--color-accent)_0%,_transparent_50%)] opacity-[0.16]" />
        
        <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:justify-between">
            {/* Título e Identidad Principal del Espacio */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" />
                  Centro del Autor
                </span>

                {requestState === 'active' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Producción Activa
                  </span>
                )}

                {requestState === 'pending' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    En Evaluación Editorial
                  </span>
                )}

                {requestState === 'none' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface px-3 py-1 text-xs font-medium text-ink-muted">
                    Estudio Creativo & Producción
                  </span>
                )}

                {(hasActiveProject || requestState === 'pending') && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-surface border border-edge/60 px-2.5 py-1 text-xs font-mono font-medium text-ink-muted">
                    ID: {requestContext?.projectId ? `#PROJ-${requestContext.projectId.slice(0, 8).toUpperCase()}` : requestContext?.requestId ? `#REQ-${requestContext.requestId.slice(0, 8).toUpperCase()}` : '#SOLICITUD'}
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl lg:text-5xl leading-[1.15]">
                {requestState === 'active'
                  ? (realProject?.title || requestContext?.title || 'Tu Obra en Grabación')
                  : requestState === 'pending'
                  ? (requestContext?.title || 'Manuscrito en Evaluación Editorial')
                  : 'Bienvenido a Studio Flamkit'}
              </h1>

              <p className="max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base font-light">
                {requestState === 'active'
                  ? 'Gestiona la dirección artística de tu audiolibro, escucha muestras de capítulos en tiempo real y descarga tus entregables de preservación.'
                  : requestState === 'pending'
                  ? 'Hemos recibido tu manuscrito. La dirección técnica está evaluando el número de palabras y tono lírico para formalizar tu propuesta de producción.'
                  : 'Transformamos tu texto impreso en una experiencia de escucha cinematográfica. Sube tu manuscrito para obtener una cotización técnica sin compromiso.'}
              </p>
            </div>

            {/* Tarjeta Dominante Contextual de Estado a la Derecha */}
            {requestState === 'pending' ? (
              <div className="shrink-0 flex flex-col justify-between rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 shadow-xs lg:w-80">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      <Clock className="h-4 w-4" />
                      Manuscrito Recibido
                    </span>
                    <span className="text-[10px] font-mono text-ink-muted">24-48 hrs est.</span>
                  </div>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Solicitud <strong className="font-mono text-ink">#REQ-{requestContext?.requestId?.slice(0, 8).toUpperCase() || 'REGISTRADA'}</strong> en fase de lectura y estimación técnica.
                  </p>
                </div>
                <div className="mt-4 border-t border-amber-500/20 pt-3 flex items-center justify-between text-[11px] text-ink-muted">
                  <span>Obra registrada:</span>
                  <strong className="text-ink truncate max-w-[150px]">{requestContext?.title || 'Sin Título'}</strong>
                </div>
              </div>
            ) : hasActiveProject ? (
              <div className="shrink-0 flex flex-col justify-between rounded-3xl border border-edge/80 bg-surface p-6 shadow-sm lg:w-80">
                <div>
                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <span className="uppercase tracking-wider font-medium text-[11px]">Progreso de Producción</span>
                    <span className="font-serif text-lg font-semibold text-accent">{realProject?.progress ?? 0}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-elevated border border-edge/60">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
                      style={{ width: `${realProject?.progress ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 border-t border-edge/60 pt-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-ink">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-medium">Grabación Master</span>
                  </div>
                  <span className="text-ink-muted font-mono">
                    {chaptersState.length > 0
                      ? `${chaptersState.filter(c => c.status === 'Entregado' || c.paymentStatus === 'Pagado' || c.status === 'Aprobado').length}/${chaptersState.length} caps.`
                      : '0 caps.'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="shrink-0 flex flex-col justify-between rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent p-6 shadow-xs lg:w-80">
                <div>
                  <div className="flex items-center gap-2 text-accent">
                    <UploadCloud className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Paso 1 de 3: Cotización</span>
                  </div>
                  <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                    Adjunta tu archivo (.docx, .odt, .pdf) para calcular el tiempo total de locución y desglose presupuestario.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setUploaderModalOpen(true)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-xs font-medium text-surface transition hover:bg-accent-hover shadow-sm cursor-pointer"
                >
                  <FileUp className="h-4 w-4" />
                  <span>Subir Manuscrito</span>
                </button>
              </div>
            )}
          </div>

          {/* Fila de metadatos del proyecto (Solo visible en obra activa) */}
          {hasActiveProject && (
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-edge/60 pt-6 sm:grid-cols-4">
              <div className="rounded-2xl border border-edge/50 bg-surface/60 p-4 shadow-2xs">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-muted">Formato Seleccionado</p>
                <p className="mt-1 text-xs font-medium text-ink sm:text-sm">
                  {deliveryFormat === 'm4b' ? 'M4B Native Audiolibro' : deliveryFormat === 'wav' ? 'WAV Master Preservación' : 'MP3 High-Bitrate'}
                </p>
              </div>
              <div className="rounded-2xl border border-edge/50 bg-surface/60 p-4 shadow-2xs">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-muted">Dirección de Arte</p>
                <p className="mt-1 text-xs font-medium text-ink sm:text-sm">Studio Flamkit Editorial</p>
              </div>
              <div className="rounded-2xl border border-edge/50 bg-surface/60 p-4 shadow-2xs">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-muted">Duración Estimada</p>
                <p className="mt-1 text-xs font-medium text-ink sm:text-sm">~1h 10 min de audio</p>
              </div>
              <div className="rounded-2xl border border-edge/50 bg-surface/60 p-4 shadow-2xs">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-ink-muted">Fecha de Entrega Target</p>
                <p className="mt-1 text-xs font-medium text-ink sm:text-sm">28 de Agosto, 2026</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal con Sidebar */}
      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          
          {/* Sidebar de Navegación */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-edge bg-surface-elevated p-3 shadow-xs">
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
                          ? 'border border-accent/30 bg-accent/10 text-accent shadow-2xs'
                          : 'border border-transparent text-ink-muted hover:border-edge hover:bg-surface hover:text-ink'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? 'text-accent' : 'text-ink-muted'}`} strokeWidth={1.75} />
                        <span>{section.label}</span>
                      </div>
                      {section.badge ? (
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          isActive ? 'bg-accent/20 text-accent' : 'bg-surface border border-edge text-ink-muted'
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
            <div className="hidden rounded-3xl border border-edge bg-surface-elevated p-5 shadow-xs lg:block">
              <div className="flex items-center gap-2 text-accent">
                <Headphones className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Atención Directa</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                ¿Tienes alguna consulta sobre la locución o edición? Tu productor asignado está disponible.
              </p>
              <Link
                href="/contacto"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-edge bg-surface px-3 py-2.5 text-xs font-medium text-ink transition hover:border-accent/40 hover:text-accent shadow-2xs"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Contactar Productor
              </Link>
            </div>
          </aside>

          {/* Contenido de la Sección Activa */}
          <div className="min-w-0">
            {active === 'resumen' && (
              <div className="space-y-6">
                {requestState === 'pending' ? (
                  <Card className="border-accent/30 bg-surface-elevated p-8 shadow-xs">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <Clock className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-medium text-accent">
                              Tracking: #REQ-{requestContext?.requestId?.slice(0, 8).toUpperCase() || 'PENDIENTE'}
                            </span>
                            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                              En Evaluación Editorial
                            </span>
                          </div>
                          <h3 className="font-serif text-2xl font-medium text-ink">
                            {requestContext?.title || 'Tu Manuscrito'}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                      Tu manuscrito fue recibido y registrado con éxito. Nuestro equipo de dirección técnica está realizando el desglose de palabras y análisis de tono dramático para preparar tu propuesta formal con presupuesto y casting de voces.
                    </p>

                    {/* Timeline de la solicitud */}
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 border-t border-edge/60 pt-6">
                      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>1. Recepción</span>
                        </div>
                        <p className="text-[11px] text-ink-muted">Documento registrado en el sistema</p>
                      </div>

                      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                          <Clock className="h-4 w-4 animate-spin" />
                          <span>2. Análisis de Guion</span>
                        </div>
                        <p className="text-[11px] text-ink-muted">Evaluación de ritmo y duración</p>
                      </div>

                      <div className="rounded-2xl border border-edge bg-surface/50 p-4 space-y-1 opacity-60">
                        <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
                          <Sparkles className="h-4 w-4" />
                          <span>3. Cotización & Casting</span>
                        </div>
                        <p className="text-[11px] text-ink-muted">Muestra de voz y desglose</p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-edge/60">
                      <button
                        type="button"
                        onClick={() => setActive('capitulos')}
                        className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-medium text-surface hover:bg-accent-hover transition cursor-pointer shadow-xs"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>Ver Estado de Producción</span>
                      </button>
                      <Link
                        href="/contacto"
                        className="inline-flex items-center gap-2 rounded-xl border border-edge bg-surface px-4 py-2.5 text-xs font-medium text-ink hover:border-accent/40 transition"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Consultar al Director</span>
                      </Link>
                    </div>
                  </Card>
                ) : !hasActiveProject ? (
                  /* Estado 'none': bienvenida editorial e inicio del proceso */
                  <div className="space-y-6">
                    <Card className="border-accent/30 bg-gradient-to-br from-surface-elevated via-surface-elevated to-accent/5 p-8 sm:p-10 text-center shadow-xs">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-accent/30 bg-accent/10 text-accent shadow-xs">
                        <UploadCloud className="h-8 w-8" />
                      </div>
                      <h3 className="mt-5 font-serif text-2xl sm:text-3xl font-normal text-ink tracking-tight">
                        Transforma tu manuscrito en una experiencia audiocinematográfica
                      </h3>
                      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-muted font-light">
                        Adjunta tu archivo en formato <strong>.DOCX, .ODT o .PDF</strong>. Nuestro estudio realizará un análisis técnico gratuito, estimación de horas de locución y propuesta de voces.
                      </p>

                      {/* 3 Pasos del flujo editorial */}
                      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 text-left max-w-3xl mx-auto">
                        <div className="rounded-2xl border border-edge/60 bg-surface/80 p-4 shadow-2xs space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-[10px]">1</span>
                            Análisis
                          </div>
                          <p className="text-xs font-medium text-ink">Conteo & Estimación</p>
                          <p className="text-[11px] text-ink-muted leading-relaxed">Mapeo de palabras, tono narrativo y tiempo total de reproducción.</p>
                        </div>

                        <div className="rounded-2xl border border-edge/60 bg-surface/80 p-4 shadow-2xs space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-[10px]">2</span>
                            Casting
                          </div>
                          <p className="text-xs font-medium text-ink">Muestra de Voz</p>
                          <p className="text-[11px] text-ink-muted leading-relaxed">Selección de locutores profesionales y muestra personalizada.</p>
                        </div>

                        <div className="rounded-2xl border border-edge/60 bg-surface/80 p-4 shadow-2xs space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-[10px]">3</span>
                            Master
                          </div>
                          <p className="text-xs font-medium text-ink">Entrega M4B / WAV</p>
                          <p className="text-[11px] text-ink-muted leading-relaxed">Edición, diseño sonoro, mezcla y entrega en formato nativo.</p>
                        </div>
                      </div>
                      
                      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => setUploaderModalOpen(true)}
                          className="inline-flex items-center gap-2.5 rounded-2xl bg-accent px-6 py-3.5 text-xs font-medium text-surface transition hover:bg-accent-hover shadow-sm cursor-pointer"
                        >
                          <FileUp className="h-4.5 w-4.5" />
                          <span>Subir Manuscrito (.DOCX, .ODT, .PDF)</span>
                        </button>
                        <Link
                          href="/servicios"
                          className="inline-flex items-center gap-2 rounded-2xl border border-edge bg-surface px-6 py-3.5 text-xs font-medium text-ink transition hover:border-accent/40"
                        >
                          <span>Conocer Metodología Editorial</span>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </Card>
                  </div>
                ) : (
                  /* Estado activo con proyecto real */
                  <div className="space-y-6">
                    <Card className="border-edge/80 bg-surface-elevated p-6 sm:p-8 shadow-xs space-y-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-medium text-accent">
                              ID Proy: #PROJ-{realProject?.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              Producción Activa
                            </span>
                          </div>
                          <h3 className="mt-2 font-serif text-2xl font-medium text-ink sm:text-3xl">
                            {realProject?.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActive('capitulos')}
                            className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-xs font-medium text-surface transition hover:bg-accent-hover shadow-xs cursor-pointer"
                          >
                            <BookOpen className="h-4 w-4" />
                            <span>Ver Capítulos ({chaptersState.length})</span>
                          </button>
                        </div>
                      </div>

                      {/* KPIs del Proyecto */}
                      <div className="grid gap-4 sm:grid-cols-3 border-t border-edge/60 pt-6">
                        <div className="rounded-2xl border border-edge/60 bg-surface p-4 shadow-2xs">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Progreso Global</p>
                          <p className="mt-1 font-serif text-2xl font-medium text-accent">{realProject?.progress}%</p>
                          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface-elevated border border-edge/40">
                            <div className="h-full bg-accent transition-all duration-500" style={{ width: `${realProject?.progress}%` }} />
                          </div>
                        </div>

                        <div className="rounded-2xl border border-edge/60 bg-surface p-4 shadow-2xs">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Capítulos Registrados</p>
                          <p className="mt-1 font-serif text-2xl font-medium text-ink">{chaptersState.length}</p>
                          <p className="mt-1 text-xs text-ink-muted">
                            {chaptersState.filter(c => c.paymentStatus === 'Pagado').length} pagados / {chaptersState.length} en sistema
                          </p>
                        </div>

                        <div className="rounded-2xl border border-edge/60 bg-surface p-4 shadow-2xs">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-muted">Revisiones por Capítulo</p>
                          <p className="mt-1 font-serif text-2xl font-medium text-ink">{realProject?.maxRevisions || 3}</p>
                          <p className="mt-1 text-xs text-ink-muted">Límite contractual garantizado</p>
                        </div>
                      </div>

                      {/* Timeline de Producción */}
                      <div className="border-t border-edge/60 pt-6">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink mb-4">Etapas de Producción Sonora</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          {productionSteps.map((step, idx) => (
                            <div key={step.title} className="rounded-2xl border border-edge/50 bg-surface p-3.5 space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-mono text-ink-muted">0{idx + 1}</span>
                                <span className={`font-medium ${step.status === 'Completado' ? 'text-emerald-500' : step.status === 'En curso' ? 'text-accent' : 'text-ink-muted'}`}>
                                  {step.status}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-ink">{step.title}</p>
                              <p className="text-[11px] text-ink-muted leading-tight">{step.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
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
                    <div className="mt-8 rounded-2xl border border-dashed border-edge bg-surface p-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated text-ink-muted border border-edge">
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
                    <div className="mt-8 rounded-2xl border border-dashed border-edge bg-surface p-8 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated text-accent border border-edge">
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
                          className="group rounded-2xl border border-edge bg-surface-elevated p-5 transition-colors hover:border-accent/40 hover:shadow-md cursor-pointer"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3.5">
                              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-edge bg-surface text-accent group-hover:border-accent/30 group-hover:bg-accent/10">
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
                                className="inline-flex items-center gap-1.5 rounded-xl border border-edge bg-surface px-3 py-1.5 text-xs font-medium text-ink transition hover:border-accent/40 hover:text-accent cursor-pointer"
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
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface border border-edge/40">
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
                  <div className="mt-8 rounded-2xl border border-dashed border-edge bg-surface p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated text-ink-muted border border-edge">
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
                        className="group flex flex-col gap-3 rounded-2xl border border-edge bg-surface-elevated p-4 transition hover:border-accent/40 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-edge bg-surface text-accent group-hover:border-accent/30">
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
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface px-3 py-1 text-xs text-ink-muted">
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
                        <div className="rounded-2xl border border-edge bg-surface p-4">
                          <p className="text-xs uppercase tracking-wider text-ink-muted">Inversión Total</p>
                          <p className="mt-1 text-xl font-semibold text-ink">$0.00</p>
                        </div>
                        <div className="rounded-2xl border border-edge bg-surface p-4">
                          <p className="text-xs uppercase tracking-wider text-ink-muted">Total Pagado</p>
                          <p className="mt-1 text-xl font-semibold text-ink">$0.00</p>
                        </div>
                        <div className="rounded-2xl border border-edge bg-surface p-4">
                          <p className="text-xs uppercase tracking-wider text-ink-muted">Pendiente</p>
                          <p className="mt-1 text-xl font-semibold text-ink">$0.00</p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-dashed border-edge bg-surface p-8 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated text-ink-muted border border-edge">
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
                  <div className="flex items-center gap-4 rounded-2xl border border-edge bg-surface p-4 shadow-sm">
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
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
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
                            : 'border-edge bg-surface hover:border-accent/30'
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
                            : 'border-edge bg-surface hover:border-accent/30'
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
                      <div className="rounded-2xl border border-edge bg-surface/50 p-4 space-y-2">
                        <label className="text-xs font-medium text-ink-muted">Correo electrónico registrado en PayPal</label>
                        <input
                          type="email"
                          value={paypalEmail}
                          onChange={(e) => setPaypalEmail(e.target.value)}
                          className="w-full rounded-xl border border-edge bg-surface px-3.5 py-2 text-xs font-mono text-ink focus:border-accent focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-edge bg-surface/50 p-4 space-y-3">
                        <div>
                          <label className="text-xs font-medium text-ink-muted">Titular de la cuenta</label>
                          <input
                            type="text"
                            value={bankHolder}
                            onChange={(e) => setBankHolder(e.target.value)}
                            className="w-full rounded-xl border border-edge bg-surface px-3.5 py-2 text-xs text-ink focus:border-accent focus:outline-none mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-ink-muted">IBAN / Número de Cuenta Bancaria</label>
                          <input
                            type="text"
                            value={bankIban}
                            onChange={(e) => setBankIban(e.target.value)}
                            className="w-full rounded-xl border border-edge bg-surface px-3.5 py-2 text-xs font-mono text-ink focus:border-accent focus:outline-none mt-1"
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
                            : 'border-edge bg-surface hover:border-accent/30'
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
                            : 'border-edge bg-surface hover:border-accent/30'
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
                            <span className="rounded-full border border-accent/30 bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
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
                            : 'border-edge bg-surface hover:border-accent/30'
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
              className="relative w-full max-w-lg rounded-3xl border border-edge bg-surface p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setUploaderModalOpen(false)}
                className="absolute top-5 right-5 rounded-full p-1 text-ink-muted hover:bg-surface-elevated hover:text-ink transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
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
                        : 'border-edge bg-surface-elevated hover:border-accent/40'
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
                      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-edge bg-surface px-4 py-2 text-xs font-medium text-ink transition hover:border-accent/40 hover:text-accent cursor-pointer"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Seleccionar Archivo</span>
                    </label>
                  </div>

                  {/* Estado de Carga / Archivo subido */}
                  {uploadingState && (
                    <div className="rounded-2xl border border-edge bg-surface-elevated p-4">
                      <div className="flex items-center justify-between text-xs text-ink-muted">
                        <span>Analizando estructura del archivo...</span>
                        <span className="font-medium text-accent">{uploadProgress}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface border border-edge/40">
                        <div
                          className="h-full bg-accent transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadedFile && (
                    <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 flex items-center justify-between">
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
                          className="mt-1 w-full rounded-xl border border-edge bg-surface px-3 py-2 text-sm text-ink"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider text-ink-muted">Numero de palabras aproximado</label>
                        <input
                          type="number"
                          value={manuscriptWordCount}
                          onChange={(e) => setManuscriptWordCount(e.target.value)}
                          placeholder="Ej. 45000"
                          className="mt-1 w-full rounded-xl border border-edge bg-surface px-3 py-2 text-sm text-ink"
                        />
                      </div>
                      {submitError && <p className="text-xs text-red-400">{submitError}</p>}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setUploaderModalOpen(false)}
                      className="rounded-xl border border-edge bg-surface px-4 py-2.5 text-xs font-medium text-ink hover:bg-surface-elevated cursor-pointer"
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
                          : 'bg-surface-elevated border border-edge text-ink-muted cursor-not-allowed'
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
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-edge bg-surface p-6 shadow-2xl space-y-6"
            >
              {/* Header del modal */}
              <div className="flex items-start justify-between border-b border-edge/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
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
              <div className="rounded-2xl border border-accent/30 bg-surface-elevated p-4 shadow-sm">
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
                  <span className="rounded-full border border-edge bg-surface px-3 py-1 text-[11px] text-ink-muted">
                    {selectedChapter.revisions} de {selectedChapter.maxRevisions} revisiones utilizadas
                  </span>
                </div>

                {/* Barra de progreso interactiva */}
                <div
                  className="relative mt-3 h-2.5 w-full cursor-pointer overflow-hidden rounded-full bg-surface border border-edge/60"
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

                <div className="space-y-3 max-h-56 overflow-y-auto rounded-2xl border border-edge bg-surface-elevated p-4">
                  {(commentsState[selectedChapter.id] || []).map((comm) => (
                    <div
                      key={comm.id}
                      className={`flex flex-col gap-1 rounded-xl p-3 text-xs ${
                        comm.author === 'Autor'
                          ? 'ml-auto max-w-[85%] border border-accent/30 bg-accent/10 text-ink'
                          : 'mr-auto max-w-[85%] border border-edge bg-surface text-ink'
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
                <div className="flex flex-col gap-2.5 rounded-2xl border border-edge bg-surface p-3">
                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <label className="font-medium text-ink">Escribir observación o solicitud de cambio:</label>
                    <div className="flex items-center gap-1.5">
                      <span>Marca de tiempo (min):</span>
                      <input
                        type="text"
                        value={newCommentTime}
                        onChange={(e) => setNewCommentTime(e.target.value)}
                        className="w-16 rounded-md border border-edge bg-surface-elevated px-2 py-0.5 font-mono text-center text-xs text-ink focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Describe los detalles de locución, ruido o música a corregir..."
                    className="w-full rounded-xl border border-edge bg-surface-elevated p-3 text-xs text-ink focus:border-accent focus:outline-none resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleAddComment(selectedChapter.id)}
                      disabled={selectedChapter.revisions >= selectedChapter.maxRevisions}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition cursor-pointer ${
                        selectedChapter.revisions < selectedChapter.maxRevisions
                          ? 'bg-accent text-surface hover:bg-accent-hover'
                          : 'bg-surface-elevated border border-edge text-ink-muted cursor-not-allowed'
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
                        ? 'border border-accent/40 bg-accent/20 text-accent cursor-default'
                        : 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
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
              className="relative w-full max-w-md rounded-3xl border border-edge bg-surface p-6 shadow-2xl space-y-5"
            >
              <button
                type="button"
                onClick={() => setPayingChapter(null)}
                className="absolute top-5 right-5 rounded-full p-1 text-ink-muted hover:bg-surface-elevated hover:text-ink transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent border border-accent/30">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-ink">Pagar Capítulo</h3>
                  <p className="text-xs text-ink-muted">{payingChapter.title}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-edge bg-surface-elevated p-4 space-y-2 text-xs">
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
                    className="rounded-xl border border-edge bg-surface px-4 py-2.5 text-xs font-medium text-ink hover:bg-surface-elevated cursor-pointer"
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
              className="relative w-full max-w-lg rounded-3xl border border-edge bg-surface p-6 shadow-2xl space-y-5"
            >
              <button
                type="button"
                onClick={() => setViewInvoice(null)}
                className="absolute top-5 right-5 rounded-full p-1 text-ink-muted hover:bg-surface-elevated hover:text-ink transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="border-b border-edge pb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">Studio Flamkit</span>
                  <h3 className="font-serif text-2xl font-semibold text-ink">Comprobante Oficial</h3>
                  <p className="text-xs text-ink-muted font-mono">{viewInvoice.id}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  viewInvoice.status === 'Pagado' ? 'bg-accent/15 text-accent border border-accent/30' : 'bg-amber-500/15 text-amber-600'
                }`}>
                  {viewInvoice.status}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-4 rounded-xl border border-edge bg-surface-elevated p-3.5">
                  <div>
                    <span className="text-[11px] text-ink-muted uppercase">Fecha de emisión</span>
                    <p className="font-medium text-ink mt-0.5">{viewInvoice.date}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-ink-muted uppercase">Cliente / Autor</span>
                    <p className="font-medium text-ink mt-0.5">{bankHolder}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-edge bg-surface-elevated p-3.5 space-y-2">
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
                  className="rounded-xl border border-edge bg-surface px-4 py-2 text-xs font-medium text-ink hover:bg-surface-elevated cursor-pointer"
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

      <Footer />
    </main>
  );
}
