import { BrainCircuit, Link2, Route, Satellite } from 'lucide-react';
import type { QuoteForm, UsageEstimate } from '../domain/types';
import { Callout, CheckboxRow, Field, LoadingButton, StatusBadge, StepHeading } from '../components/UI';
import { formatNumber } from '../utils/format';

export function UsageScreen(props: {
  form: QuoteForm;
  estimate: UsageEstimate;
  errors: Record<string, string | undefined>;
  onUpdate: (patch: Partial<QuoteForm['usage']>) => void;
  onConnectTelematics: () => void;
  connectingTelematics: boolean;
}) {
  const telematicsConnected = props.form.usage.telematicsStatus === 'SUCCESS';

  return (
    <>
      <StepHeading
        eyebrow="Bagian estimasi pemakaian"
        title="Estimasi pemakaian tanpa menebak"
        description="Sistem menyusun rentang mileage dari pola komuter, penggunaan akhir pekan, perjalanan panjang, dan sumber data yang benar-benar terhubung atas persetujuan nasabah."
        icon={<Route size={24} />}
      />

      <div className="form-grid two">
        <Field label="Hari Komuter per Minggu" required error={props.errors.commuteDays}>
          <input type="number" min="0" max="7" value={props.form.usage.commuteDays} onChange={(event) => props.onUpdate({ commuteDays: event.target.value })} placeholder="Contoh: 5" />
        </Field>
        <Field label="Jarak Sekali Jalan" required error={props.errors.commuteOneWayKm} hint="Rumah ke tujuan, bukan pulang-pergi.">
          <div className="input-suffix"><input type="number" min="0" value={props.form.usage.commuteOneWayKm} onChange={(event) => props.onUpdate({ commuteOneWayKm: event.target.value })} placeholder="Contoh: 16" /><span>km</span></div>
        </Field>
        <Field label="Pemakaian Akhir Pekan" required error={props.errors.weekendKm}>
          <div className="input-suffix"><input type="number" min="0" value={props.form.usage.weekendKm} onChange={(event) => props.onUpdate({ weekendKm: event.target.value })} placeholder="Contoh: 45" /><span>km/minggu</span></div>
        </Field>
        <Field label="Perjalanan Panjang Bulanan" required error={props.errors.monthlyTripKm}>
          <div className="input-suffix"><input type="number" min="0" value={props.form.usage.monthlyTripKm} onChange={(event) => props.onUpdate({ monthlyTripKm: event.target.value })} placeholder="Contoh: 180" /><span>km/bulan</span></div>
        </Field>
        <Field label="Saya Tahu Rata-Rata Mingguan" hint="Opsional. Jika diisi, angka ini menjadi input utama estimasi berbasis pernyataan nasabah.">
          <div className="input-suffix"><input type="number" min="0" value={props.form.usage.knownWeeklyKm} onChange={(event) => props.onUpdate({ knownWeeklyKm: event.target.value })} placeholder="Contoh: 140" /><span>km</span></div>
        </Field>
        <Field label="Lokasi Parkir Utama" required error={props.errors.parking}>
          <select value={props.form.usage.parking} onChange={(event) => props.onUpdate({ parking: event.target.value })}>
            <option value="">Pilih lokasi parkir</option><option>Garasi / area tertutup</option><option>Carport rumah</option><option>Gedung parkir</option><option>Area terbuka</option>
          </select>
        </Field>
      </div>

      <div className="telematics-card">
        <div className="telematics-icon"><Satellite size={24} /></div>
        <div><h2>Perkuat estimasi dengan data kendaraan</h2><p>Persetujuan saja tidak meningkatkan tingkat keyakinan. Tingkat keyakinan baru menjadi tinggi setelah sumber data kendaraan terhubung benar-benar terhubung dan datanya lolos pemeriksaan kualitas.</p></div>
        <div className="telematics-actions">
          <CheckboxRow
            checked={props.form.usage.telematicsConsent}
            onChange={(checked) => props.onUpdate({ telematicsConsent: checked, telematicsStatus: checked ? props.form.usage.telematicsStatus : 'IDLE' })}
            title="Saya memberi izin koneksi data kendaraan"
            description="Consent dapat dicabut melalui pengaturan akun."
          />
          {props.form.usage.telematicsConsent && (
            <div className="telematics-connect">
              <LoadingButton type="button" className="secondary-btn" loading={props.connectingTelematics} onClick={props.onConnectTelematics} disabled={telematicsConnected}>
                <Link2 size={17} /> {telematicsConnected ? 'Sumber data terhubung' : 'Hubungkan sumber data (simulasi)'}
              </LoadingButton>
              <StatusBadge status={props.form.usage.telematicsStatus} label={telematicsConnected ? 'Connected' : props.form.usage.telematicsStatus === 'PROCESSING' ? 'Menghubungkan' : 'Belum terhubung'} />
            </div>
          )}
        </div>
      </div>

      <div className="forecast-panel">
        <div className="forecast-icon"><BrainCircuit size={28} /></div>
        <div className="forecast-main">
          <span>Estimasi pusat</span>
          <strong>{formatNumber(props.estimate.annualKm)} <small>km/tahun</small></strong>
          <p>Rentang perkiraan {formatNumber(props.estimate.lowerKm)}–{formatNumber(props.estimate.upperKm)} km.</p>
        </div>
        <div className="forecast-stat"><span>Tingkat keyakinan</span><strong>{props.estimate.confidence === 'HIGH' ? 'Tinggi' : props.estimate.confidence === 'MEDIUM' ? 'Sedang' : 'Rendah'}</strong><StatusBadge status={props.estimate.confidence === 'HIGH' ? 'PASS' : props.estimate.confidence === 'MEDIUM' ? 'WARN' : 'REFER'} label={props.estimate.confidence === 'HIGH' ? 'Tinggi' : props.estimate.confidence === 'MEDIUM' ? 'Sedang' : 'Rendah'} /></div>
        <div className="forecast-stat"><span>Band rekomendasi</span><strong>{props.estimate.recommendedBand ?? 'Referral'}</strong><p>Menggunakan sisi atas rentang untuk menekan risiko perkiraan yang terlalu rendah.</p></div>
      </div>

      {props.estimate.recommendedBand ? (
        <Callout tone="success" title={`Rekomendasi sistem: ${props.estimate.recommendedBand}`}>
          Estimasi memakai rentang, tingkat keyakinan, dan sumber data yang dijelaskan—bukan angka tunggal yang tampak presisi tetapi tidak dapat dipertanggungjawabkan.
        </Callout>
      ) : (
        <Callout tone="warning" title="Estimasi melewati M30">
          Transaksi tidak dipaksa masuk band tertinggi. Flow diarahkan ke underwriting atau produk lain.
        </Callout>
      )}
    </>
  );
}
