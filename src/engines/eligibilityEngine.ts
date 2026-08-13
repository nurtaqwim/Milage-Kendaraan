import { PRODUCT_RULES } from '../config/productConfig';
import type { Decision, QuoteForm, RuleReason, UsageEstimate } from '../domain/types';

function worstStatus(reasons: RuleReason[]): Decision['status'] {
  if (reasons.some((reason) => reason.status === 'BLOCK')) return 'BLOCK';
  if (reasons.some((reason) => reason.status === 'REFER')) return 'REFER';
  if (reasons.some((reason) => reason.status === 'WARN')) return 'WARN';
  return 'PASS';
}

export function evaluateEligibility(form: QuoteForm, usage: UsageEstimate): Decision {
  const reasons: RuleReason[] = [];
  const currentYear = new Date().getFullYear();
  const year = Number(form.vehicle.year || 0);
  const age = year ? currentYear - year : 0;
  const maxAge = PRODUCT_RULES.maxVehicleAge[form.vehicle.coverage];
  const sumInsured = Number(form.vehicle.sumInsured || 0);

  if (!/^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{0,3}$/i.test(form.vehicle.plate.trim())) {
    reasons.push({ code: 'VEHICLE_PLATE_FORMAT', title: 'Format nomor polisi perlu dikoreksi', detail: 'Gunakan format umum seperti B 1234 ABC.', status: 'BLOCK' });
  }

  if (!year || year > currentYear || year < 1980) {
    reasons.push({ code: 'VEHICLE_YEAR_INVALID', title: 'Tahun kendaraan tidak valid', detail: `Tahun harus berada antara 1980 dan ${currentYear}.`, status: 'BLOCK' });
  } else if (age > maxAge) {
    reasons.push({ code: 'VEHICLE_AGE_LIMIT', title: 'Usia kendaraan melewati batas prototype', detail: `${form.vehicle.coverage === 'COMPREHENSIVE' ? 'Comprehensive' : 'TLO'} disimulasikan maksimum ${maxAge} tahun dan perlu referral jika terlampaui.`, status: 'REFER' });
  } else if (age > PRODUCT_RULES.ageLoadingStartsAfterYears) {
    reasons.push({ code: 'VEHICLE_AGE_LOADING', title: 'Age loading terindikasi', detail: `Kendaraan berusia ${age} tahun. Mock pricing engine menampilkan loading setelah usia ${PRODUCT_RULES.ageLoadingStartsAfterYears} tahun.`, status: 'WARN' });
  }

  if (sumInsured <= 0) {
    reasons.push({ code: 'SUM_INSURED_REQUIRED', title: 'Harga pertanggungan belum tersedia', detail: 'Nilai pertanggungan wajib lebih dari Rp0.', status: 'BLOCK' });
  } else if (sumInsured > PRODUCT_RULES.maxSumInsured) {
    reasons.push({ code: 'SUM_INSURED_LIMIT', title: 'Harga pertanggungan membutuhkan referral', detail: `Nilai di atas Rp${PRODUCT_RULES.maxSumInsured.toLocaleString('id-ID')} tidak diproses otomatis pada prototype.`, status: 'REFER' });
  }

  if (form.vehicle.vehicleUse === 'COMMERCIAL') {
    reasons.push({ code: 'COMMERCIAL_USE_REFERRAL', title: 'Penggunaan komersial perlu review', detail: 'Prototype customer flow difokuskan pada penggunaan pribadi. Penggunaan komersial diarahkan ke underwriting.', status: 'REFER' });
  }

  if (usage.upperKm > PRODUCT_RULES.maxMileageKm) {
    reasons.push({ code: 'MILEAGE_ABOVE_M30', title: 'Estimasi mileage melebihi M30', detail: `Rentang atas estimasi mencapai ${usage.upperKm.toLocaleString('id-ID')} km/tahun, sehingga tidak boleh dipaksa masuk M30.`, status: 'REFER' });
  }

  if (form.vehicle.stnkFileName && form.vehicle.stnkStatus === 'REVIEW') {
    reasons.push({ code: 'STNK_REVIEW_REQUIRED', title: 'Dokumen kendaraan perlu review', detail: 'Ekstraksi STNK tidak cukup yakin. Data manual tetap dapat disimpan, tetapi straight-through processing dihentikan.', status: 'REFER' });
  }

  if (form.odometer.scanStatus === 'REVIEW') {
    reasons.push({ code: 'ODOMETER_MANUAL_REVIEW', title: 'Bukti odometer perlu review', detail: 'Quality/tamper flag perlu diperiksa manusia. Ini bukan penolakan otomatis.', status: 'REFER' });
  } else if (form.odometer.scanStatus !== 'SUCCESS') {
    reasons.push({ code: 'ODOMETER_NOT_VERIFIED', title: 'Odometer belum terverifikasi', detail: 'Foto dan angka odometer harus lolos quality check serta pencocokan sebelum quote final.', status: 'BLOCK' });
  }

  if (form.customer.identityStatus === 'REVIEW') {
    reasons.push({ code: 'IDENTITY_MANUAL_REVIEW', title: 'Identitas perlu review', detail: 'KYC/KYB tidak boleh diloloskan otomatis tanpa pemeriksaan lanjutan.', status: 'REFER' });
  } else if (form.customer.identityStatus !== 'SUCCESS') {
    reasons.push({ code: 'IDENTITY_NOT_VERIFIED', title: 'Identitas belum terverifikasi', detail: 'KYC/identity check perlu selesai sebelum pembayaran production.', status: 'BLOCK' });
  }

  if (form.usage.parking === 'Area terbuka') {
    reasons.push({ code: 'OPEN_PARKING_SIGNAL', title: 'Lokasi parkir perlu diperhatikan', detail: 'Sinyal ini diteruskan ke risk/rating engine production; prototype tidak mengubah premi secara diam-diam.', status: 'WARN' });
  }

  if (usage.confidence === 'LOW') {
    reasons.push({ code: 'MILEAGE_CONFIDENCE_LOW', title: 'Confidence estimasi mileage rendah', detail: 'Minta data tambahan atau gunakan band konservatif untuk mengurangi under-estimation.', status: 'WARN' });
  }

  if (reasons.length === 0) {
    reasons.push({ code: 'AUTO_ELIGIBLE', title: 'Eligible untuk straight-through processing', detail: 'Tidak ditemukan blocking rule atau referral pada data prototype.', status: 'PASS' });
  }

  return { status: worstStatus(reasons), score: Math.max(0, 100 - reasons.filter((reason) => reason.status !== 'PASS').length * 12), reasons };
}
