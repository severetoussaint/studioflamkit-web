import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export type ManuscriptRow = Database['public']['Tables']['manuscripts']['Row'];
export type AuthorRequestState = 'none' | 'pending' | 'active' | 'rejected';

export interface AuthorRequestContext {
  state: AuthorRequestState;
  requestId: string | null;
  manuscriptId: string | null;
  projectId: string | null;
  title: string | null;
  createdAt: string | null;
  manuscripts: Array<{
    id: string;
    title: string;
    createdAt: string | null;
    requestStatus: string | null;
  }>;
}

type ManuscriptContextRow = Pick<ManuscriptRow, 'id' | 'title' | 'created_at' | 'status'>;
type RequestRow = Pick<Database['public']['Tables']['project_requests']['Row'], 'id' | 'manuscript_id' | 'status' | 'created_at'>;
type ProjectRow = Pick<Database['public']['Tables']['projects']['Row'], 'id' | 'manuscript_id' | 'status' | 'updated_at'>;

export async function getAuthorRequestContext(
  authorId: string,
  selectedManuscriptId?: string | null,
): Promise<AuthorRequestContext> {
  try {
    // Load manuscripts independently. A failure in a related table must never
    // make the author appear to have no manuscripts.
    const { data: manuscriptRows, error: manuscriptsError } = await supabaseClient
      .from('manuscripts')
      .select('id, title, created_at, status')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    if (manuscriptsError) throw manuscriptsError;

    const authorManuscripts = (manuscriptRows ?? []) as ManuscriptContextRow[];

    if (authorManuscripts.length === 0) {
      return {
        state: 'none',
        requestId: null,
        manuscriptId: null,
        projectId: null,
        title: null,
        createdAt: null,
        manuscripts: [],
      };
    }

    const manuscriptIds = authorManuscripts.map((manuscript) => manuscript.id);

    const [requestsResult, projectsResult] = await Promise.all([
      supabaseClient
        .from('project_requests')
        .select('id, manuscript_id, status, created_at')
        .in('manuscript_id', manuscriptIds)
        .order('created_at', { ascending: false }),
      supabaseClient
        .from('projects')
        .select('id, manuscript_id, status, updated_at')
        .in('manuscript_id', manuscriptIds)
        .order('updated_at', { ascending: false }),
    ]);

    if (requestsResult.error) {
      console.warn('No se pudieron cargar las solicitudes asociadas:', requestsResult.error);
    }
    if (projectsResult.error) {
      console.warn('No se pudieron cargar los proyectos asociados:', projectsResult.error);
    }

    const requests = (requestsResult.data ?? []) as RequestRow[];
    const projects = (projectsResult.data ?? []) as ProjectRow[];

    const requestsByManuscript = new Map<string, RequestRow>();
    for (const request of requests) {
      if (!requestsByManuscript.has(request.manuscript_id)) {
        requestsByManuscript.set(request.manuscript_id, request);
      }
    }

    const projectsByManuscript = new Map<string, ProjectRow>();
    for (const project of projects) {
      if (!projectsByManuscript.has(project.manuscript_id)) {
        projectsByManuscript.set(project.manuscript_id, project);
      }
    }

    const manuscriptsList = authorManuscripts.map((manuscript) => {
      const request = requestsByManuscript.get(manuscript.id) ?? null;
      const project = projectsByManuscript.get(manuscript.id) ?? null;

      let requestStatus = manuscript.status || 'evaluating';

      if (project) {
        requestStatus = project.status === 'completed' ? 'completed' : 'active';
      } else if (request?.status) {
        requestStatus = request.status;
      }

      return {
        id: manuscript.id,
        title: manuscript.title || 'Sin título',
        createdAt: manuscript.created_at || null,
        requestStatus,
      };
    });

    const activeManuscript =
      authorManuscripts.find((manuscript) => manuscript.id === selectedManuscriptId) ??
      authorManuscripts[0];

    const activeRequest = requestsByManuscript.get(activeManuscript.id) ?? null;
    const activeProject = projectsByManuscript.get(activeManuscript.id) ?? null;

    if (activeProject) {
      return {
        state: 'active',
        projectId: activeProject.id,
        manuscriptId: activeManuscript.id,
        requestId: activeRequest?.id ?? null,
        title: activeManuscript.title || 'Obra en producción',
        createdAt: activeManuscript.created_at || null,
        manuscripts: manuscriptsList,
      };
    }

    if (activeRequest?.status === 'rejected') {
      return {
        state: 'rejected',
        projectId: null,
        manuscriptId: activeManuscript.id,
        requestId: activeRequest.id,
        title: activeManuscript.title || 'Solicitud finalizada',
        createdAt: activeManuscript.created_at || null,
        manuscripts: manuscriptsList,
      };
    }

    return {
      state: 'pending',
      projectId: null,
      manuscriptId: activeManuscript.id,
      requestId: activeRequest?.id ?? activeManuscript.id,
      title: activeManuscript.title || 'Manuscrito enviado',
      createdAt: activeManuscript.created_at || null,
      manuscripts: manuscriptsList,
    };
  } catch (err) {
    console.error('Error en getAuthorRequestContext:', err);
    throw err;
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
