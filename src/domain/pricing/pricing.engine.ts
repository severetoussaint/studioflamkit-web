import type {
  PricingCalculationInput,
  PricingCalculationLine,
  PricingCalculationResult,
  PricingService,
  PricingSettings,
  PricingSelection,
} from './pricing.types';

const roundMoney = (value: number) => Math.round(value * 100) / 100;
const roundMinutes = (value: number) => Math.round(value * 100) / 100;

function clampQuantity(selection: PricingSelection, service: PricingService): number {
  const requested = Number.isFinite(selection.quantity) ? Number(selection.quantity) : service.defaultQuantity;
  const minimum = service.minQuantity;
  const maximum = service.maxQuantity ?? Number.POSITIVE_INFINITY;
  return Math.min(maximum, Math.max(minimum, requested));
}

function calculateServicePrice(
  service: PricingService,
  quantity: number,
  basePrice: number,
  audioHours: number,
  durationMinutes: number,
  chapterCount: number,
): number {
  switch (service.pricingModel) {
    case 'included':
      return 0;
    case 'percent_of_base':
      return basePrice * service.priceValue * quantity;
    case 'fixed':
    case 'per_unit':
      return service.priceValue * quantity;
    case 'per_finished_hour':
      return service.priceValue * audioHours * quantity;
    case 'per_minute':
      return service.priceValue * durationMinutes * quantity;
    case 'per_chapter':
      return service.priceValue * chapterCount * quantity;
    case 'per_actor':
      return basePrice * service.priceValue * quantity;
    default:
      return 0;
  }
}

function calculateServiceTime(service: PricingService, quantity: number, audioHours: number, durationMinutes: number, chapterCount: number): number {
  switch (service.pricingModel) {
    case 'included':
      return 0;
    case 'per_finished_hour':
      return service.timeMinutes * audioHours * quantity;
    case 'per_minute':
      return service.timeMinutes * durationMinutes * quantity;
    case 'per_chapter':
      return service.timeMinutes * chapterCount * quantity;
    default:
      return service.timeMinutes * quantity;
  }
}

export function calculatePricing(
  settings: PricingSettings,
  services: PricingService[],
  input: PricingCalculationInput,
): PricingCalculationResult {
  const wordCount = Math.max(0, Math.round(input.wordCount));
  const chapterCount = Math.max(1, Math.round(input.chapterCount ?? 1));
  const complexity = input.complexity ?? 'standard';
  const complexityMultiplier = settings.complexityMultipliers[complexity] ?? 1;
  const durationMinutes = wordCount === 0 ? 0 : wordCount / settings.wordsPerMinute;
  const audioHours = durationMinutes / 60;

  const rawBasePrice = audioHours * settings.basePfhRateUsd;
  const basePrice = wordCount === 0 ? 0 : Math.max(settings.minimumBasePriceUsd, rawBasePrice);

  const selections = input.selections ?? [];
  const selectionMap = new Map(selections.map((selection) => [selection.serviceCode, selection]));

  const lines: PricingCalculationLine[] = [];

  for (const service of services.filter((item) => item.active)) {
    const selection = selectionMap.get(service.code);
    const isIncludedBySelection = Boolean(selection);
    const isIncludedByDefault = service.includedByDefault;

    if (!isIncludedBySelection && !isIncludedByDefault) continue;

    const effectiveSelection = selection ?? { serviceCode: service.code, quantity: service.defaultQuantity };
    const quantity = clampQuantity(effectiveSelection, service);
    const price = calculateServicePrice(service, quantity, basePrice, audioHours, durationMinutes, chapterCount);
    const estimatedMinutes = calculateServiceTime(service, quantity, audioHours, durationMinutes, chapterCount);

    lines.push({
      serviceCode: service.code,
      name: service.name,
      quantity,
      unitLabel: service.unitLabel,
      price: roundMoney(price),
      estimatedMinutes: roundMinutes(estimatedMinutes),
      pricingModel: service.pricingModel,
    });
  }

  const serviceSubtotal = lines.reduce((sum, line) => sum + line.price, 0);
  const uncappedRecommendedPrice = (basePrice + serviceSubtotal) * complexityMultiplier;
  const priceCeiling = basePrice * settings.maxTotalPriceMultiplier;
  const recommendedPrice = roundMoney(Math.min(uncappedRecommendedPrice, priceCeiling));

  const bounds = settings.recommendedAdjustmentBounds;
  const requestedAdjustment = Number.isFinite(input.commercialAdjustment) ? Number(input.commercialAdjustment) : 0;
  const commercialAdjustment = Math.min(bounds.max, Math.max(bounds.min, requestedAdjustment));
  const adjustmentAmount = recommendedPrice * commercialAdjustment;
  const finalPrice = roundMoney(Math.max(settings.minimumBasePriceUsd, recommendedPrice + adjustmentAmount));

  const baseWorkMinutes = audioHours * settings.baseWorkHoursPerAudioHour * 60;
  const serviceWorkMinutes = lines.reduce((sum, line) => sum + line.estimatedMinutes, 0);
  const estimatedWorkMinutes = roundMinutes((baseWorkMinutes + serviceWorkMinutes) * complexityMultiplier);

  return {
    wordCount,
    durationMinutes: roundMinutes(durationMinutes),
    basePrice: roundMoney(basePrice),
    complexity,
    complexityMultiplier,
    serviceSubtotal: roundMoney(serviceSubtotal),
    commercialAdjustment,
    recommendedPrice,
    finalPrice,
    estimatedWorkMinutes,
    lines,
    currency: 'USD',
    pricingVersion: settings.version,
  };
}
