import type { AddOn, MileageBand, TopUpPack } from '../domain/types';

export const PRODUCT_NAME = 'Jasindo Mileage';
export const PRODUCT_VERSION = 'Prototype v4.3';

/**
 * Semua nominal di bawah adalah nilai mock untuk UX dan pengujian integrasi.
 * Pricing production harus berasal dari rating engine / tabel tarif yang disetujui.
 */
export const MILEAGE_BANDS: MileageBand[] = [
  { code: 'M5', limitKm: 5_000, label: 'Mileage Band 5.000 km', customerLabel: 'Pemakaian rendah', variablePremium: { COMPREHENSIVE: 650_000, TLO: 390_000 } },
  { code: 'M10', limitKm: 10_000, label: 'Mileage Band 10.000 km', customerLabel: 'Pemakaian ringan', variablePremium: { COMPREHENSIVE: 1_050_000, TLO: 620_000 } },
  { code: 'M15', limitKm: 15_000, label: 'Mileage Band 15.000 km', customerLabel: 'Pemakaian normal', variablePremium: { COMPREHENSIVE: 1_350_000, TLO: 810_000 } },
  { code: 'M20', limitKm: 20_000, label: 'Mileage Band 20.000 km', customerLabel: 'Pemakaian aktif', variablePremium: { COMPREHENSIVE: 1_600_000, TLO: 960_000 } },
  { code: 'M30', limitKm: 30_000, label: 'Mileage Band 30.000 km', customerLabel: 'Pemakaian tinggi', variablePremium: { COMPREHENSIVE: 1_950_000, TLO: 1_170_000 } }
];

export const TOP_UP_PACKS: TopUpPack[] = [
  { code: 'T1', incrementKm: 1_000, label: 'Tambah 1.000 km' },
  { code: 'T3', incrementKm: 3_000, label: 'Tambah 3.000 km' },
  { code: 'T5', incrementKm: 5_000, label: 'Tambah 5.000 km' },
  { code: 'T10', incrementKm: 10_000, label: 'Tambah 10.000 km' }
];

export const ADD_ONS: AddOn[] = [
  { id: 'tpl', title: 'Tanggung Jawab Hukum Pihak Ketiga', description: 'Perluasan tanggung jawab hukum kepada pihak ketiga.', premium: 125_000 },
  { id: 'pa', title: 'Kecelakaan Diri Pengemudi & Penumpang', description: 'Perlindungan tambahan akibat kecelakaan bagi pengemudi dan penumpang.', premium: 90_000 },
  { id: 'flood', title: 'Banjir & Angin Topan', description: 'Perluasan kerusakan akibat banjir, angin topan, badai, dan hujan es.', premium: 180_000 },
  { id: 'eq', title: 'Gempa Bumi', description: 'Perluasan kerusakan kendaraan akibat gempa bumi.', premium: 135_000 }
];

export const PRODUCT_RULES = {
  policyTermMonths: 12,
  reminderThresholds: [75, 90],
  starterQuotaKm: 5_000,
  maxMileageKm: 30_000,
  maxSumInsured: 1_500_000_000,
  maxVehicleAge: { COMPREHENSIVE: 15, TLO: 20 },
  ageLoadingStartsAfterYears: 5,
  ageLoadingPercentPerYear: 5,
  administrativeToleranceKm: 250,
  autoUpgradeTriggerPercent: 100,
  topUpEntitlementMode: 'STRICT_PACK_INCREMENT',
  unusedMileageTreatment: 'PENDING_PRODUCT_DECISION',
  productDecisionFlags: {
    administrativeToleranceKm: 'PROTOTYPE_ASSUMPTION',
    autoUpgradeTriggerPercent: 'PROTOTYPE_ASSUMPTION',
    topUpEntitlementMode: 'ALIGNED_WITH_SOURCE_EXAMPLE',
    unusedMileageTreatment: 'UNRESOLVED_IN_SOURCE'
  },
  claimGuardrail: 'MILEAGE_EXHAUSTION_NEVER_AUTO_DECLINES_CLAIM',
  fraudGuardrail: 'SUSPECTED_TAMPERING_REQUIRES_MANUAL_REVIEW'
} as const;

export const BASE_RISK_PREMIUM_RATE = { COMPREHENSIVE: 0.0032, TLO: 0.0018 } as const;
export const ADMINISTRATION_FEE = 25_000;
