import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export type ManuscriptRow = Database['public']['Tables']['manuscripts']['Row'];

export type AuthorRequestState = 'none' | 'pending' | 'active';

export interface AuthorManuscriptSummary {
  id: string;
  title: string;
  createdAt: string | null;
  requestId: string | null;
  requestStatus: string | null;
}

export interface AuthorRequestContext {
  state: AuthorRequestState;
  requestId: string | null;
  manuscriptId: string | null;
  projectId: string | null;
  title: string | null;
  createdAt: string | null;
  manuscripts: AuthorManuscriptSummary[];
  activeManuscriptId: string | null;
}

interface ManuscriptWithRequests {
  id: string;
  title: string;
  created_at?: string;
  project_requests?: Array<{ id: string; status: string }> | { id: string; status: string } | null;
}

interface ProjectRecord {
  id: string;
  manuscript_id?: string | null;
  created_at?: string | null;
  manuscripts?: { title?: string | null } | null;
}

function normalizeRequestList(
  projectRequests: ManuscriptWithRequests['project_requests']
): Array<{ id: string; status: string }> {
  if (Array.isArray(projectRequests)) return projectRequests;
  if (projectRequests) return [projectRequests];
  return [];
}

function summarizeManuscriptTitles(manuscripts: AuthorManuscriptSummary[]): string | null {
  const titles = manuscripts
    .map((m) => m.title?.trim())
    .filter((title): title is string => Boolean(title));

  if (titles.length === 0) return null;
  if (titles.length === 1) return titles[0];
  if (titles.length === 2) return `${titles[0]} · ${titles[1]}`;
  return `${titles[0]} · ${titles[1]} · +${titles.length - 2} más`;
}

function buildContextTitle(
  manuscripts: AuthorManuscriptSummary[],
  baseTitle: string | null,
  fallback: string
): string {
  const summary = summarizeManuscriptTitles(manuscripts);
  if (summary) return summary;
  return baseTitle || fallback;
}

export async function getAuthorRequestContext(authorId: string): Promise<AuthorRequestContext> {
  try {
    const { data: authorManuscriptsData } = await supabaseClient
      .from('manuscripts')
      .select('id, title, created_at, project_requests(id, status)')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    const authorManuscripts = (authorManuscriptsData as unknown as ManuscriptWithRequests[]) || [];
    const manuscriptIds = authorManuscripts.map((m) => m.id);

    const manuscripts: AuthorManuscriptSummary[] = authorManuscripts.map((m) => {
      const reqList = normalizeRequestList(m.project_requests);
      const latestReq = reqList[0] || null;

      return {
        id: m.id,
        title: m.title,
        createdAt: m.created_at || null,
        requestId: latestReq?.id || null,
        requestStatus: latestReq?.status || null,
      };
    });

    let activeProject: ProjectRecord | null = null;

    if (manuscriptIds.length > 0) {
      const { data: projs } = await supabaseClient
        .from('projects')
        .select('id, manuscript_id, created_at, manuscripts(title)')
        .or(`author_id.eq.${authorId},manuscript_id.in.(${manuscriptIds.join(',')})`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (projs && projs.length > 0) {
        activeProject = projs[0] as unknown as ProjectRecord;
      }
    } else {
      const { data: projs } = await supabaseClient
        .from('projects')
        .select('id, manuscript_id, created_at, manuscripts(title)')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (projs && projs.length > 0) {
        activeProject = projs[0] as unknown as ProjectRecord;
      }
    }

    if (activeProject) {
      const selectedManuscript =
        manuscripts.find((m) => m.id === activeProject?.manuscript_id) || manuscripts[0] || null;

      const baseTitle = activeProject.manuscripts?.title || selectedManuscript?.title || 'Obra en producción';

      return {
        state: 'active',
        projectId: activeProject.id,
        manuscriptId: activeProject.manuscript_id || selectedManuscript?.id || null,
        requestId: null,
        title: buildContextTitle(manuscripts, baseTitle, 'Obra en producción'),
        createdAt: activeProject.created_at || selectedManuscript?.createdAt || null,
        manuscripts,
        activeManuscriptId: activeProject.manuscript_id || selectedManuscript?.id || null,
      };
    }

    const pendingManuscript =
      manuscripts.find((m) => m.requestStatus === 'pending' || m.requestStatus === 'evaluating') ||
      manuscripts[0] ||
      null;

    if (pendingManuscript) {
      return {
        state: 'pending',
        projectId: null,
        manuscriptId: pendingManuscript.id,
        requestId: pendingManuscript.requestId || pendingManuscript.id,
        title: buildContextTitle(manuscripts, pendingManuscript.title || 'Manuscrito enviado', 'Manuscrito enviado'),
        createdAt: pendingManuscript.createdAt || null,
        manuscripts,
        activeManuscriptId: pendingManuscript.id,
      };
    }

    return {
      state: 'none',
      requestId: null,
      manuscriptId: null,
      projectId: null,
      title: null,
      createdAt: null,
      manuscripts,
      activeManuscriptId: null,
    };
  } catch (err) {
    console.error('Error en getAuthorRequestContext:', err);
    return {
      state: 'none',
      requestId: null,
      manuscriptId: null,
      projectId: null,
      title: null,
      createdAt: null,
      manuscripts: [],
      activeManuscriptId: null,
    };
  }
}

export async function getAuthorRequestState(authorId: string): Promise<AuthorRequestState> {
  const context = await getAuthorRequestContext(authorId);
  return context.state;
}

export interface SubmitManuscriptInput {
  authorId: string;
  title: string;
  wordCount: number;
  file: File;
}

export async function submitManuscript({ authorId, title, wordCount, file }: SubmitManuscriptInput) {
  try {
    const { data: userData } = await supabaseClient.auth.getUser();
    if (userData?.user) {
      const u = userData.user;
      await supabaseClient.from('authors').upsert(
        {
          id: authorId,
          email: u.email ?? '',
          full_name: (u.user_metadata?.full_name as string) ?? u.email ?? 'Autor',
        } as never,
        { onConflict: 'id' }
      );
    }

    const extension = file.name.split('.').pop() || 'pdf';
    const path = `${authorId}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabaseClient.storage
      .from('manuscripts')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      console.warn('Advertencia al subir a Supabase Storage:', uploadError);
    }

    const { data: manuscript, error: manuscriptError } = await supabaseClient
      .from('manuscripts')
      .insert({
        author_id: authorId,
        title,
        word_count: wordCount,
        status: 'submitted',
        original_file_path: path,
      } as never)
      .select()
      .single();

    if (manuscriptError) throw manuscriptError;

    const manuscriptRow = manuscript as ManuscriptRow;

    let requestRow: { id: string } | null = null;

    const { data: existingReq } = await supabaseClient
      .from('project_requests')
      .select('*')
      .eq('manuscript_id', manuscriptRow.id)
      .maybeSingle();

    if (existingReq) {
      requestRow = existingReq as { id: string };
    } else {
      const { data: requestData, error: requestError } = await supabaseClient
        .from('project_requests')
        .upsert(
          {
            manuscript_id: manuscriptRow.id,
            channel: 'dashboard',
            status: 'pending',
          } as never,
          { onConflict: 'manuscript_id' }
        )
        .select()
        .maybeSingle();

      if (requestError) {
        const { data: fallbackReq } = await supabaseClient
          .from('project_requests')
          .select('*')
          .eq('manuscript_id', manuscriptRow.id)
          .maybeSingle();

        if (fallbackReq) {
          requestRow = fallbackReq as { id: string };
        } else {
          throw requestError;
        }
      } else {
        requestRow = requestData as { id: string } | null;
      }
    }

    return {
      id: manuscriptRow.id,
      requestId: requestRow?.id || manuscriptRow.id,
      title: manuscriptRow.title,
      wordCount: manuscriptRow.word_count,
    };
  } catch (err) {
    console.error('Error al enviar el manuscrito:', JSON.stringify(err, null, 2));
    if (err && typeof err === 'object') {
      const e = err as Record<string, unknown>;
      console.error('message:', e.message);
      console.error('code:', e.code);
      console.error('details:', e.details);
      console.error('hint:', e.hint);
    }
    throw err;
  }
}