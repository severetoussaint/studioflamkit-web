export type ProductionLevel = 'basico' | 'estandar' | 'cinematografico';

export interface QuotationInput {
  wordCount: number;
  pageCount: number;
  productionLevel: ProductionLevel;
}

export interface QuotationResult {
  estimatedHours: number;
  basePrice: number;
  totalCost: number;
}
