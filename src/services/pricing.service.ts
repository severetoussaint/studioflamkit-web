import { supabaseClient } from '@/lib/supabase/client';
import type { PricingService, PricingSettings } from '@/domain/pricing/pricing.types';

interface PricingSettingRow {
  key: string;
  numeric_value: number | null;
  text_value: string | null;
  json_value: unknown;
}

interface PricingServiceRow {
  id: string;
  code: string;
  category: PricingService['category'];
  name: string;
  description: string | null;
  pricing_model: PricingService['pricingModel'];
  price_value: number;
  time_minutes: number;
  unit_label: string | null;
  default_quantity: number;
  min_quantity: number;
  max_quantity: number | null;
  included_by_default: boolean;
  active: boolean;
  customer_visible: boolean;
  sort_order: number;
  dependencies: unknown;
  metadata: unknown;
}

const pricingDb = supabaseClient as typeof supabaseClient & {
  from: (table: string) => ReturnType<typeof supabaseClient.from>;
};

function parseComplexityMultipliers(value: unknown): PricingSettings['complexityMultipliers'] {
  const candidate = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    standard: Number(candidate.standard ?? 1),
    medium: Number(candidate.medium ?? 1.1),
    high: Number(candidate.high ?? 1.2),
    cinematic: Number(candidate.cinematic ?? 1.35),
  };
}

function parseAdjustmentBounds(value: unknown): PricingSettings['recommendedAdjustmentBounds'] {
  const candidate = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    min: Number(candidate.min ?? -0.2),
    max: Number(candidate.max ?? 0.2),
  };
}

export function mapPricingService(row: PricingServiceRow): PricingService {
  return {
    id: row.id,
    code: row.code,
    category: row.category,
    name: row.name,
    description: row.description,
    pricingModel: row.pricing_model,
    priceValue: Number(row.price_value ?? 0),
    timeMinutes: Number(row.time_minutes ?? 0),
    unitLabel: row.unit_label,
    defaultQuantity: Number(row.default_quantity ?? 1),
    minQuantity: Number(row.min_quantity ?? 0),
    maxQuantity: row.max_quantity == null ? null : Number(row.max_quantity),
    includedByDefault: Boolean(row.included_by_default),
    active: Boolean(row.active),
    customerVisible: Boolean(row.customer_visible),
    sortOrder: Number(row.sort_order ?? 0),
    dependencies: Array.isArray(row.dependencies) ? row.dependencies : [],
    metadata: row.metadata && typeof row.metadata === 'object' ? row.metadata as Record<string, unknown> : {},
  };
}

export async function getPricingSettings(): Promise<PricingSettings> {
  const { data, error } = await pricingDb
    .from('pricing_settings')
    .select('key, numeric_value, text_value, json_value');

  if (error) throw error;

  const rows = (data ?? []) as unknown as PricingSettingRow[];
  const byKey = new Map(rows.map((row) => [row.key, row]));

  return {
    basePfhRateUsd: Number(byKey.get('base_pfh_rate_usd')?.numeric_value ?? 400),
    wordsPerMinute: Number(byKey.get('words_per_minute')?.numeric_value ?? 155),
    minimumBasePriceUsd: Number(byKey.get('minimum_base_price_usd')?.numeric_value ?? 30),
    complexityMultipliers: parseComplexityMultipliers(byKey.get('complexity_multipliers')?.json_value),
    recommendedAdjustmentBounds: parseAdjustmentBounds(byKey.get('recommended_adjustment_bounds')?.json_value),
    version: byKey.get('pricing_model_version')?.text_value ?? 'v1',
  };
}

export async function listPricingServices(options?: { activeOnly?: boolean; customerVisibleOnly?: boolean }): Promise<PricingService[]> {
  let query = pricingDb
    .from('pricing_services')
    .select('*')
    .order('sort_order', { ascending: true });

  if (options?.activeOnly) query = query.eq('active', true);
  if (options?.customerVisibleOnly) query = query.eq('customer_visible', true);

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as unknown as PricingServiceRow[]).map(mapPricingService);
}
