export interface Chapter {
  id: string;
  project_id: string;
  chapter_number: number;
  title?: string;
  duration_seconds?: number;
  status?: 'pending' | 'ready' | 'review';
  created_at: string;
}

export interface AudioSample {
  id: string;
  chapter_id: string;
  url: string;
  duration_seconds?: number;
  created_at: string;
}

export interface Delivery {
  id: string;
  project_id: string;
  title: string;
  type: 'final' | 'sample' | 'review';
  url?: string;
  created_at: string;
}

export interface Audiobook {
  id: string;
  project_id: string;
  title: string;
  chapters: Chapter[];
  samples: AudioSample[];
  deliveries: Delivery[];
  created_at: string;
}
