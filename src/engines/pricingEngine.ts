import { ADD_ONS, ADMINISTRATION_FEE, BASE_RISK_PREMIUM_RATE, MILEAGE_BANDS, PRODUCT_RULES } from '../config/productConfig';
import type { CoverageType, MileageBandCode, PremiumBreakdown, QuoteComparison, QuoteForm } from '../domain/types';
import { getBand, mapQuotaToBand } from './mileageEngine';

function roundPremium(value: number): number {
  return Math.max(0, Math.round(value / 1_000) * 1_000);
}

function vehicleAge(year: string): number {
  const parsed = Number(year);
  if (!parsed) return 0;
  return Math.max(0, new Date().getFullYear() - parsed);
}

function baseRiskPremium(sumInsured: number, coverage: CoverageType): number {
  return roundPremium(Math.max(500_000, sumInsured * BASE_RISK_PREMIUM_RATE[coverage]));
}

function ageLoading(basePremium: number, year: string): number {
  const age = vehicleAge(year);
  const extraYears = Math.max(0, age - PRODUCT_RULES.ageLoadingStartsAfterYears);
  return roundPremium(basePremium * extraYears * (PRODUCT_RULES.ageLoadingPercentPerYear / 100));
}

function selectedAddOnPremium(form: QuoteForm): number {
  return ADD_ONS.filter((addon) => form.protection.addOns.includes(addon.id)).reduce((sum, addon) => sum + addon.premium, 0);
}

export function calculateBandPremium(form: QuoteForm, bandCode: MileageBandCode): PremiumBreakdown {
  const sumInsured = Number(form.vehicle.sumInsured || 0);
  const base = baseRiskPremium(sumInsured, form.vehicle.coverage);
  const band = getBand(bandCode);
  const mileagePremium = band.variablePremium[form.vehicle.coverage];
  const loading = ageLoading(base, form.vehicle.year);
  const addOnPremium = selectedAddOnPremium(form);

  return {
    baseRiskPremium: base,
    mileagePremium,
    ageLoading: loading,
    addOnPremium,
    administrationFee: ADMINISTRATION_FEE,
    total: base + mileagePremium + loading + addOnPremium + ADMINISTRATION_FEE
  };
}

export function calculateQuoteComparison(form: QuoteForm, expectedBandCode: MileageBandCode): QuoteComparison {
  const currentBand = form.plan.purchaseMode === 'STARTER_TOPUP' ? getBand('M5') : getBand(form.plan.selectedBand);
  return {
    upfront: calculateBandPremium(form, currentBand.code),
    expectedAnnual: calculateBandPremium(form, expectedBandCode),
    currentBand: currentBand.code,
    expectedBand: expectedBandCode
  };
}

export function calculateTopUpPrice(params: { form: QuoteForm; currentQuotaKm: number; targetQuotaKm: number }) {
  const current = mapQuotaToBand(params.currentQuotaKm);
  const target = mapQuotaToBand(params.targetQuotaKm);

  if (!current || !target) {
    return {
      currentBand: current?.code ?? 'M30',
      targetBand: null,
      premiumDifference: null,
      parityCheck: false
    };
  }

  const currentPremium = calculateBandPremium(params.form, current.code);
  const targetPremium = calculateBandPremium(params.form, target.code);
  const premiumDifference = Math.max(0, targetPremium.mileagePremium - currentPremium.mileagePremium);

  return {
    currentBand: current.code,
    targetBand: target.code,
    premiumDifference,
    parityCheck: currentPremium.mileagePremium + premiumDifference === targetPremium.mileagePremium
  };
}

export function getAllBandQuotes(form: QuoteForm) {
  return MILEAGE_BANDS.map((band) => {
    const price = calculateBandPremium(form, band.code);
    return { code: band.code, limitKm: band.limitKm, total: price.total, variablePremium: price.mileagePremium };
  });
}
