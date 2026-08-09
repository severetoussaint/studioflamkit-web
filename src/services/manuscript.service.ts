import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export type ManuscriptRow = Database['public']['Tables']['manuscripts']['Row'];

export type AuthorRequestState = 'none' | 'pending' | 'active';

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

export interface ProductionStageRelation {
  id: string;
  name: string;
  status: string | null;
  order_index: number;
}

export interface ProjectRelation {
  id: string;
  status: string | null;
  production_stages?: ProductionStageRelation[] | null;
}

export interface ProjectRequestRelation {
  id: string;
  status: string | null;
}

export interface ManuscriptWithDetails {
  id: string;
  title: string;
  created_at: string | null;
  status: string | null;
  project_requests?: ProjectRequestRelation[] | null;
  projects?: ProjectRelation[] | null;
}

interface ProjectRecord {
  id: string;
  manuscript_id?: string | null;
  created_at?: string | null;
  manuscripts?: { title?: string | null } | null;
}

export async function getAuthorRequestContext(authorId: string, selectedManuscriptId?: string | null): Promise<AuthorRequestContext> {
  try {
    // 1. Obtener todos los manuscritos del autor
    const { data: authorManuscriptsData } = await supabaseClient
      .from('manuscripts')
      .select('id, title, created_at, status, project_requests(id, status), projects(id, status, production_stages(id, name, status, order_index))')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    const authorManuscripts = (authorManuscriptsData as unknown as ManuscriptWithDetails[]) || [];
    const manuscriptsList = authorManuscripts.map((m: ManuscriptWithDetails) => {
      const reqList = Array.isArray(m.project_requests)
        ? m.project_requests
        : m.project_requests
        ? [m.project_requests]
        : [];
      const projList = Array.isArray(m.projects)
        ? m.projects
        : m.projects
        ? [m.projects]
        : [];

      let resolvedStatus = 'evaluating';

      if (projList.length > 0) {
        const proj = projList[0];
        if (proj.status === 'completed') {
          resolvedStatus = 'completed';
        } else {
          const stages = Array.isArray(proj.production_stages) ? proj.production_stages : [];
          const activeStage = stages.find((s: ProductionStageRelation) => /active|activo|en_curso|en curso/i.test(s.status || ''));
          if (activeStage) {
            resolvedStatus = 'en_revision';
          } else {
            resolvedStatus = 'active';
          }
        }
      } else if (reqList.length > 0) {
        resolvedStatus = reqList[0].status || 'evaluating';
      } else if (m.status) {
        resolvedStatus = m.status;
      }

      return {
        id: m.id,
        title: m.title || 'Sin título',
        createdAt: m.created_at || null,
        requestStatus: resolvedStatus,
      };
    });

    // Encontrar el manuscrito activo según el id seleccionado
    let activeManuscript = authorManuscripts.find((m) => m.id === selectedManuscriptId);

    // Si no se proporcionó id o no se encontró, seleccionamos el primero con proyecto activo, o el primero de la lista
    if (!activeManuscript && authorManuscripts.length > 0) {
      activeManuscript = authorManuscripts.find((m) => {
        const projList = Array.isArray(m.projects) ? m.projects : m.projects ? [m.projects] : [];
        return projList.length > 0;
      }) || authorManuscripts[0];
    }

    if (!activeManuscript) {
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

    const projList = Array.isArray(activeManuscript.projects)
      ? activeManuscript.projects
      : activeManuscript.projects
      ? [activeManuscript.projects]
      : [];

    const reqList = Array.isArray(activeManuscript.project_requests)
      ? activeManuscript.project_requests
      : activeManuscript.project_requests
      ? [activeManuscript.project_requests]
      : [];

    if (projList.length > 0) {
      const activeProject = projList[0];
      return {
        state: 'active',
        projectId: activeProject.id,
        manuscriptId: activeManuscript.id,
        requestId: null,
        title: activeManuscript.title || 'Obra en producción',
        createdAt: activeManuscript.created_at || null,
        manuscripts: manuscriptsList,
      };
    } else {
      const pendingReq = reqList.find((r) => r.status === 'pending' || r.status === 'evaluating');
      return {
        state: 'pending',
        projectId: null,
        manuscriptId: activeManuscript.id,
        requestId: pendingReq?.id || activeManuscript.id,
        title: activeManuscript.title || 'Manuscrito enviado',
        createdAt: activeManuscript.created_at || null,
        manuscripts: manuscriptsList,
      };
    }
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
    // 1. Asegurar que exista la fila en la tabla authors para este authorId
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

    // 2. Generar un nombre de archivo puramente aleatorio o simple
    const extension = file.name.split('.').pop() || 'pdf';
    const path = `${authorId}/${Date.now()}.${extension}`;

    // 3. Subir archivo a Supabase Storage
    const { error: uploadError } = await supabaseClient.storage
      .from('manuscripts')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      console.warn('Advertencia al subir a Supabase Storage:', uploadError);
      // Continuamos con el registro en BD aun si el bucket requiere configuración previa
    }

    // 4. Crear la fila real en manuscripts
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

    // 5. Crear o recuperar la fila real en project_requests
    let requestRow: { id: string } | null = null;

    // Verificar primero si un trigger de base de datos o inserción previa ya creó la solicitud
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
        // Si hay error por concurrencia u otro motivo, reintentar la lectura
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
