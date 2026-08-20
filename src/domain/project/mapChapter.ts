import type { Database } from '@/types/database.types';
import type { Chapter } from '@/types/domain.types';

type ChapterRow = Database['public']['Tables']['chapters']['Row'];

export function mapChapterRowToDomain(row: ChapterRow): Chapter {
  return {
    id: row.id,
    chapterNumber: row.chapter_number,
    title: row.title || `Capítulo ${row.chapter_number}`,
    wordCount: row.word_count || 0,
    durationMinutes: row.duration_minutes ?? Math.round((row.word_count || 0) / 155),
    price: row.price || 0,
    currency: row.currency || 'USD',
    tier: row.tier || 'entrada',
    status: row.status || 'pendiente',
  };
}
