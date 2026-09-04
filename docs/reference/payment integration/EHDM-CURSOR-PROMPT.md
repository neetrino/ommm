Do not implement any code yet. First switch to Plan mode and produce a detailed implementation plan. Wait for my approval before writing or deleting files.

# Task

Create a production-grade EHDM (E-HDM / Էլեկտրոնային ՀԴՄ) integration plan for this OMMM monorepo, then (only after I approve the plan) implement it.

OMMM currently has a mock/fake fiscal-receipt path. Replace it with a real Armenia Tax Service (ՊԵԿ) integration. Env vars are already set locally — do not invent credentials, CRN, TIN, certs, or tax codes.

This is a Size C monorepo: `apps/web`, `apps/api`, `apps/mobile`, `packages/database`. Keep EHDM on the NestJS API. Follow existing conventions: TypeScript strict, named exports, no `any`, no secrets in git, functions ≤ 50 lines, files ≤ 300 lines.

---

## Research first (mandatory, before the plan)

Read these sources in full, in this order:

1. Official PEC manual (source of truth):
   `docs/reference/payment integration/official-api-integration-docs/EHDM/uc_hhpek_electronic_HDM_integration_manual_11_2024_6734a3be6964d.html`

2. Project payment docs:
   - `docs/reference/payment integration/payments/EHDM-INTEGRATION.md`
   - `docs/reference/payment integration/payments/01-GENERAL-RULES.md` (section 8)
   - `docs/reference/payment integration/payments/00-INDEX.md`

3. Working reference implementation:
   - GitHub: `https://github.com/neetrino/borboraqua.am.git`
   - Local clone if present: `D:\Neetrino\_ref-borboraqua`
   - Focus on:
     - `apps/web/lib/payments/ehdm/` (`config.ts`, `client.ts`, `seq.ts`, `print.ts`, `print-for-order.ts`, `types.ts`, `index.ts`)
     - `apps/web/lib/payments/post-payment-side-effects.ts`
     - `apps/web/components/EhdmReceiptBlock.tsx`
     - `docs/payments/EHDM-INTEGRATION.md`

4. Current OMMM code (to replace, not blindly keep):
   - `apps/api/src/payments/ehdm/**`
   - `apps/api/src/payments/payments.module.ts`
   - `apps/api/src/payments/payments-confirm.service.ts`
   - `apps/api/src/payments/payments-checkout.service.ts`
   - `apps/api/src/payments/payments-admin.service.ts`
   - `packages/database/prisma/models/ehdm.prisma`
   - Web receipt UI: `apps/web/src/components/payment/payment-ehdm-*`
   - Admin finance receipt rows
   - `.env.example` EHDM section

Use borboraqua as the behavioral and payload reference. Do not copy its Next.js architecture. Adapt to OMMM domain: `Payment` (PACKAGE / DROPIN / GIFT), not e-commerce Order + cart + shipping.

---

## Official API contract

Base URL: `https://ecrm.taxservice.am/taxsystem-rs-vcr/api/v1.0`

Auth: HTTPS POST, `Content-Type: application/json`, mutual TLS client certificate (`.crt` + encrypted `.key` + passphrase) via Node `https.Agent` (`cert`, `key`, `passphrase`, `rejectUnauthorized: true`).

Methods:

| Method | Path | When |
|---|---|---|
| Connection check | `POST /checkConnection` | Startup / admin health (recommended) |
| Print sale receipt | `POST /print` | Payment newly reaches `SUCCEEDED` |
| Print return receipt | `POST /printReturnReceipt` | Payment is refunded and a sale receipt already exists |
| Print copy | `POST /printCopy` | Client method only; wire UI only if cheap |

`/print` sale body (`mode = 2`):

```json
{
  "crn": "<EHDM_CRN>",
  "seq": 2,
  "cardAmount": 40000,
  "cashAmount": 0,
  "partialAmount": 0,
  "prePaymentAmount": 0,
  "cashierId": 1,
  "mode": 2,
  "partnerTin": null,
  "items": [
    {
      "dep": 1,
      "adgCode": "9205",
      "goodCode": "SKU-OR-REF",
      "goodName": "max 30 chars",
      "quantity": 1,
      "unit": "Հատ",
      "price": 40000
    }
  ]
}
```

Amounts are AMD major units, not cents. Tender must match the payment method: card/Arca/online → `cardAmount = total`, `cashAmount = 0`; cash/bank transfer/other manual → `cashAmount = total`, `cardAmount = 0`.

Success: `code === 0` and `result` with at least `receiptId`, `fiscal`, `qr`, `crn`, `sn`, `tin`, `time`, `total`. Persist the full JSON.

`seq` rules:

- First request may use `EHDM_INITIAL_SEQ`.
- After every successful seq-bearing request, next request MUST be previous + 1.
- PEC stores seq server-side. Reused or skipped seq fails.
- Reserve seq in DB atomically before the HTTP call. Roll back only if PEC did not accept it.
- Never print two receipts for the same payment.

`/printReturnReceipt`:

```json
{
  "crn": "<EHDM_CRN>",
  "seq": 6,
  "receiptId": 8,
  "cardAmountForReturn": 22000,
  "cashAmountForReturn": 0,
  "returnItemList": [{ "receiptProductId": 0, "quantity": 1 }]
}
```

Use the original sale `receiptId`. Match return cash/card to the original tender.

---

## Current fake path to remove

- `EhdmMockClient` and `MOCK-*` receipts
- Fake CRN/TIN `00000000`
- Auto-mock when certs are missing or `EHDM_TEST_MODE=true`
- New `isMock: true` rows and mock badges / `https://mock.ehdm.local/...`
- Any other fake fiscal-receipt helpers

If EHDM is not fully configured: skip print and log a warning. Do not invent a fake receipt.

Do not rip out unrelated flows (Arca checkout, manual cash confirm, gift checkout).

---

## Env (already set — do not invent values)

Support both styles:

- Deploy: `EHDM_CERT_BASE64`, `EHDM_KEY_BASE64`, `EHDM_KEY_PASSPHRASE`
- Local files: `EHDM_CERT_PATH`, `EHDM_KEY_PATH`

Also: `EHDM_API_URL`, `EHDM_CRN`, `EHDM_TIN`, `EHDM_INITIAL_SEQ`, `EHDM_DEP`, `EHDM_DEFAULT_ADG_CODE`, `EHDM_DEFAULT_UNIT`, `EHDM_CASHIER_ID`, optional `EHDM_ENABLED=false`.

Prefer in-memory PEM from base64 (do not write secrets to disk unless necessary). Never commit certs, keys, passphrase, CRN, or TIN. Update `.env.example` with empty placeholders only. Use existing `EHDM_DEP` / ADG from env; do not change tax regime.

---

## What the plan must cover

1. Config + HTTPS client on `apps/api/src/payments/ehdm/` (no mock fallbacks). Methods: `checkConnection`, `print`, `printReturnReceipt`, `printCopy`.
2. Atomic seq reserve + conditional rollback + up to 3 retries with short delay (as in borboraqua).
3. Fire-and-forget `/print` when payment newly becomes `SUCCEEDED` from confirm, checkout, admin status, and Arca sync/callback. Guards: configured, AMD only, not already receipted.
4. One line item from OMMM payment: `goodName` ≤ 30 chars (package/class/gift), `goodCode` = payment reference or short stable id, `price = amountCents / 100`.
5. Fire-and-forget `/printReturnReceipt` when a receipted payment is refunded. No double-return.
6. Schema: keep `EhdmState` + `EhdmReceipt` (`paymentId` unique). Add return-receipt fields only if needed. Stop writing `isMock: true`.
7. UI: real receipt in member success/receipt page and admin finance details (receipt id, fiscal, taxpayer, Asia/Yerevan time, total, QR from PEC payload text — not assumed to be a URL). Hide print CTA until a real receipt exists.
8. Tests for print body, seq, skip rules, return body. Do not delete tests to pass CI.
9. Update `EHDM-INTEGRATION.md` for the NestJS implementation and `.env.example` comments.

Do not change payment fulfillment, Arca, emails, or package logic except to hook print/return. Do not add new libraries. Do not call `/activate` or `/configureDepartments` unless the plan explains why they are required.

---

## Plan output format

After research, produce a plan with:

1. Current-state findings (what is fake vs already reusable)
2. Target architecture and file list (create / edit / delete)
3. Payment → print and refund → return sequence diagrams in words
4. Schema / migration decision
5. Env checklist (names only, no secret values)
6. UI surfaces to update
7. Test plan
8. Implementation order (small, reviewable steps)
9. Risks (seq collisions, fire-and-forget race, cert path/base64, PEC downtime)

Then stop and wait. Do not implement until I explicitly approve the plan.
