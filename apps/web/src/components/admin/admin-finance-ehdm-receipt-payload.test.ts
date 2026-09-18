import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toAdminEhdmReceiptPayload } from "./admin-finance-ehdm-receipt-payload";
import type { FinancePaymentItem } from "./admin-finance-types";

function stubPayment(
  overrides: Partial<FinancePaymentItem> = {},
): FinancePaymentItem {
  return {
    id: "pay-1",
    amountCents: 1,
    currency: "amd",
    status: "SUCCEEDED",
    description: "Package payment",
    relatedItemName: "Mix Dance Pilates",
    relatedItemGroupName: "Reformer Group",
    paymentMethod: "CARD",
    paymentReference: "PACKAGE-2818A5C8575F",
    sourceId: "pkg-1",
    source: "package",
    createdAt: "2026-09-18T10:00:00.000Z",
    confirmedAt: "2026-09-18T10:14:00.000Z",
    ehdmReceipt: {
      receiptId: "2",
      seq: 1,
      fiscal: "7972958",
      qr: "TIN:1",
      taxpayer: "OMMM",
      tin: "02944878",
      time: 1_726_650_000_000,
      total: 1,
      createdAt: "2026-09-18T10:14:00.000Z",
    },
    user: { email: "a@b.c", name: "G", lastName: "G" },
    ...overrides,
  };
}

describe("toAdminEhdmReceiptPayload", () => {
  it("returns null when the fiscal receipt is missing", () => {
    assert.equal(toAdminEhdmReceiptPayload(stubPayment({ ehdmReceipt: null })), null);
  });

  it("uses the package name and confirmed time for the member printer", () => {
    const payload = toAdminEhdmReceiptPayload(stubPayment());
    assert.ok(payload);
    assert.equal(payload.paymentReference, "PACKAGE-2818A5C8575F");
    assert.equal(payload.description, "Mix Dance Pilates");
    assert.equal(payload.paidAt, "2026-09-18T10:14:00.000Z");
    assert.equal(payload.ehdmReceipt?.fiscal, "7972958");
  });
});
