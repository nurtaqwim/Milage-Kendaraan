import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  BellRing,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  WalletCards
} from 'lucide-react';
import { PRODUCT_RULES, TOP_UP_PACKS } from '../config/productConfig';
import type { AuditEvent, EngineStatus, QuoteComparison, QuoteForm, UsageEstimate } from '../domain/types';
import {
  getBand,
  getTopUpPackOffers,
  recommendTopUpOffer,
  mapQuotaToBand,
  projectExhaustionDate,
  renewalRecommendation,
  type TopUpPackOffer
} from '../engines/mileageEngine';
import { calculateTopUpPrice } from '../engines/pricingEngine';
import { createAuditEvent } from '../engines/auditEngine';
import { evaluateClaimMileageContext } from '../engines/claimGuardrailEngine';
import { scanOdometer } from '../engines/documentEngine';
import { Callout, Field, LoadingButton, Modal, StatusBadge, SummaryRow, UploadBox } from '../components/UI';
import { formatCurrency, formatDate, formatNumber } from '../utils/format';

interface ReconciliationSummary {
  actualMileageKm: number;
  unusedMileageKm: number;
  overMileageKm: number;
  renewalBand: ReturnType<typeof renewalRecommendation>;
}

export function DashboardScreen(props: {
  form: QuoteForm;
  quote: QuoteComparison;
  usage: UsageEstimate;
  policyEnd: string;
  auditTrail: AuditEvent[];
  onAddAudit: (event: AuditEvent) => void;
  onReset: () => void;
}) {
  const selectedLimit = getBand(props.form.plan.selectedBand).limitKm;
  const initialQuota = props.form.plan.purchaseMode === 'STARTER_TOPUP' ? PRODUCT_RULES.starterQuotaKm : selectedLimit;
  const [totalQuotaKm, setTotalQuotaKm] = useState(initialQuota);
  const [usedKm, setUsedKm] = useState(Math.round(initialQuota * 0.28));
  const [elapsedDays, setElapsedDays] = useState(110);
  const [selectedOffer, setSelectedOffer] = useState<TopUpPackOffer | null>(null);
  const [selectedOfferSource, setSelectedOfferSource] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [upgrading, setUpgrading] = useState(false);
  const [auditTrail, setAuditTrail] = useState(props.auditTrail);
  const [reconciliationOpen, setReconciliationOpen] = useState(false);
  const [endOdometer, setEndOdometer] = useState('');
  const [endOdometerFile, setEndOdometerFile] = useState('');
  const [reconciliationStatus, setReconciliationStatus] = useState<EngineStatus>('IDLE');
  const [reconciliationError, setReconciliationError] = useState('');
  const [reconciling, setReconciling] = useState(false);
  const [reconciliationSummary, setReconciliationSummary] = useState<ReconciliationSummary | null>(null);
  const lastThresholdRef = useRef('NORMAL');
  const autoUpgradeQuotaRef = useRef<number | null>(null);

  const activeBand = mapQuotaToBand(totalQuotaKm) ?? getBand('M30');
  const percentage = totalQuotaKm > 0 ? Math.round((usedKm / totalQuotaKm) * 100) : 0;
  const remainingKm = Math.max(0, totalQuotaKm - usedKm);
  const toleranceRemaining = Math.max(0, totalQuotaKm + PRODUCT_RULES.administrativeToleranceKm - usedKm);
  const projectedExhaustion = projectExhaustionDate({
    policyStart: props.form.vehicle.policyStart,
    usedKm,
    totalQuotaKm,
    elapsedDays
  });
  const annualizedKm = elapsedDays > 0 ? Math.round((usedKm / elapsedDays) * 365) : 0;
  const renewalBand = renewalRecommendation(annualizedKm);

  const status = percentage < 75 ? 'SAFE' : percentage < 90 ? 'PASS' : percentage < 100 ? 'WARN' : usedKm <= totalQuotaKm + PRODUCT_RULES.administrativeToleranceKm ? 'ACTION' : 'REFER';
  const statusLabel = percentage < 75 ? 'Aman' : percentage < 90 ? 'Early warning' : percentage < 100 ? 'Top-up disarankan' : usedKm <= totalQuotaKm + PRODUCT_RULES.administrativeToleranceKm ? 'Dalam toleransi' : 'Over tolerance';
  const thresholdKey = percentage >= 100 ? 'OVER' : percentage >= 90 ? '90' : percentage >= 75 ? '75' : 'NORMAL';

  const topUpOffers = useMemo(() => getTopUpPackOffers(totalQuotaKm, TOP_UP_PACKS), [totalQuotaKm]);
  const selectedPrice = useMemo(
    () => selectedOffer ? calculateTopUpPrice({ form: props.form, currentQuotaKm: totalQuotaKm, targetQuotaKm: selectedOffer.targetQuotaKm }) : null,
    [selectedOffer, props.form, totalQuotaKm]
  );

  const tamperFlag = Boolean(props.form.odometer.scanResult?.qualityChecks.some((check) => check.id === 'tamper' && check.status !== 'PASS'));
  const claimGuardrail = evaluateClaimMileageContext({ usedKm, totalQuotaKm, toleranceKm: PRODUCT_RULES.administrativeToleranceKm, tamperFlag });

  const addAudit = (event: AuditEvent) => {
    setAuditTrail((previous) => [event, ...previous]);
    props.onAddAudit(event);
  };

  useEffect(() => {
    if (thresholdKey === lastThresholdRef.current) return;
    lastThresholdRef.current = thresholdKey;
    if (thresholdKey === 'NORMAL') return;

    const event = createAuditEvent({
      type: thresholdKey === '75' ? 'MILEAGE_75_REACHED' : thresholdKey === '90' ? 'MILEAGE_90_REACHED' : 'OVER_MILEAGE_REACHED',
      title: thresholdKey === '75' ? 'Reminder 75% dipicu' : thresholdKey === '90' ? 'Reminder 90% dipicu' : 'Over-mileage terdeteksi',
      detail: `Penggunaan mencapai ${percentage}% dari ${formatNumber(totalQuotaKm)} km. Kanal: ${props.form.customer.notificationChannels.join(', ') || 'belum dipilih'}.`,
      source: 'SYSTEM'
    });
    setAuditTrail((previous) => [event, ...previous]);
    props.onAddAudit(event);
  }, [thresholdKey, percentage, totalQuotaKm, props.form.customer.notificationChannels, props.onAddAudit]);

  const confirmTopUp = async () => {
    if (!selectedOffer || !selectedPrice || selectedPrice.premiumDifference === null || upgrading) return;
    const premiumDifference = selectedPrice.premiumDifference;
    setUpgrading(true);

    await new Promise((resolve) => window.setTimeout(resolve, 450));
    addAudit(createAuditEvent({
      type: premiumDifference === 0
        ? 'TOPUP_WITHIN_PAID_BAND'
        : selectedOfferSource === 'AUTO'
          ? 'AUTO_UPGRADE_PAYMENT_AUTHORIZED'
          : 'TOPUP_PAYMENT_AUTHORIZED',
      title: premiumDifference === 0 ? 'Top-up tidak memerlukan tambahan premi' : 'Pembayaran tambahan diotorisasi',
      detail: premiumDifference === 0
        ? `${selectedOffer.pack.code} masih berada dalam band tarif ${selectedOffer.targetBand.code} yang sudah dibayar.`
        : `${formatCurrency(premiumDifference)}; mode ${selectedOfferSource === 'AUTO' ? 'auto-upgrade dengan consent' : 'top-up manual'}. Idempotency dan tokenization masih simulasi.`,
      source: premiumDifference === 0 ? 'PRICING_ENGINE' : 'SYSTEM'
    }));

    await new Promise((resolve) => window.setTimeout(resolve, 450));
    setTotalQuotaKm(selectedOffer.targetQuotaKm);
    addAudit(createAuditEvent({
      type: 'MILEAGE_ENDORSEMENT_ISSUED',
      title: `Endorsement top-up ${selectedOffer.pack.code} diterbitkan`,
      detail: `Kapasitas menjadi ${formatNumber(selectedOffer.targetQuotaKm)} km dan tetap berakhir pada ${formatDate(props.policyEnd)}. Mileage terpakai dipertahankan ${formatNumber(usedKm)} km.`,
      source: 'SYSTEM'
    }));
    addAudit(createAuditEvent({
      type: 'TOPUP_CONFIRMED',
      title: `Top-up ${selectedOffer.pack.code} selesai`,
      detail: `Top-up ${selectedOffer.pack.code} menambah ${formatNumber(selectedOffer.pack.incrementKm)} km sehingga kapasitas menjadi ${formatNumber(selectedOffer.targetQuotaKm)} km. ${premiumDifference === 0 ? 'Tidak ada tambahan premi karena masih dalam band yang sudah dibayar.' : `Tambahan premi ${formatCurrency(premiumDifference)}.`}`,
      source: 'PRICING_ENGINE'
    }));

    setUpgrading(false);
    setSelectedOffer(null);
    setSelectedOfferSource('MANUAL');
  };

  useEffect(() => {
    const autoEnabled = props.form.plan.purchaseMode === 'STARTER_TOPUP'
      && props.form.plan.upgradeMode === 'AUTO'
      && props.form.plan.autoUpgradeConsent
      && props.form.plan.paymentTokenConsent;
    const triggerReached = percentage >= PRODUCT_RULES.autoUpgradeTriggerPercent;
    const offer = recommendTopUpOffer({ currentQuotaKm: totalQuotaKm, projectedPolicyKm: Math.max(annualizedKm, usedKm + 1), packs: TOP_UP_PACKS });

    if (!autoEnabled || !triggerReached || !offer || autoUpgradeQuotaRef.current === totalQuotaKm || selectedOffer) return;

    autoUpgradeQuotaRef.current = totalQuotaKm;
    setSelectedOfferSource('AUTO');
    setSelectedOffer(offer);
    addAudit(createAuditEvent({
      type: 'AUTO_UPGRADE_TRIGGERED',
      title: `Auto top-up ${offer.pack.code} siap diproses`,
      detail: `Trigger ${PRODUCT_RULES.autoUpgradeTriggerPercent}% tercapai. Prototype membuka ringkasan transaksi sebelum simulasi authorization dan endorsement.`,
      source: 'SYSTEM'
    }));
  }, [percentage, annualizedKm, usedKm, totalQuotaKm, selectedOffer, props.form.plan.purchaseMode, props.form.plan.upgradeMode, props.form.plan.autoUpgradeConsent, props.form.plan.paymentTokenConsent, activeBand.code]);

  const runReconciliation = async () => {
    setReconciliationError('');
    setReconciliationSummary(null);
    const startOdometer = Number(props.form.odometer.value || 0);
    const endValue = Number(endOdometer || 0);

    if (!endOdometerFile) {
      setReconciliationError('Unggah foto odometer akhir.');
      return;
    }
    if (!Number.isFinite(endValue) || endValue < startOdometer) {
      setReconciliationError(`Odometer akhir harus sama atau lebih besar dari ${formatNumber(startOdometer)} km.`);
      return;
    }

    setReconciling(true);
    setReconciliationStatus('PROCESSING');
    const result = await scanOdometer({ manualValue: endValue, fileName: endOdometerFile, scenario: 'MATCH' });
    setReconciling(false);
    setReconciliationStatus(result.status);

    if (result.status !== 'SUCCESS') {
      setReconciliationError(result.reviewReason ?? 'Bukti odometer akhir perlu review.');
      return;
    }

    const actualMileageKm = Math.max(0, endValue - startOdometer);
    const summary: ReconciliationSummary = {
      actualMileageKm,
      unusedMileageKm: Math.max(0, totalQuotaKm - actualMileageKm),
      overMileageKm: Math.max(0, actualMileageKm - totalQuotaKm),
      renewalBand: renewalRecommendation(actualMileageKm)
    };
    setReconciliationSummary(summary);
    setUsedKm(actualMileageKm);
    setElapsedDays(365);
    addAudit(createAuditEvent({
      type: 'END_ODOMETER_RECONCILED',
      title: 'Rekonsiliasi odometer akhir selesai',
      detail: `Pemakaian aktual ${formatNumber(actualMileageKm)} km; rekomendasi renewal ${summary.renewalBand}. Treatment sisa mileage masih menunggu keputusan produk.`,
      source: 'VISION_ENGINE'
    }));
  };

  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar">
        <div className="brand-wrap brand-wrap--reference">
          <img src="/brand/danantara.png" alt="Danantara Indonesia" />
          <span className="brand-divider" aria-hidden="true" />
          <img src="/brand/jasindo-white.png" alt="Asuransi Jasindo" />
        </div>
        <div className="dashboard-actions"><button type="button" className="outline-btn" onClick={props.onReset}><RefreshCw size={17} /> Ulangi prototype</button></div>
      </header>

      <main className="dashboard-page">
        <section className="success-hero">
          <div className="success-icon"><CheckCircle2 size={34} /></div>
          <div><span>Polis simulasi aktif</span><h1>{props.form.vehicle.brand} {props.form.vehicle.model} · {props.form.vehicle.plate}</h1><p>{formatDate(props.form.vehicle.policyStart)} – {formatDate(props.policyEnd)}</p></div>
          <div className="policy-number"><span>Nomor polis</span><strong>601-MIL-{new Date().getFullYear()}-000128</strong></div>
        </section>

        <div className="dashboard-grid">
          <section className="dashboard-main">
            <article className="dashboard-card mileage-card">
              <div className="dashboard-card-head">
                <div><span className="overline">MILEAGE AKTIF</span><h2>{activeBand.code} · total {formatNumber(totalQuotaKm)} km</h2><p>Band tarif mengikuti total mileage yang dimiliki, bukan harga per kilometer.</p></div>
                <StatusBadge status={status} label={`${statusLabel} · ${percentage}%`} />
              </div>

              <div className="mileage-progress"><div style={{ width: `${Math.min(100, percentage)}%` }} /></div>
              <div className="mileage-metrics">
                <div><span>Terpakai</span><strong>{formatNumber(usedKm)} km</strong></div>
                <div><span>Sisa</span><strong>{formatNumber(remainingKm)} km</strong></div>
                <div><span>Toleransi simulasi tersisa</span><strong>{formatNumber(toleranceRemaining)} km</strong></div>
                <div><span>Proyeksi habis</span><strong>{projectedExhaustion ? formatDate(projectedExhaustion) : 'Belum cukup data'}</strong></div>
              </div>

              {props.form.plan.purchaseMode === 'STARTER_TOPUP' && (
                <div className={`auto-upgrade-state ${props.form.plan.upgradeMode === 'AUTO' ? 'armed' : ''}`}>
                  <BellRing size={19} />
                  <div><strong>{props.form.plan.upgradeMode === 'AUTO' ? 'Auto-upgrade siap' : 'Top-up manual aktif'}</strong><span>{props.form.plan.upgradeMode === 'AUTO' ? `Pre-notification pada 90%; trigger simulasi ${PRODUCT_RULES.autoUpgradeTriggerPercent}%. Tidak ada debit tanpa token dan consent valid.` : 'Nasabah memilih upgrade setelah menerima reminder.'}</span></div>
                </div>
              )}

              {percentage < 75 && <Callout tone="success" title="Pemakaian masih aman">Sistem tetap menghitung proyeksi dan tidak melakukan hard selling.</Callout>}
              {percentage >= 75 && percentage < 90 && <Callout title="Reminder 75%">Early warning dikirim melalui {props.form.customer.notificationChannels.join(', ')}.</Callout>}
              {percentage >= 90 && percentage < 100 && <Callout tone="warning" title="Reminder 90%">Top-up atau auto-upgrade disiapkan sebelum batas tercapai.</Callout>}
              {percentage >= 100 && usedKm <= totalQuotaKm + PRODUCT_RULES.administrativeToleranceKm && <Callout tone="warning" title="Mileage terlampaui, tetapi masih dalam toleransi simulasi">Polis tidak otomatis berhenti. Penyesuaian premi perlu diselesaikan secara transparan.</Callout>}
              {usedKm > totalQuotaKm + PRODUCT_RULES.administrativeToleranceKm && <Callout tone="danger" title="Melewati toleransi simulasi">Transaksi penyesuaian dan review diperlukan. Klaim tetap tidak boleh ditolak otomatis hanya karena kondisi ini.</Callout>}

              <div className="topup-center">
                <div className="section-heading"><div><span>Tambah Mileage</span><h2>Pilih T1, T3, T5, atau T10</h2><p>Setiap pack menambah kilometer sesuai nominalnya. Harga tetap mengikuti selisih band dan semua top-up berakhir pada {formatDate(props.policyEnd)}.</p></div></div>
                <div className="topup-grid">
                  {topUpOffers.map((offer) => {
                    const price = calculateTopUpPrice({ form: props.form, currentQuotaKm: totalQuotaKm, targetQuotaKm: offer.targetQuotaKm });
                    return (
                      <button type="button" className="topup-card" key={offer.pack.code} onClick={() => { setSelectedOfferSource('MANUAL'); setSelectedOffer(offer); }}>
                        <span>{offer.pack.code}{offer.bestValueInTargetBand ? ' · paling efisien' : ''}</span><strong>Tambah {formatNumber(offer.pack.incrementKm)} km</strong><small>Total menjadi {formatNumber(offer.targetQuotaKm)} km · band tarif {offer.targetBand.code}</small><b>{price.premiumDifference === null ? 'Review' : price.premiumDifference === 0 ? 'Tanpa tambahan premi' : formatCurrency(price.premiumDifference)}</b>
                      </button>
                    );
                  })}
                  {topUpOffers.length === 0 && <div className="topup-empty">M30 adalah batas tertinggi prototype. Penggunaan berikutnya harus melalui referral.</div>}
                </div>
              </div>
            </article>

            <div className="dashboard-two-column">
              <article className="dashboard-card">
                <div className="dashboard-card-title"><Sparkles size={19} /><div><span>Renewal Intelligence</span><h3>Rekomendasi periode berikutnya</h3></div></div>
                <div className="renewal-metric"><span>Proyeksi penggunaan aktual</span><strong>{formatNumber(annualizedKm)} km/tahun</strong></div>
                <div className="renewal-metric"><span>Band renewal</span><strong>{renewalBand}</strong></div>
                <p className="dashboard-note">Rekomendasi final membutuhkan rekonsiliasi odometer akhir atau telematics yang terverifikasi.</p>
                <button type="button" className="secondary-btn full-width" onClick={() => setReconciliationOpen(true)}><ScanLine size={17} /> Mulai rekonsiliasi akhir</button>
              </article>

              <article className="dashboard-card">
                <div className="dashboard-card-title"><ShieldCheck size={19} /><div><span>Status perlindungan</span><h3>Polis tetap mengikuti masa pertanggungan</h3></div></div>
                <ul className="guardrail-list"><li>Status perlindungan dari konteks mileage: <strong>Aktif</strong>.</li><li>Mileage habis tidak menjadi keputusan penolakan klaim otomatis.</li><li>{claimGuardrail.reason}</li><li>Indikasi manipulasi tetap dapat memicu investigasi manual.</li></ul><details className="technical-disclosure decision-technical"><summary>Detail sistem</summary><p>Action code: {claimGuardrail.action}; automaticDeclineAllowed: {String(claimGuardrail.automaticDeclineAllowed)}.</p></details>
              </article>
            </div>

            {reconciliationSummary && (
              <article className="dashboard-card reconciliation-result-card">
                <div className="dashboard-card-title"><CalendarClock size={19} /><div><span>Rekonsiliasi selesai</span><h3>Odometer akhir sudah diverifikasi</h3></div></div>
                <div className="mileage-metrics">
                  <div><span>Pemakaian aktual</span><strong>{formatNumber(reconciliationSummary.actualMileageKm)} km</strong></div>
                  <div><span>Sisa mileage</span><strong>{formatNumber(reconciliationSummary.unusedMileageKm)} km</strong></div>
                  <div><span>Over mileage</span><strong>{formatNumber(reconciliationSummary.overMileageKm)} km</strong></div>
                  <div><span>Rekomendasi renewal</span><strong>{reconciliationSummary.renewalBand}</strong></div>
                </div>
                <Callout tone="warning" title="Treatment sisa mileage belum dikunci">PDF sumber menempatkan hangus, kredit renewal, atau refund sebagai keputusan produk. Prototype tidak menetapkannya sebagai hak/kewajiban final.</Callout>
              </article>
            )}

            <article className="dashboard-card simulator-card">
              <div className="dashboard-card-title"><Activity size={19} /><div><span>Mode simulasi prototype</span><h3>Uji reminder dan over-mileage</h3></div></div>
              <label>Mileage terpakai: <strong>{formatNumber(usedKm)} km</strong><input type="range" min="0" max={Math.max(35_000, totalQuotaKm + 2_000)} step="100" value={usedKm} onChange={(event) => setUsedKm(Number(event.target.value))} /></label>
              <label>Hari berjalan: <strong>{elapsedDays} hari</strong><input type="range" min="10" max="365" step="5" value={elapsedDays} onChange={(event) => setElapsedDays(Number(event.target.value))} /></label>
              <div className="simulator-shortcuts"><button type="button" onClick={() => setUsedKm(Math.round(totalQuotaKm * 0.75))}>75%</button><button type="button" onClick={() => setUsedKm(Math.round(totalQuotaKm * 0.9))}>90%</button><button type="button" onClick={() => setUsedKm(totalQuotaKm + 100)}>Over mileage</button><button type="button" onClick={() => setUsedKm(totalQuotaKm + PRODUCT_RULES.administrativeToleranceKm + 100)}>Over tolerance</button></div>
            </article>
          </section>

          <aside className="dashboard-side">
            <article className="dashboard-card">
              <span className="overline">RINGKASAN POLIS</span>
              <h3>{props.form.vehicle.coverage === 'COMPREHENSIVE' ? 'Comprehensive' : 'TLO'}</h3>
              <SummaryRow label="Skema" value={props.form.plan.purchaseMode === 'STARTER_TOPUP' ? 'Starter + Top-Up' : 'Band Tahunan'} />
              <SummaryRow label="Band aktif" value={activeBand.code} />
              <SummaryRow label="Periode" value="12 bulan" />
              <SummaryRow label="Dibayar awal" value={formatCurrency(props.quote.upfront.total)} strong />
            </article>

            <article className="dashboard-card audit-card">
              <div className="dashboard-card-title"><ClipboardList size={19} /><div><span>Audit trail</span><h3>Aktivitas penting</h3></div></div>
              <div className="audit-list">
                {auditTrail.slice(0, 9).map((event) => <div key={event.id}><span>{new Date(event.at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span><strong>{event.title}</strong><small>{event.detail}</small></div>)}
              </div>
            </article>

            <button type="button" className="side-action" disabled title="Membutuhkan integrasi policy administration"><FileText size={18} /> Lihat detail polis · segera tersedia</button>
            <button type="button" className="side-action" disabled title="Membutuhkan integrasi payment gateway"><WalletCards size={18} /> Riwayat pembayaran · segera tersedia</button>
            <button type="button" className="side-action" onClick={() => setReconciliationOpen(true)}><CalendarClock size={18} /> Rekonsiliasi odometer akhir</button>
          </aside>
        </div>
      </main>

      <Modal
        open={Boolean(selectedOffer)}
        onClose={() => { if (!upgrading) { setSelectedOffer(null); setSelectedOfferSource('MANUAL'); } }}
        title={selectedOffer ? `${selectedOfferSource === 'AUTO' ? 'Auto top-up siap' : 'Konfirmasi top-up'} ${selectedOffer.pack.code}` : 'Konfirmasi top-up'}
        footer={<><button type="button" className="ghost-btn" disabled={upgrading} onClick={() => { setSelectedOffer(null); setSelectedOfferSource('MANUAL'); }}>Batal</button><LoadingButton type="button" className="primary-btn" loading={upgrading} disabled={!selectedOffer || !selectedPrice || selectedPrice.premiumDifference === null} onClick={confirmTopUp}>{selectedOfferSource === 'AUTO' ? 'Proses Auto Top-Up' : 'Konfirmasi Top-Up'}</LoadingButton></>}
      >
        {selectedOffer && selectedPrice && (
          <div className="topup-modal-content">
            {selectedOfferSource === 'AUTO' && <Callout title="Dipicu dari persetujuan awal" compact>Ringkasan tetap ditampilkan pada prototype. Production harus menyimpan consent, mengirim pre-notification, memakai idempotency key, dan menerbitkan endorsement setelah pembayaran berhasil.</Callout>}
            <div className="topup-transition"><div><span>Sebelum</span><strong>{formatNumber(totalQuotaKm)} km · {activeBand.code}</strong></div><Gauge size={22} /><div><span>Sesudah</span><strong>{formatNumber(selectedOffer.targetQuotaKm)} km · {selectedOffer.targetBand.code}</strong></div></div>
            <SummaryRow label="Referensi paket top-up" value={selectedOffer.pack.code} />
            <SummaryRow label="Tambahan kapasitas efektif" value={`+${formatNumber(selectedOffer.pack.incrementKm)} km`} />
            <SummaryRow label="Tambahan premi" value={selectedPrice.premiumDifference === null ? 'Perlu review' : selectedPrice.premiumDifference === 0 ? 'Tanpa tambahan premi' : formatCurrency(selectedPrice.premiumDifference)} strong />
            <SummaryRow label="Tanggal berakhir" value={formatDate(props.policyEnd)} />
            {selectedPrice.parityCheck ? <Callout tone="success" title="Perhitungan top-up konsisten">Tambahan premi membuat total komponen mileage sama dengan paket tujuan.</Callout> : <Callout tone="warning" title="Perhitungan top-up perlu diperiksa">Konsistensi harga upgrade belum lolos pemeriksaan.</Callout>}
          </div>
        )}
      </Modal>

      <Modal
        open={reconciliationOpen}
        onClose={() => setReconciliationOpen(false)}
        title="Rekonsiliasi odometer akhir"
        footer={<><button type="button" className="ghost-btn" onClick={() => setReconciliationOpen(false)}>Tutup</button><LoadingButton type="button" className="primary-btn" loading={reconciling} onClick={runReconciliation}><ScanLine size={17} /> Verifikasi & Rekonsiliasi</LoadingButton></>}
      >
        <div className="reconciliation-form">
          <Callout title="Tujuan rekonsiliasi" compact>Band renewal ditentukan dari mileage aktual. Treatment sisa mileage belum diputuskan dalam dokumen konsep.</Callout>
          <Field label="Odometer awal"><div className="readonly-value">{formatNumber(Number(props.form.odometer.value || 0))} km</div></Field>
          <Field label="Odometer akhir" required><div className="input-suffix"><input type="number" min={Number(props.form.odometer.value || 0)} value={endOdometer} onChange={(event) => { setEndOdometer(event.target.value); setReconciliationStatus('IDLE'); setReconciliationSummary(null); }} /><span>km</span></div></Field>
          <Field label="Foto odometer akhir" required><UploadBox label="Unggah bukti akhir" fileName={endOdometerFile} accept="image/*" onChange={(file) => { setEndOdometerFile(file?.name ?? ''); setReconciliationStatus('IDLE'); }} /></Field>
          <div className="reconciliation-status"><span>Status pemeriksaan foto</span><StatusBadge status={reconciliationStatus} label={reconciliationStatus === 'SUCCESS' ? 'Terverifikasi' : reconciliationStatus === 'PROCESSING' ? 'Memproses' : reconciliationStatus === 'REVIEW' ? 'Perlu review' : 'Belum diproses'} /></div>
          {reconciliationError && <Callout tone="danger" title="Rekonsiliasi belum dapat diselesaikan" compact>{reconciliationError}</Callout>}
          {reconciliationSummary && <Callout tone="success" title="Rekonsiliasi berhasil" compact>Pemakaian aktual {formatNumber(reconciliationSummary.actualMileageKm)} km dengan rekomendasi renewal {reconciliationSummary.renewalBand}.</Callout>}
        </div>
      </Modal>
    </div>
  );
}
