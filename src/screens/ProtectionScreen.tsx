import { Check, ChevronDown, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { ADD_ONS } from '../config/productConfig';
import type { PremiumBreakdown, QuoteForm } from '../domain/types';
import { StepHeading } from '../components/UI';
import { formatCurrency } from '../utils/format';

export function ProtectionScreen(props: {
  form: QuoteForm;
  breakdown: PremiumBreakdown;
  onToggleAddOn: (id: string) => void;
  summary?: ReactNode;
}) {
  const [expandedAddOn, setExpandedAddOn] = useState<string | null>(null);
  return (
    <>
      <StepHeading
        eyebrow="Lengkapi pilihan paket"
        title="Susun perlindungan dengan transparan"
        description="Pilih perluasan yang paling relevan untuk melengkapi perlindungan kendaraan Anda."
        icon={<ShieldCheck size={24} />}
      />

      <div className={`protection-layout ${props.summary ? 'with-summary' : ''}`}>
        <div className="protection-main">
      <div className="coverage-hero">
        <div className="coverage-hero-icon"><ShieldCheck size={29} /></div>
        <div><span>Perlindungan utama</span><h2>Comprehensive</h2><p>{props.form.vehicle.brand} {props.form.vehicle.model} · Nilai pertanggungan {formatCurrency(Number(props.form.vehicle.sumInsured || 0))}</p></div>
      </div>

      <section className="plan-section">
        <div className="section-heading"><div><span>Perluasan opsional</span><h2>Pilih manfaat yang relevan</h2></div></div>
        <div className="addon-grid">
          {ADD_ONS.map((addon) => {
            const selected = props.form.protection.addOns.includes(addon.id);
            const expanded = expandedAddOn === addon.id;
            return (
              <article key={addon.id} className={`external-addon-card ${selected ? 'selected' : ''} ${expanded ? 'expanded' : ''}`}>
                <button type="button" className="external-addon-select" aria-pressed={selected} onClick={() => props.onToggleAddOn(addon.id)}>
                  <span className="addon-check">{selected && <Check size={16} />}</span>
                  <span><strong>{addon.title}</strong><small>{selected ? 'Dipilih sebagai perluasan perlindungan.' : 'Tambahkan ke perlindungan Anda.'}</small>{selected && <em><Check size={13} /> Dipilih</em>}</span>
                </button>
                <button type="button" className="external-addon-detail" onClick={() => setExpandedAddOn(expanded ? null : addon.id)} aria-expanded={expanded} aria-label={`Detail ${addon.title}`}><strong>+ {formatCurrency(addon.premium)}</strong><ChevronDown size={17} /></button>
                {expanded && <div className="external-addon-detail-copy"><p>{addon.description}</p><small>Premi perluasan ditambahkan ke total pembayaran setelah dipilih.</small></div>}
              </article>
            );
          })}
        </div>
      </section>
        </div>
        {props.summary && <aside className="protection-summary">{props.summary}</aside>}
      </div>
    </>
  );
}
