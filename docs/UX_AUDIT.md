# UX Audit — Customer Purchase Flow v4.3

## Verdict

Flow sekarang **tidak lagi terasa seperti form internal yang dipindahkan ke web**. Ia memakai progressive disclosure: nasabah melihat langkah sederhana, sementara confidence, reason code, pricing parity, fraud flag, audit, dan engine detail tersedia ketika relevan. Struktur visual mengambil pola yang kuat dari referensi portal—header bersih, navy/blue, card, status, dan hierarchy—tetapi diubah menjadi customer-facing wizard, bukan workflow Maker/Checker/HO.

UX ini sudah layak untuk usability test dan diskusi lintas fungsi. Belum layak disebut final tanpa test pengguna, accessibility audit formal, content/legal review, dan integrasi backend nyata.

## Perbaikan utama

### 1. Multi-screen dengan state yang benar

Tujuh langkah mempunyai tujuan tunggal, progress yang jelas, browser back/forward, autosave draft lokal, dan sticky action pada mobile. Bug pembukaan langkah baru akibat stale state telah dikoreksi pada v4.3.

### 2. Ringkasan harga tetap terlihat

Desktop memakai sticky quote summary. Mobile memprioritaskan form dan menampilkan ringkasan lengkap pada review. Starter price selalu ditemani estimasi total tahunan agar harga masuk tidak misleading.

### 3. Form membantu sebelum memblokir

- STNK benar-benar menghasilkan prefill simulasi, confidence, field list, dan konfirmasi.
- Odometer memeriksa angka, kualitas, glare, framing, metadata, dan tamper flag.
- Usage estimator bertanya tentang perilaku nyata, bukan memaksa nasabah menebak angka tahunan.
- Forecast memakai range dan confidence.
- Error diarahkan ke field pertama dan fokus dipindahkan.
- Referral menjadi outcome utuh, bukan error page.

### 4. Top-up lebih jujur dan sesuai konsep sumber

T1/T3/T5/T10 tetap menambah kilometer sesuai nominal. UI menunjukkan:

- total quota sesudah transaksi;
- band tarif tujuan;
- tambahan premi berdasarkan selisih band;
- status “tanpa tambahan premi” jika masih dalam band yang sudah dibayar;
- badge pack paling efisien dalam band yang sama.

Ini lebih transparan daripada mengubah T1 menjadi kapasitas penuh M10 tanpa menjelaskan penyimpangannya.

### 5. Sophistication tidak menjadi jargon utama

Bahasa customer menggunakan “pemeriksaan foto”, “tingkat keyakinan”, “dasar rekomendasi”, “band tarif”, dan “status perlindungan”. Reason code, score, dan technical detail ditempatkan dalam disclosure atau Prototype Lab.

### 6. Post-purchase journey dibangun sejak awal

Dashboard mencakup:

- reminder 75% dan 90%;
- proyeksi mileage habis;
- manual/auto top-up;
- payment/endorsement simulation;
- tolerance simulation;
- claim guardrail;
- audit trail;
- end-odometer reconciliation; dan
- renewal recommendation.

Dengan demikian produk tidak berhenti sebagai digital form.

### 7. Safe defaults mengurangi dark pattern

- manual top-up menjadi default;
- add-on berbayar tidak preselected;
- metode pembayaran belum dipilih sampai nasabah memilih;
- referral tidak meminta pembayaran; dan
- pilihan auto-upgrade membutuhkan consent terpisah.

### 8. Accessibility baseline diperkuat

- focus-visible tersedia;
- step aktif memakai `aria-current`;
- pilihan card memakai `aria-pressed`;
- error memakai `role="alert"`;
- status memakai `role="status"`;
- modal menangani Escape, focus return, dan Tab focus trap;
- reduced-motion preference dihormati;
- layout responsif desktop/tablet/mobile.

## Risiko UX yang masih nyata

1. **Top-up dengan harga sama.** T1/T3/T5 dari M5 dapat sama-sama masuk M10. Badge “paling efisien” membantu, tetapi product economics dan wording tetap harus dikunci.
2. **Auto-upgrade trust.** Prototype kini default ke manual top-up. Consent awal, pre-notification, token, trigger, cancellation window, dan revocation untuk opsi auto tetap harus diuji.
3. **Odometer/KYC drop-off.** Upload dokumen adalah friction terbesar; guided capture dan save-resume wajib diuji di perangkat nyata.
4. **Toleransi.** Menampilkan angka 250 km dapat dianggap hak kontraktual. Production sebaiknya hanya menampilkan setelah rule final.
5. **Technical overload.** Prototype Lab harus dihilangkan dari build customer production atau dilindungi feature flag/internal role.
6. **Draft privacy.** `localStorage` hanya cocok untuk prototype; produksi perlu authenticated server-side draft, encryption, retention, dan clear-device behavior.

## Test yang wajib dilakukan

### Comprehension test

Nasabah harus dapat menjawab dengan benar:

1. Berapa lama polis berlaku?
2. Apakah polis berhenti ketika mileage habis?
3. Apa yang terjadi ketika quota hampir habis?
4. Mengapa T1 dan T5 bisa mempunyai tambahan premi sama?
5. Apakah klaim otomatis ditolak saat over-mileage?

### Moderated usability test

Minimal 5–8 peserta per persona:

- kendaraan kedua / weekend user;
- low-mileage WFH;
- commuter normal;
- high-mileage/referral;
- pengguna usia 45+ yang kurang familiar dengan aplikasi;
- pengguna mobile dengan koneksi lambat.

### Metrics

- completion rate dan time-on-task;
- drop-off per step;
- upload retry rate;
- mismatch recovery rate;
- comprehension score;
- package selection regret;
- auto-upgrade opt-in dan revocation;
- top-up transaction count;
- referral completion;
- support contact/complaint rate.

## Acceptance bar sebelum pilot

- ≥90% peserta memahami polis tetap 12 bulan;
- ≥85% memahami over-mileage bukan auto-decline klaim;
- ≥80% dapat menjelaskan perbedaan quota dan band tarif;
- tidak ada critical accessibility blocker pada keyboard/screen reader;
- mobile completion rate tidak tertinggal lebih dari 10 poin dari desktop;
- tidak ada pricing disclosure yang dinilai misleading oleh Legal/Compliance.
