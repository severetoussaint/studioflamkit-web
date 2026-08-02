import type { ChapterCalculatorInput, ChapterCalculatorResult, ChapterTier } from '@/types/quotation';

const WORDS_PER_MINUTE = 155;
const PFH_RATE = 400; // USD por hora de audio terminado
const MIN_PRICE = 30; // piso mínimo para evitar precios irrisorios con conteos muy bajos

function getTier(wordCount: number): ChapterTier {
  if (wordCount <= 1500) return 'entrada';
  if (wordCount <= 4000) return 'intermedio';
  return 'completo';
}

export function calculateChapterPrice(input: ChapterCalculatorInput): ChapterCalculatorResult {
  const wordCount = Math.max(0, Math.round(input.wordCount));
  const durationMinutes = wordCount / WORDS_PER_MINUTE;
  const rawPrice = (durationMinutes / 60) * PFH_RATE;
  const price = Math.max(MIN_PRICE, Math.round(rawPrice * 100) / 100);

  return {
    wordCount,
    durationMinutes: Math.round(durationMinutes),
    price,
    currency: 'USD',
    tier: getTier(wordCount),
    pfhRate: PFH_RATE,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function getTierLabel(tier: ChapterTier): string {
  const labels: Record<ChapterTier, string> = {
    entrada: 'Entrada',
    intermedio: 'Intermedio',
    completo: 'Completo',
  };
  return labels[tier];
}