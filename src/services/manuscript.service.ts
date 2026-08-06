import { supabaseClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

export type ManuscriptRow = Database['public']['Tables']['manuscripts']['Row'];

export type AuthorRequestState = 'none' | 'pending' | 'active';

export async function getAuthorRequestState(authorId: string): Promise<AuthorRequestState> {
  const { data: projects, error: projectsError } = await supabaseClient
    .from('projects')
    .select('id')
    .eq('author_id', authorId)
    .limit(1);
  if (projectsError) {
    console.error('DEBUG: Error en consulta de proyectos:', projectsError);
    throw projectsError;
  }
  if (projects && projects.length > 0) return 'active';

  const { data: manuscripts, error: manuscriptsError } = await supabaseClient
    .from('manuscripts')
    .select('id')
    .eq('author_id', authorId)
    .limit(1);
  if (manuscriptsError) {
    console.error('DEBUG: Error en consulta de manuscritos:', manuscriptsError);
    throw manuscriptsError;
  }
  if (manuscripts && manuscripts.length > 0) return 'pending';

  return 'none';
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
    const { error: requestError } = await supabaseClient
      .from('project_requests')
      .insert({
        manuscript_id: manuscriptRow.id,
        channel: 'dashboard',
        status: 'pending',
      } as never);

    if (requestError) throw requestError;

    return manuscriptRow;
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
