import type { DocumentScanResult } from '../domain/types';

export type ScanScenario = 'MATCH' | 'MISMATCH' | 'LOW_QUALITY' | 'TAMPER_REVIEW';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function scanOdometer(params: {
  manualValue: number;
  fileName: string;
  scenario: ScanScenario;
}): Promise<DocumentScanResult> {
  await sleep(850);

  if (!params.fileName || !Number.isFinite(params.manualValue)) {
    return { status: 'REVIEW', qualityChecks: [], reviewReason: 'Data input belum lengkap.' };
  }

  if (params.scenario === 'LOW_QUALITY') {
    return {
      status: 'REVIEW',
      extractedValue: params.manualValue,
      confidence: 0.51,
      qualityChecks: [
        { id: 'sharpness', label: 'Ketajaman', status: 'FAIL', detail: 'Foto terlalu buram untuk membaca digit dengan yakin.' },
        { id: 'glare', label: 'Pantulan cahaya', status: 'WARN', detail: 'Pantulan menutupi sebagian panel.' },
        { id: 'framing', label: 'Framing', status: 'PASS', detail: 'Panel odometer berada di dalam frame.' },
        { id: 'metadata', label: 'Metadata', status: 'PASS', detail: 'Metadata dasar tersedia.' },
        { id: 'tamper', label: 'Indikasi manipulasi', status: 'PASS', detail: 'Tidak ada indikasi manipulasi visual pada simulasi.' }
      ],
      reviewReason: 'Unggah ulang foto yang lebih tajam dan bebas pantulan.'
    };
  }

  if (params.scenario === 'TAMPER_REVIEW') {
    return {
      status: 'REVIEW',
      extractedValue: params.manualValue,
      confidence: 0.88,
      qualityChecks: [
        { id: 'sharpness', label: 'Ketajaman', status: 'PASS', detail: 'Foto cukup tajam.' },
        { id: 'glare', label: 'Pantulan cahaya', status: 'PASS', detail: 'Tidak ada pantulan signifikan.' },
        { id: 'framing', label: 'Framing', status: 'PASS', detail: 'Panel odometer lengkap.' },
        { id: 'metadata', label: 'Metadata', status: 'WARN', detail: 'Metadata waktu/perangkat tidak konsisten.' },
        { id: 'tamper', label: 'Indikasi manipulasi', status: 'WARN', detail: 'Perlu pemeriksaan forensik/manual.' }
      ],
      reviewReason: 'Fraud/tamper flag tidak menolak otomatis; transaksi diarahkan ke manual review.'
    };
  }

  const extractedValue = params.scenario === 'MISMATCH' ? params.manualValue + 128 : params.manualValue;
  const isMatch = extractedValue === params.manualValue;

  return {
    status: isMatch ? 'SUCCESS' : 'MISMATCH',
    extractedValue,
    confidence: isMatch ? 0.97 : 0.94,
    qualityChecks: [
      { id: 'sharpness', label: 'Ketajaman', status: 'PASS', detail: 'Digit terbaca jelas.' },
      { id: 'glare', label: 'Pantulan cahaya', status: 'PASS', detail: 'Tidak ada pantulan yang mengganggu.' },
      { id: 'framing', label: 'Framing', status: 'PASS', detail: 'Panel odometer lengkap.' },
      { id: 'metadata', label: 'Metadata', status: 'PASS', detail: 'Metadata simulasi konsisten.' },
      { id: 'tamper', label: 'Indikasi manipulasi', status: 'PASS', detail: 'Tidak ada indikasi manipulasi visual.' }
    ],
    reviewReason: isMatch ? undefined : 'Angka manual berbeda dengan hasil ekstraksi.'
  };
}

export async function scanSimpleDocument(params: {
  fileName: string;
  scenario: 'PASS' | 'REVIEW';
}): Promise<'SUCCESS' | 'REVIEW'> {
  await sleep(650);
  return params.fileName && params.scenario === 'PASS' ? 'SUCCESS' : 'REVIEW';
}

export async function scanVehicleDocument(params: {
  fileName: string;
  current: {
    plate: string;
    brand: string;
    model: string;
    year: string;
  };
  scenario?: 'PASS' | 'REVIEW';
}): Promise<import('./contracts').VehicleDocumentResult> {
  await sleep(700);

  if (!params.fileName) {
    return {
      status: 'REVIEW',
      confidence: 0,
      extracted: {},
      reasons: ['Dokumen belum tersedia.']
    };
  }

  if (params.scenario === 'REVIEW') {
    return {
      status: 'REVIEW',
      confidence: 0.62,
      extracted: {},
      reasons: ['Sebagian field STNK tidak terbaca konsisten dan memerlukan konfirmasi manual.']
    };
  }

  return {
    status: 'SUCCESS',
    confidence: 0.96,
    extracted: {
      plate: params.current.plate.trim().toUpperCase() || 'B 1234 ABC',
      brand: params.current.brand.trim() || 'Honda',
      model: params.current.model.trim() || 'CR-V',
      year: params.current.year || String(new Date().getFullYear() - 3)
    },
    reasons: ['Nomor polisi, merek, model, dan tahun berhasil dibaca dan perlu dikonfirmasi nasabah.']
  };
}
