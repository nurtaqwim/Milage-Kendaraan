export interface EngineDescriptor {
  id: string;
  label: string;
  role: string;
  currentAdapter: 'MOCK' | 'RULE_BASED_LOCAL';
  productionCapability: string;
  requiredControls: string[];
}

export const ENGINE_REGISTRY: EngineDescriptor[] = [
  {
    id: 'vehicle-document',
    label: 'Vehicle Document Intelligence',
    role: 'Ekstraksi STNK, validasi field, dan prefill dengan confidence.',
    currentAdapter: 'MOCK',
    productionCapability: 'OCR/VLM dokumen kendaraan + master vehicle lookup.',
    requiredControls: ['confidence threshold', 'field-level confirmation', 'PII encryption', 'manual review queue']
  },
  {
    id: 'odometer-evidence',
    label: 'Odometer Evidence Intelligence',
    role: 'Membaca angka, menilai kualitas, metadata, dan indikasi manipulasi.',
    currentAdapter: 'MOCK',
    productionCapability: 'Vision/OCR + image forensics + capture SDK.',
    requiredControls: ['liveness/capture guidance', 'tamper rules', 'device metadata consent', 'human review']
  },
  {
    id: 'mileage-forecast',
    label: 'Mileage Forecast Engine',
    role: 'Menghasilkan rentang penggunaan dan confidence, bukan satu angka semu.',
    currentAdapter: 'RULE_BASED_LOCAL',
    productionCapability: 'Forecasting dengan telematics, connected car, atau historical renewal data.',
    requiredControls: ['consent', 'data minimization', 'model monitoring', 'explainability']
  },
  {
    id: 'eligibility-risk',
    label: 'Eligibility & Risk Decisioning',
    role: 'Orkestrasi PASS/WARN/REFER/BLOCK dengan reason code.',
    currentAdapter: 'RULE_BASED_LOCAL',
    productionCapability: 'Rules engine/decision table yang versioned dan auditable.',
    requiredControls: ['rule versioning', 'maker-checker governance', 'manual override log', 'fallback']
  },
  {
    id: 'rating',
    label: 'Rating & Pricing Engine',
    role: 'Base premium, mileage band, loading, add-on, dan parity top-up.',
    currentAdapter: 'RULE_BASED_LOCAL',
    productionCapability: 'Tariff service dengan effective date, version, dan approval trail.',
    requiredControls: ['approved tariff', 'rounding rules', 'quote expiry', 'reconciliation']
  },
  {
    id: 'identity',
    label: 'Identity / KYC Engine',
    role: 'Pencocokan identitas, dokumen, dan data pemegang polis.',
    currentAdapter: 'MOCK',
    productionCapability: 'eKYC/KYB, face/liveness bila dibutuhkan, dan corporate registry.',
    requiredControls: ['consent', 'retention policy', 'manual review', 'privacy notice']
  },
  {
    id: 'payment',
    label: 'Payment & Tokenization',
    role: 'Pembayaran awal dan token consent untuk auto-upgrade.',
    currentAdapter: 'MOCK',
    productionCapability: 'Payment gateway + token vault, tanpa menyimpan data kartu di aplikasi.',
    requiredControls: ['PCI scope', 'idempotency', '3DS/authentication', 'refund/reversal']
  },
  {
    id: 'policy-admin',
    label: 'Policy Administration / Endorsement',
    role: 'Penerbitan polis dan endorsement kenaikan band.',
    currentAdapter: 'MOCK',
    productionCapability: 'Integrasi STAR/PAS untuk issue, endorsement, dan accounting.',
    requiredControls: ['transaction id', 'retry strategy', 'reconciliation', 'document generation']
  },
  {
    id: 'notification',
    label: 'Notification Orchestration',
    role: 'Reminder 75%, 90%, over-mileage, dan rekonsiliasi akhir.',
    currentAdapter: 'MOCK',
    productionCapability: 'Omnichannel notification service dengan preference center.',
    requiredControls: ['template approval', 'opt-out', 'delivery status', 'quiet hours']
  },
  {
    id: 'claims-guardrail',
    label: 'Claims Mileage Guardrail',
    role: 'Mencegah kuota habis menjadi alasan penolakan otomatis.',
    currentAdapter: 'RULE_BASED_LOCAL',
    productionCapability: 'Pre-claim context service yang mengirim fakta mileage tanpa auto-decline.',
    requiredControls: ['no sole-factor decline', 'fraud referral', 'reason code', 'claim audit']
  },
  {
    id: 'audit-observability',
    label: 'Audit & Observability',
    role: 'Mencatat keputusan, versi engine, consent, dan transaksi penting.',
    currentAdapter: 'RULE_BASED_LOCAL',
    productionCapability: 'Immutable audit store + tracing/metrics/logging.',
    requiredControls: ['correlation id', 'PII masking', 'retention', 'alerting']
  },
  {
    id: 'geo-risk',
    label: 'Geospatial Risk Enrichment',
    role: 'Menambahkan konteks hazard wilayah, parkir, banjir, dan theft hotspot tanpa hidden pricing.',
    currentAdapter: 'MOCK',
    productionCapability: 'Geocoding + approved hazard layers + versioned geospatial decision service.',
    requiredControls: ['approved data layers', 'effective date', 'explainability', 'fallback when location is imprecise']
  },
  {
    id: 'fraud-signals',
    label: 'Fraud & Cross-Policy Anomaly Signals',
    role: 'Mendeteksi reuse dokumen, device/contact anomalies, dan pola lintas polis untuk referral.',
    currentAdapter: 'MOCK',
    productionCapability: 'Fraud graph/anomaly engine dengan entity resolution dan review queue.',
    requiredControls: ['no automatic decline', 'false-positive monitoring', 'PII minimization', 'investigation trail']
  },
  {
    id: 'consent-registry',
    label: 'Consent & Preference Registry',
    role: 'Menyimpan consent telematics, data pribadi, auto-upgrade, token, dan revocation secara versioned.',
    currentAdapter: 'MOCK',
    productionCapability: 'Central consent ledger + preference center.',
    requiredControls: ['purpose limitation', 'versioned privacy notice', 'revocation', 'evidence timestamp']
  },
  {
    id: 'optimization',
    label: 'Next-Best-Action & Top-Up Optimization',
    role: 'Memilih waktu reminder dan pack yang mengurangi under-insurance serta biaya transaksi.',
    currentAdapter: 'RULE_BASED_LOCAL',
    productionCapability: 'Optimization service yang mempertimbangkan proyeksi, transaction economics, dan customer preference.',
    requiredControls: ['customer benefit constraint', 'no dark patterns', 'explanation', 'champion/challenger monitoring']
  }
];
