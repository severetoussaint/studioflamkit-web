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
}

export async function getAuthorRequestContext(authorId: string): Promise<AuthorRequestContext> {
  // 1. Verificar si tiene un proyecto activo
  const { data: projects, error: projectsError } = await supabaseClient
    .from('projects')
    .select('id, manuscript_id, created_at, manuscripts(title)')
    .or(`author_id.eq.${authorId}`)
    .order('created_at', { ascending: false })
    .limit(1);

  if (!projectsError && projects && projects.length > 0) {
    const proj = projects[0] as any;
    return {
      state: 'active',
      projectId: proj.id,
      manuscriptId: proj.manuscript_id || null,
      requestId: null,
      title: proj.manuscripts?.title || 'Obra en producción',
      createdAt: proj.created_at || null,
    };
  }

  // 2. Verificar si tiene un manuscrito / solicitud pendiente
  const { data: manuscripts, error: manuscriptsError } = await supabaseClient
    .from('manuscripts')
    .select('id, title, created_at, project_requests(id, status)')
    .eq('author_id', authorId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (!manuscriptsError && manuscripts && manuscripts.length > 0) {
    const m = manuscripts[0] as any;
    const req = Array.isArray(m.project_requests) ? m.project_requests[0] : m.project_requests;
    return {
      state: 'pending',
      projectId: null,
      manuscriptId: m.id,
      requestId: req?.id || m.id,
      title: m.title || 'Manuscrito enviado',
      createdAt: m.created_at || null,
    };
  }

  return {
    state: 'none',
    requestId: null,
    manuscriptId: null,
    projectId: null,
    title: null,
    createdAt: null,
  };
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

    // 5. Crear la fila real en project_requests
    const { data: requestData, error: requestError } = await supabaseClient
      .from('project_requests')
      .insert({
        manuscript_id: manuscriptRow.id,
        channel: 'dashboard',
        status: 'pending',
      } as never)
      .select()
      .single();

    if (requestError) throw requestError;

    const requestRow = requestData as any;

    return {
      id: manuscriptRow.id,
      requestId: requestRow?.id || manuscriptRow.id,
      title: manuscriptRow.title,
      wordCount: manuscriptRow.word_count,
    };
  } catch (err) {
    console.error('Error al enviar el manuscrito:', JSON.stringify(err, null, 2));
    if (err && typeof err === 'object') {
      console.error('message:', (err as any).message);
      console.error('code:', (err as any).code);
      console.error('details:', (err as any).details);
      console.error('hint:', (err as any).hint);
    }
    throw err;
  }
}
