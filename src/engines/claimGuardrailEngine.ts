import type { ClaimMileageGuardrail } from '../domain/types';

export function evaluateClaimMileageContext(input: {
  usedKm: number;
  totalQuotaKm: number;
  toleranceKm: number;
  tamperFlag: boolean;
}): ClaimMileageGuardrail {
  if (input.tamperFlag) {
    return {
      policyCoverageStatus: 'ACTIVE',
      automaticDeclineAllowed: false,
      action: 'FRAUD_INVESTIGATION',
      reason: 'Indikasi manipulasi memerlukan investigasi; tidak boleh menjadi auto-decline tanpa pemeriksaan.'
    };
  }

  if (input.usedKm > input.totalQuotaKm + input.toleranceKm) {
    return {
      policyCoverageStatus: 'ACTIVE',
      automaticDeclineAllowed: false,
      action: 'PREMIUM_ADJUSTMENT_REVIEW',
      reason: 'Mileage melewati batas dan toleransi. Konteks diteruskan untuk penyesuaian premi/review, bukan penolakan otomatis.'
    };
  }

  return {
    policyCoverageStatus: 'ACTIVE',
    automaticDeclineAllowed: false,
    action: 'NORMAL_REVIEW',
    reason: 'Tidak ada kondisi mileage yang membenarkan penolakan otomatis.'
  };
}
