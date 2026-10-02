import type { useTranslations } from "next-intl";
import { ApiError } from "@/lib/api";

export type GiftCardPendingConfirm = "activate" | "deactivate" | "delete";

type GiftCardConfirmCopy = {
  title: string;
  description: string;
  confirmLabel: string;
  tone: "danger" | "success";
  confirmClassName: string;
};

type GiftCardLabels = ReturnType<typeof useTranslations<"adminPages.giftCards">>;
type GiftCardActionLabels = ReturnType<
  typeof useTranslations<"adminPages.giftCards.actions">
>;

export function giftCardActionErrorMessage(
  error: unknown,
  fallback: string,
  issuedBlocked: string,
): string {
  if (!(error instanceof ApiError)) {
    return fallback;
  }
  if (error.message.includes("issued gift cards")) {
    return issuedBlocked;
  }
  const message = error.message.trim();
  return message.length > 0 ? message : fallback;
}

export function resolveGiftCardConfirmCopy(
  pending: GiftCardPendingConfirm | null,
  t: GiftCardLabels,
  tActions: GiftCardActionLabels,
): GiftCardConfirmCopy {
  if (pending === "delete") {
    return {
      title: tActions("delete"),
      description: tActions("deleteConfirm"),
      confirmLabel: tActions("delete"),
      tone: "danger",
      confirmClassName: "ommm-btn-lifecycle-action--danger",
    };
  }
  if (pending === "deactivate") {
    return {
      title: t("deactivateGiftCard"),
      description: tActions("deactivateConfirm"),
      confirmLabel: t("deactivateGiftCard"),
      tone: "danger",
      confirmClassName: "ommm-btn-lifecycle-action--danger",
    };
  }
  return {
    title: t("activateGiftCard"),
    description: t("confirmActivate"),
    confirmLabel: t("activateGiftCard"),
    tone: "success",
    confirmClassName: "ommm-btn-lifecycle-action--success",
  };
}
