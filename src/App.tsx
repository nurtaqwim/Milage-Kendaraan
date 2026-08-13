import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CarFront,
  ClipboardCheck,
  FlaskConical,
  Gauge,
  HelpCircle,
  Home,
  LockKeyhole,
  Package,
  Route,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards
} from 'lucide-react';
import { Stepper, type StepDefinition } from './components/Stepper';
import { Callout, LoadingButton, Modal } from './components/UI';
import { QuoteSummary } from './components/QuoteSummary';
import { PrototypeLab } from './components/PrototypeLab';
import { VehicleScreen } from './screens/VehicleScreen';
import { OdometerScreen } from './screens/OdometerScreen';
import { UsageScreen } from './screens/UsageScreen';
import { PlanScreen } from './screens/PlanScreen';
import { ProtectionScreen } from './screens/ProtectionScreen';
import { CustomerScreen } from './screens/CustomerScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ReferralScreen } from './screens/ReferralScreen';
import { useQuoteSession } from './hooks/useQuoteSession';
import { getBand } from './engines/mileageEngine';
import { calculateBandPremium } from './engines/pricingEngine';
import { buildQuoteIntelligence } from './engines/orchestrator';
import { scanOdometer, scanSimpleDocument, scanVehicleDocument, type ScanScenario } from './engines/documentEngine';
import type { FieldErrors } from './validationTypes';
import type { QuoteForm } from './domain/types';
import { calculatePolicyEnd, formatCurrency, formatDate, normalizeDigits } from './utils/format';
import './styles.css';

const STEPS: StepDefinition[] = [
  { id: 1, label: 'Kendaraan & Pemakaian', shortLabel: 'Kendaraan', icon: CarFront },
  { id: 2, label: 'Mileage & Perlindungan', shortLabel: 'Pilih Paket', icon: WalletCards },
  { id: 3, label: 'Data Nasabah', shortLabel: 'Data Diri', icon: UserRound },
  { id: 4, label: 'Review & Bayar', shortLabel: 'Pembayaran', icon: ClipboardCheck }
];

const STEP_SLUGS = ['kendaraan', 'paket', 'nasabah', 'pembayaran'];

function getStepFromHash(): number | null {
  const slug = window.location.hash.replace(/^#\/?/, '');
  const index = STEP_SLUGS.indexOf(slug);
  return index >= 0 ? index + 1 : null;
}

export default function App() {
  const session = useQuoteSession();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<{ tone: 'warning' | 'danger' | 'success' | 'info'; title: string; copy: string } | null>(null);
  const [labOpen, setLabOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [odometerScenario, setOdometerScenario] = useState<ScanScenario>('MATCH');
  const [identityScenario, setIdentityScenario] = useState<'PASS' | 'REVIEW'>('PASS');
  const [scanningStnk, setScanningStnk] = useState(false);
  const [scanningOdometer, setScanningOdometer] = useState(false);
  const [verifyingIdentity, setVerifyingIdentity] = useState(false);
  const [connectingTelematics, setConnectingTelematics] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [outcome, setOutcome] = useState<'POLICY' | 'REFERRAL' | null>(null);
  const contentRef = useRef<HTMLElement>(null);
  const maxVisitedStepRef = useRef(session.maxVisitedStep);

  const intelligence = useMemo(() => buildQuoteIntelligence(session.form), [session.form]);
  const usageEstimate = intelligence.usage;
  const quoteComparison = intelligence.quote;
  const currentBreakdown = useMemo(() => calculateBandPremium(session.form, quoteComparison.currentBand), [session.form, quoteComparison.currentBand]);
  const policyEnd = useMemo(() => calculatePolicyEnd(session.form.vehicle.policyStart), [session.form.vehicle.policyStart]);
  const decision = intelligence.decision;
  const riskAssessment = intelligence.risk;

  useEffect(() => {
    maxVisitedStepRef.current = session.maxVisitedStep;
  }, [session.maxVisitedStep]);

  useEffect(() => {
    const hashStep = getStepFromHash();
    if (hashStep && hashStep <= session.maxVisitedStep) session.setCurrentStep(hashStep);
    else window.history.replaceState(null, '', `#/${STEP_SLUGS[session.currentStep - 1]}`);

    const onHashChange = () => {
      const next = getStepFromHash();
      if (next && next <= maxVisitedStepRef.current) {
        session.setCurrentStep(next);
        setErrors({});
        setBanner(null);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const previewUrl = session.form.odometer.previewUrl;
    return () => {
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [session.form.odometer.previewUrl]);

  useEffect(() => {
    contentRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [session.currentStep]);

  const goToStep = (step: number, unlock = false) => {
    const nextMaxVisited = unlock ? Math.max(maxVisitedStepRef.current, step) : maxVisitedStepRef.current;
    if (step > nextMaxVisited) return;

    if (unlock && nextMaxVisited !== maxVisitedStepRef.current) {
      maxVisitedStepRef.current = nextMaxVisited;
      session.setMaxVisitedStep(nextMaxVisited);
    }

    session.setCurrentStep(step);
    const nextHash = `#/${STEP_SLUGS[step - 1]}`;
    if (window.location.hash !== nextHash) window.location.hash = `/${STEP_SLUGS[step - 1]}`;
    setErrors({});
    setBanner(null);
  };

  const validateStep = (step: number): boolean => {
    const nextErrors: FieldErrors = {};
    let nextBanner: typeof banner = null;
    const form = session.form;

    if (step === 1) {
      if (!form.vehicle.brand.trim()) nextErrors.brand = 'Merek kendaraan wajib diisi.';
      if (!form.vehicle.model.trim()) nextErrors.model = 'Model kendaraan wajib diisi.';
      const year = Number(form.vehicle.year || 0);
      if (!year || year < 1980 || year > new Date().getFullYear()) nextErrors.year = 'Tahun kendaraan tidak valid.';
      if (Number(form.vehicle.sumInsured || 0) <= 0) nextErrors.sumInsured = 'Harga pertanggungan harus lebih dari Rp0.';
      if (!form.vehicle.policyStart) nextErrors.policyStart = 'Tanggal mulai pertanggungan wajib diisi.';
    }

    if (step === 1) {
      if (form.odometer.value === '' || Number(form.odometer.value) < 0) nextErrors.odometer = 'Odometer wajib diisi dengan angka valid.';
      if (!form.odometer.fileName) nextErrors.odometerFile = 'Foto odometer wajib diunggah.';
      if (form.odometer.scanStatus !== 'SUCCESS' && form.odometer.scanStatus !== 'REVIEW') {
        nextBanner = {
          tone: form.odometer.scanStatus === 'MISMATCH' ? 'danger' : 'warning',
          title: form.odometer.scanStatus === 'MISMATCH' ? 'Angka odometer tidak cocok' : 'Bukti odometer belum lolos',
          copy: form.odometer.scanResult?.reviewReason ?? 'Jalankan verifikasi sampai statusnya terverifikasi.'
        };
      }
    }

    if (step === 1) {
      if (Number(form.usage.commuteDays) < 0 || Number(form.usage.commuteDays) > 7) nextErrors.commuteDays = 'Hari komuter harus 0–7.';
      if (Number(form.usage.commuteOneWayKm) < 0) nextErrors.commuteOneWayKm = 'Jarak tidak boleh negatif.';
      if (Number(form.usage.weekendKm) < 0) nextErrors.weekendKm = 'Pemakaian akhir pekan tidak boleh negatif.';
      if (Number(form.usage.monthlyTripKm) < 0) nextErrors.monthlyTripKm = 'Perjalanan bulanan tidak boleh negatif.';
      if (!form.usage.parking) nextErrors.parking = 'Pilih lokasi parkir.';
      if (usageEstimate.annualKm <= 0) nextBanner = { tone: 'warning', title: 'Estimasi mileage masih nol', copy: 'Isi pola penggunaan agar sistem dapat menghitung rekomendasi.' };
    }

    if (step === 2 && usageEstimate.recommendedBand) {
      const recommended = getBand(usageEstimate.recommendedBand);
      const selected = getBand(form.plan.selectedBand);
      if (form.plan.purchaseMode === 'ANNUAL_BAND' && selected.limitKm < recommended.limitKm && !form.plan.lowBandConsent) {
        nextErrors.lowBandConsent = 'Konfirmasi pemahaman ketika memilih band di bawah rekomendasi.';
      }
      if (form.plan.purchaseMode === 'STARTER_TOPUP' && form.plan.upgradeMode === 'AUTO') {
        if (!form.plan.autoUpgradeConsent) nextErrors.autoUpgradeConsent = 'Persetujuan auto-upgrade wajib diberikan.';
        if (!form.plan.paymentTokenConsent) nextErrors.paymentTokenConsent = 'Persetujuan token pembayaran wajib diberikan untuk auto-upgrade.';
      }
    }

    if (step === 3) {
      if (!form.customer.name.trim()) nextErrors.customerName = 'Nama wajib diisi.';
      if (form.customer.type === 'PERSONAL' && normalizeDigits(form.customer.nik).length !== 16) nextErrors.nik = 'NIK harus 16 digit.';
      if (form.customer.type === 'COMPANY' && normalizeDigits(form.customer.npwp).length < 15) nextErrors.npwp = 'NPWP perusahaan belum valid.';
      if (!/^\S+@\S+\.\S+$/.test(form.customer.email)) nextErrors.email = 'Format email belum valid.';
      const phone = normalizeDigits(form.customer.phone);
      if (phone.length < 9 || phone.length > 15) nextErrors.phone = 'Nomor HP harus 9–15 digit.';
      if (!form.customer.address.trim()) nextErrors.address = 'Alamat wajib diisi.';
      if (!form.customer.identityFileName) nextErrors.identityFile = 'Dokumen identitas wajib diunggah.';
      if (form.customer.identityStatus !== 'SUCCESS' && form.customer.identityStatus !== 'REVIEW') nextBanner = { tone: 'warning', title: 'Identitas belum terverifikasi', copy: 'Selesaikan KYC atau arahkan ke manual review.' };
      if (form.customer.notificationChannels.length === 0) nextErrors.notificationChannels = 'Pilih minimal satu kanal pengingat.';
      if (!form.customer.dataConsent) nextErrors.dataConsent = 'Persetujuan pemrosesan data wajib diberikan.';
    }

    if (step === 4) {
      if (decision.status === 'PASS' || decision.status === 'WARN') {
        if (!form.finalConsents.annualPolicy) nextErrors.annualPolicy = 'Konfirmasi masa polis wajib diberikan.';
        if (!form.finalConsents.mileageMechanism) nextErrors.mileageMechanism = 'Konfirmasi mekanisme mileage wajib diberikan.';
        if (!form.finalConsents.topUpExpiry) nextErrors.topUpExpiry = 'Konfirmasi masa berlaku top-up wajib diberikan.';
        if (!form.finalConsents.claimTreatment) nextErrors.claimTreatment = 'Konfirmasi ketentuan over-mileage dan klaim wajib diberikan.';
        if (!form.paymentMethod) nextErrors.paymentMethod = 'Pilih metode pembayaran.';
      }
      if (decision.status === 'BLOCK') {
        nextBanner = {
          tone: 'danger',
          title: 'Data belum dapat diproses',
          copy: 'Perbaiki blocking reason sebelum melanjutkan. Tidak ada pembayaran atau referral otomatis dari data yang belum lengkap.'
        };
      }
    }

    setErrors(nextErrors);
    setBanner(nextBanner);
    const isValid = Object.keys(nextErrors).length === 0 && !nextBanner;
    if (!isValid) {
      window.setTimeout(() => {
        const target = document.querySelector<HTMLElement>('.field-error input, .field-error select, .field-error textarea, .check-row-wrap.invalid input, .callout-danger, .callout-warning');
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) target.focus({ preventScroll: true });
      }, 0);
    }
    return isValid;
  };

  const nextStep = () => {
    if (!validateStep(session.currentStep)) return;
    const next = Math.min(STEPS.length, session.currentStep + 1);
    goToStep(next, true);
    session.log({ type: 'STEP_COMPLETED', title: `${STEPS[session.currentStep - 1].label} selesai`, detail: `Nasabah melanjutkan ke ${STEPS[next - 1].label}.`, source: 'CUSTOMER' });
  };

  const previousStep = () => goToStep(Math.max(1, session.currentStep - 1));

  const handleStnkFile = (file: File | null) => {
    session.updateSection('vehicle', { stnkFileName: file?.name ?? '', stnkStatus: 'IDLE', stnkConfidence: null, stnkReviewReason: '', stnkExtractedFields: [] });
  };

  const fillDemoFields = () => {
    session.setForm((previous: QuoteForm) => ({
      ...previous,
      vehicle: {
        ...previous.vehicle,
        brand: 'Honda', model: 'CR-V', year: '2023', sumInsured: '450000000',
        policyStart: previous.vehicle.policyStart || '2026-08-18', region: 'DKI Jakarta',
        stnkFileName: 'STNK-Honda-CRV-demo.jpg', stnkStatus: 'SUCCESS', stnkConfidence: .96,
        stnkExtractedFields: ['brand', 'model', 'year']
      },
      odometer: {
        ...previous.odometer, value: '18450', fileName: 'odometer-demo.jpg', scanStatus: 'SUCCESS',
        scanResult: { status: 'SUCCESS', extractedValue: 18450, confidence: .97, qualityChecks: [], reviewReason: '' }
      },
      usage: { ...previous.usage, commuteDays: '5', commuteOneWayKm: '16', weekendKm: '45', monthlyTripKm: '180', knownWeeklyKm: '', parking: 'Garasi / area tertutup' },
      customer: { ...previous.customer, name: 'Andi Pratama', nik: '3174011201900001', email: 'andi.pratama@example.com', phone: '081234567890', address: 'Jl. Sudirman No. 10, Jakarta Selatan', identityFileName: 'KTP-andi-demo.jpg', identityStatus: 'SUCCESS', notificationChannels: ['WHATSAPP'] }
    }));
    session.log({ type: 'DRAFT_SAVED', title: 'Data demo diisi otomatis', detail: 'Data contoh diisi untuk mempercepat simulasi. Consent dan metode pembayaran tetap harus dipilih secara eksplisit.', source: 'CUSTOMER' });
  };

  const handleScanStnk = async () => {
    setScanningStnk(true);
    session.updateSection('vehicle', { stnkStatus: 'PROCESSING' });
    const result = await scanVehicleDocument({
      fileName: session.form.vehicle.stnkFileName,
      current: session.form.vehicle,
      scenario: 'PASS'
    });
    const extractedFields = Object.keys(result.extracted);
    session.updateSection('vehicle', {
      ...result.extracted,
      stnkStatus: result.status,
      stnkConfidence: result.confidence,
      stnkReviewReason: result.reasons.join(' '),
      stnkExtractedFields: extractedFields
    });
    setScanningStnk(false);
    session.log({
      type: 'STNK_PARSED',
      title: 'STNK diproses dan data diprefill',
      detail: `${result.status}; confidence ${Math.round(result.confidence * 100)}%; field ${extractedFields.join(', ') || 'tidak ada'}.`,
      source: 'VISION_ENGINE'
    });
  };

  const handleOdometerFile = (file: File | null) => {
    if (session.form.odometer.previewUrl) URL.revokeObjectURL(session.form.odometer.previewUrl);
    session.updateSection('odometer', {
      fileName: file?.name ?? '',
      previewUrl: file ? URL.createObjectURL(file) : '',
      scanStatus: 'IDLE',
      scanResult: null
    });
  };

  const handleScanOdometer = async () => {
    setScanningOdometer(true);
    session.updateSection('odometer', { scanStatus: 'PROCESSING', scanResult: null });
    const result = await scanOdometer({ manualValue: Number(session.form.odometer.value), fileName: session.form.odometer.fileName, scenario: odometerScenario });
    session.updateSection('odometer', { scanStatus: result.status, scanResult: result });
    setScanningOdometer(false);
    session.log({ type: 'ODOMETER_VERIFIED', title: 'Bukti odometer diproses', detail: `${result.status}; confidence ${Math.round((result.confidence ?? 0) * 100)}%.`, source: 'VISION_ENGINE' });
  };


  const handleConnectTelematics = async () => {
    if (!session.form.usage.telematicsConsent) return;
    setConnectingTelematics(true);
    session.updateSection('usage', { telematicsStatus: 'PROCESSING' });
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    session.updateSection('usage', { telematicsStatus: 'SUCCESS' });
    setConnectingTelematics(false);
    session.log({ type: 'TELEMATICS_CONNECTED', title: 'Sumber data kendaraan terhubung', detail: 'Prototype meningkatkan confidence setelah status koneksi SUCCESS, bukan hanya karena consent.', source: 'SYSTEM' });
  };

  const handleIdentityFile = (file: File | null) => {
    session.updateSection('customer', { identityFileName: file?.name ?? '', identityStatus: 'IDLE' });
  };

  const handleIdentityVerification = async () => {
    setVerifyingIdentity(true);
    session.updateSection('customer', { identityStatus: 'PROCESSING' });
    const status = await scanSimpleDocument({ fileName: session.form.customer.identityFileName, scenario: identityScenario });
    session.updateSection('customer', { identityStatus: status });
    setVerifyingIdentity(false);
    session.log({ type: 'KYC_VERIFIED', title: 'Identitas diproses', detail: `Status KYC: ${status}.`, source: 'VISION_ENGINE' });
  };

  const toggleAddOn = (id: string) => {
    const active = session.form.protection.addOns.includes(id);
    session.updateSection('protection', { addOns: active ? session.form.protection.addOns.filter((item) => item !== id) : [...session.form.protection.addOns, id] });
  };

  const completeApplication = async () => {
    if (!validateStep(4)) return;
    setIssuing(true);
    await new Promise((resolve) => window.setTimeout(resolve, 900));

    if (decision.status === 'REFER') {
      session.log({ type: 'REFERRAL_SUBMITTED', title: 'Permohonan dikirim ke underwriting', detail: `Reason code: ${decision.reasons.filter((reason) => reason.status === 'REFER').map((reason) => reason.code).join(', ')}. Tidak ada pembayaran yang ditagihkan.`, source: 'RULE_ENGINE' });
      setIssuing(false);
      setOutcome('REFERRAL');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    session.log({ type: 'PAYMENT_CAPTURED', title: 'Pembayaran simulasi berhasil', detail: `${formatCurrency(quoteComparison.upfront.total)} melalui ${session.form.paymentMethod}.`, source: 'SYSTEM' });
    session.log({ type: 'POLICY_ISSUED', title: 'Polis simulasi diterbitkan', detail: `Periode ${formatDate(session.form.vehicle.policyStart)} – ${formatDate(policyEnd)}.`, source: 'SYSTEM' });
    setIssuing(false);
    setOutcome('POLICY');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (outcome === 'POLICY') {
    return (
      <DashboardScreen
        form={session.form}
        quote={quoteComparison}
        usage={usageEstimate}
        policyEnd={policyEnd}
        auditTrail={session.auditTrail}
        onAddAudit={(event) => session.setAuditTrail((previous) => [event, ...previous])}
        onReset={() => { setOutcome(null); session.reset(); window.location.hash = '/vehicle'; }}
      />
    );
  }

  if (outcome === 'REFERRAL') {
    return <ReferralScreen form={session.form} usage={usageEstimate} decision={decision} auditTrail={session.auditTrail} onBackToDraft={() => { setOutcome(null); session.setCurrentStep(1); window.location.hash = '/vehicle'; }} />;
  }

  const screen = (() => {
    switch (session.currentStep) {
      case 1: return <div className="stage-stack">
        <div className="stage-section"><VehicleScreen form={session.form} errors={errors} onUpdate={(patch) => session.updateSection('vehicle', patch)} onStnkFile={handleStnkFile} onScanStnk={handleScanStnk} scanning={scanningStnk} /></div>
        <div className="stage-section"><OdometerScreen form={session.form} errors={errors} scenario={odometerScenario} onUpdate={(patch) => session.updateSection('odometer', patch)} onFile={handleOdometerFile} onScan={handleScanOdometer} scanning={scanningOdometer} /></div>
        <div className="stage-section"><UsageScreen form={session.form} estimate={usageEstimate} errors={errors} onUpdate={(patch) => session.updateSection('usage', patch)} onConnectTelematics={handleConnectTelematics} connectingTelematics={connectingTelematics} /></div>
      </div>;
      case 2: return <div className="stage-stack">
        <div className="stage-section"><PlanScreen form={session.form} estimate={usageEstimate} quote={quoteComparison} errors={errors} onUpdate={(patch) => session.updateSection('plan', patch)} /></div>
        <div className="stage-section"><ProtectionScreen form={session.form} breakdown={currentBreakdown} onToggleAddOn={toggleAddOn} /></div>
      </div>;
      case 3: return <CustomerScreen form={session.form} errors={errors} onUpdate={(patch) => session.updateSection('customer', patch)} onIdentityFile={handleIdentityFile} onVerifyIdentity={handleIdentityVerification} verifying={verifyingIdentity} />;
      case 4: return <ReviewScreen form={session.form} usage={usageEstimate} quote={quoteComparison} decision={decision} risk={riskAssessment} policyEnd={policyEnd} errors={errors} onUpdateConsent={(patch) => session.updateSection('finalConsents', patch)} onPaymentMethod={(paymentMethod) => session.setForm((previous: QuoteForm) => ({ ...previous, paymentMethod }))} onEdit={(step) => goToStep(step <= 3 ? 1 : step <= 5 ? 2 : step === 6 ? 3 : 4)} />;
      default: return null;
    }
  })();

  return (
    <div className="app-shell app-shell--external">
      <header className="topbar">
        <div className="brand-wrap brand-wrap--reference">
          <img src="/brand/danantara.png" alt="Danantara Indonesia" />
          <span className="brand-divider" aria-hidden="true" />
          <img src="/brand/jasindo-white.png" alt="Asuransi Jasindo" />
        </div>
        <nav className="topbar-nav" aria-label="Navigasi utama">
          <button type="button" className="topbar-nav-item" onClick={() => goToStep(1)}><Home size={17} /> Beranda</button>
          <button type="button" className="topbar-nav-item active" onClick={() => goToStep(session.currentStep)}><Package size={17} /> Produk</button>
        </nav>
        <div className="topbar-actions">
          <span className="autosave-chip"><Save size={15} /> {session.lastSavedAt ? `Tersimpan ${new Date(session.lastSavedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : 'Draft lokal'}</span>
          <button type="button" className="demo-header-btn" onClick={fillDemoFields}><Sparkles size={16} /> Isi demo</button>
          <button type="button" className="help-btn" onClick={() => setHelpOpen(true)}><HelpCircle size={18} /> Bantuan</button>
          <button type="button" className="lab-btn" onClick={() => setLabOpen(true)}><FlaskConical size={18} /> Prototype Lab</button>
        </div>
      </header>

      <section className="external-hero" aria-labelledby="external-hero-title">
        <div className="external-hero-inner">
          <h1 id="external-hero-title">Asuransi Mobil Mileage</h1>
          <p>Perlindungan mobil selama satu tahun dengan premi yang menyesuaikan pola pemakaian Anda.</p>
        </div>
      </section>

      <div className="workspace">
        <Stepper steps={STEPS} currentStep={session.currentStep} maxVisitedStep={session.maxVisitedStep} onStepClick={goToStep} />
        <main className="content-area" ref={contentRef} tabIndex={-1}>
          <div className="content-layout">
            <section className="form-card">
              {banner && <Callout tone={banner.tone} title={banner.title}>{banner.copy}</Callout>}
              {screen}
              <div className="form-actions">
                <button type="button" className="ghost-btn" onClick={previousStep} disabled={session.currentStep === 1}><ArrowLeft size={18} /> Kembali</button>
                {session.currentStep < STEPS.length ? (
                  <button type="button" className="primary-btn" onClick={nextStep}>Lanjutkan <ArrowRight size={18} /></button>
                ) : (
                  <LoadingButton type="button" className="primary-btn pay-btn" loading={issuing} onClick={completeApplication} disabled={decision.status === 'BLOCK'}><LockKeyhole size={17} /> {decision.status === 'REFER' ? 'Kirim untuk Review' : decision.status === 'BLOCK' ? 'Perbaiki Data' : `Bayar ${formatCurrency(quoteComparison.upfront.total)}`}</LoadingButton>
                )}
              </div>
            </section>
            <QuoteSummary form={session.form} quote={quoteComparison} usage={usageEstimate} policyEnd={policyEnd} />
          </div>
        </main>
      </div>

      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Cara kerja Jasindo Mileage" footer={<button type="button" className="primary-btn" onClick={() => setHelpOpen(false)}>Mengerti</button>}>
        <div className="help-content">
          <Callout title="Perlindungan tetap 12 bulan" compact>Mileage menentukan exposure dan penyesuaian premi, bukan tanggal berakhirnya polis.</Callout>
          <div className="help-list"><div><strong>1. Verifikasi data</strong><span>Data kendaraan, foto odometer, dan identitas diperiksa sebelum penawaran final.</span></div><div><strong>2. Dapatkan rekomendasi</strong><span>Sistem menghitung rentang penggunaan dan merekomendasikan band yang cukup konservatif.</span></div><div><strong>3. Pilih cara bayar</strong><span>Bayar band tahunan atau mulai dari Starter M5 lalu upgrade saat diperlukan.</span></div><div><strong>4. Pantau setelah membeli</strong><span>Reminder 75%/90%, top-up, dan rekonsiliasi akhir tersedia pada dashboard.</span></div></div>
        </div>
      </Modal>

      <PrototypeLab open={labOpen} onClose={() => setLabOpen(false)} odometerScenario={odometerScenario} onOdometerScenario={setOdometerScenario} identityScenario={identityScenario} onIdentityScenario={setIdentityScenario} onReset={() => { setLabOpen(false); session.reset(); window.location.hash = '/vehicle'; }} />
    </div>
  );
}
