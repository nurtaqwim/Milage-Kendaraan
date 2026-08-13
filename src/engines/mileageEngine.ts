import { MILEAGE_BANDS, PRODUCT_RULES } from '../config/productConfig';
import type { MileageBand, MileageBandCode, QuoteForm, TopUpPack, UsageEstimate } from '../domain/types';

export function getBand(code: MileageBandCode): MileageBand {
  const band = MILEAGE_BANDS.find((item) => item.code === code);
  if (!band) throw new Error(`Unknown mileage band: ${code}`);
  return band;
}

export function mapQuotaToBand(totalQuotaKm: number): MileageBand | null {
  return MILEAGE_BANDS.find((band) => totalQuotaKm <= band.limitKm) ?? null;
}

export function estimateUsage(form: QuoteForm): UsageEstimate {
  const knownWeekly = Number(form.usage.knownWeeklyKm || 0);
  const commuteDays = Number(form.usage.commuteDays || 0);
  const commuteOneWayKm = Number(form.usage.commuteOneWayKm || 0);
  const weekendKm = Number(form.usage.weekendKm || 0);
  const monthlyTripKm = Number(form.usage.monthlyTripKm || 0);

  const modeledWeekly = commuteDays * commuteOneWayKm * 2 + weekendKm + (monthlyTripKm * 12) / 52;
  const weeklyKm = knownWeekly > 0 ? knownWeekly : modeledWeekly;
  const confidence: UsageEstimate['confidence'] =
    form.usage.telematicsStatus === 'SUCCESS'
      ? 'HIGH'
      : knownWeekly > 0 || (commuteDays > 0 && commuteOneWayKm > 0 && (weekendKm > 0 || monthlyTripKm > 0))
        ? 'MEDIUM'
        : 'LOW';

  const annualKm = Math.max(0, Math.round(weeklyKm * 52));
  const variance = confidence === 'HIGH' ? 0.1 : confidence === 'MEDIUM' ? 0.17 : 0.25;
  const lowerKm = Math.max(0, Math.round(annualKm * (1 - variance)));
  const upperKm = Math.round(annualKm * (1 + variance));
  const recommendedBand = mapQuotaToBand(upperKm)?.code ?? null;

  return {
    annualKm,
    lowerKm,
    upperKm,
    weeklyKm: Math.round(weeklyKm),
    confidence,
    recommendedBand,
    method: form.usage.telematicsStatus === 'SUCCESS'
      ? 'Connected vehicle / telematics signal'
      : knownWeekly > 0
        ? 'Customer-known weekly mileage'
        : 'Modeled commute + weekend + monthly trips'
  };
}

export interface TopUpTransition {
  pack: TopUpPack;
  currentQuotaKm: number;
  targetQuotaKm: number;
  currentBand: MileageBand;
  targetBand: MileageBand | null;
  exceedsProductMaximum: boolean;
}

export function calculateTopUpTransition(currentQuotaKm: number, pack: TopUpPack): TopUpTransition {
  const currentBand = mapQuotaToBand(currentQuotaKm) ?? getBand('M30');
  const targetQuotaKm = currentQuotaKm + pack.incrementKm;
  const targetBand = mapQuotaToBand(targetQuotaKm);

  return {
    pack,
    currentQuotaKm,
    targetQuotaKm,
    currentBand,
    targetBand,
    exceedsProductMaximum: targetQuotaKm > PRODUCT_RULES.maxMileageKm
  };
}

export function projectExhaustionDate(params: {
  policyStart: string;
  usedKm: number;
  totalQuotaKm: number;
  elapsedDays: number;
}): Date | null {
  const { policyStart, usedKm, totalQuotaKm, elapsedDays } = params;
  if (!policyStart || usedKm <= 0 || elapsedDays <= 0 || totalQuotaKm <= usedKm) return null;

  const start = new Date(`${policyStart}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;

  const kmPerDay = usedKm / elapsedDays;
  if (kmPerDay <= 0) return null;

  const totalDaysToExhaustion = Math.ceil(totalQuotaKm / kmPerDay);
  const projected = new Date(start);
  projected.setDate(projected.getDate() + totalDaysToExhaustion);
  return projected;
}

export function renewalRecommendation(actualAnnualKm: number): MileageBandCode | 'REFER' {
  return mapQuotaToBand(actualAnnualKm)?.code ?? 'REFER';
}



export interface TopUpPackOffer {
  pack: TopUpPack;
  currentQuotaKm: number;
  targetQuotaKm: number;
  effectiveAdditionalKm: number;
  currentBand: MileageBand;
  targetBand: MileageBand;
  crossesPricingBand: boolean;
  bestValueInTargetBand: boolean;
}

/**
 * Mengikuti contoh produk pada PDF: T1/T3/T5/T10 menambah kilometer sesuai
 * nominal pack. Pricing tetap mengikuti band dari total quota setelah top-up.
 * Karena itu beberapa pack dapat memiliki tambahan premi yang sama ketika
 * semuanya jatuh pada band target yang sama.
 */
export function getTopUpPackOffers(currentQuotaKm: number, packs: TopUpPack[]): TopUpPackOffer[] {
  const raw = packs.flatMap((pack) => {
    const transition = calculateTopUpTransition(currentQuotaKm, pack);
    if (!transition.targetBand || transition.exceedsProductMaximum) return [];
    return [{
      pack,
      currentQuotaKm,
      targetQuotaKm: transition.targetQuotaKm,
      effectiveAdditionalKm: pack.incrementKm,
      currentBand: transition.currentBand,
      targetBand: transition.targetBand,
      crossesPricingBand: transition.currentBand.code !== transition.targetBand.code,
      bestValueInTargetBand: false
    } satisfies TopUpPackOffer];
  });

  const maxQuotaByTargetBand = new Map<MileageBandCode, number>();
  for (const offer of raw) {
    maxQuotaByTargetBand.set(
      offer.targetBand.code,
      Math.max(maxQuotaByTargetBand.get(offer.targetBand.code) ?? 0, offer.targetQuotaKm)
    );
  }

  return raw.map((offer) => ({
    ...offer,
    bestValueInTargetBand: offer.targetQuotaKm === maxQuotaByTargetBand.get(offer.targetBand.code)
  }));
}

/**
 * Next-best-action lokal untuk prototype. Memilih satu pack yang paling dekat
 * dengan proyeksi kebutuhan; jika satu pack belum cukup, memilih pack terbesar
 * agar frekuensi transaksi berkurang. Production dapat mengganti fungsi ini
 * dengan optimization engine/bundle engine.
 */
export function recommendTopUpOffer(params: {
  currentQuotaKm: number;
  projectedPolicyKm: number;
  packs: TopUpPack[];
}): TopUpPackOffer | null {
  const offers = getTopUpPackOffers(params.currentQuotaKm, params.packs);
  if (offers.length === 0) return null;

  const targetNeed = Math.min(PRODUCT_RULES.maxMileageKm, Math.max(params.currentQuotaKm + 1, params.projectedPolicyKm));
  const covering = offers
    .filter((offer) => offer.targetQuotaKm >= targetNeed)
    .sort((a, b) => a.targetQuotaKm - b.targetQuotaKm || a.pack.incrementKm - b.pack.incrementKm);

  if (covering.length > 0) return covering[0];
  return [...offers].sort((a, b) => b.targetQuotaKm - a.targetQuotaKm)[0];
}
