import type { UserPaymentRow } from "../../lib/api/paymentsClient";

export type UserPaymentSource =
  | "package"
  | "dropin"
  | "gift"
  | "membership"
  | "other";

const KNOWN_PAYMENT_METHODS = new Set([
  "CASH",
  "CARD",
  "CARD_TERMINAL",
  "BANK_TRANSFER",
  "OTHER",
  "INFLUENCER",
]);

export function normalizePaymentSource(
  description: string | null,
): UserPaymentSource {
  const normalized = (description ?? "").toLowerCase();
  if (normalized.startsWith("membership")) return "membership";
  if (normalized.startsWith("package")) return "package";
  if (normalized.startsWith("drop-in")) return "dropin";
  if (normalized.startsWith("gift")) return "gift";
  return "other";
}

export function resolveRelatedItemName(
  description: string | null,
): string | null {
  if (!description) {
    return null;
  }
  const [head, ...tail] = description.split(":");
  if (tail.length === 0) {
    return null;
  }
  const candidate = tail.join(":").trim();
  return candidate.length > 0 ? candidate : head.trim() || null;
}

export function resolvePaymentMethodKey(
  paymentMethod: string | null,
): string | null {
  if (paymentMethod === null || !KNOWN_PAYMENT_METHODS.has(paymentMethod)) {
    return null;
  }
  return paymentMethod;
}

export function paymentStatusTone(
  status: string,
): "success" | "pending" | "failed" | "refunded" | "neutral" {
  if (status === "SUCCEEDED") return "success";
  if (status === "PENDING") return "pending";
  if (status === "FAILED") return "failed";
  if (status === "REFUNDED") return "refunded";
  return "neutral";
}

export function formatPaymentDate(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatPaymentTime(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString(locale, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export type PaymentCardLabels = {
  source: string;
  title: string;
  status: string;
  method: string;
  amountLabel: string;
  methodLabel: string;
};

export function buildPaymentCardLabels(
  payment: UserPaymentRow,
  t: (key: string) => string,
): PaymentCardLabels {
  const source = normalizePaymentSource(payment.description);
  const related = resolveRelatedItemName(payment.description);
  const methodKey = resolvePaymentMethodKey(payment.paymentMethod);
  return {
    source: t(`source.${source}`),
    title: related ?? t(`source.${source}`),
    status: t(`status.${payment.status}`),
    method:
      methodKey !== null
        ? t(`paymentMethods.${methodKey}`)
        : t("common.notAvailable"),
    amountLabel: t("table.amount"),
    methodLabel: t("table.paymentMethod"),
  };
}
