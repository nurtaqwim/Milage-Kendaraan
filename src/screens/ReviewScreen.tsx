import { CalendarDays, Check, ClipboardCheck, CreditCard } from 'lucide-react';
import { useState } from 'react';
import type { Decision, QuoteComparison, QuoteForm, RiskAssessment, UsageEstimate } from '../domain/types';
import { Callout, EmptyRadio, Modal, StepHeading, SummaryRow } from '../components/UI';
import { getBand } from '../engines/mileageEngine';
import { formatCurrency, formatDate, formatNumber } from '../utils/format';

export function ReviewScreen(props: {
  form: QuoteForm;
  usage: UsageEstimate;
  quote: QuoteComparison;
  decision: Decision;
  risk: RiskAssessment;
  policyEnd: string;
  errors: Record<string, string | undefined>;
  onUpdateConsent: (patch: Partial<QuoteForm['finalConsents']>) => void;
  onPaymentMethod: (method: QuoteForm['paymentMethod']) => void;
  onEdit: (step: number) => void;
}) {
  const [consentOpen, setConsentOpen] = useState(false);
  const activeBand = getBand(props.quote.currentBand);
  const allConsents = props.form.finalConsents.annualPolicy && props.form.finalConsents.mileageMechanism && props.form.finalConsents.topUpExpiry && props.form.finalConsents.claimTreatment;

  return (
    <>
      <StepHeading eyebrow="Langkah 4 dari 4" title="Ringkasan sebelum pembayaran" description="Tinjau kembali polis, pilihan mileage, dan total pembayaran." icon={<ClipboardCheck size={24} />} />

      <section className="checkout-summary-card">
        <div className="checkout-summary-section">
          <h2>Informasi pemegang polis</h2>
          <SummaryRow label="Nama" value={props.form.customer.name} />
          <SummaryRow label="Email" value={props.form.customer.email} />
          <SummaryRow label="Nomor handphone" value={props.form.customer.phone} />
        </div>

        <div className="checkout-summary-section">
          <h2>Informasi kendaraan</h2>
          <SummaryRow label="Merek / tipe" value={`${props.form.vehicle.brand} ${props.form.vehicle.model}`} />
          <SummaryRow label="Nomor polisi" value={props.form.vehicle.plate} />
          <SummaryRow label="Tahun pembuatan" value={props.form.vehicle.year} />
          <SummaryRow label="Harga pertanggungan" value={formatCurrency(Number(props.form.vehicle.sumInsured || 0))} />
          <SummaryRow label="Periode perlindungan" value={`${formatDate(props.form.vehicle.policyStart)} – ${formatDate(props.policyEnd)}`} />
        </div>

        <div className="checkout-summary-section">
          <h2>Perlindungan & mileage</h2>
          <SummaryRow label="Perlindungan" value="Comprehensive" />
          <SummaryRow label="Mileage awal" value={`${activeBand.code} · ${formatNumber(activeBand.limitKm)} km`} />
          <SummaryRow label="Odometer awal" value={`${formatNumber(Number(props.form.odometer.value))} km`} />
          <SummaryRow label="Pilihan top-up" value={props.form.plan.purchaseMode === 'STARTER_TOPUP' ? 'Starter M5 + Top-Up' : 'Band tahunan'} />
        </div>

        <div className="checkout-summary-section checkout-payment-summary">
          <h2>Ringkasan pembayaran</h2>
          <div className="checkout-total"><span>Total pembayaran</span><strong>{formatCurrency(props.quote.upfront.total)}</strong></div>
          <SummaryRow label="Premi dasar" value={formatCurrency(props.quote.upfront.baseRiskPremium)} />
          <SummaryRow label="Komponen mileage" value={formatCurrency(props.quote.upfront.mileagePremium)} />
          {props.quote.upfront.addOnPremium > 0 && <SummaryRow label="Premi perluasan" value={formatCurrency(props.quote.upfront.addOnPremium)} />}
          <SummaryRow label="Administrasi" value={formatCurrency(props.quote.upfront.administrationFee)} />
        </div>
      </section>

      <section className="payment-card checkout-payment-method">
        <div className="payment-card-head"><CreditCard size={21} /><div><strong>Pilih Metode Pembayaran</strong><span>Pilih metode pembayaran untuk melanjutkan proses polis.</span></div></div>
        <div className="payment-options">
          {([['VA', 'Virtual Account'], ['QRIS', 'QRIS'], ['CARD', 'Kartu Debit/Kredit']] as const).map(([code, label]) => (
            <button type="button" key={code} aria-pressed={props.form.paymentMethod === code} className={`payment-option ${props.form.paymentMethod === code ? 'selected' : ''}`} onClick={() => props.onPaymentMethod(code)}>
              <EmptyRadio selected={props.form.paymentMethod === code} /><strong>{label}</strong>
            </button>
          ))}
        </div>
        {props.errors.paymentMethod && <p className="field-message error" role="alert">{props.errors.paymentMethod}</p>}
      </section>

      <section className={`checkout-consent ${props.errors.annualPolicy || props.errors.mileageMechanism || props.errors.topUpExpiry || props.errors.claimTreatment ? 'invalid' : ''}`}>
        <div className="external-consent-row">
          <button type="button" className={`external-consent-check ${allConsents ? 'checked' : ''}`} onClick={() => setConsentOpen(true)} aria-label={allConsents ? 'Persetujuan sudah disetujui' : 'Buka syarat dan ketentuan persetujuan'}><Check size={14} /></button>
          <p>Saya telah membaca dan menyetujui <button type="button" onClick={() => setConsentOpen(true)}>Syarat dan Ketentuan Persetujuan</button> atas SPAU elektronik ini.</p>
        </div>
        {(props.errors.annualPolicy || props.errors.mileageMechanism || props.errors.topUpExpiry || props.errors.claimTreatment) && <p className="field-message error" role="alert">Centang persetujuan sebelum melanjutkan pembayaran.</p>}
      </section>

      <div className="policy-period-strip"><CalendarDays size={18} /><span>Periode: {formatDate(props.form.vehicle.policyStart)} – {formatDate(props.policyEnd)}</span><strong>Polis tetap berlaku 12 bulan.</strong></div>

      <Modal open={consentOpen} onClose={() => setConsentOpen(false)} title="Syarat dan Ketentuan Persetujuan" footer={<><button type="button" className="ghost-btn" onClick={() => setConsentOpen(false)}>Tutup</button><button type="button" className="primary-btn" onClick={() => { props.onUpdateConsent({ annualPolicy: true, mileageMechanism: true, topUpExpiry: true, claimTreatment: true }); setConsentOpen(false); }}>{allConsents ? 'Sudah Disetujui' : 'Saya Setuju'}</button></>}>
        <div className="external-consent-modal">
          <p>Dengan melanjutkan proses ini, Anda menyatakan telah membaca dan memahami poin persetujuan atas SPAU elektronik ini.</p>
          <ol>
            <li><strong>Pemahaman Produk</strong><span>Saya telah menerima penjelasan, membaca, dan memahami informasi produk asuransi ini.</span></li>
            <li><strong>Pemrosesan Data Pribadi</strong><span>Saya memberi izin pemrosesan data untuk penerbitan polis, pelayanan klaim, dan peningkatan layanan sesuai ketentuan yang berlaku.</span></li>
            <li><strong>Kebenaran Fakta Material</strong><span>Saya menyatakan seluruh informasi dalam SPAU ini benar sesuai keadaan yang saya ketahui dan menjadi dasar penerbitan polis.</span></li>
          </ol>
        </div>
      </Modal>
    </>
  );
}
