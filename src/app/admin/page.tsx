"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen, Plus, Upload, MessageCircle, Send, X,
  Inbox, User, AlertTriangle, CheckCircle2,
  BarChart3, ArrowRight, ShieldCheck,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { supabaseClient } from "@/lib/supabase/client";

import { getUser, getUserRole } from "@/services/auth.service";
import { adminService } from "@/services/admin.service";
import { uploadProjectDeliverableFile } from "@/services/storage.service";
import { useAdminProjectWorkspace } from "@/hooks/useAdminProjectWorkspace";
import type { AdminProject, AdminProjectStatus, AudioDeliverable, QuotationRequest } from "@/services/admin.service";
import type { ProjectBrief } from "@/types/project-brief.types";
import { getProjectBrief } from "@/services/project-brief.service";
import { deriveAdminEditorialJourney, type AdminEditorialJourneyModel } from "@/components/admin/adminEditorialJourney.model";
import { AdminProjectHeader } from "@/components/admin/AdminProjectHeader";
import { AdminEditorialJourneyView } from "@/components/admin/AdminEditorialJourneyView";
import { AdminProgressPanel } from "@/components/admin/AdminProgressPanel";
import { AdminNextActionCard } from "@/components/admin/AdminNextActionCard";
import { AdminRequestProposalPanel } from "@/components/admin/AdminRequestProposalPanel";
import { AdminChaptersDeliverablesPanel } from "@/components/admin/AdminChaptersDeliverablesPanel";
import { AdminFeedbackReviewPanel } from "@/components/admin/AdminFeedbackReviewPanel";
import { AdminSupportMessagingPanel } from "@/components/admin/AdminSupportMessagingPanel";
import { AdminQuotationList } from "@/components/admin/quotation/AdminQuotationList";
import { AdminQuotationDetailModal } from "@/components/admin/quotation/AdminQuotationDetailModal";

/* ────────────────────────────
   Legacy status presentation map
   ──────────────────────────── */
const statusLabels: Record<AdminProjectStatus, string> = {
  analisis: "Análisis de Obra",
  produccion: "En Grabación / Edición",
  revisiones: "Fase de Revisiones",
  completado: "Obra Completada",
};

const statusStyles: Record<AdminProjectStatus, string> = {
  analisis: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300 font-medium",
  produccion: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-medium",
  revisiones: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300 font-medium",
  completado: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300 font-medium",
};

/* ────────────────────────────
   Animation presets
   ──────────────────────────── */
const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" as const },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN ADMIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const router = useRouter();

  /* ─── Tabs ─── */
  const [activeTab, setActiveTab] = useState<"proyectos" | "cotizaciones" | "soporte" | "crear">("proyectos");
  const [adminUserId, setAdminUserId] = useState<string>("");

  /* ─── Data states (legacy preserved) ─── */
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);

  /* ─── Selectors (legacy preserved) ─── */
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  /* ─── Auth states (legacy preserved) ─── */
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  /* ─── Deliverables form state (legacy preserved) ─── */
  const [newDeliverableTitles, setNewDeliverableTitles] = useState<Record<string, string>>({});
  const [newDeliverableUrls, setNewDeliverableUrls] = useState<Record<string, string>>({});
  const [newDeliverableFiles, setNewDeliverableFiles] = useState<Record<string, File | null>>({});

  /* ─── Chat/Feedback modal state (legacy preserved) ─── */
  const [selectedProject, setSelectedProject] = useState<AdminProject | null>(null);
  const [selectedDeliverable, setSelectedDeliverable] = useState<AudioDeliverable | null>(null);
  const [replyText, setReplyText] = useState("");

  /* ─── Quotation request detail state ─── */
  const [selectedQuotationRequest, setSelectedQuotationRequest] = useState<QuotationRequest | null>(null);
  const [selectedQuotationBrief, setSelectedQuotationBrief] = useState<ProjectBrief | null>(null);
  const [quotationBriefLoading, setQuotationBriefLoading] = useState(false);
  const [quotationBriefError, setQuotationBriefError] = useState<string | null>(null);

  /* ─── Chapter creation state (legacy preserved) ─── */
  const [newChapterTitles, setNewChapterTitles] = useState<Record<string, string>>({});
  const [newChapterWords, setNewChapterWords] = useState<Record<string, number>>({});

  /* ─── Manual creation state (legacy preserved) ─── */
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjClient, setNewProjClient] = useState("");
  const [newProjStatus, setNewProjStatus] = useState<AdminProjectStatus>("analisis");
  const [newProjChapters, setNewProjChapters] = useState(5);
  const [newProjAmount, setNewProjAmount] = useState(1500);
  const [newProjMaxRevisions, setNewProjMaxRevisions] = useState(3);
  const [creationSuccess, setCreationSuccess] = useState(false);

  /* ─── Group projects by author (legacy preserved) ─── */
  const groupedAuthors = useMemo(() => {
    const groups: Record<string, AdminProject[]> = {};
    const safeProjects = Array.isArray(projects) ? projects : [];
    safeProjects.forEach((p) => {
      const authorName = p.client || "Autor Desconocido";
      if (!groups[authorName]) groups[authorName] = [];
      groups[authorName].push(p);
    });
    return groups;
  }, [projects]);

  const authorNames = useMemo(() => Object.keys(groupedAuthors).sort(), [groupedAuthors]);
  const currentAuthor = selectedAuthor || authorNames[0] || "";
  const currentAuthorProjects = groupedAuthors[currentAuthor] || [];
  const currentProjectId = selectedProjectId || currentAuthorProjects[0]?.id || "";

  /* ─── Admin Workspace (NEW domain consumption) ─── */
  const adminWorkspace = useAdminProjectWorkspace(currentProjectId || null);
  const adminWorkspaceData = adminWorkspace.data;

  const activeWorkspaceProject = adminWorkspaceData?.project ?? null;
  const activeProjectId = activeWorkspaceProject?.id ?? currentProjectId;

  /* ─── Active legacy project (bridge for data not yet in ViewModel) ─── */
  const activeProject = currentAuthorProjects.find((p) => p.id === currentProjectId) || currentAuthorProjects[0] || null;

  /* ─── Derived editorial journey (NEW) ─── */
  const editorialJourney: AdminEditorialJourneyModel | null = useMemo(() => {
    if (!activeProject) return null;
    return deriveAdminEditorialJourney({
      project: activeWorkspaceProject,
      progress: adminWorkspaceData?.progress ?? null,
      hasOpenReviews: adminWorkspaceData?.hasOpenReviews ?? false,
      legacyStatus: activeProject.status,
      hasRequest: requests.some((r) => r.manuscript_id === activeProject.manuscript_id || r.author_id === activeProject.author_id),
      hasProposal: !!activeWorkspaceProject?.proposalId,
    });
  }, [activeProject, activeWorkspaceProject, adminWorkspaceData, requests]);

  /* ─── Find linked request for this project (NEW bridge) ─── */
  const linkedRequest = useMemo(() => {
    if (!activeProject) return undefined;
    return requests.find(
      (r) => r.manuscript_id === activeProject.manuscript_id || r.author_id === activeProject.author_id
    );
  }, [activeProject, requests]);

  /* ─── Summary (legacy preserved) ─── */
  const summary = useMemo(() => {
    const safeProjects = Array.isArray(projects) ? projects : [];
    const safeRequests = Array.isArray(requests) ? requests : [];
    const activeProjects = safeProjects.filter((p) => p.status !== "completado").length;
    const completedProjects = safeProjects.filter((p) => p.status === "completado").length;
    const pendingRequests = safeRequests.filter(
      (r) => r.request.status === "pending" || r.request.status === "evaluating"
    ).length;
    const projectsTotal = safeProjects.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const pendingRequestsTotal = safeRequests
      .filter((r) => r.request.status === "pending" || r.request.status === "evaluating")
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    return { activeProjects, completedProjects, pendingRequests, totalAmount: projectsTotal + pendingRequestsTotal };
  }, [projects, requests]);

  /* ─── Data loader (legacy preserved exactly) ─── */
  const loadAllData = async () => {
    setIsDataLoading(true);
    setRequestsError(null);
    setProjectsError(null);
    const [requestsResult, projectsResult] = await Promise.allSettled([
      adminService.listQuotationRequests(),
      adminService.listAdminProjects(),
    ]);
    if (requestsResult.status === "fulfilled") {
      setRequests(Array.isArray(requestsResult.value) ? requestsResult.value : []);
    } else {
      const err = requestsResult.reason;
      console.error("Error loading admin requests:", err);
      const errMsg = err?.message || err?.hint || (typeof err === "object" && err !== null ? JSON.stringify(err) : String(err)) || "Error desconocido";
      setRequestsError(`Error al cargar cotizaciones: ${errMsg}`);
    }
    if (projectsResult.status === "fulfilled") {
      setProjects(Array.isArray(projectsResult.value) ? projectsResult.value : []);
    } else {
      const err = projectsResult.reason;
      console.error("Error loading admin projects:", err);
      const errMsg = err?.message || err?.hint || (typeof err === "object" && err !== null ? JSON.stringify(err) : String(err)) || "Error desconocido";
      setProjectsError(`Error al cargar proyectos: ${errMsg}`);
    }
    setIsDataLoading(false);
  };

  /* ─── Auth effect (legacy preserved exactly) ─── */
  useEffect(() => {
    let isMounted = true;
    async function verifyAccess() {
      try {
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError) {
          console.error("Session verification error:", sessionError);
          setRequestsError(`Error de sesión: ${sessionError.message}`);
          throw sessionError;
        }
        if (!session) {
          console.warn("No active session found in admin page.");
          if (isMounted) router.replace("/login");
          return;
        }
        const expiresAt = session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        if (!expiresAt || expiresAt - now < 60) {
          console.log("Admin session needs refresh/sync. Refreshing session...");
          const { error: refreshError } = await supabaseClient.auth.refreshSession();
          if (refreshError) {
            console.error("Failed to refresh admin session:", refreshError);
            setRequestsError(`Error de refresco de sesión: ${refreshError.message}`);
            throw refreshError;
          }
        }
        const user = await getUser();
        const role = getUserRole(user);
        if (!isMounted) return;
        if (user && role === "admin") {
          setIsAuthorized(true);
          setAdminUserId(user.id);
          await loadAllData();
        } else {
          console.warn("Unauthorized access attempt to admin page.", { email: user?.email, role });
          router.replace("/login");
        }
      } catch (err) {
        console.error("Error during admin access verification:", err);
        if (isMounted) router.replace("/login");
      } finally {
        if (isMounted) setIsChecking(false);
      }
    }
    verifyAccess();
    return () => { isMounted = false; };
  }, [router]);

  /* ─── ALL HANDLERS PRESERVED EXACTLY ─── */
  const handleCreateChapter = async (projectId: string, currentChaptersCount: number) => {
    const title = newChapterTitles[projectId]?.trim() || `Capítulo ${currentChaptersCount + 1}`;
    const wordCount = newChapterWords[projectId] || 3000;
    try {
      await adminService.createAdminChapter({ project_id: projectId, chapter_number: currentChaptersCount + 1, title, word_count: wordCount, status: "en_produccion" });
      await loadAllData();
      setNewChapterTitles((prev) => ({ ...prev, [projectId]: "" }));
      setNewChapterWords((prev) => ({ ...prev, [projectId]: 3000 }));
    } catch (error) {
      console.error("Error al crear capítulo:", error);
      alert("Ocurrió un error al crear el capítulo en la base de datos.");
    }
  };

  const handleUpdateChapterStatus = async (chapterId: string, status: "pendiente" | "cotizado" | "pagado" | "en_produccion" | "entregado") => {
    try { await adminService.updateChapterStatus(chapterId, status); await loadAllData(); } catch (error) { console.error("Error al actualizar capítulo:", error); }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (confirm("¿Seguro que deseas eliminar este capítulo de la base de datos?")) {
      try { await adminService.deleteChapter(chapterId); await loadAllData(); } catch (error) { console.error("Error al eliminar capítulo:", error); }
    }
  };

  const openQuotationRequest = async (request: QuotationRequest) => {
    setSelectedQuotationRequest(request);
    setSelectedQuotationBrief(null);
    setQuotationBriefError(null);
    setQuotationBriefLoading(true);

    try {
      const brief = await getProjectBrief(request.request.manuscriptId);
      setSelectedQuotationBrief(brief);
      if (!brief) {
        setQuotationBriefError("Esta solicitud no tiene un brief guardado para el manuscrito seleccionado.");
      }
    } catch (error) {
      console.error("Error loading quotation brief:", error);
      setQuotationBriefError(error instanceof Error ? error.message : "No se pudo cargar el brief de la solicitud.");
    } finally {
      setQuotationBriefLoading(false);
    }
  };

  const closeQuotationRequest = () => {
    setSelectedQuotationRequest(null);
    setSelectedQuotationBrief(null);
    setQuotationBriefLoading(false);
    setQuotationBriefError(null);
  };

  const handleDeleteQuote = async (id: string) => {
    if (confirm("¿Seguro que deseas eliminar esta solicitud de cotización?")) {
      try { await adminService.deleteQuotationRequest(id); await loadAllData(); } catch (error) { console.error(error); }
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("¿Seguro que deseas eliminar este proyecto y todos sus entregables de Supabase?")) {
      try { await adminService.deleteAdminProject(id); await loadAllData(); } catch (error: unknown) {
        console.error("Error al borrar proyecto:", error);
        alert("Ocurrió un error al intentar eliminar el proyecto: " + (error instanceof Error ? error.message : "Error de restricción o permisos en la base de datos."));
      }
    }
  };

  const handleProjectStatus = async (id: string, status: AdminProjectStatus) => {
    try { const updated = await adminService.updateProjectStatus(id, status); if (updated) await loadAllData(); } catch (error) { console.error(error); }
  };

  const handleUpdateMaxRevisions = async (id: string, increment: boolean, currentMax: number) => {
    const targetVal = increment ? currentMax + 1 : Math.max(0, currentMax - 1);
    try { const updated = await adminService.updateProjectMaxRevisions(id, targetVal); if (updated) await loadAllData(); } catch (error) { console.error(error); }
  };

  const handleUpdateBudget = async (id: string, currentAmount: number) => {
    const newAmountStr = prompt("Introduce el nuevo presupuesto total del proyecto ($ USD):", currentAmount.toString());
    if (newAmountStr === null) return;
    const newAmount = parseFloat(newAmountStr);
    if (isNaN(newAmount) || newAmount < 0) { alert("Por favor introduce un valor numérico válido."); return; }
    try { const updated = await adminService.updateProjectBudget(id, newAmount); if (updated) await loadAllData(); } catch (error) { console.error(error); }
  };

  const handleAddDeliverable = async (projectId: string) => {
    const title = newDeliverableTitles[projectId]?.trim();
    if (!title) return;
    const file = newDeliverableFiles[projectId];
    const url = newDeliverableUrls[projectId]?.trim() || undefined;
    try {
      if (file) { await uploadProjectDeliverableFile(projectId, title, file); }
      else { await adminService.addAudioDeliverable(projectId, title, url); }
      await loadAllData();
      setNewDeliverableTitles((prev) => ({ ...prev, [projectId]: "" }));
      setNewDeliverableUrls((prev) => ({ ...prev, [projectId]: "" }));
      setNewDeliverableFiles((prev) => ({ ...prev, [projectId]: null }));
    } catch (error) { console.error(error); }
  };

  const handleToggleDeliverable = async (projectId: string, deliverableId: string) => {
    try { const updated = await adminService.toggleAudioDeliverable(projectId, deliverableId); if (updated) await loadAllData(); } catch (error) { console.error(error); }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !selectedDeliverable || !replyText.trim()) return;
    try {
      const updated = await adminService.addDeliverableComment(selectedProject.id, selectedDeliverable.id, "admin", replyText.trim());
      if (updated) {
        await loadAllData();
        const freshProject = updated;
        const freshDeliverable = freshProject.deliverables.find((d) => d.id === selectedDeliverable.id) || null;
        setSelectedProject(freshProject);
        setSelectedDeliverable(freshDeliverable);
        setReplyText("");
      }
    } catch (error) { console.error(error); }
  };

  const openChatPanel = (project: AdminProject, deliverable: AudioDeliverable) => {
    setSelectedProject(project);
    setSelectedDeliverable(deliverable);
    setReplyText("");
  };

  const handleCreateProjectManually = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim() || !newProjClient.trim()) { alert("Por favor rellena el título de la obra y el nombre de autor."); return; }
    try {
      const created = await adminService.createAdminProject({ title: newProjTitle.trim(), client: newProjClient.trim(), status: newProjStatus, chapters: newProjChapters, amount: newProjAmount, maxRevisions: newProjMaxRevisions, revisionsUsed: 0 });
      await loadAllData();
      if (created) { setSelectedAuthor(created.client || newProjClient.trim()); setSelectedProjectId(created.id); }
      setNewProjTitle(""); setNewProjClient(""); setCreationSuccess(true);
      setTimeout(() => setCreationSuccess(false), 3500);
      setActiveTab("proyectos");
    } catch (error) { console.error(error); }
  };

  /* ─── Loading / Auth guards (preserved) ─── */
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent)] border-t-transparent" />
      </div>
    );
  }
  if (!isAuthorized) return null;

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-200 flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* ─── Hero Header ─── */}
          <motion.div {...fadeInUp} className="mb-8">
            <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-10">
              <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-premium)] to-[var(--color-accent)] opacity-60" />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Estudio Flamkit • Editor de Control</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    Supervisa y gestiona la conversión de manuscritos a obras cinemáticas. Configura límites de revisiones, sube archivos de sonido y responde en tiempo real al feedback de tus autores.
                  </p>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-accent-soft)] px-3.5 py-1.5 text-xs font-semibold text-[var(--color-accent)]">
                    <ShieldCheck className="h-4 w-4" />
                    Vista Operativa Admin
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── Quick Metrics ─── */}
          <motion.div {...fadeInUp} className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Proyectos Activos", value: summary.activeProjects, icon: BookOpen },
              { label: "Obras Completadas", value: summary.completedProjects, icon: CheckCircle2 },
              { label: "Nuevos Manuscritos", value: summary.pendingRequests, icon: Inbox },
              { label: "Valor de Cartera", value: `$${summary.totalAmount} USD`, icon: BarChart3 },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                  <kpi.icon className="h-4 w-4 text-[var(--color-accent)]" />{kpi.label}
                </div>
                <p className="mt-2 font-serif text-2xl font-semibold text-[var(--color-text)]">{kpi.value}</p>
              </div>
            ))}
          </motion.div>

          {/* ─── Alerts Banner (backed by real data) ─── */}
          {(summary.pendingRequests > 0 || (adminWorkspaceData?.hasOpenReviews)) && (
            <motion.div {...fadeInUp} className="mb-8 rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)] p-4 sm:p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-text)]">Atención Requerida</h4>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {summary.pendingRequests > 0 && adminWorkspaceData?.hasOpenReviews
                        ? `${summary.pendingRequests} solicitud(es) de cotización pendiente(s) y revisiones abiertas del autor.`
                        : summary.pendingRequests > 0
                        ? `${summary.pendingRequests} nueva(s) solicitud(es) de cotización esperando evaluación.`
                        : "El autor ha registrado nuevo feedback o revisiones abiertas en la obra."}
                    </p>
                  </div>
                </div>
                {summary.pendingRequests > 0 && activeTab !== "cotizaciones" && (
                  <button
                    onClick={() => setActiveTab("cotizaciones")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--color-accent-hover)] shrink-0 cursor-pointer"
                  >
                    Ver Cotizaciones <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ─── Tabs Navigation ─── */}
          <div className="mb-8 flex items-center gap-2 border-b border-[var(--color-border)] pb-1">
            {([
              { id: "proyectos", label: "Proyectos en Curso" },
              { id: "cotizaciones", label: "Cotizaciones" },
              { id: "soporte", label: "Soporte & Mensajería" },
              { id: "crear", label: "Registrar Obra" },
            ] as const).map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${activeTab === tab.id ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"}`}>
                {tab.label}
                {activeTab === tab.id && <motion.div layoutId="adminTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)]" />}
              </button>
            ))}
          </div>

          {/* ═════════════════════════════════════════════════════════
              TAB 1: PROYECTOS — NEW ADMIN EXPERIENCE
              ═════════════════════════════════════════════════════════ */}
          <AnimatePresence mode="wait">
            {activeTab === "proyectos" && (
              <motion.div key="proyectos" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-6">
                {projectsError && (
                  <div className="rounded-2xl border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] p-4 text-sm text-[var(--color-error)]">
                    <strong>Error al cargar proyectos de la base de datos</strong><p className="mt-1">{projectsError}</p>
                  </div>
                )}

                {projects.length === 0 ? (
                  <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-10 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                    <BookOpen className="mx-auto h-10 w-10 text-[var(--color-text-muted)]" />
                    <p className="mt-4 text-sm text-[var(--color-text-secondary)]">No se encontraron proyectos activos en este momento.</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">Crea un nuevo proyecto en la pestaña &quot;Registrar Obra&quot; o aprueba un manuscrito.</p>
                  </div>
                ) : (
                  <>
                    {/* Context Selectors */}
                    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-[var(--color-text-muted)]" />
                        <label className="text-sm font-medium text-[var(--color-text-secondary)]">Autor:</label>
                        <select value={currentAuthor} onChange={(e) => { setSelectedAuthor(e.target.value); setSelectedProjectId(""); }}
                          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]">
                          {authorNames.map((name) => (<option key={name} value={name}>{name}</option>))}
                        </select>
                      </div>
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-[var(--color-text-muted)]" />
                        <label className="text-sm font-medium text-[var(--color-text-secondary)]">Obra Activa:</label>
                        <select value={currentProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}
                          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]">
                          {currentAuthorProjects.map((p) => (<option key={p.id} value={p.id}>{p.title} ({statusLabels[p.status]})</option>))}
                        </select>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:ml-auto">
                        {currentAuthorProjects.map((p) => {
                          const isActive = p.id === currentProjectId;
                          return (
                            <button key={p.id} onClick={() => setSelectedProjectId(p.id)}
                              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${isActive ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]" : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/30"}`}>
                              {p.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* NEW ADMIN LAYOUT */}
                    {activeProject && (
                      <div className="space-y-6">
                        {/* 1. Header / Context */}
                        <AdminProjectHeader
                          workspaceProject={activeWorkspaceProject}
                          legacyProject={activeProject}
                          progress={adminWorkspaceData?.progress ?? null}
                          hasOpenReviews={adminWorkspaceData?.hasOpenReviews ?? false}
                          currentPhaseLabel={editorialJourney?.currentPhase ? statusLabels[activeProject.status] ?? "En curso" : "Sin obra seleccionada"}
                          onDeleteProject={() => handleDeleteProject(activeProjectId)}
                        />

                        {/* 2. Editorial Journey */}
                        <AdminEditorialJourneyView journey={editorialJourney} />

                        {/* 3. Next Action */}
                        <AdminNextActionCard journey={editorialJourney} hasOpenReviews={adminWorkspaceData?.hasOpenReviews ?? false} legacyStatus={activeProject.status} />

                        {/* 4. Three-column grid: Progress | Request/Proposal */}
                        <div className="grid gap-6 lg:grid-cols-3">
                          <AdminProgressPanel progress={adminWorkspaceData?.progress ?? null} legacyProgress={activeProject.progress} currentStageName={adminWorkspaceData?.progress?.currentStageId ? `Etapa ${adminWorkspaceData.progress.currentStageId.slice(0, 6)}…` : null} />
                          <div className="lg:col-span-2">
                            <AdminRequestProposalPanel request={linkedRequest} workspaceProject={activeWorkspaceProject} />
                          </div>
                        </div>

                        {/* 5. Chapters & Deliverables - Primary Consolidated View */}
                        <AdminChaptersDeliverablesPanel
                          chapters={activeProject.chapterList ?? []}
                          deliverables={activeProject.deliverables}
                          onToggleDeliverable={(deliverableId) => handleToggleDeliverable(activeProjectId, deliverableId)}
                          onOpenFeedback={(deliverable) => openChatPanel(activeProject, deliverable)}
                          onUpdateChapterStatus={(chapterId, newStatus) => handleUpdateChapterStatus(chapterId, newStatus)}
                          onDeleteChapter={(chapterId) => handleDeleteChapter(chapterId)}
                        />

                        {/* 6. Feedback / Review */}
                        <AdminFeedbackReviewPanel deliverables={activeProject.deliverables} hasOpenReviews={adminWorkspaceData?.hasOpenReviews ?? false} onOpenFeedback={(deliverable) => openChatPanel(activeProject, deliverable)} />

                        {/* ─── CONSOLIDATED OPERATIONAL ACTIONS ─── */}
                        <div className="grid gap-6 lg:grid-cols-3">
                          {/* Status & Limits Control */}
                          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
                            <h3 className="font-serif text-lg font-semibold text-[var(--color-text)]">Configuración de Obra</h3>
                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Ajusta el estado editorial, presupuesto y límite de revisiones sincronizado con Supabase.</p>
                            
                            <div className="mt-4 space-y-2">
                              {["analisis", "produccion", "revisiones", "completado"].map((st) => (
                                <button key={st} onClick={() => handleProjectStatus(activeProjectId, st as AdminProjectStatus)}
                                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-xs font-medium transition-all ${activeProject.status === st ? statusStyles[st as AdminProjectStatus] : "border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/20"}`}>
                                  <span>{statusLabels[st as AdminProjectStatus]}</span>{activeProject.status === st && <CheckCircle2 className="h-4 w-4" />}
                                </button>
                              ))}
                            </div>

                            <div className="mt-5 border-t border-[var(--color-border)] pt-4">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-[var(--color-text-secondary)]">Presupuesto</span>
                                <button onClick={() => handleUpdateBudget(activeProjectId, activeProject.amount || 0)} className="text-xs font-semibold text-[var(--color-accent)] hover:underline">Editar</button>
                              </div>
                              <p className="mt-1 font-serif text-xl font-semibold text-[var(--color-text)]">${activeProject.amount || 0} USD</p>
                            </div>

                            <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-[var(--color-text-secondary)]">Límite de Revisiones</span>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleUpdateMaxRevisions(activeProjectId, false, activeProject.maxRevisions)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]">-</button>
                                  <span className="w-6 text-center text-xs font-semibold">{activeProject.maxRevisions}</span>
                                  <button onClick={() => handleUpdateMaxRevisions(activeProjectId, true, activeProject.maxRevisions)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]">+</button>
                                </div>
                              </div>
                              <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">{activeProject.revisionsUsed} / {activeProject.maxRevisions} usadas</p>
                            </div>
                          </div>

                          {/* Add Chapter Action */}
                          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
                            <h3 className="font-serif text-lg font-semibold text-[var(--color-text)]">Añadir Nuevo Capítulo</h3>
                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Inserta un nuevo capítulo numerado al plan de producción del proyecto.</p>

                            <div className="mt-4 space-y-3">
                              <div>
                                <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">Título del capítulo</label>
                                <input type="text" placeholder="Ej: Capítulo I - La Revelación" value={newChapterTitles[activeProjectId] || ""} onChange={(e) => setNewChapterTitles((prev) => ({ ...prev, [activeProjectId]: e.target.value }))}
                                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">Conteo de palabras</label>
                                <input type="number" placeholder="Ej: 3500" value={newChapterWords[activeProjectId] || 3000} onChange={(e) => setNewChapterWords((prev) => ({ ...prev, [activeProjectId]: parseInt(e.target.value) || 0 }))}
                                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
                              </div>
                              <button onClick={() => handleCreateChapter(activeProjectId, activeProject.chapterList?.length || 0)}
                                className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] cursor-pointer">
                                <Plus className="h-4 w-4" /> Registrar Capítulo
                              </button>
                            </div>
                          </div>

                          {/* Upload Deliverable Audio */}
                          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
                            <h3 className="font-serif text-lg font-semibold text-[var(--color-text)]">Subir Archivo de Audio</h3>
                            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Publica entregables de audio o maquetas para que el autor las revise.</p>

                            <div className="mt-4 space-y-3">
                              <div>
                                <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">Título del entregable</label>
                                <input type="text" placeholder="Ej: Muestra Capítulo 1 (Audio)" value={newDeliverableTitles[activeProjectId] || ""} onChange={(e) => setNewDeliverableTitles((prev) => ({ ...prev, [activeProjectId]: e.target.value }))}
                                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2.5 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
                              </div>

                              <div>
                                <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">Archivo MP3/WAV o enlace</label>
                                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)]">
                                  <span className="truncate max-w-[180px]">{newDeliverableFiles[activeProjectId] ? newDeliverableFiles[activeProjectId]?.name : "Seleccionar audio..."}</span>
                                  <Upload className="h-4 w-4 text-[var(--color-accent)] shrink-0" />
                                  <input type="file" accept="audio/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setNewDeliverableFiles((prev) => ({ ...prev, [activeProjectId]: file })); if (!newDeliverableTitles[activeProjectId]) { setNewDeliverableTitles((prev) => ({ ...prev, [activeProjectId]: file.name })); } } }} />
                                </label>
                              </div>

                              <div>
                                <input type="text" placeholder="URL externa opcional (SoundCloud/Drive)" value={newDeliverableUrls[activeProjectId] || ""} onChange={(e) => setNewDeliverableUrls((prev) => ({ ...prev, [activeProjectId]: e.target.value }))}
                                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
                              </div>

                              <button onClick={() => handleAddDeliverable(activeProjectId)} className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] cursor-pointer">
                                <Plus className="h-4 w-4" /> Publicar Entregable
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* ═════════════════════════════════════════════════════════
                TAB 2: COTIZACIONES — Modularized Pipeline
                ═════════════════════════════════════════════════════════ */}
            {activeTab === "cotizaciones" && (
              <motion.div key="cotizaciones" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <AdminQuotationList
                  requests={requests}
                  isLoading={isDataLoading}
                  error={requestsError}
                  onOpenRequest={openQuotationRequest}
                  onDeleteRequest={handleDeleteQuote}
                />
              </motion.div>
            )}

            {/* ═════════════════════════════════════════════════════════
                TAB 3: SOPORTE & MENSAJERÍA
                ═════════════════════════════════════════════════════════ */}
            {activeTab === "soporte" && (
              <motion.div key="soporte" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <AdminSupportMessagingPanel adminUserId={adminUserId} />
              </motion.div>
            )}

            {/* ═════════════════════════════════════════════════════════
                TAB 4: CREAR — Legacy preserved, restyled
                ═════════════════════════════════════════════════════════ */}
            {activeTab === "crear" && (
              <motion.div key="crear" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="space-y-6">
                <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-10">
                  <h2 className="font-serif text-2xl font-semibold text-[var(--color-text)]">Registrar Nueva Obra Manualmente</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    Utiliza este formulario para dar de alta a un autor con el que ya has acordado un límite de revisiones y presupuesto, saltándote el paso de cotización previa.
                  </p>
                </div>

                {creationSuccess && (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-[var(--color-success)]/20 bg-[var(--color-success-soft)] p-4 text-sm text-[var(--color-success)]">
                    <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5" />¡Obra registrada exitosamente! Se ha añadido a la pestaña &quot;Proyectos en Curso&quot;.</div>
                  </motion.div>
                )}

                <form onSubmit={handleCreateProjectManually} className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8 lg:max-w-2xl">
                  <div className="space-y-5">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">Título de la obra</label>
                      <input type="text" value={newProjTitle} onChange={(e) => setNewProjTitle(e.target.value)} placeholder="Ej: El Último Arcano"
                        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-accent)]" required />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">Nombre del autor</label>
                      <input type="text" value={newProjClient} onChange={(e) => setNewProjClient(e.target.value)} placeholder="Ej: María González"
                        className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-accent)]" required />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">Estado inicial</label>
                        <select value={newProjStatus} onChange={(e) => setNewProjStatus(e.target.value as AdminProjectStatus)}
                          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]">
                          <option value="analisis">Análisis</option>
                          <option value="produccion">Producción</option>
                          <option value="revisiones">Revisiones</option>
                          <option value="completado">Completado</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">Capítulos estimados</label>
                        <input type="number" min={1} value={newProjChapters} onChange={(e) => setNewProjChapters(parseInt(e.target.value) || 1)}
                          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
                      </div>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">Presupuesto (USD)</label>
                        <input type="number" min={0} value={newProjAmount} onChange={(e) => setNewProjAmount(parseFloat(e.target.value) || 0)}
                          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">Revisiones incluidas</label>
                        <input type="number" min={0} value={newProjMaxRevisions} onChange={(e) => setNewProjMaxRevisions(parseInt(e.target.value) || 0)}
                          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)]" />
                      </div>
                    </div>
                    <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)] sm:w-auto cursor-pointer">
                      <Plus className="h-4 w-4" />Registrar Obra
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═════════════════════════════════════════════════════════
              QUOTATION REQUEST / BRIEF DETAIL MODAL
              ═════════════════════════════════════════════════════════ */}
          <AdminQuotationDetailModal
            isOpen={!!selectedQuotationRequest}
            request={selectedQuotationRequest}
            brief={selectedQuotationBrief}
            loadingBrief={quotationBriefLoading}
            briefError={quotationBriefError}
            onClose={closeQuotationRequest}
            onRequestUpdated={loadAllData}
          />

          {/* ═════════════════════════════════════════════════════════
              CHAT / FEEDBACK SLIDE-OVER (Legacy preserved, restyled)
              ═════════════════════════════════════════════════════════ */}
          <AnimatePresence>
            {selectedProject && selectedDeliverable && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setSelectedProject(null); setSelectedDeliverable(null); }} />
                <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-[var(--color-border)] bg-[var(--color-bg-elevated)] shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-[var(--color-text)]">{selectedDeliverable.title}</h3>
                      <p className="text-xs text-[var(--color-text-muted)]">Obra: {selectedProject.title}</p>
                    </div>
                    <button onClick={() => { setSelectedProject(null); setSelectedDeliverable(null); }} className="rounded-lg p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 space-y-4 overflow-y-auto p-6">
                    {selectedDeliverable.comments && selectedDeliverable.comments.length > 0 ? (
                      selectedDeliverable.comments.map((comment) => (
                        <div key={comment.id} className={`flex gap-3 ${comment.sender === "admin" ? "flex-row-reverse" : ""}`}>
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${comment.sender === "admin" ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]" : "bg-[var(--color-premium-soft)] text-[var(--color-premium)]"}`}>
                            {comment.sender === "admin" ? "A" : "U"}
                          </div>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${comment.sender === "admin" ? "bg-[var(--color-accent)] text-white" : "border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text)]"}`}>
                            <p>{comment.text}</p>
                            <p className={`mt-1 text-[10px] ${comment.sender === "admin" ? "text-white/60" : "text-[var(--color-text-muted)]"}`}>{comment.timestamp}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageCircle className="h-10 w-10 text-[var(--color-text-muted)]" />
                        <p className="mt-3 text-sm text-[var(--color-text-secondary)]">No hay mensajes de feedback para este entregable.</p>
                        <p className="mt-1 text-xs text-[var(--color-text-muted)]">Escribe el primer comentario para iniciar la conversación.</p>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSendComment} className="border-t border-[var(--color-border)] p-4">
                    <div className="flex items-center gap-3">
                      <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Escribe tu respuesta..."
                        className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-accent)]" />
                      <button type="submit" disabled={!replyText.trim()}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-40 cursor-pointer">
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </main>
  );

}