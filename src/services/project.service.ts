import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { ProjectStatus } from '@/types/domain.types';
import { getProjectProgress, getProjectsProgress } from '@/services/production-stage.service';

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

export async function getProject(id: string): Promise<ProjectRow | null> {
  const { data, error } = await supabaseClient
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as ProjectRow | null;
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

export async function updateProjectStatus(id: string, status: ProjectStatus) {
  return updateProject(id, { status, updated_at: new Date().toISOString() });
}

export async function getProjectByManuscript(manuscriptId: string): Promise<ProjectRow | null> {
  const { data, error } = await supabaseClient
    .from('projects')
    .select('*')
    .eq('manuscript_id', manuscriptId)
    .maybeSingle();

  if (error) throw error;
  return data as ProjectRow | null;
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
  status: ProjectStatus;
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
  status?: ProjectStatus;
  updated_at?: string;
  manuscripts?: { id?: string; title?: string; word_count?: number; author_id?: string } | null;
  proposals?: { revisions_included?: number | null } | null;
  chapters?: AuthorProjectChapterRow[];
  deliverables?: AuthorProjectDeliverableRow[];
}

export async function getAuthorProjectData(authorId: string, manuscriptId?: string | null): Promise<AuthorProjectData | null> {
  try {
    let query = supabaseClient
      .from('projects')
      .select(`
        id,
        status,
        updated_at,
        manuscripts ( id, title, word_count, author_id ),
        proposals ( revisions_included ),
        chapters ( id, chapter_number, title, word_count, duration_minutes, pfh_rate_used, price, currency, tier, status ),
        deliverables ( id, title, status, created_at )
      `);

    if (manuscriptId) {
      query = query.eq('manuscript_id', manuscriptId);
    } else {
      const { data: userManuscripts } = await supabaseClient
        .from('manuscripts')
        .select('id')
        .eq('author_id', authorId);

      const manuscriptIds = ((userManuscripts as unknown as ManuscriptIdRow[]) || []).map((m) => m.id);

      if (manuscriptIds.length > 0) {
        query = query.or(`author_id.eq.${authorId},manuscript_id.in.(${manuscriptIds.join(',')})`);
      } else {
        query = query.eq('author_id', authorId);
      }
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
    const dbStatus: ProjectStatus = project.status ?? 'planning';

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

    const projectProgress = await getProjectProgress(project.id);

    return {
      id: project.id,
      title: project.manuscripts?.title ?? 'Tu Obra de Audio',
      status: dbStatus,
      maxRevisions: Math.max(0, project.proposals?.revisions_included ?? 0),
      revisionsUsed: 0,
      progress: projectProgress.percentage,
      chapters,
      deliverables,
    };
  } catch (err) {
    console.error('getAuthorProjectData unexpected error:', err);
    return null;
  }
}

export interface AuthorProjectOverview {
  id: string;
  manuscriptId: string | null;
  title: string | null;
  status: ProjectStatus | null;
  progress: number;
  createdAt: string | null;
}

interface DBProjectRow {
  id: string;
  status: ProjectStatus | null;
  created_at: string | null;
  manuscript_id: string | null;
  manuscripts: { id: string; title: string | null } | { id: string; title: string | null }[] | null;
  chapters: { status: string }[] | null;
}

export async function getAuthorProjectsList(authorId: string): Promise<AuthorProjectOverview[]> {
  try {
    const { data: userManuscripts } = await supabaseClient
      .from('manuscripts')
      .select('id')
      .eq('author_id', authorId);

    const manuscriptIds = (userManuscripts || []).map((m) => m.id);

    let query = supabaseClient
      .from('projects')
      .select(`
        id,
        status,
        created_at,
        manuscript_id,
        manuscripts ( id, title ),
        chapters ( status )
      `);

    if (manuscriptIds.length > 0) {
      query = query.or(`author_id.eq.${authorId},manuscript_id.in.(${manuscriptIds.join(',')})`);
    } else {
      query = query.eq('author_id', authorId);
    }

    const { data: projects, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('getAuthorProjectsList query error:', error);
      return [];
    }

    const typedProjects = (projects as unknown as DBProjectRow[]) || [];
    const projectProgress = await getProjectsProgress(typedProjects.map((project) => project.id));

    return typedProjects.map((project) => {
      const manuscriptData = Array.isArray(project.manuscripts)
        ? project.manuscripts[0]
        : project.manuscripts;
      const status = project.status ?? 'planning';
      const realProgress = projectProgress[project.id];

      return {
        id: project.id,
        manuscriptId: project.manuscript_id || null,
        title: manuscriptData?.title ?? 'Tu Obra de Audio',
        status,
        progress: realProgress?.percentage ?? 0,
        createdAt: project.created_at || null,
      };
    });
  } catch (err) {
    console.error('getAuthorProjectsList unexpected error:', err);
    return [];
  }
}
