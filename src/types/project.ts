export type ProjectStatus = 'analisis' | 'produccion' | 'revisiones' | 'completado';

export interface Project {
  id: string;
  title: string;
  author_id?: string;
  client_id?: string;
  status: ProjectStatus;
  word_count?: number;
  page_count?: number;
  created_at: string;
  updated_at: string;
}
