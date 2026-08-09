import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export type ProjectRow = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export type ManuscriptRow = Database['public']['Tables']['manuscripts']['Row'];
export type ManuscriptInsert = Database['public']['Tables']['manuscripts']['Insert'];
export type ManuscriptUpdate = Database['public']['Tables']['manuscripts']['Update'];

export async function listProjects() {
  const { data, error } = await supabaseClient.from('projects').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProjectRow[];
}

export async function createProject(input: ProjectInsert) {
  const { data, error } = await supabaseClient.from('projects').insert(input as never).select().single();
  if (error) throw error;
  return data as ProjectRow | null;
}

export async function updateProject(id: string, updates: ProjectUpdate) {
  const { data, error } = await supabaseClient.from('projects').update(updates as never).eq('id', id).select().single();
  if (error) throw error;
  return data as ProjectRow | null;
}

export async function updateProjectStatus(id: string, status: ProjectRow['status']) {
  return updateProject(id, { status, updated_at: new Date().toISOString() });
}

export async function listManuscriptsByAuthor(authorId: string) {
  const { data, error } = await supabaseClient.from('manuscripts').select('*').eq('author_id', authorId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ManuscriptRow[];
}

export async function createManuscript(input: ManuscriptInsert) {
  const { data, error } = await supabaseClient.from('manuscripts').insert(input as never).select().single();
  if (error) throw error;
  return data as ManuscriptRow | null;
}

export async function updateManuscript(id: string, updates: ManuscriptUpdate) {
  const { data, error } = await supabaseClient.from('manuscripts').update(updates as never).eq('id', id).select().single();
  if (error) throw error;
  return data as ManuscriptRow | null;
}

export interface AuthorChapterData {
  id: string;
  chapter_number: number;
  title: string;
  word_count: number;
  duration_minutes: number;
  price: number;
  currency: string;
  tier: string;
  status: 'pendiente' | 'cotizado' | 'pagado' | 'en_produccion' | 'entregado';
}

export interface AuthorProjectData {
  id: string;
  title: string;
  status: string;
  maxRevisions: number;
  revisionsUsed: number;
  progress: number;
  chapters: AuthorChapterData[];
  deliverables: {
    id: string;
    title: string;
    completed: boolean;
    createdAt: string;
  }[];
}

interface ManuscriptIdRow {
  id: string;
}

interface AuthorProjectChapterRow {
  id: string;
  chapter_number: number;
  title?: string;
  word_count?: number;
  duration_minutes?: number;
  price?: number;
  currency?: string;
  tier?: string;
  status?: string;
}

interface AuthorProjectDeliverableRow {
  id: string;
  title: string;
  status?: string;
  created_at?: string;
}

interface AuthorProjectQueryResult {
  id: string;
  status?: string;
  updated_at?: string;
  manuscripts?: { id?: string; title?: string; word_count?: number; author_id?: string } | null;
  chapters?: AuthorProjectChapterRow[];
  deliverables?: AuthorProjectDeliverableRow[];
}

export async function getAuthorProjectData(authorId: string): Promise<AuthorProjectData | null> {
  try {
    // 1. Obtener manuscritos vinculados al autor
    const { data: userManuscripts } = await supabaseClient
      .from('manuscripts')
      .select('id')
      .eq('author_id', authorId);

    const manuscriptIds = ((userManuscripts as unknown as ManuscriptIdRow[]) || []).map((m) => m.id);

    // 2. Filtrar proyectos por author_id o manuscript_id (ambas columnas directas de projects)
    let query = supabaseClient
      .from('projects')
      .select(`
        id,
        status,
        updated_at,
        manuscripts ( id, title, word_count, author_id ),
        chapters ( id, chapter_number, title, word_count, duration_minutes, pfh_rate_used, price, currency, tier, status ),
        deliverables ( id, title, status, created_at )
      `);

    if (manuscriptIds.length > 0) {
      query = query.or(`author_id.eq.${authorId},manuscript_id.in.(${manuscriptIds.join(',')})`);
    } else {
      query = query.eq('author_id', authorId);
    }

    const { data: projects, error } = await query
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('getAuthorProjectData query error:', error);
      return null;
    }

    if (!projects || projects.length === 0) {
      return null;
    }

    const project = projects[0] as unknown as AuthorProjectQueryResult;
    const dbStatus = project.status ?? 'planning';

    const dbChapters = (project.chapters ?? []).sort((a, b) => a.chapter_number - b.chapter_number);

    const chapters: AuthorChapterData[] = dbChapters.map((c) => ({
      id: c.id,
      chapter_number: c.chapter_number,
      title: c.title || `Capítulo ${c.chapter_number}`,
      word_count: c.word_count || 0,
      duration_minutes: c.duration_minutes || Math.round((c.word_count || 0) / 155),
      price: c.price || 0,
      currency: c.currency || 'USD',
      tier: c.tier || 'entrada',
      status: (c.status as AuthorChapterData['status']) || 'pendiente',
    }));

    const deliverables = (project.deliverables ?? []).map((d) => ({
      id: d.id,
      title: d.title,
      completed: d.status === 'approved',
      createdAt: (d.created_at ?? '').slice(0, 10),
    }));

    // Progreso general real derivado del estado de los capítulos o estado de la obra
    let progress = 25;
    if (chapters.length > 0) {
      const weights: Record<string, number> = {
        pendiente: 0,
        cotizado: 20,
        pagado: 40,
        en_produccion: 75,
        entregado: 100,
      };
      const sum = chapters.reduce((acc, c) => acc + (weights[c.status] ?? 0), 0);
      progress = Math.round(sum / chapters.length);
    } else {
      const statusMap: Record<string, number> = {
        planning: 25,
        production: 60,
        review: 85,
        completed: 100,
      };
      progress = statusMap[dbStatus] ?? 25;
    }

    return {
      id: project.id,
      title: project.manuscripts?.title ?? 'Tu Obra de Audio',
      status: dbStatus,
      maxRevisions: 3,
      revisionsUsed: 0,
      progress,
      chapters,
      deliverables,
    };
  } catch (err) {
    console.error('getAuthorProjectData unexpected error:', err);
    return null;
  }
}
