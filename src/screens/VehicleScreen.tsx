import { CarFront, FileSearch, Search, X } from 'lucide-react';
import { useState } from 'react';
import type { QuoteForm } from '../domain/types';
import { Callout, Field, LoadingButton, StepHeading, UploadBox } from '../components/UI';
import { formatCurrency } from '../utils/format';

const VEHICLE_OPTIONS = [
  'Honda Brio Satya', 'Honda CR-V', 'Honda HR-V', 'Toyota Avanza',
  'Toyota Innova Zenix', 'Mitsubishi Xpander', 'Suzuki Ertiga', 'Daihatsu Terios'
];

export function VehicleScreen(props: {
  form: QuoteForm;
  errors: Record<string, string | undefined>;
  onUpdate: (patch: Partial<QuoteForm['vehicle']>) => void;
  onStnkFile: (file: File | null) => void;
  onScanStnk: () => void;
  scanning: boolean;
}) {
  const [vehicleSearchOpen, setVehicleSearchOpen] = useState(false);
  const year = Number(props.form.vehicle.year || 0);
  const age = year ? new Date().getFullYear() - year : 0;
  const sumInsured = Number(props.form.vehicle.sumInsured || 0);
  const vehicleValue = [props.form.vehicle.brand, props.form.vehicle.model].filter(Boolean).join(' ');
  const vehicleSuggestions = VEHICLE_OPTIONS.filter((item) => item.toLowerCase().includes(vehicleValue.toLowerCase())).slice(0, 6);
  const updateVehicle = (value: string) => {
    const [brand = '', ...modelParts] = value.trim().split(/\s+/);
    props.onUpdate({ brand, model: modelParts.join(' ') });
  };

  return (
    <>
      <StepHeading
        eyebrow="Langkah 1 dari 4"
        title="Data kendaraan"
        description="Masukkan detail kendaraan untuk memulai simulasi."
        icon={<CarFront size={24} />}
      />

      <div className="stnk-quick-upload">
        <div><strong>Punya foto STNK?</strong><span>Opsional, untuk mengisi data lebih cepat.</span></div>
        <div className="stnk-quick-upload-actions">
          <UploadBox label="Unggah STNK" fileName={props.form.vehicle.stnkFileName} accept="image/*,.pdf" onChange={props.onStnkFile} />
          <LoadingButton type="button" className="secondary-btn" loading={props.scanning} onClick={props.onScanStnk} disabled={!props.form.vehicle.stnkFileName}>
            <FileSearch size={17} /> Gunakan data STNK
          </LoadingButton>
        </div>
      </div>

      {props.form.vehicle.stnkStatus === 'SUCCESS' && <Callout tone="success" title="Data STNK sudah digunakan" compact>Periksa kembali data kendaraan di bawah sebelum melanjutkan.</Callout>}
      {props.form.vehicle.stnkStatus === 'REVIEW' && <Callout tone="warning" title="Lengkapi data kendaraan secara manual" compact>Kami belum dapat menggunakan data dari foto STNK ini.</Callout>}

      <div className="form-grid two">
        <Field label="Merek / Tipe Kendaraan" required error={props.errors.brand ?? props.errors.model}>
          <div className="vehicle-search">
            <Search size={17} aria-hidden="true" />
            <input value={vehicleValue} onFocus={() => setVehicleSearchOpen(true)} onBlur={() => window.setTimeout(() => setVehicleSearchOpen(false), 140)} onChange={(event) => { updateVehicle(event.target.value); setVehicleSearchOpen(true); }} placeholder="Ketuk untuk mencari kendaraan" />
            {vehicleValue && <button type="button" className="vehicle-search-clear" onMouseDown={(event) => event.preventDefault()} onClick={() => { updateVehicle(''); setVehicleSearchOpen(false); }} aria-label="Kosongkan pilihan kendaraan"><X size={16} /></button>}
            {vehicleSearchOpen && <div className="vehicle-search-menu">
              <span className="vehicle-search-menu-label">Pilih kendaraan</span>
              {vehicleSuggestions.length ? vehicleSuggestions.map((item) => <button type="button" key={item} onMouseDown={(event) => event.preventDefault()} onClick={() => { updateVehicle(item); setVehicleSearchOpen(false); }}><strong>{item}</strong><small>Mobil penumpang</small></button>) : <p>Ketik merek atau tipe kendaraan Anda.</p>}
            </div>}
          </div>
        </Field>
        <Field label="Tahun Kendaraan" required error={props.errors.year} hint={age ? `Usia ${age} tahun` : undefined}>
          <input type="number" min="1980" max={new Date().getFullYear()} value={props.form.vehicle.year} onChange={(event) => props.onUpdate({ year: event.target.value })} placeholder="Tahun produksi" />
        </Field>
        <Field label="Harga Pertanggungan" required error={props.errors.sumInsured} hint={sumInsured ? formatCurrency(sumInsured) : 'Masukkan nilai kendaraan'}>
          <div className="input-prefix"><span>Rp</span><input type="number" min="1" value={props.form.vehicle.sumInsured} onChange={(event) => props.onUpdate({ sumInsured: event.target.value })} placeholder="Harga pasar kendaraan" /></div>
        </Field>
        <Field label="Tanggal Mulai Pertanggungan" required error={props.errors.policyStart} hint="Masa polis 12 bulan.">
          <input type="date" value={props.form.vehicle.policyStart} onChange={(event) => props.onUpdate({ policyStart: event.target.value })} />
        </Field>
      </div>

    </>
  );
}
