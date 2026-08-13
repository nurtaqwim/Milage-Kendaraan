import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const config = read('src/config/productConfig.ts');
const pricing = read('src/engines/pricingEngine.ts');
const mileage = read('src/engines/mileageEngine.ts');
const claim = read('src/engines/claimGuardrailEngine.ts');
const dashboard = read('src/screens/DashboardScreen.tsx');
const plan = read('src/screens/PlanScreen.tsx');
const contracts = read('src/engines/contracts.ts');
const review = read('src/screens/ReviewScreen.tsx');
const app = read('src/App.tsx');
const eligibility = read('src/engines/eligibilityEngine.ts');
const initialState = read('src/config/initialState.ts');

const checks = [
  ['Band M5–M30 tersedia', ['M5', 'M10', 'M15', 'M20', 'M30'].every((code) => config.includes(`code: '${code}'`))],
  ['Top-up T1/T3/T5/T10 tersedia', ['T1', 'T3', 'T5', 'T10'].every((code) => config.includes(`code: '${code}'`))],
  ['Pack menambah kilometer sesuai nominal sumber', config.includes("topUpEntitlementMode: 'STRICT_PACK_INCREMENT'") && mileage.includes('targetQuotaKm: transition.targetQuotaKm') && mileage.includes('effectiveAdditionalKm: pack.incrementKm')],
  ['Masa polis 12 bulan dikunci', config.includes('policyTermMonths: 12') && review.includes('polis tetap berlaku 12 bulan')],
  ['Premi dasar dipisahkan dari komponen mileage', pricing.includes('baseRiskPremium') && pricing.includes('mileagePremium') && pricing.includes('base + mileagePremium')],
  ['Starter M5 dipisahkan dari band tahunan', config.includes('starterQuotaKm: 5_000') && pricing.includes("purchaseMode === 'STARTER_TOPUP' ? getBand('M5')")],
  ['Top-up memakai selisih band', pricing.includes('targetPremium.mileagePremium - currentPremium.mileagePremium')],
  ['Parity check top-up tersedia', pricing.includes('parityCheck') && dashboard.includes('selectedPrice.parityCheck')],
  ['Top-up berakhir bersama polis', review.includes('semua top-up berakhir bersama polis') && dashboard.includes('tetap berakhir pada')],
  ['Reminder 75% dan 90% dikunci', config.includes('reminderThresholds: [75, 90]') && dashboard.includes("thresholdKey === '75'") && dashboard.includes("thresholdKey === '90'")],
  ['Auto-upgrade membutuhkan consent dan token', plan.includes('autoUpgradeConsent') && plan.includes('paymentTokenConsent') && app.includes('Persetujuan token pembayaran wajib diberikan')],
  ['Kuota habis tidak auto-decline klaim', claim.includes('automaticDeclineAllowed: false') && review.includes('tidak otomatis menggugurkan polis atau menolak klaim')],
  ['Tamper diarahkan ke investigasi', claim.includes("action: 'FRAUD_INVESTIGATION'")],
  ['Rekonsiliasi odometer akhir tersedia', dashboard.includes('runReconciliation') && dashboard.includes('END_ODOMETER_RECONCILED')],
  ['Treatment mileage tersisa ditandai belum final', config.includes("unusedMileageTreatment: 'PENDING_PRODUCT_DECISION'")],
  ['Di atas M30 diarahkan ke referral', eligibility.includes("code: 'MILEAGE_ABOVE_M30'") && plan.includes('tidak memaksa nasabah masuk band tertinggi')],
  ['Referral tidak menagihkan pembayaran', app.includes('Tidak ada pembayaran yang ditagihkan') && app.includes("setOutcome('REFERRAL')")],
  ['Port engine production dan advanced extension tersedia', contracts.includes('export interface EngineGateway') && contracts.includes('PolicyAdminEnginePort') && contracts.includes('NotificationEnginePort') && contracts.includes('FraudSignalEnginePort') && contracts.includes('OptimizationEnginePort')],
  ['Navigasi langkah baru dibuka secara sinkron', app.includes('goToStep(next, true)') && app.includes('maxVisitedStepRef.current = nextMaxVisited')],
  ['Top-up manual menjadi default aman', initialState.includes("upgradeMode: 'MANUAL'") && plan.includes('Top-up manual · direkomendasikan')],
  ['Perluasan berbayar tidak dipilih otomatis', initialState.includes('protection: { addOns: [] }')],
  ['Metode pembayaran membutuhkan pilihan eksplisit', initialState.includes("paymentMethod: ''")]
];

let failed = 0;
for (const [label, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${label}`);
  if (!passed) failed += 1;
}

console.log(`\n${checks.length - failed}/${checks.length} conformance checks passed.`);
if (failed > 0) process.exit(1);
