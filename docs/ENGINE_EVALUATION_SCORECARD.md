# Engine Evaluation Scorecard

Dokumen ini digunakan saat membandingkan calon engine/vendor. Demo yang terlihat pintar tidak cukup. Engine harus dapat dipertanggungjawabkan dalam underwriting, pricing, klaim, privasi, dan operasi.

## Hard gates — gugur bila tidak terpenuhi

Calon engine tidak boleh dilanjutkan bila gagal salah satu gate berikut:

1. kontrak data residency, retention, deletion, dan penggunaan data untuk training tidak jelas;
2. tidak menyediakan version identifier dan audit trail per response;
3. tidak dapat mengirim confidence/reason per field atau per decision;
4. tidak memiliki mekanisme manual review/fallback;
5. tidak mendukung idempotency/reconciliation untuk transaksi finansial;
6. mengharuskan browser mengakses credential atau engine sensitif secara langsung;
7. tidak dapat diuji dengan dokumen, bahasa, kendaraan, dan skenario Indonesia;
8. vendor mengunci data/model tanpa jalur export atau adapter yang wajar.

## Scorecard umum

Gunakan skor 1–5. Nilai akhir = skor × bobot.

| Kriteria | Bobot | Yang harus dibuktikan |
|---|---:|---|
| Akurasi pada data Indonesia | 15% | benchmark STNK/KTP/odometer lokal, bukan demo generik |
| Confidence calibration | 10% | confidence sesuai error aktual; threshold dapat dikonfigurasi |
| Explainability | 10% | field reason, decision reason, evidence reference |
| Security & privacy | 15% | encryption, isolation, ZDR/retention contract, deletion, access control |
| Auditability & governance | 10% | versioning, approval, rollback, immutable log |
| Integration & portability | 10% | REST/event contract, private connectivity, timeout/fallback, adapter portability |
| Operational reliability | 10% | SLA, latency, retry, queue, regional resilience |
| Manual-review capability | 5% | review queue, evidence bundle, override trail |
| Cost economics | 10% | cost per document/quote/top-up pada beberapa volume, minimum commitment |
| Vendor viability & support | 5% | support model, incident process, roadmap, exit plan |

**Minimum rekomendasi:** 80/100 dan seluruh hard gate PASS.

## Tambahan bobot per kelas engine

### Vehicle Document / Odometer Evidence

Tambahkan penilaian untuk:

- field-level extraction accuracy;
- guided capture dan glare/blur/framing feedback;
- detection terhadap screen replay, image reuse, metadata anomaly, dan edit;
- kemampuan memisahkan fraud signal dari keputusan penolakan;
- latency pada koneksi mobile rendah;
- evidence image crop/coordinate untuk review manusia.

### Mileage Forecast / Telematics

Tambahkan penilaian untuk:

- forecast interval dan calibration, bukan hanya point estimate;
- cold-start fallback questionnaire;
- handling missing/late/outlier data;
- consent, revocation, and data minimization;
- drift monitoring dan renewal back-testing;
- cakupan OEM/dongle/mobile SDK serta biaya konektivitas.

### Rules / Decisioning

Tambahkan penilaian untuk:

- decision table versioning;
- maker-checker approval;
- effective date dan rollback;
- reason-code stability;
- test simulation sebelum publish;
- override dengan alasan dan audit.

### Rating / Pricing

Tambahkan penilaian untuk:

- approved tariff version dan effective date;
- deterministic rounding;
- quote expiry;
- band/top-up parity;
- replay/reproduce quote lama;
- accounting and reinsurance output bila dibutuhkan.

### Payment / Policy Administration

Tambahkan penilaian untuk:

- token vault dan revocation;
- idempotency;
- authorization/capture/reversal/refund;
- payment-success but endorsement-failed recovery;
- endorsement document and premium booking;
- reconciliation report dan operational dashboard.

### Notification / Next-Best-Action

Tambahkan penilaian untuk:

- delivery status dan retry;
- preference/quiet-hours/opt-out;
- approved template governance;
- no-dark-pattern constraint;
- optimasi yang mempertimbangkan customer benefit dan biaya transaksi;
- experiment governance dan complaint monitoring.

## Proof-of-concept minimum

Setiap vendor harus diuji pada satu dataset bersama dan skenario yang sama:

1. normal/pass;
2. low quality;
3. mismatch;
4. suspected tamper/reuse;
5. missing data;
6. engine timeout;
7. low confidence/manual review;
8. duplicate request/idempotency;
9. version rollback;
10. audit reconstruction satu transaksi end-to-end.

Hasil POC harus mencakup confusion matrix/field accuracy, latency distribution, review rate, false-positive rate, unit economics, dan contoh audit trace.
