# Flow & Validation Specification

Dokumen ini memisahkan **pengalaman nasabah**, **pemeriksaan cerdas**, dan **operational control**. Tujuannya agar produk tidak berhenti sebagai digital form.

## Prinsip state

Setiap pemeriksaan menggunakan empat outcome:

- **PASS** — boleh straight-through;
- **WARN** — boleh lanjut dengan disclosure/attention;
- **REFER** — berhenti dari straight-through dan masuk review manusia;
- **BLOCK** — data wajib diperbaiki sebelum lanjut.

Reason code dan versi rule/engine wajib disimpan untuk seluruh REFER/BLOCK dan keputusan finansial.

## 1. Data Kendaraan

**Nasabah melihat:** input nomor polisi, kendaraan, tahun, nilai pertanggungan, wilayah, coverage, tanggal mulai, dan opsi upload STNK.

**Pemeriksaan:**

- format nomor polisi;
- validitas tahun;
- nilai pertanggungan > 0;
- usia vs eligibility prototype;
- penggunaan pribadi/komersial;
- STNK extraction, confidence, dan field confirmation;
- future geo/hazard enrichment tanpa hidden pricing.

**Outcome:** invalid field = BLOCK; usia/nilai/penggunaan di luar rule = REFER; low-confidence STNK = REFER.

## 2. Odometer & Bukti

**Nasabah melihat:** guided upload/capture, angka manual, hasil baca, kualitas foto, dan cara memperbaiki.

**Pemeriksaan:** sharpness, glare, framing, metadata, extracted km vs manual km, tamper/reuse signal.

**Outcome:** mismatch = BLOCK sampai dikoreksi; low quality/tamper = REFER; match = PASS. Fraud signal tidak boleh menjadi auto-decline klaim atau polis tanpa review.

## 3. Profil Penggunaan

**Nasabah melihat:** pertanyaan perilaku penggunaan dan opsi connected-car/telematics.

**Pemeriksaan:** central estimate, lower/upper range, confidence, source/method, M30 boundary.

**Outcome:** estimasi nol = BLOCK; upper range > M30 = REFER; confidence rendah = WARN; lainnya PASS.

## 4. Skema Mileage

**Nasabah melihat:**

- rekomendasi M5–M30;
- perbandingan Band Tahunan vs Starter M5 + Top-Up;
- pembayaran awal dan expected annual cost;
- T1/T3/T5/T10 dengan total quota, band tarif, dan selisih premi;
- manual top-up sebagai default aman;
- auto-upgrade hanya melalui consent khusus.

**Pemeriksaan:** selected band vs recommended band, pricing parity, product maximum, auto-upgrade consent, payment token consent.

**Outcome:** pilihan band lebih rendah = WARN + acknowledgment; missing auto consent/token = BLOCK; di atas M30 = REFER.

## 5. Perlindungan

**Nasabah melihat:** coverage utama, perluasan opsional, dan breakdown premi dasar/mileage/loading/perluasan.

**Pemeriksaan:** add-on compatibility dan approved tariff version pada production.

**Guardrail UX:** tidak ada add-on berbayar yang dipilih otomatis.

## 6. Data Nasabah

**Nasabah melihat:** tipe nasabah, identitas, kontak, alamat, KYC/KYB, kanal notifikasi, dan consent data.

**Pemeriksaan:** NIK/NPWP, email, HP, identity match, document confidence, consent, notification preference.

**Outcome:** format/consent tidak lengkap = BLOCK; identity review = REFER; verified = PASS.

## 7. Review & Bayar

**Nasabah melihat:** reason yang dapat dipahami, risk context, harga, masa polis, mileage, consent final, dan pilihan pembayaran.

**Pemeriksaan:** final decision orchestration, quote version/expiry, payment choice, all product consents.

**Outcome:** PASS/WARN → payment; REFER → review tanpa pembayaran; BLOCK → kembali memperbaiki data.

**Guardrail UX:** metode pembayaran tidak dipilih otomatis.

## 8. Policy Issue / Referral

### Straight-through

```text
QUOTE_ACCEPTED
→ PAYMENT_AUTHORIZED
→ PAYMENT_CAPTURED
→ POLICY_ISSUED
→ DOCUMENT_DELIVERED
→ AUDIT_RECONCILED
```

### Referral

```text
REFERRAL_CREATED
→ EVIDENCE_BUNDLE_ATTACHED
→ SLA_STARTED
→ UNDERWRITER_DECISION
→ REVISED_QUOTE / DECLINE_WITH_REASON
```

Tidak ada pembayaran sebelum revised quote diterima.

## 9. Dashboard Pascapembelian

**Fungsi:** quota wallet, usage projection, reminder 75/90, manual/auto top-up, status perlindungan, audit, reconciliation, renewal recommendation.

### Top-up transaction

```text
OFFERED
→ CUSTOMER_CONFIRMED / VALID_AUTO_CONSENT
→ PAYMENT_AUTHORIZED atau NO_CHARGE_WITHIN_PAID_BAND
→ ENDORSEMENT_ISSUED
→ ACCOUNTING_POSTED
→ NOTIFICATION_SENT
→ RECONCILED
```

Kegagalan di tengah proses masuk reconciliation queue. UI tidak boleh menambah quota hanya karena pembayaran berhasil bila endorsement gagal.

### Claims guardrail

- policy coverage status tidak berubah hanya karena quota habis;
- over-mileage dapat memicu premium adjustment review;
- suspected tamper dapat memicu fraud investigation;
- mileage tidak boleh menjadi satu-satunya faktor auto-decline klaim.

## 10. End Odometer & Renewal

Odometer akhir diverifikasi; actual mileage dihitung; band renewal direkomendasikan. Treatment unused mileage tetap mengikuti keputusan produk—tidak diputus otomatis oleh UI.
