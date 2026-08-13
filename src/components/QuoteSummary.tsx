import { CarFront, CircleDollarSign, Sparkles } from 'lucide-react';
import type { QuoteForm, QuoteComparison, UsageEstimate } from '../domain/types';
import { getBand } from '../engines/mileageEngine';
import { formatCurrency, formatDate, formatNumber } from '../utils/format';
import { SummaryRow } from './UI';

export function QuoteSummary(props: {
  form: QuoteForm;
  quote: QuoteComparison;
  usage: UsageEstimate;
  policyEnd: string;
}) {
  const currentBand = getBand(props.quote.currentBand);
  return (
    <aside className="quote-summary">
      <div className="summary-card">
        <div className="summary-card-head"><span>Ringkasan penawaran</span><CircleDollarSign size={21} /></div>
        <div className="vehicle-mini">
          <div className="vehicle-mini-icon"><CarFront size={23} /></div>
          <div><strong>{props.form.vehicle.brand} {props.form.vehicle.model}</strong><span>{props.form.vehicle.plate} · {props.form.vehicle.year}</span></div>
        </div>
        <SummaryRow label="Pertanggungan" value={props.form.vehicle.coverage === 'COMPREHENSIVE' ? 'Comprehensive' : 'TLO'} />
        <SummaryRow label="Skema pembelian" value={props.form.plan.purchaseMode === 'STARTER_TOPUP' ? 'Starter + Top-Up' : 'Band Tahunan'} />
        <SummaryRow label="Mileage awal" value={`${currentBand.code} · ${formatNumber(currentBand.limitKm)} km`} />
        <SummaryRow label="Periode" value={`${formatDate(props.form.vehicle.policyStart)} – ${formatDate(props.policyEnd)}`} />
        <div className="summary-divider" />
        <SummaryRow label="Premi dasar" value={formatCurrency(props.quote.upfront.baseRiskPremium)} />
        <SummaryRow label="Komponen mileage" value={formatCurrency(props.quote.upfront.mileagePremium)} />
        {props.quote.upfront.ageLoading > 0 && <SummaryRow label="Penyesuaian usia (simulasi)" value={formatCurrency(props.quote.upfront.ageLoading)} />}
        <SummaryRow label="Perluasan" value={formatCurrency(props.quote.upfront.addOnPremium)} />
        <SummaryRow label="Administrasi" value={formatCurrency(props.quote.upfront.administrationFee)} />
        <div className="summary-total"><span>{props.usage.recommendedBand ? 'Dibayar sekarang' : 'Status harga'}</span><strong>{props.usage.recommendedBand ? formatCurrency(props.quote.upfront.total) : 'Perlu review'}</strong><small>{props.usage.recommendedBand ? 'Harga simulasi untuk pengujian alur.' : 'Tidak ada pembayaran sampai underwriting memberi penawaran.'}</small></div>
        {props.usage.recommendedBand && props.form.plan.purchaseMode === 'STARTER_TOPUP' && props.quote.expectedBand !== props.quote.currentBand && (
          <div className="expected-cost"><span>Estimasi total setahun jika mencapai {props.quote.expectedBand}</span><strong>{formatCurrency(props.quote.expectedAnnual.total)}</strong></div>
        )}
      </div>

      <div className="recommendation-side">
        <Sparkles size={19} />
        <div><span>Rekomendasi sistem</span><strong>{props.usage.recommendedBand ? `${props.usage.recommendedBand} · rentang` : 'Referral · rentang'} {formatNumber(props.usage.lowerKm)}–{formatNumber(props.usage.upperKm)} km</strong><small>Tingkat keyakinan {props.usage.confidence === 'HIGH' ? 'tinggi' : props.usage.confidence === 'MEDIUM' ? 'sedang' : 'rendah'}.</small></div>
      </div>
    </aside>
  );
}
