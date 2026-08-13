import { ArrowLeft, ClipboardList, Clock3, FileSearch, ShieldCheck } from 'lucide-react';
import type { AuditEvent, Decision, QuoteForm, UsageEstimate } from '../domain/types';
import { StatusBadge, SummaryRow } from '../components/UI';
import { formatDate, formatNumber } from '../utils/format';

export function ReferralScreen(props: {
  form: QuoteForm;
  usage: UsageEstimate;
  decision: Decision;
  auditTrail: AuditEvent[];
  onBackToDraft: () => void;
}) {
  const reference = `MIL-REV-${new Date().getFullYear()}-00041`;
  return (
    <div className="referral-shell">
      <header className="dashboard-topbar">
        <div className="brand-wrap"><div className="brand-mark">J</div><div><strong>Jasindo Mileage</strong><span>Pusat pemeriksaan lanjutan</span></div></div>
      </header>
      <main className="referral-page">
        <section className="referral-hero">
          <div className="referral-icon"><FileSearch size={34} /></div>
          <div><span>Permohonan berhasil dikirim</span><h1>Perlu review underwriting</h1><p>Tidak ada pembayaran yang ditagihkan dan polis belum diterbitkan.</p></div>
          <StatusBadge status="REFER" label="REFER" />
        </section>

        <div className="referral-grid">
          <section className="referral-card">
            <div className="dashboard-card-title"><ShieldCheck size={19} /><div><span>Reference</span><h3>{reference}</h3></div></div>
            <SummaryRow label="Kendaraan" value={`${props.form.vehicle.brand} ${props.form.vehicle.model} · ${props.form.vehicle.plate}`} />
            <SummaryRow label="Estimasi mileage" value={`${formatNumber(props.usage.lowerKm)}–${formatNumber(props.usage.upperKm)} km/tahun`} />
            <SummaryRow label="Tanggal pengajuan" value={formatDate(new Date())} />
            <SummaryRow label="Status pembayaran" value="Belum ditagihkan" strong />
          </section>

          <section className="referral-card">
            <div className="dashboard-card-title"><Clock3 size={19} /><div><span>Next best action</span><h3>Pemeriksaan berbasis alasan yang jelas</h3></div></div>
            <p className="referral-copy">Tim underwriting menerima data terstruktur, bukti, tingkat keyakinan, dan alasan pemeriksaan—bukan hanya dokumen mentah. SLA serta kanal komunikasi masih perlu ditentukan sebagai business rule.</p>
            <div className="decision-reasons">
              {props.decision.reasons.filter((reason) => reason.status === 'REFER' || reason.status === 'BLOCK').map((reason) => (
                <div className={`decision-reason reason-${reason.status.toLowerCase()}`} key={reason.code}><strong>{reason.title}</strong><span>{reason.detail}</span><small>{reason.code}</small></div>
              ))}
            </div>
          </section>

          <section className="referral-card referral-audit">
            <div className="dashboard-card-title"><ClipboardList size={19} /><div><span>Audit trail</span><h3>Data yang diteruskan</h3></div></div>
            <div className="audit-list">
              {props.auditTrail.slice(0, 8).map((event) => <div key={event.id}><span>{new Date(event.at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span><strong>{event.title}</strong><small>{event.detail}</small></div>)}
            </div>
          </section>
        </div>

        <button type="button" className="outline-btn referral-back" onClick={props.onBackToDraft}><ArrowLeft size={17} /> Kembali ke draft</button>
      </main>
    </div>
  );
}
