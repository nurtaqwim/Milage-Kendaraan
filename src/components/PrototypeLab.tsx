import { FlaskConical, PlugZap, RotateCcw, ShieldAlert, X } from 'lucide-react';
import type { ScanScenario } from '../engines/documentEngine';
import { ENGINE_REGISTRY } from '../engines/registry';
import { PRODUCT_RULES } from '../config/productConfig';

export function PrototypeLab(props: {
  open: boolean;
  onClose: () => void;
  odometerScenario: ScanScenario;
  onOdometerScenario: (scenario: ScanScenario) => void;
  identityScenario: 'PASS' | 'REVIEW';
  onIdentityScenario: (scenario: 'PASS' | 'REVIEW') => void;
  onReset: () => void;
}) {
  if (!props.open) return null;
  return (
    <aside className="prototype-lab" aria-label="Prototype Lab">
      <div className="lab-head">
        <div><FlaskConical size={20} /><span><strong>Prototype Lab</strong><small>Kontrol developer—bukan bagian dari customer UI production.</small></span></div>
        <button type="button" onClick={props.onClose} aria-label="Tutup lab"><X size={19} /></button>
      </div>

      <div className="lab-alert">
        <ShieldAlert size={18} />
        <div><strong>Keputusan produk belum final</strong><span>Toleransi {PRODUCT_RULES.administrativeToleranceKm.toLocaleString('id-ID')} km, trigger auto-upgrade {PRODUCT_RULES.autoUpgradeTriggerPercent}%, treatment mileage tersisa, biaya transaksi, dan mekanisme pack yang masih berada dalam band berbayar harus dikunci Product Owner.</span></div>
      </div>

      <div className="lab-section">
        <label>Scenario Vision/Odometer</label>
        <select value={props.odometerScenario} onChange={(event) => props.onOdometerScenario(event.target.value as ScanScenario)}>
          <option value="MATCH">Match / high confidence</option>
          <option value="MISMATCH">Mismatch angka</option>
          <option value="LOW_QUALITY">Foto buram / glare</option>
          <option value="TAMPER_REVIEW">Tamper flag → manual review</option>
        </select>
      </div>

      <div className="lab-section">
        <label>Scenario Identity/KYC</label>
        <select value={props.identityScenario} onChange={(event) => props.onIdentityScenario(event.target.value as 'PASS' | 'REVIEW')}>
          <option value="PASS">Pass</option>
          <option value="REVIEW">Manual review</option>
        </select>
      </div>

      <div className="lab-engine-list">
        <div className="lab-engine-title"><PlugZap size={17} /><span><strong>Engine integration slots</strong><small>Semua adapter saat ini mock/local dan dapat diganti tanpa mengubah customer flow.</small></span></div>
        {ENGINE_REGISTRY.map((engine) => (
          <details key={engine.id}>
            <summary><span>{engine.label}</span><b>{engine.currentAdapter === 'MOCK' ? 'Mock' : 'Local rules'}</b></summary>
            <p>{engine.role}</p>
            <small>Target: {engine.productionCapability}</small>
          </details>
        ))}
      </div>

      <button type="button" className="lab-reset" onClick={props.onReset}><RotateCcw size={17} /> Reset seluruh prototype</button>
    </aside>
  );
}
