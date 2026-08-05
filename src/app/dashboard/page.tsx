"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/services/auth.service';
import { getAuthorRequestState, submitManuscript, type AuthorRequestState } from '@/services/manuscript.service';
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
  title: string;
  progress: number;
  revisions: number;
  maxRevisions: number;
  status: 'Produccion' | 'Revisiones' | 'Aprobado' | 'Completado';
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

const initialChapters: ChapterItem[] = [
  {
    id: 'chap-1',
    title: 'Capítulo 1: La llamada del crepúsculo',
    progress: 85,
    revisions: 1,
    maxRevisions: 2,
    status: 'Produccion',
    paymentStatus: 'Pagado',
    price: 130,
    words: '3,200 palabras',
    duration: '22 min',
  },
  {
    id: 'chap-2',
    title: 'Capítulo 2: El secreto entre árboles',
    progress: 62,
    revisions: 2,
    maxRevisions: 2,
    status: 'Revisiones',
    paymentStatus: 'Pagado',
    price: 130,
    words: '2,850 palabras',
    duration: '19 min',
  },
  {
    id: 'chap-3',
    title: 'Capítulo 3: Ecos en la penumbra',
    progress: 100,
    revisions: 0,
    maxRevisions: 2,
    status: 'Completado',
    paymentStatus: 'Pendiente',
    price: 130,
    words: '4,100 palabras',
    duration: '29 min',
  },
];

const initialComments: Record<string, CommentItem[]> = {
  'chap-1': [
    { id: 'c1', author: 'Productor', text: 'Subida la mezcla preliminar del Capítulo 1 con ambiente nocturno y ecualización de voz limpia.', timecode: '00:00', date: '10 jul 2026, 10:30' },
    { id: 'c2', author: 'Autor', text: '¡Excelente entonación! Solo pido atenuar un poco la música al minuto 04:12.', timecode: '04:12', date: '11 jul 2026, 16:45' },
    { id: 'c3', author: 'Productor', text: 'Ajuste realizado y procesado en la toma master.', timecode: '04:12', date: '12 jul 2026, 09:15' },
  ],
  'chap-2': [
    { id: 'c4', author: 'Productor', text: 'Muestra preliminar enviada para revisión de cadencia en diálogos secundario.', timecode: '02:30', date: '17 jul 2026, 11:00' },
    { id: 'c5', author: 'Autor', text: 'Revisión #1: La risa en 08:45 suena muy lejana, ¿se puede acercar al micrófono frontal?', timecode: '08:45', date: '18 jul 2026, 14:20' },
    { id: 'c6', author: 'Autor', text: 'Revisión #2: Por favor revisar el susurro al minuto 12:10.', timecode: '12:10', date: '19 jul 2026, 18:00' },
  ],
  'chap-3': [
    { id: 'c7', author: 'Productor', text: 'Edición y mezcla final terminada. Capítulo listo para aprobación y descarga final.', timecode: '00:00', date: '22 jul 2026, 15:00' },
  ],
};

const deliverables = [
  { title: 'Versión de prueba (Master preliminar)', date: '12 jul 2026', size: '42.5 MB', format: 'WAV 24-bit' },
  { title: 'Muestra de audio 01 - Atmósfera sonora', date: '20 jul 2026', size: '18.2 MB', format: 'MP3 320kbps' },
  { title: 'Entrega final lista para publicación', date: 'Pendiente', size: '--', format: 'Master DDP/FLAC' },
];

const invoicesList: InvoiceItem[] = [
  { id: '#INV-2026-001', date: '10 jul 2026', concept: 'Capítulo 1: La llamada del crepúsculo', method: 'PayPal (autor@ejemplo.com)', amount: '$130.00', status: 'Pagado', pdfAvailable: true },
  { id: '#INV-2026-002', date: '18 jul 2026', concept: 'Capítulo 2: El secreto entre árboles', method: 'Transferencia Bancaria (IBAN)', amount: '$130.00', status: 'Pagado', pdfAvailable: true },
  { id: '#INV-2026-003', date: '22 jul 2026', concept: 'Capítulo 3: Ecos en la penumbra', method: 'PayPal (autor@ejemplo.com)', amount: '$130.00', status: 'Pendiente', pdfAvailable: false },
];

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
        const state = await getAuthorRequestState(u.id);
        if (isMounted) setRequestState(state);
      } catch (err) {
        // Mejoramos el log para ver el error real
        console.error('Error detallado en getAuthorRequestState:', err);
      } finally {
        if (isMounted) setIsChecking(false);
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const [active, setActive] = useState<SectionId>('resumen');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(35);

  // hasActiveProject ahora se deriva del estado REAL (requestState), no de un switch manual
  const hasActiveProject = requestState === 'active';

  // Estado del modal de subida de manuscrito
  const [uploaderModalOpen, setUploaderModalOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; wordCount: string } | null>(null);
  const [uploadingState, setUploadingState] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSubmitted, setUploadSubmitted] = useState(false);

  // Estado del modal de revisión e interacción del capítulo
  const [selectedChapter, setSelectedChapter] = useState<ChapterItem | null>(null);
  const [chaptersState, setChaptersState] = useState<ChapterItem[]>(initialChapters);
  const [commentsState, setCommentsState] = useState<Record<string, CommentItem[]>>(initialComments);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentTime, setNewCommentTime] = useState('03:45');

  // Estado del modal de pago de capítulo
  const [payingChapter, setPayingChapter] = useState<ChapterItem | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Estado del modal de detalle de factura
  const [viewInvoice, setViewInvoice] = useState<InvoiceItem | null>(null);

  // Configuración de Perfil (Métodos de pago y Formato de entrega)
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'bank'>('paypal');
  const [paypalEmail, setPaypalEmail] = useState('autor@ejemplo.com');
  const [bankIban, setBankIban] = useState('ES91 2100 0418 4502 0005 1234');
  const [bankHolder, setBankHolder] = useState('Joens Don');
  const [deliveryFormat, setDeliveryFormat] = useState<'mp3' | 'm4b' | 'wav'>('m4b');
  const [profileNotification, setProfileNotification] = useState<string | null>(null);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const sections: { id: SectionId; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
    { id: 'capitulos', label: 'Capítulos', icon: BookOpen, badge: hasActiveProject ? `${chaptersState.length}` : undefined },
    { id: 'entregables', label: 'Entregables', icon: Download, badge: hasActiveProject ? '3' : undefined },
    { id: 'pagos', label: 'Pagos & Facturas', icon: Wallet, badge: hasActiveProject ? '1 Pend.' : undefined },
    { id: 'perfil', label: 'Perfil & Preferencias', icon: Settings },
  ];

  // Archivo real seleccionado, en espera de que el autor confirme palabras y titulo
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [manuscriptTitle, setManuscriptTitle] = useState('');
  const [manuscriptWordCount, setManuscriptWordCount] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFileSelect = (fileName: string, fileSize: string, file?: File) => {
    if (file) setPendingFile(file);
    setUploadedFile({ name: fileName, size: fileSize, wordCount: '' });
  };

  // Enviar manuscrito real: sube el archivo y crea las filas reales en Supabase
  const handleSubmitManuscript = async () => {
    if (!authorId || !pendingFile) {
      setSubmitError('Falta el archivo o no hay sesion activa.');
      return;
    }
    const wordCountNumber = Number(manuscriptWordCount);
    if (!manuscriptTitle.trim() || !wordCountNumber || wordCountNumber <= 0) {
      setSubmitError('Completa el titulo y un numero de palabras valido.');
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
      setTimeout(() => {
        setUploaderModalOpen(false);
        setUploadSubmitted(false);
        setUploadedFile(null);
        setPendingFile(null);
        setManuscriptTitle('');
        setManuscriptWordCount('');
        setRequestState('pending');
      }, 1500);
    } catch (err) {
      console.error('Error al enviar el manuscrito:', JSON.stringify(err, null, 2));
      if (err && typeof err === 'object') {
        console.error('message:', (err as any).message);
        console.error('code:', (err as any).code);
        console.error('details:', (err as any).details);
        console.error('hint:', (err as any).hint);
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
      <div className="relative overflow-hidden border-b border-edge bg-surface-elevated">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,_var(--color-accent)_0%,_transparent_35%)] opacity-[0.14]" />
        
        <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 text-xs font-medium uppercase tracking-[0.25em] text-accent">
                  <Sparkles className="h-3 w-3" />
                  Centro del Autor
                </span>
                {hasActiveProject && (
                  <>
                    <span className="text-xs text-ink-muted">·</span>
                    <span className="text-xs font-medium text-ink-muted">ID: #FLAM-2026-89</span>
                  </>
                )}
              </div>

              <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-ink sm:text-4xl lg:text-5xl">
                {requestState === 'active'
                  ? 'El jardín de las sombras'
                  : requestState === 'pending'
                  ? 'Tu manuscrito esta en evaluacion'
                  : 'Bienvenido a Studio Flamkit'}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted sm:text-base max-w-2xl">
                {requestState === 'active'
                  ? 'Supervisa el proceso de producción audiocinematográfica, escucha avances de capítulos y gestiona entregables de tu obra.'
                  : requestState === 'pending'
                  ? 'Recibimos tu manuscrito. Nuestro equipo lo esta evaluando y te avisaremos en cuanto tengamos una propuesta.'
                  : 'Tu espacio exclusivo para llevar tu libro a la vida en formato audiocinematográfico con producción sonora profesional.'}
              </p>
            </div>

            {/* Tarjeta rápida de estado en header */}
            {requestState === 'pending' ? (
              <div className="shrink-0 rounded-2xl border border-accent/30 bg-accent/5 p-5 shadow-sm lg:w-80">
                <div className="flex items-center gap-2 text-accent">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">En evaluacion</span>
                </div>
                <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                  Tu manuscrito ya fue recibido. Te contactaremos con la propuesta de produccion.
                </p>
              </div>
            ) : hasActiveProject ? (
              <div className="shrink-0 rounded-2xl border border-edge bg-surface p-4 shadow-sm lg:w-72">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Progreso General</span>
                  <span className="font-semibold text-accent">74%</span>
                </div>
                <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-surface-elevated border border-edge/50">
                  <div
                    className="h-full rounded-full bg-accent transition-all duration-500 ease-out"
                    style={{ width: '74%' }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-ink">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    Producción Activa
                  </span>
                  <span className="text-ink-muted">2/3 Capítulos</span>
                </div>
              </div>
            ) : (
              <div className="shrink-0 rounded-2xl border border-accent/30 bg-accent/5 p-5 shadow-sm lg:w-80">
                <div className="flex items-center gap-2 text-accent">
                  <UploadCloud className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Análisis y Presupuesto</span>
                </div>
                <p className="mt-2 text-xs text-ink-muted leading-relaxed">
                  Sube el archivo manuscrito de tu libro (.docx, .odt, .pdf) para estimar duración y costos.
                </p>
                <button
                  type="button"
                  onClick={() => setUploaderModalOpen(true)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-medium text-surface transition hover:bg-accent-hover shadow-sm cursor-pointer"
                >
                  <FileUp className="h-4 w-4" />
                  <span>Subir Manuscrito</span>
                </button>
              </div>
            )}
          </div>

          {/* Fila de metadatos del proyecto (Solo visible en obra activa) */}
          {hasActiveProject && (
            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-edge/60 pt-6 sm:grid-cols-4 lg:gap-6">
              <div className="rounded-xl border border-edge/50 bg-surface/50 p-3">
                <p className="text-[11px] uppercase tracking-wider text-ink-muted">Formato Seleccionado</p>
                <p className="mt-1 text-xs font-medium text-ink sm:text-sm capitalize">
                  {deliveryFormat === 'm4b' ? 'Audiolibro M4B Native' : deliveryFormat === 'wav' ? 'WAV Máster Preservación' : 'MP3 320kbps'}
                </p>
              </div>
              <div className="rounded-xl border border-edge/50 bg-surface/50 p-3">
                <p className="text-[11px] uppercase tracking-wider text-ink-muted">Director de Arte</p>
                <p className="mt-1 text-xs font-medium text-ink sm:text-sm">Studio Flamkit</p>
              </div>
              <div className="rounded-xl border border-edge/50 bg-surface/50 p-3">
                <p className="text-[11px] uppercase tracking-wider text-ink-muted">Duración Estimada</p>
                <p className="mt-1 text-xs font-medium text-ink sm:text-sm">~1h 10 min</p>
              </div>
              <div className="rounded-xl border border-edge/50 bg-surface/50 p-3">
                <p className="text-[11px] uppercase tracking-wider text-ink-muted">Entrega Estimada</p>
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
            <div className="rounded-3xl border border-edge bg-surface-elevated p-3 shadow-sm">
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
                          ? 'border border-accent/30 bg-accent/10 text-accent shadow-sm'
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
            <div className="hidden rounded-3xl border border-edge bg-surface-elevated p-5 shadow-sm lg:block">
              <div className="flex items-center gap-2 text-accent">
                <Headphones className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Atención Directa</span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                ¿Tienes alguna consulta sobre la locución o edición? Tu productor asignado está disponible.
              </p>
              <Link
                href="/contacto"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-edge bg-surface px-3 py-2 text-xs font-medium text-ink transition hover:border-accent/40 hover:text-accent"
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
                {!hasActiveProject ? (
                  /* Estado vacío para nuevo autor en sección Resumen */
                  <div className="space-y-6">
                    <Card className="border-accent/30 bg-gradient-to-br from-surface-elevated via-surface-elevated to-accent/5 p-8 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-accent/30 bg-accent/10 text-accent">
                        <UploadCloud className="h-8 w-8" />
                      </div>
                      <h3 className="mt-4 font-serif text-2xl font-medium text-ink">
                        Sube tu manuscrito para presupuestar tu audiolibro
                      </h3>
                      <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
                        Adjunta tu archivo manuscrito en formato <strong>.DOCX, .ODT o .PDF</strong>. Nuestro equipo realizará un análisis de conteo de palabras, estructura dramática y te enviará una propuesta técnica detallada.
                      </p>
                      
                      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => setUploaderModalOpen(true)}
                          className="inline-flex items-center gap-2.5 rounded-xl bg-accent px-6 py-3 text-xs font-medium text-surface transition hover:bg-accent-hover shadow-sm cursor-pointer"
                        >
                          <FileUp className="h-4 w-4" />
                          <span>Subir Archivo (.DOCX, .ODT, .PDF)</span>
                        </button>
                        <Link
                          href="/servicios"
                          className="inline-flex items-center gap-2 rounded-xl border border-edge bg-surface px-6 py-3 text-xs font-medium text-ink transition hover:border-accent/40"
                        >
                          <span>Conocer el Proceso</span>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </Card>

                    {/* Explicación del flujo de producción */}
                    <Card title="¿Cómo funciona el proceso?" description="Pasos claros desde el manuscrito hasta el master publicado.">
                      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {productionSteps.map((step, idx) => (
                          <div key={step.title} className="rounded-2xl border border-edge bg-surface p-4">
                            <span className="font-serif text-xs font-medium text-accent">Paso 0{idx + 1}</span>
                            <h4 className="mt-2 text-sm font-semibold text-ink">{step.title}</h4>
                            <p className="mt-1 text-xs leading-relaxed text-ink-muted">{step.desc}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                ) : (
                  /* Estado activo con proyecto en producción */
                  <>
                    {/* Reproductor de muestra destacado en el resumen */}
                    <Card className="border-accent/30 bg-gradient-to-br from-surface-elevated via-surface-elevated to-accent/5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent shadow-inner">
                            <Headphones className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                                Muestra Reciente
                              </span>
                              <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
                                WAV 24-bit
                              </span>
                            </div>
                            <h3 className="mt-0.5 text-base font-semibold text-ink">
                              Capítulo 1: La llamada del crepúsculo (Mezcla preliminar)
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedChapter(chaptersState[0])}
                            className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-edge bg-surface px-4 py-2.5 text-xs font-medium text-ink transition hover:border-accent/40 hover:text-accent cursor-pointer"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-accent" />
                            <span>Revisar & Chat</span>
                          </button>
                          <button
                            type="button"
                            onClick={togglePlay}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-xs font-medium text-surface transition hover:bg-accent-hover shadow-sm cursor-pointer"
                          >
                            {isPlaying ? (
                              <>
                                <Pause className="h-4 w-4" fill="currentColor" />
                                <span>Pausar Muestra</span>
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4" fill="currentColor" />
                                <span>Reproducir Muestra</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Barra de progreso de audio interactiva */}
                      <div className="mt-5 rounded-2xl border border-edge bg-surface p-4">
                        <div className="flex items-center justify-between text-xs text-ink-muted">
                          <span className="font-mono text-ink">04:12</span>
                          <div className="flex items-center gap-1.5 text-accent">
                            <Volume2 className="h-3.5 w-3.5" />
                            <span className="text-[11px]">Audio de alta fidelidad</span>
                          </div>
                          <span className="font-mono text-ink-muted">12:15</span>
                        </div>

                        <div
                          className="relative mt-2.5 h-3 w-full cursor-pointer overflow-hidden rounded-full bg-surface-elevated border border-edge/60"
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
                    </Card>

                    {/* Grilla de Métricas clave */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      <Card>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Estado Actual</p>
                          <ShieldCheck className="h-4 w-4 text-accent" />
                        </div>
                        <p className="mt-2 text-xl font-semibold text-ink">En Producción</p>
                        <p className="mt-1 text-xs text-ink-muted">
                          Locución y edición sonora en curso por el equipo editorial.
                        </p>
                      </Card>

                      <Card>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Progreso General</p>
                          <Sparkles className="h-4 w-4 text-accent" />
                        </div>
                        <p className="mt-2 text-xl font-semibold text-ink">74% Completado</p>
                        <p className="mt-1 text-xs text-ink-muted">
                          Capítulo 3 pendiente de revisión técnica final.
                        </p>
                      </Card>

                      <Card className="sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Límite de Revisiones</p>
                          <FileText className="h-4 w-4 text-accent" />
                        </div>
                        <p className="mt-2 text-xl font-semibold text-ink">2 por Capítulo</p>
                        <p className="mt-1 text-xs text-ink-muted">
                          Garantiza un flujo de producción ágil y estructurado.
                        </p>
                      </Card>
                    </div>

                    {/* Línea de tiempo de producción */}
                    <Card title="Etapas de Producción" description="Progreso por fase del proyecto de audiolibro.">
                      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {productionSteps.map((step, idx) => {
                          const isComplete = step.status === 'Completado';
                          const isInProgress = step.status === 'En curso';
                          return (
                            <div
                              key={step.title}
                              className={`relative rounded-2xl border p-4 transition ${
                                isComplete
                                  ? 'border-accent/40 bg-accent/5'
                                  : isInProgress
                                  ? 'border-amber-500/40 bg-amber-500/5'
                                  : 'border-edge bg-surface'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-serif text-xs font-medium text-accent">Paso 0{idx + 1}</span>
                                {isComplete ? (
                                  <CheckCircle2 className="h-4 w-4 text-accent" />
                                ) : isInProgress ? (
                                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                                ) : (
                                  <Clock className="h-4 w-4 text-ink-muted" />
                                )}
                              </div>
                              <h4 className="mt-3 text-sm font-semibold text-ink">{step.title}</h4>
                              <p className="mt-1 text-xs text-ink-muted leading-relaxed">{step.desc}</p>
                              <div className="mt-3">
                                <span
                                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                    isComplete
                                      ? 'bg-accent/15 text-accent'
                                      : isInProgress
                                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                      : 'bg-surface-elevated text-ink-muted border border-edge'
                                  }`}
                                >
                                  {step.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </>
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
                      <div className="mb-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-edge bg-surface p-4">
                          <p className="text-xs uppercase tracking-wider text-ink-muted">Inversión Total</p>
                          <p className="mt-1 text-xl font-semibold text-ink">$390.00</p>
                        </div>
                        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4">
                          <p className="text-xs uppercase tracking-wider text-accent">Total Pagado</p>
                          <p className="mt-1 text-xl font-semibold text-accent">$260.00</p>
                        </div>
                        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                          <p className="text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">Pendiente</p>
                          <p className="mt-1 text-xl font-semibold text-amber-600 dark:text-amber-400">$130.00</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {chaptersState.map((chap) => (
                          <div
                            key={chap.id}
                            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-edge bg-surface-elevated p-4 transition hover:border-accent/40"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-edge bg-surface text-accent">
                                <Wallet className="h-5 w-5" strokeWidth={1.75} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-ink">{chap.title}</p>
                                <p className="mt-0.5 text-xs text-ink-muted">
                                  {chap.paymentStatus === 'Pagado' ? 'Factura emitida y saldada' : 'Listo para pago al completar revisión'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="text-base font-semibold text-ink">${chap.price}.00</span>
                              <StatusPill status={chap.paymentStatus} />

                              {chap.paymentStatus === 'Pendiente' ? (
                                <button
                                  type="button"
                                  onClick={() => setPayingChapter(chap)}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-1.5 text-xs font-medium text-surface transition hover:bg-accent-hover shadow-sm cursor-pointer"
                                >
                                  <DollarSign className="h-3.5 w-3.5" />
                                  <span>Pagar Ahora</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setSelectedChapter(chap)}
                                  className="inline-flex items-center gap-1 rounded-xl border border-edge bg-surface px-3 py-1.5 text-xs text-ink-muted hover:text-accent cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>Ver Audio</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </Card>

                {/* TABLA DE HISTORIAL DE FACTURAS */}
                <Card title="Historial de Facturación" description="Tabla completa de comprobantes, recibos y facturas oficiales emitidas.">
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-xs text-ink">
                      <thead>
                        <tr className="border-b border-edge/80 text-[11px] font-semibold uppercase tracking-wider text-ink-muted bg-surface/50">
                          <th className="px-4 py-3">ID Factura</th>
                          <th className="px-4 py-3">Fecha</th>
                          <th className="px-4 py-3">Concepto</th>
                          <th className="px-4 py-3">Método de Pago</th>
                          <th className="px-4 py-3">Monto</th>
                          <th className="px-4 py-3">Estado</th>
                          <th className="px-4 py-3 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-edge/50">
                        {invoicesList.map((inv) => (
                          <tr key={inv.id} className="hover:bg-surface/60 transition-colors">
                            <td className="px-4 py-3.5 font-mono font-medium text-accent">{inv.id}</td>
                            <td className="px-4 py-3.5 text-ink-muted">{inv.date}</td>
                            <td className="px-4 py-3.5 font-medium">{inv.concept}</td>
                            <td className="px-4 py-3.5 text-ink-muted">{inv.method}</td>
                            <td className="px-4 py-3.5 font-semibold text-ink">{inv.amount}</td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                                inv.status === 'Pagado'
                                  ? 'bg-accent/15 text-accent border border-accent/30'
                                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => setViewInvoice(inv)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-edge bg-surface px-2.5 py-1 text-xs font-medium text-ink transition hover:border-accent/40 hover:text-accent cursor-pointer"
                              >
                                <FileText className="h-3.5 w-3.5 text-accent" />
                                <span>Detalle</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                        {hasActiveProject ? 'Proyecto Activo: El jardín de las sombras' : 'Sin obras en producción activa'}
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
