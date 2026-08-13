# Product Decisions yang Harus Dikunci

Dokumen konsep menetapkan fondasi produk, tetapi belum menjawab seluruh detail implementasi. Item di bawah tidak boleh diputus diam-diam oleh developer, UI designer, atau vendor engine.

## Yang sudah mengikuti sumber

- T1/T3/T5/T10 menambah mileage sesuai nominal pack.
- Total quota dipetakan ke M5/M10/M15/M20/M30.
- Harga top-up berasal dari selisih band.
- Polis dan seluruh top-up berakhir pada tanggal akhir polis.
- Over-mileage tidak otomatis mengakhiri polis atau menolak klaim.

## Keputusan yang masih terbuka

| No. | Keputusan | Pilihan yang perlu dianalisis | Dampak jika tidak dikunci |
|---:|---|---|---|
| 1 | Treatment pack dalam band yang sudah dibayar | top-up Rp0 dengan endorsement / mileage wallet otomatis sampai batas band / bundle per transaksi | UX membingungkan, biaya transaksi, sengketa saldo |
| 2 | Boleh membeli beberapa pack sekaligus | satu pack / multi-pack basket / system-recommended bundle | Terlalu banyak transaksi atau quota tidak cukup |
| 3 | Minimum nilai transaksi dan biaya top-up | minimum premium / fee / absorb cost / grouping | Payment dan endorsement lebih mahal daripada premi |
| 4 | Toleransi administratif | angka km, persentase, waktu, atau proyeksi | Inkonsistensi reminder, claim handling, dan endorsement |
| 5 | Trigger auto-upgrade | 90%, 100%, lewat tolerance, atau projected exhaustion | Debit tidak terduga dan consent dispute |
| 6 | Auto-upgrade consent lifecycle | satu kali, per transaksi, dapat dicabut, expiry | Risiko kepatuhan dan komplain pembayaran |
| 7 | Pre-notification auto-upgrade | timing, kanal, grace period, hak membatalkan | Auto-charge dianggap tidak transparan |
| 8 | Unused mileage | hangus / kredit renewal / refund parsial | Kewajiban accounting dan ekspektasi nasabah |
| 9 | Treatment over-mileage | invoice, endorsement, grace period, collection | Polis aktif tetapi premi belum tertagih |
| 10 | Exact wording klaim | clause over-mileage, selisih premi, fraud, bukti | Sengketa klaim dan unfair treatment |
| 11 | Treatment >M30 | referral, produk lain, telematics-only, decline | M30 menjadi bucket risiko tak terkontrol |
| 12 | Base premium dan tariff band | approved rate table + effective date | Pricing tidak dapat diaudit |
| 13 | Faktor rating tambahan | region, parking, claim history, vehicle use | Hidden pricing dan risiko fairness |
| 14 | Renewal band | actual odometer, telematics, weighted history | Nasabah dipindah band tanpa dasar konsisten |
| 15 | Sumber telematics | OEM, dongle, mobile SDK, partner | Coverage data, consent, biaya, reliability |
| 16 | Capture odometer | upload biasa vs guided capture/liveness | Fraud dan kualitas bukti |
| 17 | SLA manual review | target waktu, escalation, customer status | Customer journey berhenti tanpa kepastian |
| 18 | Notification policy | channel, quiet hours, opt-out, retry | Reminder gagal atau dianggap spam |
| 19 | Accounting top-up | endorsement, premium booking, commission, tax | Rekonsiliasi finansial gagal |
| 20 | Refund/cancellation | treatment mileage premium saat cancel | Formula refund dan kewajiban tidak jelas |
| 21 | Data retention | STNK, KTP, foto odometer, metadata, telematics | Risiko privasi dan penyimpanan berlebihan |
| 22 | Model/rule governance | approval, versioning, monitoring, rollback | Keputusan tidak dapat dijelaskan atau direproduksi |

## Asumsi prototype v4.3

- Toleransi: **250 km** — `PROTOTYPE_ASSUMPTION`
- Trigger auto-upgrade: **100%** — `PROTOTYPE_ASSUMPTION`
- Entitlement pack: **strict increment T1/T3/T5/T10** — mengikuti contoh sumber
- Pack paling efisien dalam band yang sama: **UX recommendation**, bukan ketentuan produk
- Unused mileage: **belum diputus** — `UNRESOLVED_IN_SOURCE`
- Tarif/base premium/loading/add-on: **mock only**
- Penggunaan komersial, usia, dan nilai pertanggungan: **prototype referral rules**, bukan rule PDF
- Default UX: **manual top-up**, add-on kosong, dan pembayaran belum dipilih — safe default, bukan ketentuan PDF

## Gate sebelum pilot

Pilot tidak boleh dimulai hanya karena UI sudah siap. Minimum gate:

1. keputusan 1–13 dikunci dan dituangkan ke product specification;
2. tariff serta effective date disetujui;
3. wording legal dan claim treatment ditandatangani;
4. payment, tokenization, endorsement, accounting, dan reconciliation lolos end-to-end test;
5. consent, privacy notice, retention, dan revocation lolos review;
6. manual review queue mempunyai SLA dan escalation;
7. usability/comprehension test menunjukkan nasabah memahami polis 12 bulan, mileage, dan top-up.
