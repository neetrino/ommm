# EHDM (E-HDM) — OMMM NestJS integration

E-HDM talks to the Armenia Tax Service (PEC) at `ecrm.taxservice.am`. OMMM prints one fiscal receipt per `Payment` (PACKAGE / DROPIN / GIFT) from the NestJS API. This is not the borboraqua Next.js Order + cart + shipping flow.

**Official source:** `docs/reference/payment integration/official-api-integration-docs/EHDM/uc_hhpek_electronic_HDM_integration_manual_11_2024_6734a3be6964d.html`

---

## 1. Contract

- **Base URL:** `EHDM_API_URL` = `https://ecrm.taxservice.am/taxsystem-rs-vcr/api/v1.0`
- **Auth:** HTTPS POST, `Content-Type: application/json`, mutual TLS via Node `https.Agent` (`cert`, `key`, `passphrase`, `rejectUnauthorized: true`)
- **Methods used:**
  - `POST /checkConnection` — startup log only (does not fail boot)
  - `POST /print` — sale, `mode = 2`, when a payment newly becomes `SUCCEEDED`
  - `POST /printReturnReceipt` — when a receipted payment is `REFUNDED`
  - `POST /printCopy` — client method only; no UI
- **Not called:** `/activate`, `/configureDepartments` (one-time PEC onboarding)

Success: `code === 0` and `result` with `receiptId`, `fiscal`, `qr`, `crn`, `sn`, `tin`, `taxpayer`, `time` (unix ms), `total`. Persist the full JSON. `qr` is a **text payload**, not a URL.

Amounts are AMD **major units**. OMMM `Payment.amountCents` already stores whole dram — send it as-is (do not divide by 100).

---

## 2. Secrets

Never commit certs, keys, passphrase, CRN, or TIN.

| Variable | Secret | Notes |
|---|---|---|
| `EHDM_KEY_PASSPHRASE` | Yes | Encrypted `.key` password |
| `EHDM_CERT_BASE64` / `EHDM_KEY_BASE64` | Yes | Preferred in production; decoded in memory |
| `EHDM_CERT_PATH` / `EHDM_KEY_PATH` | Path only | Local files; keep files outside git (`Private/`) |
| `EHDM_CRN` / `EHDM_TIN` | Business IDs | Empty placeholders in `.env.example` |

Prefer base64 PEMs in memory. Do not write secrets to disk. Relative file paths resolve from `process.cwd()` (usually `apps/api` when the API is started there) — use an absolute path if `Private/` is at the repo root.

---

## 3. Environment

| Variable | Purpose |
|---|---|
| `EHDM_ENABLED` | `false` disables print/return even if credentials exist |
| `EHDM_API_URL` | PEC base URL |
| `EHDM_CRN` / `EHDM_TIN` | Cash register / taxpayer |
| `EHDM_CERT_BASE64` + `EHDM_KEY_BASE64` **or** `EHDM_CERT_PATH` + `EHDM_KEY_PATH` | mTLS |
| `EHDM_KEY_PASSPHRASE` | Key passphrase |
| `EHDM_INITIAL_SEQ` | First seq when `EhdmState` is empty |
| `EHDM_DEP` | Tax regime (do not change without accountant) |
| `EHDM_DEFAULT_ADG_CODE` / `EHDM_DEFAULT_UNIT` / `EHDM_CASHIER_ID` | Line-item defaults |

If EHDM is not fully configured: **skip** print/return and log a warning. No fake / mock receipts.

---

## 4. Seq

PEC stores seq server-side. After any successful seq-bearing request, the next must be previous + 1. Reused or skipped values fail.

1. Reserve in `EhdmState` inside a transaction (`INSERT … ON CONFLICT` + `SELECT … FOR UPDATE`).
2. Call PEC.
3. On explicit `code !== 0`, roll back that seq (`nextSeq === seq + 1`) and retry up to 3 times (2s delay).
4. On network/timeout/invalid JSON: **do not** roll back (PEC may have accepted). Leave seq consumed and log.

`EHDM_INITIAL_SEQ` is used only when the `default` row does not exist. If DB `nextSeq` is behind live PEC, prints fail until `EhdmState.nextSeq` is updated to match PEC — do not invent that number.

---

## 5. Payment → print

Fire-and-forget after a payment **newly** becomes `SUCCEEDED`:

- `PaymentsConfirmService.confirmPayment` (admin confirm, Arca `confirmPendingCardPayment`, drop-in card)
- Gift checkout card success (`PaymentsCheckoutService`)
- Admin status → `SUCCEEDED` (non-pending path)

Guards: enabled + fully configured, AMD, amount > 0, not influencer, no existing `EhdmReceipt` for `paymentId`.

One line item:

- `goodName` ≤ 30 chars (package / class / gift / `Վճարում`)
- `goodCode` = `paymentReference` or last 12 of `paymentId`
- `price` = `amountCents` (AMD)
- Tender: `CARD` / `CARD_TERMINAL` → `cardAmount`; cash / bank transfer / other / null → `cashAmount`

Never print two sale receipts for the same payment (`paymentId` unique).

---

## 6. Refund → return

When admin sets `REFUNDED` and a real sale receipt exists:

- `POST /printReturnReceipt` with original `receiptId`, matching cash/card split, `returnItemList: [{ receiptProductId: 0, quantity: 1 }]`
- Persist `returnReceiptId` / `returnSeq` / `returnResponse` / `returnedAt`
- Skip if no sale receipt, leftover `isMock` row, or return already stored

---

## 7. Code map

| Area | Path |
|---|---|
| Config / certs / mTLS client | `apps/api/src/payments/ehdm/` |
| Seq | `ehdm-seq.service.ts` |
| Print / return | `ehdm-print.service.ts`, `ehdm-return.service.ts` |
| Facade hooks | `ehdm-receipt.service.ts` (`tryPrintReceipt`, `tryPrintReturnReceipt`) |
| Schema | `packages/database/prisma/models/ehdm.prisma` |
| Member UI | `apps/web/src/components/payment/payment-ehdm-*` |
| Admin UI | `apps/web/src/components/admin/admin-finance-payment-details-rows.tsx` |

---

## 8. UI

Member success screen and `/payment/receipt` poll `/payments/me/outcome` (8 × 1.5s). Hide the view/print CTA until a real receipt exists. Show receipt id, fiscal, taxpayer, TIN, Asia/Yerevan time, total, and a QR **image** encoded from PEC `qr` text.

Leftover mock rows (`isMock = true`) are omitted from API summaries.

---

## 9. Checklist

- [ ] Env filled (no values in git). Certs outside the repo.
- [ ] `EhdmState.nextSeq` matches PEC if this CRN was used before.
- [ ] Startup log: `EHDM checkConnection succeeded` (or a skip warning).
- [ ] One AMD payment → sale receipt; refund → return receipt; second print skipped.

**Document version:** 2.0  
**Date:** 2026-09-03
