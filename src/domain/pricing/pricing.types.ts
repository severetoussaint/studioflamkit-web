export type PricingCategory =
  | 'voice'
  | 'dialogue'
  | 'sound_design'
  | 'music'
  | 'mixing'
  | 'mastering'
  | 'delivery';

export type PricingModel =
  | 'included'
  | 'percent_of_base'
  | 'fixed'
  | 'per_unit'
  | 'per_finished_hour'
  | 'per_minute'
  | 'per_chapter'
  | 'per_actor';

export type PricingComplexity = 'standard' | 'medium' | 'high' | 'cinematic';

export interface PricingSettings {
  basePfhRateUsd: number;
  wordsPerMinute: number;
  minimumBasePriceUsd: number;
  baseWorkHoursPerAudioHour: number;
  maxTotalPriceMultiplier: number;
  complexityMultipliers: Record<PricingComplexity, number>;
  recommendedAdjustmentBounds: { min: number; max: number };
  version: string;
}

export interface PricingService {
  id: string;
  code: string;
  category: PricingCategory;
  name: string;
  description: string | null;
  pricingModel: PricingModel;
  priceValue: number;
  timeMinutes: number;
  unitLabel: string | null;
  defaultQuantity: number;
  minQuantity: number;
  maxQuantity: number | null;
  includedByDefault: boolean;
  active: boolean;
  customerVisible: boolean;
  sortOrder: number;
  dependencies: unknown[];
  metadata: Record<string, unknown>;
}

export interface PricingSelection {
  serviceCode: string;
  quantity?: number;
}

export interface PricingCalculationInput {
  wordCount: number;
  chapterCount?: number;
  complexity?: PricingComplexity;
  selections?: PricingSelection[];
  commercialAdjustment?: number;
}

export interface PricingCalculationLine {
  serviceCode: string;
  name: string;
  quantity: number;
  unitLabel: string | null;
  price: number;
  estimatedMinutes: number;
  pricingModel: PricingModel;
}

export interface PricingCalculationResult {
  wordCount: number;
  durationMinutes: number;
  basePrice: number;
  complexity: PricingComplexity;
  complexityMultiplier: number;
  serviceSubtotal: number;
  commercialAdjustment: number;
  recommendedPrice: number;
  finalPrice: number;
  estimatedWorkMinutes: number;
  lines: PricingCalculationLine[];
  currency: 'USD';
  pricingVersion: string;
}
