import { Check, ShieldCheck } from 'lucide-react';
import { ADD_ONS } from '../config/productConfig';
import type { PremiumBreakdown, QuoteForm } from '../domain/types';
import { Callout, StepHeading } from '../components/UI';
import { formatCurrency } from '../utils/format';

export function ProtectionScreen(props: {
  form: QuoteForm;
  breakdown: PremiumBreakdown;
  onToggleAddOn: (id: string) => void;
}) {
  return (
    <>
      <StepHeading
        eyebrow="Lengkapi pilihan paket"
        title="Susun perlindungan dengan transparan"
        description="Komponen risiko tetap, mileage, loading, dan perluasan dipisahkan agar nasabah memahami apa yang dibayar."
        icon={<ShieldCheck size={24} />}
      />

      <div className="coverage-hero">
        <div className="coverage-hero-icon"><ShieldCheck size={29} /></div>
        <div><span>Perlindungan utama</span><h2>{props.form.vehicle.coverage === 'COMPREHENSIVE' ? 'Comprehensive' : 'Total Loss Only'}</h2><p>{props.form.vehicle.brand} {props.form.vehicle.model} · Nilai pertanggungan {formatCurrency(Number(props.form.vehicle.sumInsured || 0))}</p></div>
      </div>

      <section className="plan-section">
        <div className="section-heading"><div><span>Perluasan opsional</span><h2>Pilih manfaat yang relevan</h2></div></div>
        <div className="addon-grid">
          {ADD_ONS.map((addon) => {
            const selected = props.form.protection.addOns.includes(addon.id);
            return (
              <button type="button" key={addon.id} aria-pressed={selected} className={`addon-card ${selected ? 'selected' : ''}`} onClick={() => props.onToggleAddOn(addon.id)}>
                <span className="addon-check">{selected && <Check size={16} />}</span>
                <span className="addon-copy"><strong>{addon.title}</strong><small>{addon.description}</small></span>
                <strong className="addon-price">+ {formatCurrency(addon.premium)}</strong>
              </button>
            );
          })}
        </div>
      </section>

      <div className="premium-anatomy">
        <div><span>Premi dasar</span><strong>{formatCurrency(props.breakdown.baseRiskPremium)}</strong><small>Risiko tetap selama polis aktif.</small></div>
        <div><span>Komponen mileage</span><strong>{formatCurrency(props.breakdown.mileagePremium)}</strong><small>Exposure sesuai band aktif.</small></div>
        <div><span>Penyesuaian usia</span><strong>{formatCurrency(props.breakdown.ageLoading)}</strong><small>Perhitungan simulasi; aturan final harus dikunci.</small></div>
        <div><span>Perluasan</span><strong>{formatCurrency(props.breakdown.addOnPremium)}</strong><small>Manfaat tambahan terpilih.</small></div>
      </div>

      <Callout title="Premi dasar penting untuk desain produk">
        Kendaraan tetap memiliki risiko saat parkir atau tidak digunakan. Karena itu produk tidak boleh dihitung sebagai harga per kilometer murni.
      </Callout>
    </>
  );
}
