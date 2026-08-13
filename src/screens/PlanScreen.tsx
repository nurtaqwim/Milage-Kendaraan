import { ArrowRight, BellRing, CalendarClock, Check, Repeat2, Sparkles, WalletCards } from 'lucide-react';
import { MILEAGE_BANDS, PRODUCT_RULES, TOP_UP_PACKS } from '../config/productConfig';
import type { QuoteComparison, QuoteForm, UsageEstimate } from '../domain/types';
import { getBand, getTopUpPackOffers } from '../engines/mileageEngine';
import { calculateTopUpPrice, getAllBandQuotes } from '../engines/pricingEngine';
import { Callout, CheckboxRow, StatusBadge, StepHeading } from '../components/UI';
import { formatCurrency, formatNumber } from '../utils/format';

export function PlanScreen(props: {
  form: QuoteForm;
  estimate: UsageEstimate;
  quote: QuoteComparison;
  errors: Record<string, string | undefined>;
  onUpdate: (patch: Partial<QuoteForm['plan']>) => void;
}) {
  const bandQuotes = getAllBandQuotes(props.form);
  const recommendedCode = props.estimate.recommendedBand ?? 'M30';
  const recommendedBand = getBand(recommendedCode);
  const selectedBand = getBand(props.form.plan.selectedBand);
  const selectedBelowRecommendation = selectedBand.limitKm < recommendedBand.limitKm;
  const starterOffers = getTopUpPackOffers(PRODUCT_RULES.starterQuotaKm, TOP_UP_PACKS);

  if (!props.estimate.recommendedBand) {
    return (
      <>
        <StepHeading
          eyebrow="Langkah 2 dari 4"
          title="Penggunaan membutuhkan review"
          description="Rentang mileage berada di atas band M30. Sistem tidak memaksa nasabah masuk band tertinggi atau menampilkan harga instant yang menyesatkan."
          icon={<WalletCards size={24} />}
        />
        <div className="referral-plan-card">
          <div className="mode-icon"><Sparkles size={25} /></div>
          <div><span>Next best action</span><h2>Kirim data ke underwriting</h2><p>Seluruh data kendaraan, bukti odometer, rentang penggunaan, dan alasan pemeriksaan akan diteruskan. Pembayaran baru dilakukan setelah ada keputusan dan penawaran yang sesuai.</p></div>
          <StatusBadge status="REFER" label="Di atas M30" />
        </div>
        <Callout tone="warning" title="Tidak ada auto-quote untuk kondisi ini">
          Ini adalah guardrail produk: M30 bukan tempat menampung semua risiko yang berada di luar desain band.
        </Callout>
      </>
    );
  }

  return (
    <>
      <StepHeading
        eyebrow="Langkah 2 dari 4"
        title="Pilih cara pembayaran mileage"
        description="Mileage band tetap menjadi fondasi tarif. Nasabah dapat membayar band tahunan atau memulai dari Starter 5.000 km dan menambah kilometer sesuai kebutuhan."
        icon={<WalletCards size={24} />}
      />

      <div className="recommendation-hero">
        <div><Sparkles size={22} /><span><small>Rekomendasi berdasarkan rentang penggunaan</small><strong>{recommendedBand.code} · sampai {formatNumber(recommendedBand.limitKm)} km</strong><p>Estimasi sisi atas: {formatNumber(props.estimate.upperKm)} km/tahun.</p></span></div>
        <StatusBadge status="PASS" label="Paket rekomendasi" />
      </div>

      <div className="purchase-mode-grid">
        <button
          type="button"
          aria-pressed={props.form.plan.purchaseMode === 'STARTER_TOPUP'}
          className={`purchase-mode-card ${props.form.plan.purchaseMode === 'STARTER_TOPUP' ? 'selected recommended' : ''}`}
          onClick={() => props.onUpdate({ purchaseMode: 'STARTER_TOPUP', selectedBand: recommendedBand.code })}
        >
          <span className="mode-chip"><Sparkles size={14} /> Pilihan fleksibel</span>
          <div className="mode-icon"><Repeat2 size={24} /></div>
          <h2>Starter M5 + Top-Up</h2>
          <p>Bayar premi dasar dan komponen M5 di awal. T1/T3/T5/T10 menambah kilometer sesuai pack, sedangkan tarif mengikuti band total mileage.</p>
          <div className="mode-price"><span>Dibayar sekarang</span><strong>{formatCurrency(props.quote.upfront.total)}</strong></div>
          <div className="mode-check">{props.form.plan.purchaseMode === 'STARTER_TOPUP' && <Check size={17} />} Pilih skema fleksibel</div>
        </button>

        <button
          type="button"
          aria-pressed={props.form.plan.purchaseMode === 'ANNUAL_BAND'}
          className={`purchase-mode-card ${props.form.plan.purchaseMode === 'ANNUAL_BAND' ? 'selected' : ''}`}
          onClick={() => props.onUpdate({ purchaseMode: 'ANNUAL_BAND', selectedBand: recommendedBand.code })}
        >
          <span className="mode-chip neutral">Alternatif sederhana</span>
          <div className="mode-icon"><CalendarClock size={24} /></div>
          <h2>Band Tahunan</h2>
          <p>Pilih batas tahunan di awal dan bayar premi sesuai band. Upgrade dilakukan jika penggunaan melampaui pilihan.</p>
          <div className="mode-price"><span>Band rekomendasi</span><strong>{formatCurrency(props.quote.expectedAnnual.total)}</strong></div>
          <div className="mode-check">{props.form.plan.purchaseMode === 'ANNUAL_BAND' && <Check size={17} />} Pilih pembayaran penuh</div>
        </button>
      </div>

      {props.form.plan.purchaseMode === 'STARTER_TOPUP' ? (
        <>
          <section className="plan-section">
            <div className="section-heading"><div><span>Pengaturan Top-Up</span><h2>Pilih cara penyesuaian saat mileage mendekati batas</h2></div></div>
            <div className="upgrade-mode-grid">
              <button type="button" aria-pressed={props.form.plan.upgradeMode === 'MANUAL'} className={`upgrade-mode ${props.form.plan.upgradeMode === 'MANUAL' ? 'selected recommended-option' : ''}`} onClick={() => props.onUpdate({ upgradeMode: 'MANUAL', autoUpgradeConsent: false, paymentTokenConsent: false })}>
                <WalletCards size={21} /><span><strong>Top-up manual · direkomendasikan</strong><small>Nasabah memilih T1/T3/T5/T10 setelah menerima reminder dan melihat nominal sebelum membayar.</small></span>
              </button>
              <button type="button" aria-pressed={props.form.plan.upgradeMode === 'AUTO'} className={`upgrade-mode ${props.form.plan.upgradeMode === 'AUTO' ? 'selected' : ''}`} onClick={() => props.onUpdate({ upgradeMode: 'AUTO' })}>
                <BellRing size={21} /><span><strong>Auto-upgrade · pilihan opsional</strong><small>Hanya aktif setelah consent khusus dan token pembayaran. Nasabah tetap menerima pre-notification dan dapat mencabut persetujuan.</small></span>
              </button>
            </div>

            {props.form.plan.upgradeMode === 'AUTO' && (
              <div className="consent-stack">
                <CheckboxRow checked={props.form.plan.autoUpgradeConsent} onChange={(checked) => props.onUpdate({ autoUpgradeConsent: checked })} title="Saya menyetujui auto-upgrade sesuai batas dan aturan yang ditampilkan" description="Trigger, pack, nominal, dan hak mencabut consent harus disimpan dan dapat diaudit pada production." error={props.errors.autoUpgradeConsent} />
                <CheckboxRow checked={props.form.plan.paymentTokenConsent} onChange={(checked) => props.onUpdate({ paymentTokenConsent: checked })} title="Saya menyetujui token pembayaran untuk auto-upgrade" description="Prototype tidak menyimpan kartu atau rekening; production wajib memakai token vault dan idempotency." error={props.errors.paymentTokenConsent} />
              </div>
            )}
          </section>

          <section className="plan-section">
            <div className="section-heading">
              <div>
                <span>Contoh Top-Up dari Starter M5</span>
                <h2>Pack tetap menambah kilometer sesuai nominalnya</h2>
                <p>Harga dihitung dari selisih band tujuan. Pack yang masuk band sama dapat memiliki harga identik; sistem menandai opsi dengan mileage terbesar sebagai pilihan paling efisien.</p>
              </div>
            </div>
            <div className="topup-preview-grid">
              {starterOffers.map((offer) => {
                const price = calculateTopUpPrice({ form: props.form, currentQuotaKm: PRODUCT_RULES.starterQuotaKm, targetQuotaKm: offer.targetQuotaKm });
                const priceLabel = price.premiumDifference === null
                  ? 'Perlu review'
                  : price.premiumDifference === 0
                    ? 'Tanpa tambahan premi'
                    : formatCurrency(price.premiumDifference);
                return (
                  <div className={`topup-preview-card ${offer.bestValueInTargetBand ? 'best-value' : ''}`} key={offer.pack.code}>
                    <div>
                      <span>{offer.pack.code}</span>
                      <strong>+{formatNumber(offer.pack.incrementKm)} km</strong>
                    </div>
                    {offer.bestValueInTargetBand && <small className="efficiency-chip">Paling efisien di {offer.targetBand.code}</small>}
                    <p>Total menjadi {formatNumber(offer.targetQuotaKm)} km · band tarif {offer.targetBand.code}.</p>
                    <strong>{priceLabel}</strong>
                    <small>{offer.crossesPricingBand ? `Selisih ${offer.currentBand.code} → ${offer.targetBand.code}.` : `Masih dalam ${offer.targetBand.code} yang sudah dibayar.`}</small>
                  </div>
                );
              })}
            </div>
          </section>

          <Callout title="Starter price tidak boleh menyesatkan">
            Pembayaran awal lebih rendah, tetapi estimasi total setahun jika mencapai {recommendedBand.code} adalah <strong>{formatCurrency(props.quote.expectedAnnual.total)}</strong>. Pack, band tujuan, dan tambahan premi selalu ditampilkan sebelum transaksi.
          </Callout>
        </>
      ) : (
        <>
          <div className="band-grid">
            {MILEAGE_BANDS.map((band) => {
              const price = bandQuotes.find((item) => item.code === band.code)!;
              const selected = props.form.plan.selectedBand === band.code;
              const recommended = band.code === recommendedBand.code;
              return (
                <button type="button" aria-pressed={selected} className={`band-card ${selected ? 'selected' : ''} ${recommended ? 'recommended' : ''}`} key={band.code} onClick={() => props.onUpdate({ selectedBand: band.code, lowBandConsent: false })}>
                  <div className="band-card-head"><span>{band.code}</span>{recommended && <span className="recommended-chip"><Sparkles size={13} /> Rekomendasi</span>}</div>
                  <strong>{formatNumber(band.limitKm)} <small>km/tahun</small></strong>
                  <p>{band.customerLabel}</p>
                  <div className="band-card-price"><span>Total mock</span><strong>{formatCurrency(price.total)}</strong></div>
                </button>
              );
            })}
          </div>

          {selectedBelowRecommendation && (
            <div className="low-band-consent">
              <Callout tone="warning" title="Band di bawah rentang estimasi">
                Sistem merekomendasikan {recommendedBand.code}, sedangkan pilihan saat ini {selectedBand.code}. Ini meningkatkan kemungkinan upgrade di tengah periode.
              </Callout>
              <CheckboxRow checked={props.form.plan.lowBandConsent} onChange={(checked) => props.onUpdate({ lowBandConsent: checked })} title="Saya memahami kemungkinan upgrade dan penyesuaian premi" error={props.errors.lowBandConsent} />
            </div>
          )}
        </>
      )}

      <div className="rule-strip">
        <span><BellRing size={18} /> Reminder {PRODUCT_RULES.reminderThresholds[0]}% & {PRODUCT_RULES.reminderThresholds[1]}%</span>
        <ArrowRight size={16} />
        <span>Top-up menambah mileage, bukan mengaktifkan jaminan</span>
        <ArrowRight size={16} />
        <span>Berakhir bersama polis</span>
      </div>
    </>
  );
}
