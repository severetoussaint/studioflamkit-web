import type { ProductionLevel, QuotationInput, QuotationResult } from '@/types/quotation';

const WORDS_PER_HOUR = 9000;
const BASE_RATE_PER_HOUR = 45;

const productionMultipliers: Record<ProductionLevel, number> = {
  basico: 1,
  estandar: 1.25,
  cinematografico: 1.6,
};

export function calculateQuotation(input: QuotationInput): QuotationResult {
  const safeWordCount = Math.max(0, input.wordCount);
  const safePageCount = Math.max(0, input.pageCount);
  const estimatedHours = safeWordCount / WORDS_PER_HOUR;
  const basePrice = estimatedHours * BASE_RATE_PER_HOUR;
  const multiplier = productionMultipliers[input.productionLevel] ?? 1;
  const totalCost = Math.round(basePrice * multiplier);

  return {
    estimatedHours: Number(estimatedHours.toFixed(2)),
    basePrice: Number(basePrice.toFixed(2)),
    totalCost,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function getProductionLabel(level: ProductionLevel): string {
  switch (level) {
    case 'basico':
      return 'Básico / Demo';
    case 'estandar':
      return 'Estándar';
    case 'cinematografico':
      return 'Cinematográfico';
    default:
      return 'Estándar';
  }
}
