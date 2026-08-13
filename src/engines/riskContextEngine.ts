import type { QuoteForm, RiskAssessment, RiskInsight, UsageEstimate } from '../domain/types';

export function assessRiskContext(form: QuoteForm, usage: UsageEstimate): RiskAssessment {
  const insights: RiskInsight[] = [];
  let score = 50;

  const parking = form.usage.parking;
  if (parking === 'Garasi / area tertutup' || parking === 'Gedung parkir') {
    score -= 8;
    insights.push({ code: 'PARKING_PROTECTED', label: 'Lokasi parkir', value: parking, impact: 'POSITIVE', explanation: 'Lokasi parkir terlindungi menjadi sinyal risiko yang lebih baik. Dampak tarif belum diterapkan pada mock pricing.' });
  } else if (parking === 'Area terbuka') {
    score += 10;
    insights.push({ code: 'PARKING_OPEN', label: 'Lokasi parkir', value: parking, impact: 'ATTENTION', explanation: 'Area terbuka perlu dipertimbangkan oleh rating/risk engine production.' });
  } else {
    insights.push({ code: 'PARKING_STANDARD', label: 'Lokasi parkir', value: parking || '-', impact: 'NEUTRAL', explanation: 'Dicatat sebagai konteks risiko tanpa mengubah tarif prototype.' });
  }

  if (usage.upperKm <= 10_000) score -= 6;
  else if (usage.upperKm > 20_000) score += 10;
  insights.push({
    code: 'USAGE_INTENSITY',
    label: 'Intensitas pemakaian',
    value: `${usage.lowerKm.toLocaleString('id-ID')}–${usage.upperKm.toLocaleString('id-ID')} km/tahun`,
    impact: usage.upperKm <= 10_000 ? 'POSITIVE' : usage.upperKm > 20_000 ? 'ATTENTION' : 'NEUTRAL',
    explanation: 'Range mileage dipakai untuk rekomendasi band dan anti-under-estimation.'
  });

  if (form.vehicle.vehicleUse === 'COMMERCIAL') score += 24;
  insights.push({
    code: 'VEHICLE_USE',
    label: 'Penggunaan kendaraan',
    value: form.vehicle.vehicleUse === 'PRIVATE' ? 'Pribadi' : 'Komersial',
    impact: form.vehicle.vehicleUse === 'PRIVATE' ? 'NEUTRAL' : 'ATTENTION',
    explanation: form.vehicle.vehicleUse === 'PRIVATE' ? 'Masuk target customer flow prototype.' : 'Penggunaan komersial diarahkan ke underwriting.'
  });

  insights.push({
    code: 'REGION_CONTEXT',
    label: 'Wilayah penggunaan',
    value: form.vehicle.region || '-',
    impact: 'NEUTRAL',
    explanation: 'Region diteruskan sebagai input rating/hazard production; prototype belum memberi faktor tarif.'
  });

  if (form.odometer.scanStatus === 'SUCCESS') score -= 4;
  else score += 14;
  insights.push({
    code: 'EVIDENCE_CONFIDENCE',
    label: 'Bukti odometer',
    value: form.odometer.scanStatus === 'SUCCESS' ? 'Terverifikasi' : 'Belum terverifikasi',
    impact: form.odometer.scanStatus === 'SUCCESS' ? 'POSITIVE' : 'ATTENTION',
    explanation: 'Kualitas bukti memengaruhi straight-through processing, bukan keputusan klaim otomatis.'
  });

  score = Math.max(0, Math.min(100, score));
  const band: RiskAssessment['band'] = score < 42 ? 'LOW' : score < 68 ? 'MEDIUM' : 'HIGH';
  return { score, band, insights };
}
