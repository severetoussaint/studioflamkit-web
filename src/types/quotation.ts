export type ChapterTier = 'entrada' | 'intermedio' | 'completo';

export interface ChapterCalculatorInput {
  wordCount: number;
}

export interface ChapterCalculatorResult {
  wordCount: number;
  durationMinutes: number;
  price: number;
  currency: 'USD';
  tier: ChapterTier;
  pfhRate: number;
}