import { supabaseClient } from '@/lib/supabase/client';
import { calculateManuscriptPrice, calculateChapterPrice } from '@/features/quotations/utils/calculator';

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
  wordCount?: number;
  durationMinutes?: number;
  manuscript_id?: string;
  author_id?: string;
}

export interface AdminChapter {
  id: string;
  project_id: string;
  chapter_number: number;
  title: string;
  word_count: number;
  duration_minutes: number;
  pfh_rate_used: number;
  price: number;
  currency: string;
  tier: string;
  status: 'pendiente' | 'cotizado' | 'pagado' | 'en_produccion' | 'entregado';
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
  chapterList?: AdminChapter[];
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

interface QuotationRequestRow {
  id: string;
  status: string;
  created_at: string;
  manuscripts?: {
    id?: string;
    title?: string;
    word_count?: number;
    author_id?: string;
    authors?: {
      full_name?: string;
    } | null;
  } | null;
}

interface ChapterItemRow {
  id: string;
  chapter_number: number;
  title?: string;
  word_count?: number;
  duration_minutes?: number;
  pfh_rate_used?: number;
  price?: number;
  currency?: string;
  tier?: string;
  status?: string;
}

interface DeliverableItemRow {
  id: string;
  title: string;
  status: string;
  created_at?: string;
}

interface ProjectRow {
  id: string;
  status: string;
  updated_at: string;
  authors?: {
    full_name?: string;
  } | null;
  manuscripts?: {
    id?: string;
    title?: string;
    word_count?: number;
    author_id?: string;
    authors?: {
      full_name?: string;
    } | null;
  } | null;
  chapters?: ChapterItemRow[];
  deliverables?: DeliverableItemRow[];
}

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

  return ((data as unknown as QuotationRequestRow[]) ?? []).map((row) => {
    const wordCount = row.manuscripts?.word_count ?? 0;
    const amount = wordCount > 0 ? calculateManuscriptPrice(wordCount) : 0;
    const estimatedChapters = Math.max(1, Math.round(wordCount / 3000)) || 1;
    const durationMinutes = Math.round(wordCount / 155);

    return {
      id: row.id,
      client: row.manuscripts?.authors?.full_name ?? 'Autor desconocido',
      title: row.manuscripts?.title ?? 'Sin título',
      requestedAt: (row.created_at ?? '').slice(0, 10),
      status: dbRequestStatusToAdmin(row.status),
      chapters: estimatedChapters,
      amount,
      wordCount,
      durationMinutes,
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
    .or(`id.eq.${id},manuscript_id.eq.${id}`)
    .select(`
      id, status, created_at,
      manuscripts ( id, title, word_count, author_id, authors ( full_name ) )
    `)
    .maybeSingle();

  if (error) {
    console.error('updateQuotationRequestStatus error:', JSON.stringify(error));
    return undefined;
  }

  let row = data as unknown as QuotationRequestRow | null;

  if (!row) {
    const { data: fallbackData } = await supabaseClient
      .from('project_requests')
      .select(`
        id, status, created_at,
        manuscripts ( id, title, word_count, author_id, authors ( full_name ) )
      `)
      .or(`id.eq.${id},manuscript_id.eq.${id}`)
      .maybeSingle();

    if (!fallbackData) {
      console.warn(`updateQuotationRequestStatus: No request found with id/manuscript_id ${id}`);
      return undefined;
    }
    row = fallbackData as unknown as QuotationRequestRow;
  }

  const wordCount = row.manuscripts?.word_count ?? 0;
  const amount = wordCount > 0 ? calculateManuscriptPrice(wordCount) : 0;
  const estimatedChapters = Math.max(1, Math.round(wordCount / 3000)) || 1;
  const durationMinutes = Math.round(wordCount / 155);

  return {
    id: row.id,
    client: row.manuscripts?.authors?.full_name ?? 'Autor desconocido',
    title: row.manuscripts?.title ?? 'Sin título',
    requestedAt: (row.created_at ?? '').slice(0, 10),
    status,
    chapters: estimatedChapters,
    amount,
    wordCount,
    durationMinutes,
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
      chapters ( id, chapter_number, title, word_count, duration_minutes, pfh_rate_used, price, currency, tier, status ),
      deliverables ( id, title, status, created_at )
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('listAdminProjects error:', JSON.stringify(error));
    throw error;
  }

  console.log('listAdminProjects: Datos recibidos de Supabase:', data);

  return ((data as unknown as ProjectRow[]) ?? []).map((row) => {
    const adminStatus = dbStatusToAdmin(row.status);
    const deliverables: AudioDeliverable[] = (Array.isArray(row.deliverables) ? row.deliverables : []).map((d: DeliverableItemRow) => ({
      id: d.id,
      title: d.title,
      completed: d.status === 'approved',
      updatedAt: (d.created_at ?? '').slice(0, 10),
      comments: [],
    }));

    const rawChapters = (Array.isArray(row.chapters) ? row.chapters : []).sort((a: ChapterItemRow, b: ChapterItemRow) => a.chapter_number - b.chapter_number);
    const chapterList: AdminChapter[] = rawChapters.map((c: ChapterItemRow) => ({
      id: c.id,
      project_id: row.id,
      chapter_number: c.chapter_number,
      title: c.title || `Capítulo ${c.chapter_number}`,
      word_count: c.word_count || 0,
      duration_minutes: c.duration_minutes || Math.round((c.word_count || 0) / 155),
      pfh_rate_used: c.pfh_rate_used || 400,
      price: c.price || 0,
      currency: c.currency || 'USD',
      tier: c.tier || 'entrada',
      status: (c.status as AdminChapter['status']) || 'pendiente',
    }));

    const wordCount = row.manuscripts?.word_count ?? 0;
    const chaptersCount = chapterList.length || (wordCount > 0 ? Math.max(1, Math.round(wordCount / 3000)) : 1);
    const chapterPriceSum = chapterList.reduce((acc, c) => acc + (c.price || 0), 0);
    const totalAmount = chapterPriceSum > 0 ? chapterPriceSum : (wordCount > 0 ? calculateManuscriptPrice(wordCount) : 0);

    // Calcular avance real basado en el estado de cada capítulo si existen
    let progress = getProgressByStatus(adminStatus);
    if (chapterList.length > 0) {
      const weights: Record<string, number> = {
        pendiente: 0,
        cotizado: 20,
        pagado: 40,
        en_produccion: 75,
        entregado: 100,
      };
      const totalWeight = chapterList.reduce((acc, c) => acc + (weights[c.status] ?? 0), 0);
      progress = Math.round(totalWeight / chapterList.length);
    }

    return {
      id: row.id,
      title: row.manuscripts?.title ?? 'Sin título',
      client: row.authors?.full_name ?? 'Autor desconocido',
      status: adminStatus,
      progress,
      revisionsUsed: 0,
      maxRevisions: 3,
      chapters: chaptersCount,
      chapterList,
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
  let authorId = newProj.author_id;
  const manuscriptId = newProj.manuscript_id;

  if (manuscriptId && !authorId) {
    const { data: m } = await supabaseClient
      .from('manuscripts')
      .select('author_id')
      .eq('id', manuscriptId)
      .maybeSingle();
    if (m?.author_id) {
      authorId = m.author_id;
    }
  }

  if (authorId && manuscriptId) {
    const { data: projectRow, error: projectError } = await supabaseClient
      .from('projects')
      .insert({
        author_id: authorId,
        manuscript_id: manuscriptId,
        status: adminStatusToDb(newProj.status),
      } as never)
      .select('id')
      .maybeSingle();

    if (!projectError && projectRow) {
      createdProjectId = (projectRow as { id: string }).id;

      // Actualizar la solicitud en project_requests a 'accepted' para asegurar sincronización
      await supabaseClient
        .from('project_requests')
        .update({ status: 'accepted' })
        .eq('manuscript_id', manuscriptId);
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
  try {
    // 1. Obtener los IDs de entregables pertenecientes al proyecto
    const { data: deliverables } = await supabaseClient
      .from('deliverables')
      .select('id')
      .eq('project_id', id);

    const deliverableIds = (deliverables || []).map((d: { id: string }) => d.id);

    // 2. Eliminar revisiones/comentarios vinculados a los entregables
    if (deliverableIds.length > 0) {
      await supabaseClient
        .from('reviews')
        .delete()
        .in('deliverable_id', deliverableIds);
    }

    // 3. Eliminar entregables
    await supabaseClient
      .from('deliverables')
      .delete()
      .eq('project_id', id);

    // 4. Eliminar capítulos vinculados al proyecto
    await supabaseClient
      .from('chapters')
      .delete()
      .eq('project_id', id);

    // 5. Eliminar planes de pago
    await supabaseClient
      .from('payment_plans')
      .delete()
      .eq('project_id', id);

    // 6. Eliminar registros de archivos vinculados
    await supabaseClient
      .from('files')
      .delete()
      .eq('project_id', id);

    // 7. Eliminar la fila principal en la tabla de proyectos
    const { error } = await supabaseClient
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar proyecto en Supabase:', error);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('deleteAdminProject error:', err);
    throw err;
  }
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
  const newStatus = (current as { status?: string } | null)?.status === 'approved' ? 'pending' : 'approved';
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

// ─── CAPÍTULOS REALEZ (chapters en Supabase) ───────────────────────────────

export interface CreateChapterInput {
  project_id: string;
  chapter_number: number;
  title?: string;
  word_count: number;
  status?: 'pendiente' | 'cotizado' | 'pagado' | 'en_produccion' | 'entregado';
}

export async function createAdminChapter(input: CreateChapterInput): Promise<AdminChapter> {
  const calc = calculateChapterPrice({ wordCount: input.word_count });
  const { data, error } = await supabaseClient
    .from('chapters')
    .insert({
      project_id: input.project_id,
      chapter_number: input.chapter_number,
      title: input.title || `Capítulo ${input.chapter_number}`,
      word_count: calc.wordCount,
      duration_minutes: calc.durationMinutes,
      pfh_rate_used: calc.pfhRate,
      price: calc.price,
      currency: calc.currency,
      tier: calc.tier,
      status: input.status || 'pendiente',
    } as never)
    .select()
    .single();

  if (error) {
    console.error('createAdminChapter error:', error);
    throw error;
  }

  const row = data as ChapterItemRow & { id: string; project_id: string };
  return {
    id: row.id,
    project_id: row.project_id,
    chapter_number: row.chapter_number,
    title: row.title || `Capítulo ${row.chapter_number}`,
    word_count: row.word_count || 0,
    duration_minutes: row.duration_minutes || calc.durationMinutes,
    pfh_rate_used: row.pfh_rate_used || calc.pfhRate,
    price: row.price || calc.price,
    currency: row.currency || 'USD',
    tier: row.tier || calc.tier,
    status: (row.status as AdminChapter['status']) || 'pendiente',
  };
}

export async function updateChapterStatus(
  chapterId: string,
  status: 'pendiente' | 'cotizado' | 'pagado' | 'en_produccion' | 'entregado'
): Promise<boolean> {
  const { error } = await supabaseClient
    .from('chapters')
    .update({ status, updated_at: new Date().toISOString() } as never)
    .eq('id', chapterId);

  if (error) {
    console.error('updateChapterStatus error:', error);
    throw error;
  }
  return true;
}

export async function deleteChapter(chapterId: string): Promise<boolean> {
  const { error } = await supabaseClient
    .from('chapters')
    .delete()
    .eq('id', chapterId);

  if (error) {
    console.error('deleteChapter error:', error);
    throw error;
  }
  return true;
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
  createAdminChapter,
  updateChapterStatus,
  deleteChapter,
  addAudioDeliverable,
  toggleAudioDeliverable,
  addDeliverableComment,
  addProjectRevision,
};