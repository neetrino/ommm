import type { useTranslations } from "next-intl";
import type { FinancePaymentItem } from "@/components/admin/admin-finance-types";

type FinanceT = ReturnType<typeof useTranslations<"adminPages.finance">>;

export type PaymentDetailsTextField = { label: string; value: string };

function resolveRelatedLabel(t: FinanceT, payment: FinancePaymentItem): string {
  if (payment.relatedItemName?.trim()) {
    return payment.relatedItemName;
  }
  if (payment.description?.trim()) {
    return payment.description;
  }
  if (payment.sourceId) {
    return t(`paymentDetails.related.${payment.source}`, { id: payment.sourceId });
  }
  return "—";
}

/** Group + package for package payments; a single related item otherwise. */
export function paymentPurchaseFields(
  t: FinanceT,
  payment: FinancePaymentItem,
): PaymentDetailsTextField[] {
  if (payment.source === "package") {
    return [
      {
        label: t("paymentDetails.groupName"),
        value: payment.relatedItemGroupName?.trim() || "—",
      },
      {
        label: t("paymentDetails.packageName"),
        value: payment.relatedItemName?.trim() || "—",
      },
    ];
  }
  return [{ label: t("paymentDetails.relatedLabel"), value: resolveRelatedLabel(t, payment) }];
}

const ONLINE_CARD_PAYMENT_METHOD = "CARD";

/** True when a settled online-card payment still has no fiscal receipt. */
export function isEhdmReceiptMissing(payment: FinancePaymentItem): boolean {
  if (payment.paymentMethod !== ONLINE_CARD_PAYMENT_METHOD) {
    return false;
  }
  if (payment.status !== "SUCCEEDED" && payment.status !== "REFUNDED") {
    return false;
  }
  return !payment.ehdmReceipt;
}
