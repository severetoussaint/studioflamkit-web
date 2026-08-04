'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  MessageSquare, 
  Check, 
  CheckCircle2, 
  Music, 
  Clock, 
  Coins, 
  User, 
  Sparkles, 
  BookOpen, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Send, 
  X, 
  Sliders, 
  DollarSign, 
  AlertCircle,
  FolderPlus,
  RefreshCw,
  Eye,
  CheckCircle
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import {
  adminService,
  type AdminProject,
  type AdminProjectStatus,
  type QuotationRequest,
  type QuotationRequestStatus,
  type AudioDeliverable,
  type AudioDeliverableComment,
} from '@/services/admin.service';
import { getUser, getUserRole } from '@/services/auth.service';

const statusLabels: Record<AdminProjectStatus, string> = {
  analisis: 'Análisis de Obra',
  produccion: 'En Grabación / Edición',
  revisiones: 'Fase de Revisiones',
  completado: 'Obra Completada',
};

const quotationStatusLabels: Record<QuotationRequestStatus, string> = {
  pendiente: 'Pendiente de Revisión',
  aprobada: 'Aprobada / Cotizada',
  en_revision: 'En Análisis Editorial',
};

const statusStyles: Record<AdminProjectStatus, string> = {
  analisis: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300 font-medium',
  produccion: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-medium',
  revisiones: 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300 font-medium',
  completado: 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300 font-medium',
};

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'proyectos' | 'cotizaciones' | 'crear'>('proyectos');
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  
  // Authorization states
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Deliverables add state
  const [newDeliverableTitles, setNewDeliverableTitles] = useState<Record<string, string>>({});
  const [newDeliverableUrls, setNewDeliverableUrls] = useState<Record<string, string>>({});

  // Chat/Feedback modal state
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null);
  const [selectedDeliverable, setSelectedDeliverable] = useState<AudioDeliverable | null>(null);
  const [replyText, setReplyText] = useState('');

  // Manual project creation state
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjClient, setNewProjClient] = useState('');
  const [newProjStatus, setNewProjStatus] = useState<AdminProjectStatus>('analisis');
  const [newProjChapters, setNewProjChapters] = useState(5);
  const [newProjAmount, setNewProjAmount] = useState(1500);
  const [newProjMaxRevisions, setNewProjMaxRevisions] = useState(3);
  const [creationSuccess, setCreationSuccess] = useState(false);

  // Manual Quotation request state
  const [newQuoteTitle, setNewQuoteTitle] = useState('');
  const [newQuoteClient, setNewQuoteClient] = useState('');
  const [newQuoteChapters, setNewQuoteChapters] = useState(4);
  const [newQuoteAmount, setNewQuoteAmount] = useState(1200);

  // Load data initially
  const loadAllData = () => {
    setRequests(adminService.listQuotationRequests());
    setProjects(adminService.listAdminProjects());
  };

  useEffect(() => {
    let isMounted = true;

    async function verifyAccess() {
      try {
        const user = await getUser();
        const role = getUserRole(user);

        if (!isMounted) return;

        if (user && role === 'admin') {
          setIsAuthorized(true);
          loadAllData();
        } else {
          router.replace('/login');
        }
      } catch {
        if (isMounted) {
          router.replace('/login');
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    }

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const summary = useMemo(() => {
    const activeProjects = projects.filter((project) => project.status !== 'completado').length;
    const completedProjects = projects.filter((project) => project.status === 'completado').length;
    const pendingRequests = requests.filter((request) => request.status === 'pendiente').length;
    const totalAmount = projects.reduce((acc, curr) => acc + (curr.amount || 0), 0) + 
                        requests.filter(r => r.status === 'aprobada').reduce((acc, curr) => acc + curr.amount, 0);

    return {
      activeProjects,
      completedProjects,
      pendingRequests,
      totalAmount,
    };
  }, [projects, requests]);

  // Handle Quotation status
  const handleQuotationStatus = (id: string, status: QuotationRequestStatus) => {
    const updated = adminService.updateQuotationRequestStatus(id, status);
    if (updated) {
      loadAllData();
    }
  };

  // Convert Quotation Request to an Active Project automatically
  const handleConvertQuoteToProject = (request: QuotationRequest) => {
    adminService.createAdminProject({
      title: request.title,
      client: request.client,
      status: 'produccion',
      chapters: request.chapters,
      amount: request.amount,
      maxRevisions: 3,
      revisionsUsed: 0
    });
    
    // Mark quote as approved
    adminService.updateQuotationRequestStatus(request.id, 'aprobada');
    loadAllData();
    setActiveTab('proyectos');
  };

  // Delete Quote
  const handleDeleteQuote = (id: string) => {
    if (confirm('¿Seguro que deseas eliminar esta solicitud de cotización?')) {
      adminService.deleteQuotationRequest(id);
      loadAllData();
    }
  };

  // Delete Project
  const handleDeleteProject = (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este proyecto de la base de datos?')) {
      adminService.deleteAdminProject(id);
      loadAllData();
    }
  };

  // Handle Project Status change
  const handleProjectStatus = (id: string, status: AdminProjectStatus) => {
    const updated = adminService.updateProjectStatus(id, status);
    if (updated) {
      loadAllData();
    }
  };

  // Handle Revision count increments / decrements (Customizable revisions control)
  const handleUpdateMaxRevisions = (id: string, increment: boolean, currentMax: number) => {
    const targetVal = increment ? currentMax + 1 : Math.max(0, currentMax - 1);
    const updated = adminService.updateProjectMaxRevisions(id, targetVal);
    if (updated) {
      loadAllData();
    }
  };

  const handleUpdateRevisionsUsed = (id: string, project: AdminProject) => {
    const updated = adminService.addProjectRevision(id);
    if (updated) {
      loadAllData();
    }
  };

  // Handle Budget edits
  const handleUpdateBudget = (id: string, currentAmount: number) => {
    const newAmountStr = prompt('Introduce el nuevo presupuesto total del proyecto ($ USD):', currentAmount.toString());
    if (newAmountStr === null) return;
    const newAmount = parseFloat(newAmountStr);
    if (isNaN(newAmount) || newAmount < 0) {
      alert('Por favor introduce un valor numérico válido.');
      return;
    }
    const updated = adminService.updateProjectBudget(id, newAmount);
    if (updated) {
      loadAllData();
    }
  };

  // Add Audio Deliverable with optional URL
  const handleAddDeliverable = (projectId: string) => {
    const title = newDeliverableTitles[projectId]?.trim();
    if (!title) return;

    const url = newDeliverableUrls[projectId]?.trim() || undefined;

    const updated = adminService.addAudioDeliverable(projectId, title, url);
    if (updated) {
      loadAllData();
      // Reset inputs
      setNewDeliverableTitles(prev => ({ ...prev, [projectId]: '' }));
      setNewDeliverableUrls(prev => ({ ...prev, [projectId]: '' }));
    }
  };

  // Toggle Deliverable Completed Checkbox
  const handleToggleDeliverable = (projectId: string, deliverableId: string) => {
    const updated = adminService.toggleAudioDeliverable(projectId, deliverableId);
    if (updated) {
      loadAllData();
    }
  };

  // Add Comment to Deliverable (Chat Mode)
  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !selectedDeliverable || !replyText.trim()) return;

    const updated = adminService.addDeliverableComment(
      selectedProject.id, 
      selectedDeliverable.id, 
      'admin', 
      replyText.trim()
    );

    if (updated) {
      loadAllData();
      // Keep selected structures in sync with fresh data
      const freshProject = updated;
      const freshDeliverable = freshProject.deliverables.find(d => d.id === selectedDeliverable.id) || null;
      setSelectedProject(freshProject);
      setSelectedDeliverable(freshDeliverable);
      setReplyText('');
    }
  };

  // Open Chat feedback dialog
  const openChatPanel = (project: AdminProject, deliverable: AudioDeliverable) => {
    setSelectedProject(project);
    setSelectedDeliverable(deliverable);
    setReplyText('');
  };

  // Create project manually
  const handleCreateProjectManually = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim() || !newProjClient.trim()) {
      alert('Por favor rellena el título de la obra y el nombre de autor.');
      return;
    }

    adminService.createAdminProject({
      title: newProjTitle.trim(),
      client: newProjClient.trim(),
      status: newProjStatus,
      chapters: newProjChapters,
      amount: newProjAmount,
      maxRevisions: newProjMaxRevisions,
      revisionsUsed: 0
    });

    loadAllData();
    setNewProjTitle('');
    setNewProjClient('');
    setCreationSuccess(true);
    setTimeout(() => setCreationSuccess(false), 3500);
  };

  // Create mock quotation request manually
  const handleCreateQuoteManually = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuoteTitle.trim() || !newQuoteClient.trim()) {
      alert('Completa los campos de título y autor.');
      return;
    }

    adminService.addQuotationRequest({
      title: newQuoteTitle.trim(),
      client: newQuoteClient.trim(),
      chapters: newQuoteChapters,
      amount: newQuoteAmount,
      status: 'pendiente'
    });

    loadAllData();
    setNewQuoteTitle('');
    setNewQuoteClient('');
    alert('Simulación de manuscrito creada correctamente. Búscalo en la pestaña "Cotizaciones".');
  };

  if (isChecking) {
    return <LoadingScreen message="Verificando credenciales de administración..." />;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <main className="min-h-screen bg-surface text-ink selection:bg-accent/30 transition-colors duration-200">
      <Navbar />

      {/* Hero Banner Header */}
      <div className="relative border-b border-edge bg-surface-elevated py-14 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-accent)_0%,_transparent_45%)] opacity-10" />
        <div className="pointer-events-none absolute -bottom-16 left-12 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />
        
        <div className="mx-auto max-w-6xl px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
                <Sparkles className="h-3 w-3" />
                Estudio Flamkit • Editor de Control
              </div>
              <h1 className="mt-4 font-serif text-3xl sm:text-4xl font-semibold text-ink tracking-tight">
                Panel de Control Editorial y Producción
              </h1>
              <p className="mt-2 text-ink-muted text-sm max-w-xl leading-relaxed">
                Supervisa y gestiona la conversión de manuscritos a obras cinemáticas. Configura límites de revisiones, sube archivos de sonido y responde en tiempo real al feedback de tus autores.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={loadAllData}
                className="flex items-center gap-2 rounded-xl bg-surface border border-edge px-4 py-2.5 text-xs font-medium text-ink-muted hover:text-ink hover:bg-surface-elevated active:scale-98 transition shadow-md cursor-pointer"
                title="Sincronizar datos"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Actualizar Datos
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-edge bg-surface-elevated p-5 shadow-sm">
              <div className="flex items-center gap-2 text-ink-muted text-xs font-medium">
                <Layers className="h-3.5 w-3.5 text-accent" />
                Proyectos Activos
              </div>
              <p className="mt-2 text-2xl font-semibold text-ink">{summary.activeProjects}</p>
            </div>

            <div className="rounded-2xl border border-edge bg-surface-elevated p-5 shadow-sm">
              <div className="flex items-center gap-2 text-ink-muted text-xs font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Obras Completadas
              </div>
              <p className="mt-2 text-2xl font-semibold text-ink">{summary.completedProjects}</p>
            </div>

            <div className="rounded-2xl border border-edge bg-surface-elevated p-5 shadow-sm">
              <div className="flex items-center gap-2 text-ink-muted text-xs font-medium">
                <Clock className="h-3.5 w-3.5 text-accent animate-pulse" />
                Nuevos Manuscritos
              </div>
              <p className="mt-2 text-2xl font-semibold text-ink">{summary.pendingRequests}</p>
            </div>

            <div className="rounded-2xl border border-edge bg-surface-elevated p-5 shadow-sm">
              <div className="flex items-center gap-2 text-ink-muted text-xs font-medium">
                <Coins className="h-3.5 w-3.5 text-accent" />
                Valor de Cartera
              </div>
              <p className="mt-2 text-2xl font-semibold text-accent">${summary.totalAmount} USD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex border-b border-edge gap-6 mb-8 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('proyectos')}
            className={`pb-4 text-sm font-semibold tracking-wide transition relative whitespace-nowrap cursor-pointer ${
              activeTab === 'proyectos' ? 'text-accent' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {activeTab === 'proyectos' && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
            Proyectos en Curso ({projects.length})
          </button>
          
          <button
            onClick={() => setActiveTab('cotizaciones')}
            className={`pb-4 text-sm font-semibold tracking-wide transition relative whitespace-nowrap cursor-pointer ${
              activeTab === 'cotizaciones' ? 'text-accent' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {activeTab === 'cotizaciones' && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
            Cotizaciones y Manuscritos ({requests.length})
          </button>

          <button
            onClick={() => setActiveTab('crear')}
            className={`pb-4 text-sm font-semibold tracking-wide transition relative whitespace-nowrap cursor-pointer ${
              activeTab === 'crear' ? 'text-accent' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {activeTab === 'crear' && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
            Registrar Obra / Manuscrito
          </button>
        </div>

        {/* Tab 1: Active Projects Editor */}
        {activeTab === 'proyectos' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-medium text-ink">Gestión Directa de Obras Activas</h2>
                <p className="text-ink-muted text-xs mt-1">
                  Aquí controlas la cantidad de revisiones máximas, presupuestos, estados y los audios disponibles para cada autor.
                </p>
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-edge bg-surface-elevated/30 p-12 text-center">
                <Sliders className="h-8 w-8 text-ink-muted mx-auto mb-3" />
                <p className="text-sm text-ink-muted font-medium">No se encontraron proyectos activos en este momento.</p>
                <p className="text-xs text-ink-muted mt-1">Crea un nuevo proyecto en la pestaña "Registrar Obra" o aprueba un manuscrito.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {projects.map((project) => (
                  <motion.div 
                    layout
                    key={project.id} 
                    className="rounded-3xl border border-edge bg-surface-elevated p-6 relative overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      {/* Top bar details */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">Obra Activa</span>
                          <h3 className="font-serif text-lg font-semibold text-ink leading-tight mt-0.5">{project.title}</h3>
                          <p className="text-ink-muted text-xs mt-1">Autor: <span className="text-ink font-semibold">{project.client}</span></p>
                        </div>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-1.5 text-ink-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                          title="Eliminar Obra"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Info & Status row */}
                      <div className="grid grid-cols-2 gap-3 mb-4 rounded-2xl bg-surface p-3.5 border border-edge">
                        <div>
                          <p className="text-[10px] text-ink-muted uppercase tracking-wide">Capítulos totales</p>
                          <p className="text-sm font-semibold text-ink mt-0.5">{project.chapters} capítulos</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-ink-muted uppercase tracking-wide">Presupuesto</p>
                          <button 
                            onClick={() => handleUpdateBudget(project.id, project.amount || 0)}
                            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 mt-0.5 cursor-pointer bg-transparent border-none p-0"
                            title="Editar presupuesto"
                          >
                            <span>${project.amount || 0} USD</span>
                            <Sliders className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Customizable Revisions Panel (Core User Request) */}
                      <div className="mb-6 rounded-2xl border border-accent/10 bg-accent/[0.02] p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs font-semibold text-accent flex items-center gap-1">
                              <Sliders className="h-3.5 w-3.5 text-accent" />
                              Límite de Revisiones Pactado
                            </p>
                            <p className="text-[10px] text-ink-muted mt-0.5">Define cuántos cambios puede pedir el cliente.</p>
                          </div>
                          <span className="text-xs font-bold text-accent px-2 py-0.5 bg-accent/10 rounded-lg">
                            {project.revisionsUsed} / {project.maxRevisions} Usadas
                          </span>
                        </div>

                        {/* Adjust revisions limits */}
                        <div className="flex items-center justify-between gap-4 bg-surface rounded-xl p-2 border border-edge">
                          <span className="text-xs font-medium text-ink-muted pl-2">Límite Permitido:</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateMaxRevisions(project.id, false, project.maxRevisions)}
                              className="h-8 w-8 rounded-lg bg-surface-elevated hover:bg-surface border border-edge text-ink-muted hover:text-ink flex items-center justify-center transition active:scale-90 cursor-pointer"
                              title="Disminuir revisiones máximas"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-10 text-center font-bold text-ink text-sm">
                              {project.maxRevisions}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateMaxRevisions(project.id, true, project.maxRevisions)}
                              className="h-8 w-8 rounded-lg bg-surface-elevated hover:bg-surface border border-edge text-ink-muted hover:text-ink flex items-center justify-center transition active:scale-90 cursor-pointer"
                              title="Aumentar revisiones máximas"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Revisions consumption simulation */}
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[10px] text-ink-muted font-medium">Consumir revisión adicional:</span>
                          <Button 
                            variant="secondary" 
                            disabled={project.revisionsUsed >= project.maxRevisions}
                            onClick={() => handleUpdateRevisionsUsed(project.id, project)}
                            className="text-[10px] py-1 px-3 cursor-pointer"
                          >
                            Registrar Uso (+1)
                          </Button>
                        </div>
                      </div>

                      {/* Status Selector */}
                      <div className="mb-6">
                        <label className="text-[10px] text-ink-muted uppercase tracking-wide block mb-2 font-semibold">Estado actual de la producción</label>
                        <div className="grid grid-cols-4 gap-1.5 bg-surface border border-edge rounded-xl p-1">
                          {(['analisis', 'produccion', 'revisiones', 'completado'] as AdminProjectStatus[]).map((st) => (
                            <button
                              key={st}
                              onClick={() => handleProjectStatus(project.id, st)}
                              className={`rounded-lg py-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-center transition cursor-pointer ${
                                project.status === st
                                  ? 'bg-accent text-surface font-bold'
                                  : 'text-ink-muted hover:text-ink hover:bg-surface-elevated'
                              }`}
                            >
                              {st === 'analisis' ? 'Análisis' : st === 'produccion' ? 'Progreso' : st === 'revisiones' ? 'Revisar' : 'Final'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Deliverables management */}
                      <div className="space-y-4 pt-4 border-t border-edge">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-ink flex items-center gap-1.5">
                            <Music className="h-3.5 w-3.5 text-accent" />
                            Archivos de Sonido de la Obra ({project.deliverables.length})
                          </span>
                        </div>

                        {/* Deliverables lists */}
                        {project.deliverables.length === 0 ? (
                          <p className="text-[11px] text-ink-muted italic py-1">Aún no se han enviado audios para este proyecto.</p>
                        ) : (
                          <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {project.deliverables.map((del) => (
                              <li 
                                key={del.id} 
                                className="flex items-center justify-between rounded-xl bg-surface/60 border border-edge p-2.5 hover:border-accent transition cursor-pointer"
                              >
                                <div className="flex items-center gap-2 max-w-[65%]">
                                  <input
                                    type="checkbox"
                                    checked={del.completed}
                                    onChange={() => handleToggleDeliverable(project.id, del.id)}
                                    className="h-4 w-4 rounded border-edge bg-surface text-accent focus:ring-accent cursor-pointer"
                                  />
                                  <div className="truncate">
                                    <span className={`text-xs block font-medium truncate ${del.completed ? 'line-through text-ink-muted' : 'text-ink'}`}>
                                      {del.title}
                                    </span>
                                    <span className="text-[9px] text-ink-muted">Último cambio: {del.updatedAt}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {/* Open feedback chat dialog */}
                                  <button
                                    onClick={() => openChatPanel(project, del)}
                                    className="relative flex items-center gap-1 rounded-lg bg-surface border border-edge hover:bg-surface-elevated text-ink-muted hover:text-accent text-[10px] px-2 py-1 transition cursor-pointer"
                                    title="Ver comentarios / Chat de audio"
                                  >
                                    <MessageSquare className="h-3 w-3" />
                                    <span>Chat</span>
                                    {del.comments && del.comments.length > 0 && (
                                      <span className="absolute -top-1.5 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-surface">
                                        {del.comments.length}
                                      </span>
                                    )}
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Add audio deliverable form */}
                        <div className="bg-surface/40 rounded-2xl border border-edge p-3 space-y-2">
                          <span className="text-[10px] text-ink-muted uppercase font-semibold">Subir Nuevo Entregable de Audio</span>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Ejem: Capítulo 1 - Master Final"
                              value={newDeliverableTitles[project.id] || ''}
                              onChange={(e) => setNewDeliverableTitles(prev => ({ ...prev, [project.id]: e.target.value }))}
                              className="flex-1 rounded-xl border border-edge bg-surface px-3 py-1.5 text-xs text-ink outline-none focus:border-accent transition"
                            />
                            <Button 
                              variant="primary" 
                              onClick={() => handleAddDeliverable(project.id)}
                              className="px-3 text-xs py-1.5 cursor-pointer"
                            >
                              Agregar
                            </Button>
                          </div>
                          <input
                            type="text"
                            placeholder="URL de audio opcional (Ejem: MP3)"
                            value={newDeliverableUrls[project.id] || ''}
                            onChange={(e) => setNewDeliverableUrls(prev => ({ ...prev, [project.id]: e.target.value }))}
                            className="w-full rounded-xl border border-edge bg-surface px-3 py-1 text-[10px] text-ink-muted outline-none focus:border-accent transition"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-edge/40 flex items-center justify-between text-[10px] text-ink-muted">
                      <span>ID: {project.id}</span>
                      <span>Último cambio: {project.lastUpdate}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Quotation Requests & Uploaded Manuscripts */}
        {activeTab === 'cotizaciones' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-serif font-medium text-ink">Solicitudes de Cotización y Análisis Editorial</h2>
              <p className="text-ink-muted text-xs mt-1">
                Aquí se reciben las peticiones de los autores de Studio Flamkit. Puedes evaluarlas, ajustar el presupuesto y activarlas como Proyectos con un solo clic.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Column: Received Requests */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Manuscritos y Obras en Análisis ({requests.length})
                </h3>

                {requests.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-edge bg-surface-elevated/30 p-12 text-center">
                    <BookOpen className="h-8 w-8 text-ink-muted mx-auto mb-3" />
                    <p className="text-sm text-ink-muted">No hay solicitudes de cotización o manuscritos pendientes.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <motion.div 
                        layout
                        key={request.id} 
                        className="rounded-2xl border border-edge bg-surface-elevated p-5 relative"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-full border border-edge bg-surface px-2 py-0.5 text-[9px] uppercase tracking-wider text-ink">
                              Manuscrito #{request.id}
                            </span>
                            <h4 className="font-serif text-base font-bold text-ink mt-2">{request.title}</h4>
                            <p className="text-xs text-ink-muted mt-1">
                              Autor solicitante: <span className="text-ink font-semibold">{request.client}</span>
                            </p>
                            <p className="text-xs text-ink-muted mt-0.5">
                              Estructura: <span className="text-ink font-medium">{request.chapters} capítulos</span> • Fecha: <span className="text-ink-muted">{request.requestedAt}</span>
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-sm font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-lg">
                              ${request.amount} USD
                            </span>
                            <span className="text-[9px] font-semibold text-ink-muted">
                              Presupuesto estimado
                            </span>
                          </div>
                        </div>

                        {/* Middle panel parameters control */}
                        <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl bg-surface p-3 border border-edge text-xs">
                          <div>
                            <span className="text-[10px] text-ink-muted block">Cambiar estado del análisis:</span>
                            <div className="flex gap-1 mt-1.5">
                              {(['pendiente', 'en_revision'] as QuotationRequestStatus[]).map((st) => (
                                <button
                                  key={st}
                                  onClick={() => handleQuotationStatus(request.id, st)}
                                  className={`rounded-lg px-2 py-1 text-[10px] font-medium transition cursor-pointer ${
                                    request.status === st
                                      ? 'bg-accent text-surface font-bold'
                                      : 'bg-surface-elevated text-ink-muted hover:text-ink border border-edge'
                                  }`}
                                >
                                  {st === 'pendiente' ? 'Pendiente' : 'Revisión'}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-ink-muted block">Acción recomendada:</span>
                            <div className="mt-1">
                              <span className="text-[10px] text-ink">Convertir en Obra Activa de producción</span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive flow actions */}
                        <div className="mt-4 pt-4 border-t border-edge/60 flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="primary"
                              onClick={() => handleConvertQuoteToProject(request)}
                              className="text-xs py-1.5 px-3.5 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white border-none cursor-pointer"
                            >
                              <Check className="h-3 w-3" />
                              <span>Aprobar y Crear Proyecto</span>
                            </Button>
                          </div>

                          <button
                            onClick={() => handleDeleteQuote(request.id)}
                            className="text-xs text-ink-muted hover:text-rose-500 hover:underline flex items-center gap-1 transition p-1 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Eliminar Solicitud</span>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar Column: Simulated manuscript uploads generator */}
              <div className="space-y-6">
                <Card 
                  title="Simular Envío de Autor" 
                  description="Crea una solicitud de cotización ficticia para experimentar el flujo de aprobación automática." 
                  className="border-edge bg-surface-elevated"
                >
                  <form onSubmit={handleCreateQuoteManually} className="space-y-4">
                    <Input
                      label="Título de la Obra"
                      placeholder="Ejem: Las Crónicas del Silencio"
                      value={newQuoteTitle}
                      onChange={(e) => setNewQuoteTitle(e.target.value)}
                      required
                    />

                    <Input
                      label="Nombre del Autor"
                      placeholder="Ejem: Carlos Mendoza"
                      value={newQuoteClient}
                      onChange={(e) => setNewQuoteClient(e.target.value)}
                      required
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Capítulos"
                        type="number"
                        value={newQuoteChapters}
                        onChange={(e) => setNewQuoteChapters(parseInt(e.target.value) || 0)}
                        required
                        min="1"
                      />
                      <Input
                        label="Cotización ($ USD)"
                        type="number"
                        value={newQuoteAmount}
                        onChange={(e) => setNewQuoteAmount(parseFloat(e.target.value) || 0)}
                        required
                        min="0"
                      />
                    </div>

                    <Button
                      variant="secondary"
                      type="submit"
                      className="w-full text-xs font-semibold cursor-pointer"
                    >
                      Generar Entrada Simulada
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Manually Create Project / Register New Work */}
        {activeTab === 'crear' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-serif font-medium text-ink">Registrar Nueva Obra Manualmente</h2>
              <p className="text-ink-muted text-xs mt-1">
                Utiliza este formulario para dar de alta a un autor con el que ya has acordado un límite de revisiones y presupuesto, saltándote el paso de cotización previa.
              </p>
            </div>

            <Card className="border-edge bg-surface-elevated p-6 sm:p-8">
              {creationSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-medium"
                >
                  <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                  <span>¡Obra registrada exitosamente! Se ha añadido a la pestaña "Proyectos en Curso" con persistencia local.</span>
                </motion.div>
              )}

              <form onSubmit={handleCreateProjectManually} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Título de la Obra"
                    placeholder="Ejem: El Misterio de los Andes"
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    required
                  />

                  <Input
                    label="Nombre del Autor (Cliente)"
                    placeholder="Ejem: Sofía Vergara"
                    value={newProjClient}
                    onChange={(e) => setNewProjClient(e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    label="Capítulos Totales"
                    type="number"
                    value={newProjChapters}
                    onChange={(e) => setNewProjChapters(parseInt(e.target.value) || 0)}
                    required
                    min="1"
                  />

                  <Input
                    label="Presupuesto Estimado ($ USD)"
                    type="number"
                    value={newProjAmount}
                    onChange={(e) => setNewProjAmount(parseFloat(e.target.value) || 0)}
                    required
                    min="0"
                  />

                  {/* CUSTOMIZABLE REVISIONS LIMIT (Requested feature) */}
                  <div className="flex flex-col">
                    <label className="text-xs text-ink-muted block font-medium mb-1.5">Límite de Revisiones Pactadas</label>
                    <div className="flex items-center gap-1.5 h-[38px] bg-surface border border-edge rounded-xl px-2.5">
                      <button
                        type="button"
                        onClick={() => setNewProjMaxRevisions(prev => Math.max(0, prev - 1))}
                        className="h-6 w-6 rounded bg-surface-elevated border border-edge hover:bg-surface text-ink-muted hover:text-ink flex items-center justify-center transition active:scale-90 cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="flex-1 text-center text-xs font-bold text-ink">{newProjMaxRevisions}</span>
                      <button
                        type="button"
                        onClick={() => setNewProjMaxRevisions(prev => prev + 1)}
                        className="h-6 w-6 rounded bg-surface-elevated border border-edge hover:bg-surface text-ink-muted hover:text-ink flex items-center justify-center transition active:scale-90 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-ink-muted block font-medium mb-2">Estado Inicial del Proyecto</label>
                  <select
                    value={newProjStatus}
                    onChange={(e) => setNewProjStatus(e.target.value as AdminProjectStatus)}
                    className="w-full rounded-xl border border-edge bg-surface px-3.5 py-2.5 text-xs text-ink outline-none focus:border-accent transition"
                  >
                    <option value="analisis">Análisis Inicial (Paso 1)</option>
                    <option value="produccion">Producción activa / Grabación (Paso 2)</option>
                    <option value="revisiones">Fase de Revisiones (Paso 3)</option>
                    <option value="completado">Obra Completada y Entregada (Paso 4)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-full py-3 flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
                  >
                    <FolderPlus className="h-4 w-4" />
                    <span>Dar de Alta Proyecto de Audio</span>
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </section>

      {/* Audio Comments Chat Slide-over / Modal (Direct implementation of requested functionality) */}
      <AnimatePresence>
        {selectedProject && selectedDeliverable && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedProject(null); setSelectedDeliverable(null); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs"
            />

            {/* Slide-over Content */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
                className="relative w-full max-w-md h-full bg-surface-elevated border-l border-edge flex flex-col justify-between shadow-2xl z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-edge flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">Chat de Audio y Feedback</span>
                  <h3 className="font-serif text-base font-bold text-ink mt-1 leading-snug truncate max-w-[280px]">
                    {selectedDeliverable.title}
                  </h3>
                  <p className="text-[11px] text-ink-muted mt-0.5 truncate max-w-[280px]">
                    Obra: {selectedProject.title}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedProject(null); setSelectedDeliverable(null); }}
                  className="h-8 w-8 rounded-full bg-surface border border-edge hover:bg-surface-elevated text-ink-muted hover:text-ink flex items-center justify-center transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Revision Constraints Warnings */}
              <div className="px-5 py-3 bg-accent/10 border-b border-accent/20 text-[10px] text-accent flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-accent flex-shrink-0" />
                <span>
                  Límite Pactado: <strong>{selectedProject.maxRevisions} revisiones</strong>. Las consultas de audio en modo chat permiten que el autor dé feedback directo sobre este entregable.
                </span>
              </div>

              {/* Chat Comments Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {(!selectedDeliverable.comments || selectedDeliverable.comments.length === 0) ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-ink-muted space-y-2">
                    <MessageSquare className="h-8 w-8 text-ink-muted" />
                    <p className="text-xs font-medium">No hay comentarios en este archivo de sonido todavía.</p>
                    <p className="text-[10px] text-ink-muted">Simula una respuesta abajo para iniciar la conversación editorial.</p>
                  </div>
                ) : (
                  selectedDeliverable.comments.map((comm) => (
                    <div 
                      key={comm.id} 
                      className={`flex flex-col ${
                        comm.sender === 'admin' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[9px] font-semibold text-ink-muted">
                        <span>{comm.sender === 'admin' ? 'Administración' : selectedProject.client}</span>
                        <span>•</span>
                        <span>{comm.timestamp}</span>
                      </div>
                      <div 
                        className={`rounded-2xl px-4 py-2.5 max-w-[85%] text-xs font-medium ${
                          comm.sender === 'admin' 
                            ? 'bg-accent text-surface rounded-tr-none' 
                            : 'bg-surface text-ink rounded-tl-none border border-edge'
                        }`}
                      >
                        {comm.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Quick simulation helper buttons */}
              <div className="px-5 py-2 border-t border-edge bg-surface/50 flex gap-2">
                <span className="text-[9px] text-ink-muted self-center uppercase font-bold whitespace-nowrap">Simular:</span>
                <button
                  type="button"
                  onClick={() => {
                    adminService.addDeliverableComment(
                      selectedProject.id, 
                      selectedDeliverable.id, 
                      'client', 
                      '¿Se podría subir el volumen de la voz en el segundo 45?'
                    );
                    loadAllData();
                    // Sync active view
                    const freshProj = adminService.listAdminProjects().find(p => p.id === selectedProject.id);
                    if (freshProj) {
                      setSelectedProject(freshProj);
                      setSelectedDeliverable(freshProj.deliverables.find(d => d.id === selectedDeliverable.id) || null);
                    }
                  }}
                  className="rounded-lg bg-surface hover:bg-surface-elevated border border-edge text-ink-muted text-[9px] px-2.5 py-1 transition cursor-pointer"
                >
                  Autor pide ajuste
                </button>
                <button
                  type="button"
                  onClick={() => {
                    adminService.addDeliverableComment(
                      selectedProject.id, 
                      selectedDeliverable.id, 
                      'client', 
                      '¡Excelente mezcla! Apruebo este fragmento de audio.'
                    );
                    loadAllData();
                    // Sync active view
                    const freshProj = adminService.listAdminProjects().find(p => p.id === selectedProject.id);
                    if (freshProj) {
                      setSelectedProject(freshProj);
                      setSelectedDeliverable(freshProj.deliverables.find(d => d.id === selectedDeliverable.id) || null);
                    }
                  }}
                  className="rounded-lg bg-surface hover:bg-surface-elevated border border-edge text-ink-muted text-[9px] px-2.5 py-1 transition cursor-pointer"
                >
                  Autor aprueba audio
                </button>
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendComment} className="p-4 border-t border-edge bg-surface flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Escribe tu respuesta al autor..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 rounded-full border border-edge bg-surface-elevated px-4 py-2.5 text-xs text-ink outline-none focus:border-accent transition"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="h-9 w-9 rounded-full bg-accent disabled:bg-surface text-surface disabled:text-ink-muted flex items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
