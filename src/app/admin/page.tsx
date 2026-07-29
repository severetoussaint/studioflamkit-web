'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  adminService,
  type AdminProject,
  type AdminProjectStatus,
  type QuotationRequest,
  type QuotationRequestStatus,
} from '@/services/admin.service';
import { getUser, getUserRole } from '@/services/auth.service';

const statusLabels: Record<AdminProjectStatus, string> = {
  analisis: 'Análisis',
  produccion: 'Producción',
  revisiones: 'Revisiones',
  completado: 'Completado',
};

const quotationStatusLabels: Record<QuotationRequestStatus, string> = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  en_revision: 'En revisión',
};

const statusStyles: Record<AdminProjectStatus, string> = {
  analisis: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  produccion: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  revisiones: 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-200',
  completado: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
};

export default function AdminPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<QuotationRequest[]>(() => adminService.listQuotationRequests());
  const [projects, setProjects] = useState<AdminProject[]>(() => adminService.listAdminProjects());
  const [deliverableTitle, setDeliverableTitle] = useState<string>('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function verifyAccess() {
      try {
        const user = await getUser();
        const role = getUserRole(user);

        if (!isMounted) {
          return;
        }

        if (user && role === 'admin') {
          setIsAuthorized(true);
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
    const inRevision = requests.filter((request) => request.status === 'en_revision').length;

    return {
      activeProjects,
      completedProjects,
      pendingRequests,
      inRevision,
    };
  }, [projects, requests]);

  const handleQuotationStatus = (id: string, status: QuotationRequestStatus) => {
    const updated = adminService.updateQuotationRequestStatus(id, status);
    if (!updated) {
      return;
    }

    setRequests((current) => current.map((request) => (request.id === id ? updated : request)));
  };

  const handleProjectStatus = (id: string, status: AdminProjectStatus) => {
    const updated = adminService.updateProjectStatus(id, status);
    if (!updated) {
      return;
    }

    setProjects((current) => current.map((project) => (project.id === id ? updated : project)));
  };

  const handleRevision = (id: string) => {
    const updated = adminService.addProjectRevision(id);
    if (!updated) {
      return;
    }

    setProjects((current) => current.map((project) => (project.id === id ? updated : project)));
  };

  const handleDeliverable = (id: string) => {
    if (!deliverableTitle.trim()) {
      return;
    }

    const updated = adminService.addAudioDeliverable(id, deliverableTitle.trim());
    if (!updated) {
      return;
    }

    setProjects((current) => current.map((project) => (project.id === id ? updated : project)));
    setDeliverableTitle('');
  };

  const toggleDeliverable = (projectId: string, deliverableId: string) => {
    const updated = adminService.toggleAudioDeliverable(projectId, deliverableId);
    if (!updated) {
      return;
    }

    setProjects((current) => current.map((project) => (project.id === projectId ? updated : project)));
  };

  if (isChecking) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_25%),linear-gradient(135deg,_#09090b_0%,_#111827_50%,_#030712_100%)] text-stone-100">
        <Navbar />
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <Card className="border-stone-800/80 bg-stone-950/80">
            <p className="text-sm text-stone-400">Verificando acceso...</p>
          </Card>
        </section>
        <Footer />
      </main>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_25%),linear-gradient(135deg,_#09090b_0%,_#111827_50%,_#030712_100%)] text-stone-100">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.32em] text-amber-400">Administración interna</p>
          <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Panel de control editorial y producción</h1>
          <p className="mt-5 text-lg leading-8 text-stone-300">
            Supervisa solicitudes, gestiona proyectos en producción y controla revisiones y entregables desde un único panel.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-4">
          <Card className="border-stone-800/80 bg-stone-950/80">
            <p className="text-sm text-stone-400">Proyectos activos</p>
            <p className="mt-3 text-3xl font-semibold text-white">{summary.activeProjects}</p>
          </Card>
          <Card className="border-stone-800/80 bg-stone-950/80">
            <p className="text-sm text-stone-400">Completados</p>
            <p className="mt-3 text-3xl font-semibold text-white">{summary.completedProjects}</p>
          </Card>
          <Card className="border-stone-800/80 bg-stone-950/80">
            <p className="text-sm text-stone-400">Solicitudes pendientes</p>
            <p className="mt-3 text-3xl font-semibold text-white">{summary.pendingRequests}</p>
          </Card>
          <Card className="border-stone-800/80 bg-stone-950/80">
            <p className="text-sm text-stone-400">En revisión</p>
            <p className="mt-3 text-3xl font-semibold text-white">{summary.inRevision}</p>
          </Card>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card title="Solicitudes de cotización" description="Aprueba, rechaza o reenvía solicitudes para mantener el pipeline ordenado." className="border-stone-800/80 bg-stone-950/80">
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-white">{request.title}</p>
                      <p className="mt-1 text-sm text-stone-400">{request.client} • {request.chapters} capítulos • ${request.amount}</p>
                    </div>
                    <span className="rounded-full border border-stone-700 px-3 py-1 text-xs uppercase tracking-[0.24em] text-stone-300">
                      {quotationStatusLabels[request.status]}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="primary" onClick={() => handleQuotationStatus(request.id, 'aprobada')}>
                      Aprobar
                    </Button>
                    <Button variant="secondary" onClick={() => handleQuotationStatus(request.id, 'en_revision')}>
                      Revisar
                    </Button>
                    <Button variant="ghost" onClick={() => handleQuotationStatus(request.id, 'pendiente')}>
                      Pendiente
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Gestión de proyectos en producción" description="Cambiar estados, controlar revisiones y actualizar entregables de audio." className="border-stone-800/80 bg-stone-950/80">
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="rounded-2xl border border-stone-800 bg-stone-900/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-white">{project.title}</p>
                      <p className="mt-1 text-sm text-stone-400">{project.client} • {project.chapters} capítulos</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.24em] ${statusStyles[project.status]}`}>
                      {statusLabels[project.status]}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="primary" onClick={() => handleProjectStatus(project.id, 'analisis')}>
                      Análisis
                    </Button>
                    <Button variant="secondary" onClick={() => handleProjectStatus(project.id, 'produccion')}>
                      Producción
                    </Button>
                    <Button variant="ghost" onClick={() => handleProjectStatus(project.id, 'revisiones')}>
                      Revisiones
                    </Button>
                    <Button variant="ghost" onClick={() => handleProjectStatus(project.id, 'completado')}>
                      Completar
                    </Button>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-2xl border border-stone-800 bg-stone-950/70 p-3">
                    <div>
                      <p className="text-sm text-stone-400">Revisiones</p>
                      <p className="text-white">{project.revisionsUsed}/{project.maxRevisions}</p>
                    </div>
                    <Button variant="secondary" onClick={() => handleRevision(project.id)}>
                      Añadir revisión
                    </Button>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <input
                        value={deliverableTitle}
                        onChange={(event) => setDeliverableTitle(event.target.value)}
                        className="flex-1 rounded-full border border-stone-700 bg-stone-950/70 px-4 py-2 text-sm text-white outline-none"
                        placeholder="Nuevo entregable"
                      />
                      <Button variant="primary" onClick={() => handleDeliverable(project.id)}>
                        Añadir
                      </Button>
                    </div>

                    <ul className="mt-3 space-y-2 text-sm text-stone-300">
                      {project.deliverables.map((deliverable) => (
                        <li key={deliverable.id} className="flex items-center justify-between rounded-2xl border border-stone-800 bg-stone-950/70 px-3 py-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={deliverable.completed}
                              onChange={() => toggleDeliverable(project.id, deliverable.id)}
                              className="h-4 w-4 rounded border-stone-700 bg-stone-900"
                            />
                            <span className={deliverable.completed ? 'text-stone-500 line-through' : 'text-stone-200'}>
                              {deliverable.title}
                            </span>
                          </label>
                          <span className="text-xs text-stone-500">{deliverable.updatedAt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}
