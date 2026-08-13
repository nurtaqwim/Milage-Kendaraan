# Jasindo Mileage — Audited Engine-Ready Customer Prototype v4.3

Prototype React + TypeScript untuk pembelian asuransi kendaraan berbasis mileage. Desainnya mengikuti konsep **Mileage Band Tahunan** dan **Starter M5 + Top-Up**, tetapi proses tidak berhenti sebagai form digital: tersedia evidence intelligence, forecast range, explainable decisioning, pricing parity, consent, referral, simulated policy issue, post-purchase top-up, claims guardrail, audit trail, dan end-odometer reconciliation.

> **Batas penting:** ini prototype front-end untuk validasi produk, proses, dan UX. Tarif, loading, toleransi, trigger auto-upgrade, wording, SLA, accounting, dan nomor polis masih simulasi. Project belum production-ready.

## Menjalankan project

```bash
npm install
npm run dev
```

Buka URL Vite, biasanya `http://localhost:5173`.

Validasi repository:

```bash
npm run audit:product
npm run typecheck
npm run build
```

CI GitHub menjalankan product audit, typecheck, dan build pada push/pull request.

## Flow utama

1. **Data Kendaraan** — input manual atau simulasi ekstraksi STNK, prefill, confidence, dan pre-check.
2. **Odometer & Bukti** — OCR/vision simulation, mismatch, quality checks, metadata, dan tamper/manual-review scenario.
3. **Profil Penggunaan** — pertanyaan berbasis perilaku, opsi telematics, forecast range, confidence, dan M30 guardrail.
4. **Skema Mileage** — Band Tahunan vs Starter M5 + Top-Up, expected annual cost, exact T1/T3/T5/T10 increment, consent, dan pricing parity.
5. **Perlindungan** — premi dasar, komponen mileage, loading mock, perluasan, dan price anatomy.
6. **Data Nasabah** — individual/company, KYC/KYB simulation, kanal reminder, dan consent data.
7. **Review & Bayar** — PASS/WARN/REFER/BLOCK, explainable reason, explicit payment selection, dan final consent.
8. **Dashboard** — reminder 75%/90%, manual/auto top-up, no-charge-in-paid-band scenario, simulated payment/endorsement, claim guardrail, audit, dan renewal reconciliation.

## Prinsip produk yang dikunci

- Polis tetap **12 bulan**.
- Mileage memengaruhi exposure dan premi, bukan masa aktif perlindungan.
- M5/M10/M15/M20/M30 menjadi fondasi pricing.
- Starter M5 + Top-Up menjadi mekanisme pembelian fleksibel.
- T1/T3/T5/T10 menambah tepat 1.000/3.000/5.000/10.000 km.
- Total quota setelah top-up dipetakan ke band tarif.
- Harga top-up berasal dari selisih komponen mileage antar-band.
- Semua top-up berakhir pada tanggal akhir polis.
- Reminder dipicu pada 75% dan 90%.
- Over-mileage tidak otomatis menghentikan polis atau menolak klaim.
- Fraud/tamper diarahkan ke investigasi/manual review.
- Odometer akhir digunakan untuk reconciliation dan renewal recommendation.
- Unused mileage tidak diputus diam-diam sebagai hangus/refund/kredit.

## Safe UX defaults

- **Top-up manual** menjadi default; auto-upgrade harus dipilih dan disetujui khusus.
- Add-on berbayar **tidak dipilih otomatis**.
- Metode pembayaran **harus dipilih eksplisit**.
- Referral **tidak menagihkan pembayaran**.
- Starter price selalu ditemani estimasi total tahunan agar tidak misleading.
- Data teknis ditempatkan dalam progressive disclosure/Prototype Lab, bukan membebani customer flow utama.

## Struktur repository

```text
src/
├── components/         Reusable UI, stepper, quote summary, prototype lab
├── config/             Product config dan initial state
├── domain/             Type/domain model
├── engines/            Local rules, contracts, orchestrator, registry
├── hooks/              Draft persistence dan audit session
├── screens/            Satu screen per langkah pembelian
├── utils/              Formatting dan local-date-safe helper
├── App.tsx             Flow orchestration
└── styles.css          Responsive design system

docs/
├── PDF_ALIGNMENT_AUDIT.md
├── FLOW_AND_VALIDATION_SPEC.md
├── ENGINE_INTEGRATION_MAP.md
├── ENGINE_EVALUATION_SCORECARD.md
├── PRODUCT_DECISIONS.md
├── UX_AUDIT.md
└── VALIDATION_REPORT.md
```

## Engine-ready architecture

Port/interface ada di `src/engines/contracts.ts`, slot engine ada di `src/engines/registry.ts`, dan hasil intelligence lokal dikonsolidasikan melalui `src/engines/orchestrator.ts`.

Engine yang telah disiapkan secara arsitektural:

- Vehicle Document Intelligence
- Odometer Evidence Intelligence
- Mileage Forecast / Telematics
- Eligibility & Risk Decisioning
- Rating & Pricing
- Identity / KYC/KYB
- Payment & Tokenization
- Policy Administration / Endorsement
- Notification Orchestration
- Claims Mileage Guardrail
- Geospatial Risk Enrichment
- Fraud & Cross-Policy Anomaly Signals
- Consent & Preference Registry
- Next-Best-Action / Top-Up Optimization
- Audit & Observability

Browser sebaiknya hanya berbicara dengan BFF/orchestrator; jangan memanggil seluruh engine atau menyimpan credential langsung di front end.

## Preview statis

Buka `preview.html` untuk melihat satu screen visual tanpa menjalankan Vite. Ini hanya preview layout, bukan pengganti functional/browser test.

## Audit status

`node scripts/product-audit.mjs` saat packaging menghasilkan **22/22 PASS**. Semantic TypeScript audit dan CSS parser check juga PASS. Full `npm install && npm run build` belum dapat dijalankan pada runtime packaging karena package registry tidak tersedia; lihat [`docs/VALIDATION_REPORT.md`](docs/VALIDATION_REPORT.md).

## GitHub

```bash
git init
git add .
git commit -m "Add audited mileage insurance prototype"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

Jangan commit `.env`, token, credential, data pelanggan, STNK/KTP asli, foto odometer, atau hasil telematics nyata.
