import { useState } from 'react';
import { BellRing, Crosshair, Fingerprint, IdCard, Mail, MapPin, MessageCircle, Phone, ScanFace, UserRound } from 'lucide-react';
import type { QuoteForm } from '../domain/types';
import { CheckboxRow, Field, LoadingButton, Modal, StatusBadge, StepHeading, UploadBox } from '../components/UI';
import { normalizeDigits } from '../utils/format';

export function CustomerScreen(props: {
  form: QuoteForm;
  errors: Record<string, string | undefined>;
  onUpdate: (patch: Partial<QuoteForm['customer']>) => void;
  onUpdateVehicle: (patch: Partial<QuoteForm['vehicle']>) => void;
  onIdentityFile: (file: File | null) => void;
  onVerifyIdentity: () => void;
  verifying: boolean;
}) {
  const [mapOpen, setMapOpen] = useState(false);
  return (
    <>
      <StepHeading
        eyebrow="Langkah 3 dari 4"
        title="Verifikasi pemegang polis"
        description="Identitas, kontak, dan dokumen diproses melalui consent yang jelas. Prototype mensimulasikan KYC dan pencocokan data."
        icon={<UserRound size={24} />}
      />

      <div className="customer-type-grid">
        {(['PERSONAL', 'COMPANY'] as const).map((type) => (
          <button type="button" key={type} aria-pressed={props.form.customer.type === type} className={`customer-type-card ${props.form.customer.type === type ? 'selected' : ''}`} onClick={() => props.onUpdate({ type, identityStatus: 'IDLE', identityFileName: '', nik: type === 'PERSONAL' ? props.form.customer.nik : '', npwp: type === 'COMPANY' ? props.form.customer.npwp : '' })}>
            {type === 'PERSONAL' ? <UserRound size={22} /> : <IdCard size={22} />}
            <span><strong>{type === 'PERSONAL' ? 'Perorangan' : 'Perusahaan'}</strong><small>{type === 'PERSONAL' ? 'Polis atas nama individu.' : 'Polis atas nama badan usaha.'}</small></span>
          </button>
        ))}
      </div>

      <div className="form-grid two">
        <Field label={props.form.customer.type === 'PERSONAL' ? 'Nama Lengkap' : 'Nama Perusahaan'} required error={props.errors.customerName}>
          <input value={props.form.customer.name} onChange={(event) => props.onUpdate({ name: event.target.value, identityStatus: 'IDLE' })} placeholder="Sesuai KTP" />
        </Field>
        {props.form.customer.type === 'PERSONAL' ? (
          <Field label="NIK" required error={props.errors.nik} hint="Harus 16 digit.">
            <div className="input-icon"><Fingerprint size={17} /><input inputMode="numeric" maxLength={16} value={props.form.customer.nik} onChange={(event) => props.onUpdate({ nik: normalizeDigits(event.target.value).slice(0, 16), identityStatus: 'IDLE' })} placeholder="16 digit NIK" /></div>
          </Field>
        ) : (
          <Field label="NPWP" required error={props.errors.npwp}>
            <div className="input-icon"><Fingerprint size={17} /><input value={props.form.customer.npwp} onChange={(event) => props.onUpdate({ npwp: event.target.value, identityStatus: 'IDLE' })} placeholder="NPWP perusahaan" /></div>
          </Field>
        )}
        <Field label="Email" required error={props.errors.email}>
          <div className="input-icon"><Mail size={17} /><input type="email" value={props.form.customer.email} onChange={(event) => props.onUpdate({ email: event.target.value })} placeholder="nama@email.com" /></div>
        </Field>
        <Field label="Nomor HP" required error={props.errors.phone}>
          <div className="input-icon"><Phone size={17} /><input inputMode="numeric" value={props.form.customer.phone} onChange={(event) => props.onUpdate({ phone: normalizeDigits(event.target.value) })} placeholder="Nomor WhatsApp aktif" /></div>
        </Field>
        <Field label="Alamat" required error={props.errors.address} className="full-span">
          <div className="address-picker">
            <div className="input-icon textarea"><MapPin size={17} /><textarea rows={3} value={props.form.customer.address} onChange={(event) => props.onUpdate({ address: event.target.value })} placeholder="Alamat akan terisi setelah memilih lokasi di peta." /></div>
            <button type="button" className="map-picker-btn" onClick={() => setMapOpen(true)}><MapPin size={16} /> Pilih di peta</button>
          </div>
        </Field>
      </div>

      <section className="vehicle-identity-fields">
        <div><strong>Identitas kendaraan</strong><span>Sesuai yang tercantum pada STNK.</span></div>
        <div className="vehicle-identity-grid">
          <Field label="Nomor Polisi" required error={props.errors.plate}>
            <input value={props.form.vehicle.plate} onChange={(event) => props.onUpdateVehicle({ plate: event.target.value.toUpperCase() })} placeholder="Masukkan nomor polisi / TNKB" />
          </Field>
          <Field label="Nomor Rangka" required error={props.errors.chassisNumber}>
            <input value={props.form.vehicle.chassisNumber} onChange={(event) => props.onUpdateVehicle({ chassisNumber: event.target.value.toUpperCase() })} placeholder="Masukkan nomor rangka kendaraan" />
          </Field>
          <Field label="Nomor Mesin" required error={props.errors.engineNumber}>
            <input value={props.form.vehicle.engineNumber} onChange={(event) => props.onUpdateVehicle({ engineNumber: event.target.value.toUpperCase() })} placeholder="Masukkan nomor mesin kendaraan" />
          </Field>
        </div>
      </section>

      <div className="identity-engine-card">
        <div className="identity-engine-head"><div><ScanFace size={23} /><span><strong>Verifikasi identitas</strong><small>Dokumen dicocokkan dengan data yang diisi.</small></span></div><StatusBadge status={props.form.customer.identityStatus} label={props.form.customer.identityStatus === 'SUCCESS' ? 'Terverifikasi' : props.form.customer.identityStatus === 'REVIEW' ? 'Perlu review' : props.form.customer.identityStatus === 'PROCESSING' ? 'Memproses' : 'Belum diproses'} /></div>
        <div className="identity-engine-actions">
          <UploadBox label={props.form.customer.type === 'PERSONAL' ? 'Unggah KTP' : 'Unggah NPWP/NIB'} fileName={props.form.customer.identityFileName} onChange={props.onIdentityFile} />
          <LoadingButton type="button" className="secondary-btn" loading={props.verifying} onClick={props.onVerifyIdentity} disabled={!props.form.customer.identityFileName}>
            <ScanFace size={17} /> Verifikasi identitas
          </LoadingButton>
        </div>
      </div>


      <section className="notification-preferences">
        <div className="section-heading"><div><span>Pengaturan notifikasi</span><h2>Pilih kanal pengingat mileage</h2><p>Reminder 75%, 90%, over-mileage, dan rekonsiliasi dikirim hanya melalui kanal yang dipilih.</p></div></div>
        <div className="notification-channel-grid">
          {([
            ['WHATSAPP', 'WhatsApp', MessageCircle],
            ['EMAIL', 'Email', Mail],
            ['APP', 'Notifikasi Aplikasi', BellRing]
          ] as const).map(([channel, label, Icon]) => {
            const selected = props.form.customer.notificationChannels.includes(channel);
            return (
              <button
                type="button"
                key={channel}
                aria-pressed={selected}
                className={`notification-channel ${selected ? 'selected' : ''}`}
                onClick={() => props.onUpdate({ notificationChannels: selected ? props.form.customer.notificationChannels.filter((item) => item !== channel) : [...props.form.customer.notificationChannels, channel] })}
              >
                <Icon size={20} /><span><strong>{label}</strong><small>{selected ? 'Aktif' : 'Tidak aktif'}</small></span>
              </button>
            );
          })}
        </div>
        {props.errors.notificationChannels && <p className="field-message error" role="alert">{props.errors.notificationChannels}</p>}
      </section>

      <CheckboxRow
        checked={props.form.customer.dataConsent}
        onChange={(checked) => props.onUpdate({ dataConsent: checked })}
        title="Persetujuan pemrosesan data pribadi"
        description="Data digunakan untuk penawaran, underwriting, penerbitan polis, pencegahan fraud, dan layanan terkait sesuai ketentuan yang berlaku."
        error={props.errors.dataConsent}
      />

      <Modal open={mapOpen} onClose={() => setMapOpen(false)} title="Pilih alamat di peta" footer={<button type="button" className="primary-btn" onClick={() => { props.onUpdate({ address: 'Jl. Jenderal Sudirman, Jakarta Selatan, DKI Jakarta' }); setMapOpen(false); }}><Crosshair size={16} /> Gunakan lokasi ini</button>}>
        <div className="map-picker-modal">
          <p>Geser atau perbesar peta untuk meninjau area, lalu gunakan titik di tengah peta.</p>
          <div className="map-frame-wrap"><span className="map-center-pin" aria-hidden="true"><MapPin size={28} fill="#d84949" /></span><iframe title="Peta pilihan alamat" src="https://www.openstreetmap.org/export/embed.html?bbox=106.796%2C-6.235%2C106.846%2C-6.195&amp;layer=mapnik" loading="lazy" /></div>
          <small>Prototype menggunakan contoh lokasi Jakarta Selatan. Integrasi produksi perlu geocoding dan penyimpanan koordinat dengan persetujuan nasabah.</small>
        </div>
      </Modal>
    </>
  );
}
