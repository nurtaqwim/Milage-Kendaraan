# Validation Report — Jasindo Mileage Prototype v4.3

Tanggal audit: 11 Agustus 2026

## Kesimpulan

Source code telah melalui audit statis terhadap konsep produk, semantic TypeScript check dengan dependency shim lokal, dan CSS parser check. Hasilnya cukup untuk menyebut project **discussion-grade dan repository-ready**, tetapi belum cukup untuk menyebutnya production-ready.

## Pemeriksaan yang berhasil

| Pemeriksaan | Hasil | Catatan |
|---|---|---|
| Review sumber PDF 7 halaman | PASS | Seluruh prinsip produk dan keputusan yang belum selesai dipetakan ke code/docs |
| Review referensi UI React | PASS | Pola visual dipakai sebagai referensi, bukan disalin sebagai workflow internal |
| Product conformance audit | **22/22 PASS** | Jalankan `npm run audit:product` atau `node scripts/product-audit.mjs` |
| Semantic TypeScript audit | PASS | Dijalankan dengan shim lokal untuk React/Lucide karena dependency registry tidak tersedia pada runtime audit |
| CSS syntax parse | PASS | Seluruh `src/styles.css` berhasil diparse |
| Stale terminology scan | PASS setelah koreksi | Preview lama yang menggabungkan T1/T3/T5 ke target band telah diganti dengan strict pack increment |
| Source hygiene | PASS | Tidak ditemukan marker pekerjaan tertunda pada source code dan artifact build dibersihkan dari paket final |

## Hal penting yang dikoreksi saat audit

1. **Top-up entitlement** kini literal mengikuti contoh sumber: T1/T3/T5/T10 menambah 1.000/3.000/5.000/10.000 km.
2. **Navigation race condition** pada pembukaan langkah baru dikoreksi dengan synchronous access reference.
3. **STNK prefill** sekarang menghasilkan extracted fields, confidence, review reason, dan audit event.
4. **Top-up manual** menjadi default; auto-upgrade tidak dipilih secara default.
5. **Perluasan berbayar** tidak dipilih otomatis.
6. **Metode pembayaran** tidak dipilih otomatis; nasabah harus memilih secara eksplisit.
7. **Referral** tidak menagihkan pembayaran.
8. **Over-mileage** tidak mengubah status polis menjadi berhenti dan tidak menjadi auto-decline klaim.

## Batas validasi runtime ini

Full command berikut belum dapat dijalankan pada lingkungan audit:

```bash
npm install
npm run build
```

Penyebabnya adalah akses package registry tidak tersedia/timed out pada runtime. Karena itu laporan ini **tidak mengklaim production build telah berhasil**. CI GitHub telah disiapkan untuk menjalankan install, product audit, typecheck, dan build pada environment yang memiliki akses registry.

Browser screenshot otomatis juga tidak dapat dibuat karena executable browser diblokir oleh kebijakan administrator runtime. Sebagai pengganti tersedia `preview.html`, tetapi preview tersebut bukan bukti browser compatibility lintas perangkat.

## Validasi berikutnya yang wajib

Sebelum pilot:

- `npm ci && npm run check` harus PASS pada GitHub Actions;
- uji Chromium, Safari, dan mobile browser nyata;
- keyboard dan screen-reader audit;
- contract test terhadap setiap engine/gateway;
- E2E test payment → endorsement → accounting → notification → reconciliation;
- security review untuk PII, file upload, session, token, dan audit log;
- product/legal/claims review untuk wording dan seluruh keputusan yang masih terbuka;
- moderated usability test dan comprehension test.

## Status akhir

- **Kesesuaian konsep PDF:** kuat, dengan gap terbuka ditandai eksplisit.
- **Kualitas arsitektur prototype:** baik dan engine-ready.
- **Kualitas UI/UX untuk usability test:** baik.
- **Kesiapan production:** belum; membutuhkan keputusan produk, engine nyata, backend, security, legal wording, dan full E2E validation.
