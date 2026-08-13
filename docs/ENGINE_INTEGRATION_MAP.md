# Engine Integration Map

## Prinsip arsitektur

Customer flow tidak boleh bergantung langsung pada vendor tertentu. UI menggunakan domain model dan orchestration layer; engine production dipasang melalui port/interface di `src/engines/contracts.ts`.

Alur ideal:

```text
Customer UI
   ↓
Quote Orchestrator / BFF
   ↓
Rules & Engine Gateway
   ├─ Document / Vision
   ├─ Odometer Evidence
   ├─ Mileage Forecast / Telematics
   ├─ Eligibility & Risk
   ├─ Rating & Pricing
   ├─ KYC / KYB
   ├─ Payment / Token Vault
   ├─ Policy Admin / Endorsement
   ├─ Notification Orchestration
   ├─ Claims Mileage Guardrail
   ├─ Geospatial Risk Enrichment
   ├─ Fraud / Cross-Policy Anomaly Signals
   ├─ Consent & Preference Registry
   ├─ Next-Best-Action / Top-Up Optimization
   └─ Audit / Observability
```

## Daftar engine dan kontrak minimum

| Engine | Input utama | Output minimum | Digunakan di flow | Kontrol wajib |
|---|---|---|---|---|
| Vehicle Document Intelligence | STNK image/PDF | field extraction, confidence, field reason | Data kendaraan | encryption, confirmation, manual review, PII masking |
| Odometer Evidence Intelligence | capture image, manual km, metadata | extracted km, confidence, quality checks, tamper signal | Odometer awal/akhir | capture guidance, liveness, metadata consent, forensic review |
| Mileage Forecast | usage questionnaire, odometer history, telematics | central estimate, range, confidence, method | Profil penggunaan, renewal | consent, drift monitoring, explainability, fallback |
| Eligibility & Decisioning | vehicle, customer, evidence, usage | PASS/WARN/REFER/BLOCK + reason codes | Semua gate | versioned rules, override log, maker-checker, fallback |
| Risk Context | region, parking, usage, evidence | explainable insights, risk context | Review | approved factors, no hidden pricing, fairness review |
| Rating & Pricing | approved risk inputs, band, effective date | breakdown, quote version, expiry | Paket, review, top-up | tariff approval, rounding, version, parity, quote expiry |
| KYC/KYB | identity/company data and docs | match status, confidence, review reason | Data nasabah | privacy, retention, manual review, sanctions handling |
| Payment & Tokenization | amount, method, consent | authorization/capture, token reference | Payment, auto-upgrade | PCI, idempotency, 3DS, reversal, token revocation |
| Policy Administration | accepted quote, payment, data | policy/endorsement number, document | Issue dan top-up | transaction ID, retry, reconciliation, accounting |
| Notification | event, channel preference, template | queued/sent/delivered status | 75%, 90%, over-mileage, reconciliation | approved template, quiet hours, opt-out, delivery log |
| Claims Mileage Guardrail | policy, used km, quota, tamper | context action, no-auto-decline flag | Pre-claim context | no sole-factor decline, fraud referral, audit reason |
| Audit & Observability | every decision/consent/transaction | immutable event and correlation ID | End-to-end | masking, retention, traceability, alerting |
| Geospatial Risk Enrichment | region, approximate location, parking | versioned hazard signals + explanation | Risk context/rating | approved layers, effective date, fallback, no hidden pricing |
| Fraud & Cross-Policy Anomaly | document fingerprint, contact/device reference, policy links | review signals, severity, explanation | Evidence/referral | no auto-decline, false-positive monitoring, investigation trail |
| Consent & Preference Registry | purpose, notice version, grant/revoke | consent ID, status, timestamp | Telematics, data, auto-upgrade, notification | purpose limitation, revocation, proof |
| Next-Best-Action Optimization | used quota, projection, packs, transaction economics | recommended action/pack, confidence, explanation | Reminder/top-up | customer benefit constraint, no dark pattern, monitoring |

## Urutan integrasi yang disarankan

### Fase 1 — Fondasi yang harus benar dahulu

1. Rules/decision engine
2. Rating engine
3. Policy administration/endorsement
4. Payment + idempotency
5. Audit/observability
6. Notification orchestration

Tanpa enam fondasi ini, menambahkan AI hanya menghasilkan demo yang terlihat canggih tetapi tidak dapat dipertanggungjawabkan.

### Fase 2 — Evidence intelligence

1. STNK extraction
2. Odometer capture SDK + OCR/vision
3. Image quality/tamper screening
4. Manual review queue
5. End-odometer reconciliation

### Fase 3 — Predictive usage

1. Historical odometer/renewal data
2. Connected-car/telematics adapter
3. Forecast range and calibration
4. Model monitoring
5. Personalized reminder timing

### Fase 4 — Advanced optimization

1. Geospatial enrichment yang telah disetujui
2. Fraud graph/cross-policy anomaly detection
3. Next-best-action dan top-up bundle optimization
4. Dynamic notification timing
5. Renewal recommendation
6. Portfolio-level mileage–claim analytics
7. Champion/challenger dan model/rule monitoring

## API boundary yang disarankan

Customer browser sebaiknya tidak memanggil semua engine langsung. Gunakan BFF/orchestrator dengan endpoint seperti:

```text
POST /quotes
POST /quotes/{id}/vehicle-document
POST /quotes/{id}/odometer-evidence
POST /quotes/{id}/usage-forecast
POST /quotes/{id}/decision
POST /quotes/{id}/price
POST /quotes/{id}/identity-verification
POST /quotes/{id}/payment-authorizations
POST /quotes/{id}/issue
POST /policies/{id}/mileage-upgrade-quotes
POST /policies/{id}/mileage-upgrades
POST /policies/{id}/end-odometer-reconciliation
POST /consents
DELETE /consents/{id}
GET  /policies/{id}/mileage
```

Setiap response penting harus membawa:

- `correlationId`
- `engineVersion` atau `ruleVersion`
- `decisionAt`
- `reasonCodes`
- `confidence` bila relevan
- `effectiveDate` dan `quoteExpiry` untuk pricing
- `manualReviewRequired`

## Prinsip “canggih” yang dipakai

Canggih bukan berarti semua form dipindahkan ke web. Sistem harus:

- membaca bukti dan menilai kualitasnya;
- menyatakan confidence dan alasan;
- memprediksi dalam bentuk rentang, bukan presisi palsu;
- mengorkestrasi keputusan otomatis vs review;
- menjaga pricing parity;
- menjalankan consent dan notification preference;
- mengeluarkan endorsement, bukan hanya mengubah angka UI;
- merekonsiliasi transaksi, dokumen, dan accounting;
- menghasilkan audit trail;
- menjaga klaim agar mileage tidak menjadi auto-decline yang tidak sah.


## Pola transaksi top-up yang disarankan

Top-up bukan sekadar perubahan angka pada browser. Satu transaksi production idealnya mempunyai state machine:

```text
OFFERED
  → CUSTOMER_CONFIRMED / AUTO_TRIGGERED_WITH_VALID_CONSENT
  → PAYMENT_AUTHORIZED (atau NO_CHARGE_WITHIN_PAID_BAND)
  → POLICY_ENDORSEMENT_ISSUED
  → ACCOUNTING_POSTED
  → NOTIFICATION_SENT
  → RECONCILED
```

Setiap transisi harus idempotent, mempunyai `correlationId`, dan dapat diulang secara aman. Kegagalan setelah payment tetapi sebelum endorsement wajib masuk reconciliation queue, bukan dibiarkan sebagai mismatch antara UI, payment, dan policy administration.

## Prinsip pemilihan engine

Jangan memilih engine hanya dari akurasi demo. Evaluasi minimal:

- kemampuan menjelaskan output per field/decision;
- confidence calibration dan manual-review routing;
- data residency, retention, dan zero-data-retention yang benar-benar dikontrakkan;
- latency dan fallback;
- versioning, audit, dan rollback;
- biaya per transaksi pada volume rendah dan tinggi;
- kemampuan integrasi private network/API gateway;
- pengujian Bahasa Indonesia, format STNK/KTP, dan variasi odometer lokal;
- proteksi dari vendor lock-in melalui port/interface dan contract test.
