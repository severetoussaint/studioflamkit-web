import { supabaseClient } from '@/lib/supabase/client';
import { calculateManuscriptPrice, calculateChapterPrice } from '@/features/quotations/utils/calculator';
import { isProjectStatus } from '@/domain/project/projectStatus';
import { mapProjectRequestRowToDomain } from '@/domain/request/mapProjectRequest';
import { getProjectsProgress } from '@/services/production-stage.service';
import { createNotification } from '@/services/notification.service';
import { deleteProjectRequest } from '@/services/request.service';
import type { ProjectRequest, ProjectStatus } from '@/types/domain.types';

// ─── Tipos ──────────────────────────────────────────────────────────────────

export type AdminProjectStatus = 'analisis' | 'produccion' | 'revisiones' | 'completado';
export type QuotationRequestStatus = 'pendiente' | 'aprobada' | 'en_revision' | 'rechazada';

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
  request: ProjectRequest;
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
  author_id?: string;
  manuscript_id?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSupabaseError(error: unknown) {
  if (error && typeof error === 'object') {
    const e = error as {
      code?: string;
      message?: string;
      details?: string;
      hint?: string;
    };

    return {
      code: e.code ?? null,
      message: e.message ?? null,
      details: e.details ?? null,
      hint: e.hint ?? null,
    };
  }

  return {
    code: null,
    message: String(error),
    details: null,
    hint: null,
  };
}

export class SupabaseError extends Error {
  code: string;
  details: string | null;
  hint: string | null;
  constructor(pgError: { message: string; code: string; details: string | null; hint: string | null }) {
    super(pgError.message);
    this.name = 'SupabaseError';
    this.code = pgError.code;
    this.details = pgError.details;
    this.hint = pgError.hint;
  }
}

export function handleSupabaseError(error: unknown, contextMessage: string): never {
  const err = error as { code?: string; message?: string; details?: string | null; hint?: string | null } | null;
  const pgError = {
    code: err?.code || 'UNKNOWN',
    message: err?.message || 'Error desconocido',
    details: err?.details || null,
    hint: err?.hint || null,
  };
  console.error(`${contextMessage}:`, pgError);
  throw new SupabaseError(pgError);
}

export async function executeWithRetry<T>(queryFn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
  if (sessionError) {
    console.error('getSession error inside retry wrapper:', sessionError);
  } else if (session) {
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    if (expiresAt && (expiresAt - now < 10)) {
      console.log('Session is expired/about to expire inside retry wrapper. Refreshing session...');
      const { error: refreshError } = await supabaseClient.auth.refreshSession();
      if (refreshError) {
        console.error('refreshSession error:', refreshError);
      }
    }
  }

  try {
    return await queryFn();
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string } | null;
    const isClockSkew =
      err?.code === 'PGRST303' ||
      err?.message?.includes('JWT issued at future') ||
      (typeof error === 'object' && error !== null && JSON.stringify(error).includes('JWT issued at future'));

    if (isClockSkew && retries > 0) {
      console.warn(`PGRST303 detected: JWT issued at future. Retrying in ${delayMs}ms... (Retries left: ${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return executeWithRetry(queryFn, retries - 1, delayMs);
    }
    throw error;
  }
}

function dbStatusToAdmin(dbStatus: ProjectStatus | string | null): AdminProjectStatus {
  const map: Record<ProjectStatus, AdminProjectStatus> = {
    planning: 'analisis',
    production: 'produccion',
    review: 'revisiones',
    completed: 'completado',
    archived: 'completado',
  };
  return isProjectStatus(dbStatus) ? map[dbStatus] : 'analisis';
}

function adminStatusToDb(status: AdminProjectStatus): ProjectStatus {
  const map: Record<AdminProjectStatus, ProjectStatus> = {
    analisis: 'planning',
    produccion: 'production',
    revisiones: 'review',
    completado: 'completed',
  };
  return map[status];
}

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
  author_id?: string;
  manuscript_id?: string;
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
  return executeWithRetry(async () => {
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
      .in('status', ['pending', 'evaluating'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('listQuotationRequests error:', formatSupabaseError(error));
      throw error;
    }

    return ((data as unknown as QuotationRequestRow[]) ?? []).map((row) => {
      const request = mapProjectRequestRowToDomain({
        id: row.id,
        manuscript_id: row.manuscripts?.id ?? '',
        channel: null,
        status: row.status,
        created_at: row.created_at,
      });
      const wordCount = row.manuscripts?.word_count ?? 0;
      const amount = wordCount > 0 ? calculateManuscriptPrice(wordCount) : 0;
      const estimatedChapters = Math.max(1, Math.round(wordCount / 3000)) || 1;
      const durationMinutes = Math.round(wordCount / 155);

      return {
        id: request.id,
        client: row.manuscripts?.authors?.full_name ?? 'Autor desconocido',
        title: row.manuscripts?.title ?? 'Sin título',
        requestedAt: request.createdAt.slice(0, 10),
        status: request.status === 'evaluating' ? 'en_revision' : 'pendiente',
        request,
        chapters: estimatedChapters,
        amount,
        wordCount,
        durationMinutes,
        manuscript_id: request.manuscriptId,
        author_id: row.manuscripts?.author_id,
      };
    });
  });
}

export async function deleteQuotationRequest(id: string): Promise<boolean> {
  return executeWithRetry(async () => {
    return await deleteProjectRequest(id);
  });
}

export async function listAdminProjects(): Promise<AdminProject[]> {
  return executeWithRetry(async () => {
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
      handleSupabaseError(error, 'listAdminProjects error');
    }

    console.log('listAdminProjects: Datos recibidos de Supabase:', data);

    const rows = ((data as unknown as ProjectRow[]) ?? []);
    const projectProgress = await getProjectsProgress(rows.map((row) => row.id));

    return rows.map((row) => {
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

      const progress = projectProgress[row.id]?.percentage ?? 0;

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
        author_id: row.author_id,
        manuscript_id: row.manuscript_id,
      };
    });
  });
}

export async function updateProjectStatus(
  id: string,
  status: AdminProjectStatus
): Promise<AdminProject | undefined> {
  return executeWithRetry(async () => {
    const { error } = await supabaseClient
      .from('projects')
      .update({ status: adminStatusToDb(status) })
      .eq('id', id);

    if (error) {
      handleSupabaseError(error, 'updateProjectStatus error');
    }

    const projects = await listAdminProjects();
    const project = projects.find((p) => p.id === id);

    if (project?.author_id) {
      try {
        await createNotification({
          authorId: project.author_id,
          title: `Actualización de proyecto: ${project.title}`,
          message: `El estado de tu proyecto ha cambiado a "${status}".`,
          status: 'pending',
        });
      } catch (err) {
        console.warn('Failed to send status update notification:', err);
      }
    }

    return project;
  });
}

export async function createAdminProject(
  newProj: Omit<AdminProject, 'id' | 'deliverables' | 'progress' | 'lastUpdate'> & { title: string; client: string; }
): Promise<AdminProject | undefined> {
  return executeWithRetry(async () => {
    const manuscriptId = newProj.manuscript_id ?? null;
    const authorId = newProj.author_id ?? null;

    const { data, error } = await supabaseClient
      .from('projects')
      .insert({
        title: newProj.title,
        author_id: authorId,
        manuscript_id: manuscriptId,
        status: adminStatusToDb(newProj.status),
      } as never)
      .select('id, status, updated_at, author_id, manuscript_id, manuscripts(title, word_count), authors(full_name), chapters(id, chapter_number, title, word_count, duration_minutes, pfh_rate_used, price, currency, tier, status), deliverables(id, title, status, created_at)')
      .single();

    if (error) handleSupabaseError(error, 'createAdminProject error');

    if (!data) return undefined;

    const rows = [data as unknown as ProjectRow];
    const progress = (await getProjectsProgress(rows.map((row) => row.id)))[rows[0].id]?.percentage ?? 0;
    const row = rows[0];
    const wordCount = row.manuscripts?.word_count ?? 0;
    const chaptersCount = Array.isArray(row.chapters) && row.chapters.length > 0 ? row.chapters.length : Math.max(1, Math.round(wordCount / 3000));
    const deliverables: AudioDeliverable[] = (Array.isArray(row.deliverables) ? row.deliverables : []).map((d) => ({
      id: d.id,
      title: d.title,
      completed: d.status === 'approved',
      updatedAt: (d.created_at ?? '').slice(0, 10),
      comments: [],
    }));

    return {
      id: row.id,
      title: row.manuscripts?.title ?? newProj.title,
      client: row.authors?.full_name ?? newProj.client,
      status: dbStatusToAdmin(row.status),
      progress,
      revisionsUsed: newProj.revisionsUsed ?? 0,
      maxRevisions: newProj.maxRevisions ?? 3,
      chapters: chaptersCount,
      chapterList: [],
      amount: newProj.amount ?? 0,
      deliverables,
      lastUpdate: (row.updated_at ?? '').slice(0, 10),
      author_id: row.author_id,
      manuscript_id: row.manuscript_id,
    };
  });
}

export async function updateProjectMaxRevisions(id: string, maxRevisions: number): Promise<AdminProject | undefined> {
  return executeWithRetry(async () => {
    const { error } = await supabaseClient.from('projects').update({ max_revisions: Math.max(0, maxRevisions) } as never).eq('id', id);
    if (error) handleSupabaseError(error, 'updateProjectMaxRevisions error');
    return (await listAdminProjects()).find((p) => p.id === id);
  });
}

export async function updateProjectBudget(id: string, amount: number): Promise<AdminProject | undefined> {
  return executeWithRetry(async () => {
    const { error } = await supabaseClient.from('projects').update({ amount: Math.max(0, amount) } as never).eq('id', id);
    if (error) handleSupabaseError(error, 'updateProjectBudget error');
    return (await listAdminProjects()).find((p) => p.id === id);
  });
}

export async function deleteAdminProject(id: string): Promise<boolean> {
  return executeWithRetry(async () => {
    const { error } = await supabaseClient.from('projects').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleteAdminProject error');
    return true;
  });
}

export async function createAdminChapter(input: { project_id: string; chapter_number: number; title: string; word_count: number; status: AdminChapter['status'] }): Promise<AdminChapter | undefined> {
  return executeWithRetry(async () => {
    const durationMinutes = Math.round(input.word_count / 155);
    const { data, error } = await supabaseClient.from('chapters').insert({ ...input, duration_minutes: durationMinutes } as never).select('*').single();
    if (error) handleSupabaseError(error, 'createAdminChapter error');
    return data as AdminChapter | undefined;
  });
}

export async function updateChapterStatus(chapterId: string, status: AdminChapter['status']): Promise<boolean> {
  return executeWithRetry(async () => {
    const { error } = await supabaseClient.from('chapters').update({ status } as never).eq('id', chapterId);
    if (error) handleSupabaseError(error, 'updateChapterStatus error');
    return true;
  });
}

export async function deleteChapter(chapterId: string): Promise<boolean> {
  return executeWithRetry(async () => {
    const { error } = await supabaseClient.from('chapters').delete().eq('id', chapterId);
    if (error) handleSupabaseError(error, 'deleteChapter error');
    return true;
  });
}

export async function addAudioDeliverable(projectId: string, title: string, audioUrl?: string): Promise<AdminProject | undefined> {
  return executeWithRetry(async () => {
    const { error } = await supabaseClient.from('deliverables').insert({ project_id: projectId, title, status: 'draft', audio_url: audioUrl || null } as never);
    if (error) handleSupabaseError(error, 'addAudioDeliverable error');
    return (await listAdminProjects()).find((p) => p.id === projectId);
  });
}

export async function toggleAudioDeliverable(projectId: string, deliverableId: string): Promise<AdminProject | undefined> {
  return executeWithRetry(async () => {
    const project = (await listAdminProjects()).find((p) => p.id === projectId);
    const deliverable = project?.deliverables.find((d) => d.id === deliverableId);
    if (!deliverable) return undefined;
    const { error } = await supabaseClient.from('deliverables').update({ status: deliverable.completed ? 'draft' : 'approved' } as never).eq('id', deliverableId);
    if (error) handleSupabaseError(error, 'toggleAudioDeliverable error');
    return (await listAdminProjects()).find((p) => p.id === projectId);
  });
}

export async function addDeliverableComment(projectId: string, deliverableId: string, sender: 'admin' | 'client', text: string): Promise<AdminProject | undefined> {
  void projectId;
  void deliverableId;
  void sender;
  void text;
  return (await listAdminProjects()).find((p) => p.id === projectId);
}
