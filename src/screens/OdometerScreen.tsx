import { Camera, CheckCircle2, Gauge, ScanLine } from 'lucide-react';
import type { QuoteForm } from '../domain/types';
import type { ScanScenario } from '../engines/documentEngine';
import { Callout, Field, LoadingButton, StatusBadge, StepHeading, UploadBox } from '../components/UI';

export function OdometerScreen(props: {
  form: QuoteForm;
  errors: Record<string, string | undefined>;
  scenario: ScanScenario;
  onUpdate: (patch: Partial<QuoteForm['odometer']>) => void;
  onFile: (file: File | null) => void;
  onScan: () => void;
  scanning: boolean;
}) {
  const status = props.form.odometer.scanStatus;
  const verified = status === 'SUCCESS' || status === 'REVIEW';

  return (
    <>
      <StepHeading
        eyebrow="Bagian data kendaraan"
        title="Konfirmasi kilometer awal"
        description="Unggah foto odometer yang jelas untuk mengonfirmasi kilometer awal kendaraan."
        icon={<Gauge size={24} />}
      />

      <div className="evidence-layout evidence-layout--simple">
        <section className="evidence-input-card">
          <Field label="Odometer Saat Ini" required error={props.errors.odometer} hint="Masukkan angka tanpa titik atau koma.">
            <div className="input-suffix"><input type="number" min="0" value={props.form.odometer.value} onChange={(event) => props.onUpdate({ value: event.target.value, scanStatus: 'IDLE', scanResult: null })} placeholder="Angka di speedometer" /><span>km</span></div>
          </Field>
          <Field label="Foto Odometer" required error={props.errors.odometerFile} hint="Ambil foto lurus, tajam, dan bebas pantulan.">
            <UploadBox label="Unggah foto odometer" fileName={props.form.odometer.fileName} accept="image/*" onChange={props.onFile} />
          </Field>
          {props.form.odometer.previewUrl && <img className="odometer-preview" src={props.form.odometer.previewUrl} alt="Preview foto odometer" />}
          <LoadingButton type="button" className="primary-btn" loading={props.scanning} onClick={props.onScan} disabled={!props.form.odometer.fileName || !props.form.odometer.value}>
            <ScanLine size={18} /> Verifikasi foto
          </LoadingButton>
        </section>

        <section className={`photo-check-status ${verified ? 'verified' : status === 'MISMATCH' ? 'needs-action' : ''}`}>
          {verified ? <CheckCircle2 size={28} /> : <Camera size={28} />}
          <div>
            <span>Pemeriksaan foto</span>
            <strong>{status === 'SUCCESS' ? 'Foto odometer diterima' : status === 'REVIEW' ? 'Foto diterima, akan dikonfirmasi' : status === 'MISMATCH' ? 'Foto perlu diperiksa ulang' : 'Belum diverifikasi'}</strong>
            <p>{verified ? 'Bukti Anda sudah diterima. Pemeriksaan detail diproses di sistem.' : status === 'MISMATCH' ? 'Pastikan angka pada foto sama dengan angka yang diisi.' : 'Unggah foto yang jelas, lalu pilih Verifikasi foto.'}</p>
          </div>
          <StatusBadge status={status} label={verified ? 'Siap' : status === 'MISMATCH' ? 'Perlu tindakan' : 'Menunggu'} />
        </section>
      </div>

      {status === 'MISMATCH' && <Callout tone="warning" title="Foto perlu diperbarui">Pastikan foto terang, tidak buram, dan angka yang terlihat sama dengan angka odometer yang diisi.</Callout>}
    </>
  );
}
