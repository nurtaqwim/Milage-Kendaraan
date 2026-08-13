# Audit Kesesuaian dengan “Perbandingan Skema Mileage vs Starter Topup”

## Verdict

Versi v4.3 **selaras secara substansial dengan desain gabungan yang direkomendasikan dalam PDF**: band M5–M30 tetap menjadi fondasi pricing, sedangkan Starter M5 + Top-Up menjadi mekanisme pembelian yang lebih fleksibel. Polis tetap 12 bulan, top-up tidak mengaktifkan jaminan, klaim tidak ditolak otomatis hanya karena mileage habis, dan seluruh perubahan pascapembelian mempunyai audit trail serta simulasi endorsement.

Project ini tetap **belum production-ready** karena PDF tidak menetapkan tarif, tolerance final, treatment unused mileage, exact claim wording, SLA, serta detail accounting/payment. Semua gap tersebut dipisahkan sebagai keputusan produk, bukan diisi diam-diam oleh code.

## Matriks kesesuaian

| No. | Usulan PDF | Halaman | Status v4.3 | Implementasi |
|---:|---|---:|---|---|
| 1 | M5, M10, M15, M20, M30 sebagai fondasi pricing | 1–2, 4, 7 | Sesuai | `MILEAGE_BANDS`, `mapQuotaToBand()`, band tahunan |
| 2 | Starter M5 + Top-Up sebagai cara beli | 1, 3, 5, 7 | Sesuai | Purchase mode `STARTER_TOPUP` dan `ANNUAL_BAND` |
| 3 | T1/T3/T5/T10 menambah 1.000/3.000/5.000/10.000 km | 3 | Sesuai | Entitlement default `STRICT_PACK_INCREMENT`; target quota = quota saat ini + increment pack |
| 4 | Polis berlaku 12 bulan | 2, 5, 7 | Sesuai | Local-date-safe policy period, review consent, dashboard |
| 5 | Ada base premium untuk risiko tetap | 5 | Sesuai, angka mock | `baseRiskPremium` terpisah dari `mileagePremium` |
| 6 | Total quota dipetakan ke band | 5 | Sesuai | `mapQuotaToBand()` |
| 7 | Top-up menambah quota, bukan mengaktifkan jaminan | 5, 7 | Sesuai | Wording, consent, dashboard, claim guardrail |
| 8 | Semua top-up berakhir pada akhir polis | 5, 7 | Sesuai | Review, modal top-up, endorsement simulation |
| 9 | Harga top-up dihitung dari selisih band | 7 | Sesuai | `calculateTopUpPrice()` + parity check |
| 10 | Reminder pada 75% dan 90% | 6 | Sesuai | Trigger, notification preference, audit event |
| 11 | Top-up manual atau auto-upgrade dengan persetujuan awal | 6 | Sesuai sebagai opsi | Consent auto-upgrade dan token pembayaran dipisahkan |
| 12 | Kuota habis tidak otomatis menghentikan polis | 5, 7 | Sesuai | Policy coverage status tetap aktif |
| 13 | Klaim tidak otomatis ditolak karena quota habis | 3, 5, 7 | Sesuai | `automaticDeclineAllowed: false` |
| 14 | Fraud/manipulasi tetap penting | 5 | Sesuai | Tamper signal → investigation/manual review, bukan auto-decline |
| 15 | Odometer akhir dan renewal band | 6 | Sesuai | Rekonsiliasi akhir + renewal recommendation |
| 16 | Unused mileage masih perlu keputusan | 6 | Sesuai sebagai unresolved | Flag `PENDING_PRODUCT_DECISION`; tidak dianggap hangus/refund/kredit otomatis |
| 17 | Hindari terlalu banyak transaksi kecil | 3, 7 | Sebagian; perlu keputusan ekonomi | UI menandai pack paling efisien dalam band yang sama dan next-best-action memilih pack lebih besar bila satu pack belum menutup proyeksi |
| 18 | Formula top-up tidak boleh berbeda dari band utama | 7 | Sesuai | Tidak ada rate per-km terpisah; selisih berasal dari komponen mileage band |

## Temuan penting yang dikoreksi pada v4.3

### 1. Entitlement top-up kini mengikuti contoh PDF secara literal

Versi sebelumnya memakai rekomendasi sementara `FULL_TARGET_BAND`: T1 yang membawa quota dari 5.000 ke band M10 langsung memberi kapasitas 10.000 km. Itu nyaman secara UX tetapi **tidak sama dengan contoh PDF**, yang menyebut T1 sebagai tambahan 1.000 km.

v4.3 mengubah default menjadi:

- T1: +1.000 km;
- T3: +3.000 km;
- T5: +5.000 km;
- T10: +10.000 km.

Pricing tetap mengikuti band dari total quota setelah top-up. Konsekuensinya, T1/T3/T5 dari Starter M5 dapat sama-sama masuk M10 dan mempunyai tambahan premi yang sama. UI mengungkapkan hal ini dan menandai pack dengan mileage terbesar dalam band yang sama sebagai opsi paling efisien. Treatment transaksi berikutnya yang tetap berada pada band yang sudah dibayar harus dikunci bersama Product, Finance, dan Policy Administration.

### 2. Bug navigasi multi-step dikoreksi

Versi sebelumnya membuka `maxVisitedStep` secara asynchronous lalu segera memanggil fungsi navigasi yang masih membaca state lama. Pada kondisi tertentu tombol **Lanjutkan** dapat tidak berpindah layar. v4.3 membuka reference akses secara sinkron sebelum mengubah hash/step.

### 3. Baca STNK sekarang benar-benar melakukan prefill simulasi

UI sebelumnya menyatakan dapat melakukan prefill, tetapi code hanya mengubah status dokumen. v4.3 menambahkan hasil ekstraksi, confidence, daftar field yang dibaca, konfirmasi nasabah, dan audit event.

### 4. Safe UX defaults tidak mengunci keputusan produk yang belum final

PDF menempatkan manual top-up vs auto-upgrade sebagai keputusan yang harus dikunci. Prototype kini memilih **manual top-up sebagai default aman**; auto-upgrade hanya aktif setelah pilihan eksplisit, consent khusus, dan consent token pembayaran. Add-on berbayar serta metode pembayaran juga tidak dipilih otomatis. Ini bukan ketentuan PDF, tetapi guardrail UX agar prototype tidak memakai dark pattern.

## Asumsi prototype yang bukan ketentuan PDF

| Asumsi | Nilai prototype | Status |
|---|---:|---|
| Toleransi administratif | 250 km | Harus diputus Product/Underwriting/Claims |
| Trigger auto-upgrade | 100%, dengan pre-notification 90% | Harus diputus Product/Legal/Payment |
| Base premium dan tariff band | Mock | Wajib diganti approved tariff service |
| Age loading dan eligibility limit | Mock | Bukan berasal dari PDF |
| Harga perluasan | Mock | Bukan berasal dari PDF |
| Top-up administration/endorsement fee | Belum diterapkan | Harus dianalisis terhadap transaction economics |
| Treatment unused mileage | Pending | PDF secara eksplisit belum memutuskan |
| Wording over-mileage/klaim | Guardrail konseptual | Exact clause wajib disusun dan disetujui |

## Guardrail yang sudah eksplisit di code

- Tidak ada pembayaran ketika status `REFER`.
- Penggunaan di atas M30 tidak dipaksa masuk M30.
- Consent telematics saja tidak menaikkan confidence; koneksi harus `SUCCESS`.
- Tamper flag tidak menjadi auto-decline.
- Upgrade mempertahankan used mileage dan tanggal akhir polis.
- Top-up dalam band yang sudah dibayar dapat menghasilkan tambahan premi nol, tetapi tetap dicatat dan membutuhkan endorsement/ledger treatment.
- Unused mileage tidak otomatis diputus sebagai hangus, refund, atau renewal credit.
- Semua keputusan penting membawa reason code dan audit event.

## Kesimpulan

Secara produk, v4.3 sudah dapat dipakai sebagai **discussion-grade prototype** untuk Product, Underwriting, Claims, IT, Finance, Legal, dan Customer Experience. Ia tidak sekadar mendigitalkan form: proses sudah memisahkan evidence intelligence, forecast, decisioning, pricing, consent, payment, endorsement, notification, claim guardrail, dan reconciliation. Produksi baru boleh dimulai setelah item dalam `PRODUCT_DECISIONS.md` dikunci.
