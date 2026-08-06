import { supabaseClient } from '@/lib/supabase/client';
import { calculateManuscriptPrice } from '@/features/quotations/utils/calculator';

// ─── Tipos (mismos nombres que antes para no tocar admin/page.tsx) ────────────

export type AdminProjectStatus = 'analisis' | 'produccion' | 'revisiones' | 'completado';
export type QuotationRequestStatus = 'pendiente' | 'aprobada' | 'en_revision';

export interface AudioDeliverableComment {
  id: string;
  sender: 'admin' | 'client';
  text: string;
  timestamp: string;
}

export interface AudioDeliverable {
  id: string;
  title: string;
  completed: boolean;
  updatedAt: string;
  audioUrl?: string;
  comments?: AudioDeliverableComment[];
}

export interface QuotationRequest {
  id: string;
  client: string;
  title: string;
  requestedAt: string;
  status: QuotationRequestStatus;
  chapters: number;
  amount: number;
  // IDs reales de Supabase (opcionales para compat hacia atras)
  manuscript_id?: string;
  author_id?: string;
}

export interface AdminProject {
  id: string;
  title: string;
  client: string;
  status: AdminProjectStatus;
  progress: number;
  revisionsUsed: number;
  maxRevisions: number;
  chapters: number;
  amount?: number;
  deliverables: AudioDeliverable[];
  lastUpdate: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dbStatusToAdmin(dbStatus: string | null): AdminProjectStatus {
  const map: Record<string, AdminProjectStatus> = {
    planning: 'analisis',
    production: 'produccion',
    review: 'revisiones',
    completed: 'completado',
    archived: 'completado',
  };
  return map[dbStatus ?? ''] ?? 'analisis';
}

function adminStatusToDb(status: AdminProjectStatus): string {
  const map: Record<AdminProjectStatus, string> = {
    analisis: 'planning',
    produccion: 'production',
    revisiones: 'review',
    completado: 'completed',
  };
  return map[status];
}

function getProgressByStatus(status: AdminProjectStatus): number {
  const map: Record<AdminProjectStatus, number> = {
    analisis: 25,
    produccion: 74,
    revisiones: 82,
    completado: 100,
  };
  return map[status];
}

function dbRequestStatusToAdmin(dbStatus: string | null): QuotationRequestStatus {
  const map: Record<string, QuotationRequestStatus> = {
    pending: 'pendiente',
    evaluating: 'en_revision',
    accepted: 'aprobada',
    rejected: 'aprobada',
    canceled: 'aprobada',
  };
  return map[dbStatus ?? ''] ?? 'pendiente';
}

function adminRequestStatusToDb(status: QuotationRequestStatus): string {
  const map: Record<QuotationRequestStatus, string> = {
    pendiente: 'pending',
    en_revision: 'evaluating',
    aprobada: 'accepted',
  };
  return map[status];
}

// ─── SOLICITUDES (project_requests + manuscripts + authors) ───────────────────

export async function listQuotationRequests(): Promise<QuotationRequest[]> {
  const { data, error } = await supabaseClient
    .from('project_requests')
    .select(`
      id,
      status,
      created_at,
      channel,
      manuscripts (
        id,
        title,
        word_count,
        author_id,
        authors ( full_name )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('listQuotationRequests error:', JSON.stringify(error));
    throw error;
  }

  return (data ?? []).map((row: any) => {
    const wordCount = row.manuscripts?.word_count ?? 0;
    const amount = wordCount > 0 ? calculateManuscriptPrice(wordCount) : 0;
    const estimatedChapters = Math.max(1, Math.round(wordCount / 3000)) || 1;

    return {
      id: row.id,
      client: row.manuscripts?.authors?.full_name ?? 'Autor desconocido',
      title: row.manuscripts?.title ?? 'Sin título',
      requestedAt: (row.created_at ?? '').slice(0, 10),
      status: dbRequestStatusToAdmin(row.status),
      chapters: estimatedChapters,
      amount,
      manuscript_id: row.manuscripts?.id,
      author_id: row.manuscripts?.author_id,
    };
  });
}

export async function updateQuotationRequestStatus(
  id: string,
  status: QuotationRequestStatus
): Promise<QuotationRequest | undefined> {
  const dbStatus = adminRequestStatusToDb(status);
  const { data, error } = await supabaseClient
    .from('project_requests')
    .update({ status: dbStatus })
    .eq('id', id)
    .select(`
      id, status, created_at,
      manuscripts ( id, title, word_count, author_id, authors ( full_name ) )
    `)
    .single();

  if (error) {
    console.error('updateQuotationRequestStatus error:', JSON.stringify(error));
    throw error;
  }

  const row = data as any;
  const wordCount = row.manuscripts?.word_count ?? 0;
  const amount = wordCount > 0 ? calculateManuscriptPrice(wordCount) : 0;
  const estimatedChapters = Math.max(1, Math.round(wordCount / 3000)) || 1;

  return {
    id: row.id,
    client: row.manuscripts?.authors?.full_name ?? 'Autor desconocido',
    title: row.manuscripts?.title ?? 'Sin título',
    requestedAt: (row.created_at ?? '').slice(0, 10),
    status,
    chapters: estimatedChapters,
    amount,
    manuscript_id: row.manuscripts?.id,
    author_id: row.manuscripts?.author_id,
  };
}

export async function addQuotationRequest(
  req: Omit<QuotationRequest, 'id' | 'requestedAt'>
): Promise<QuotationRequest> {
  console.warn('addQuotationRequest: operación no soportada en modo real');
  return { ...req, id: `rq-${Date.now()}`, requestedAt: new Date().toISOString().slice(0, 10) };
}

export async function deleteQuotationRequest(id: string): Promise<boolean> {
  const { error } = await supabaseClient
    .from('project_requests')
    .delete()
    .eq('id', id);
  if (error) {
    console.error('deleteQuotationRequest error:', JSON.stringify(error));
    return false;
  }
  return true;
}

// ─── PROYECTOS (projects + chapters + deliverables + reviews) ─────────────────

export async function listAdminProjects(): Promise<AdminProject[]> {
  const { data, error } = await supabaseClient
    .from('projects')
    .select(`
      id,
      status,
      updated_at,
      author_id,
      manuscript_id,
      authors ( full_name ),
      manuscripts ( title, word_count ),
      chapters ( id, price, word_count ),
      deliverables ( id, title, status, created_at )
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('listAdminProjects error:', JSON.stringify(error));
    throw error;
  }

  return (data ?? []).map((row: any) => {
    const adminStatus = dbStatusToAdmin(row.status);
    const deliverables: AudioDeliverable[] = (row.deliverables ?? []).map((d: any) => ({
      id: d.id,
      title: d.title,
      completed: d.status === 'approved',
      updatedAt: (d.created_at ?? '').slice(0, 10),
      comments: [],
    }));

    const wordCount = row.manuscripts?.word_count ?? 0;
    const chaptersCount = (row.chapters ?? []).length || (wordCount > 0 ? Math.max(1, Math.round(wordCount / 3000)) : 1);
    const chapterPriceSum = (row.chapters ?? []).reduce((acc: number, c: any) => acc + (c.price || 0), 0);
    const totalAmount = chapterPriceSum > 0 ? chapterPriceSum : (wordCount > 0 ? calculateManuscriptPrice(wordCount) : 0);

    return {
      id: row.id,
      title: row.manuscripts?.title ?? 'Sin título',
      client: row.authors?.full_name ?? 'Autor desconocido',
      status: adminStatus,
      progress: getProgressByStatus(adminStatus),
      revisionsUsed: 0,
      maxRevisions: 3,
      chapters: chaptersCount,
      amount: totalAmount,
      deliverables,
      lastUpdate: (row.updated_at ?? '').slice(0, 10),
    };
  });
}

export async function updateProjectStatus(
  id: string,
  status: AdminProjectStatus
): Promise<AdminProject | undefined> {
  const { error } = await supabaseClient
    .from('projects')
    .update({ status: adminStatusToDb(status) })
    .eq('id', id);

  if (error) {
    console.error('updateProjectStatus error:', JSON.stringify(error));
    throw error;
  }

  const projects = await listAdminProjects();
  return projects.find((p) => p.id === id);
}

export async function createAdminProject(
  newProj: Omit<AdminProject, 'id' | 'deliverables' | 'progress' | 'lastUpdate'> & {
    manuscript_id?: string;
    author_id?: string;
  }
): Promise<AdminProject> {
  let createdProjectId: string | undefined;

  if (newProj.author_id && newProj.manuscript_id) {
    const { data: projectRow, error: projectError } = await supabaseClient
      .from('projects')
      .insert({
        author_id: newProj.author_id,
        manuscript_id: newProj.manuscript_id,
        status: adminStatusToDb(newProj.status),
      } as never)
      .select('id')
      .single();

    if (!projectError && projectRow) {
      createdProjectId = (projectRow as { id: string }).id;
    } else if (projectError) {
      console.error('Error al crear proyecto en DB:', projectError);
    }
  }

  const projects = await listAdminProjects();
  const created = projects.find((p) => p.id === createdProjectId);
  if (created) return created;

  const stub: AdminProject = {
    ...newProj,
    id: createdProjectId ?? `proj-${Date.now()}`,
    progress: getProgressByStatus(newProj.status),
    deliverables: [],
    lastUpdate: new Date().toISOString().slice(0, 10),
  };
  return stub;
}

export async function deleteAdminProject(id: string): Promise<boolean> {
  const { error } = await supabaseClient.from('projects').delete().eq('id', id);
  if (error) {
    console.error('deleteAdminProject error:', JSON.stringify(error));
    return false;
  }
  return true;
}

export async function updateProjectMaxRevisions(
  id: string,
  maxRevisions: number
): Promise<AdminProject | undefined> {
  // maxRevisions no existe en DB todavia — pendiente Fase C (schema chapters)
  // Por ahora devolvemos el proyecto actual sin cambio persistente
  const projects = await listAdminProjects();
  const project = projects.find((p) => p.id === id);
  if (project) project.maxRevisions = Math.max(0, maxRevisions);
  return project;
}

export async function updateProjectBudget(
  id: string,
  amount: number
): Promise<AdminProject | undefined> {
  const projects = await listAdminProjects();
  const project = projects.find((p) => p.id === id);
  if (project) project.amount = Math.max(0, amount);
  return project;
}

export async function addProjectRevision(id: string): Promise<AdminProject | undefined> {
  return updateProjectStatus(id, 'revisiones');
}

// ─── ENTREGABLES (deliverables + reviews en Supabase) ────────────────────────

export async function addAudioDeliverable(
  id: string,
  title: string,
  audioUrl?: string
): Promise<AdminProject | undefined> {
  const { error } = await supabaseClient
    .from('deliverables')
    .insert({ project_id: id, title, storage_path: audioUrl ?? '', status: 'pending' } as never);
  if (error) {
    console.error('addAudioDeliverable error:', JSON.stringify(error));
    throw error;
  }
  const projects = await listAdminProjects();
  return projects.find((p) => p.id === id);
}

export async function toggleAudioDeliverable(
  id: string,
  deliverableId: string
): Promise<AdminProject | undefined> {
  const { data: current } = await supabaseClient
    .from('deliverables')
    .select('status')
    .eq('id', deliverableId)
    .single();
  const newStatus = (current as any)?.status === 'approved' ? 'pending' : 'approved';
  await supabaseClient.from('deliverables').update({ status: newStatus }).eq('id', deliverableId);
  const projects = await listAdminProjects();
  return projects.find((p) => p.id === id);
}

export async function addDeliverableComment(
  _projectId: string,
  deliverableId: string,
  sender: 'admin' | 'client',
  text: string
): Promise<AdminProject | undefined> {
  await supabaseClient
    .from('reviews')
    .insert({ deliverable_id: deliverableId, comment: text, status: 'open' } as never);
  const projects = await listAdminProjects();
  return projects.find((p) => p.id === _projectId);
}

// ─── Export del objeto adminService (mismo shape que antes) ──────────────────

export const adminService = {
  listQuotationRequests,
  updateQuotationRequestStatus,
  addQuotationRequest,
  deleteQuotationRequest,
  listAdminProjects,
  updateProjectStatus,
  updateProjectMaxRevisions,
  updateProjectBudget,
  createAdminProject,
  deleteAdminProject,
  addAudioDeliverable,
  toggleAudioDeliverable,
  addDeliverableComment,
  addProjectRevision,
};