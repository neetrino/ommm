"use client";

import { useTranslations } from "next-intl";
import type { AdminGiftCardBatchRow } from "@/components/admin/admin-gift-cards-types";
import { formatAmdFromCents } from "@/lib/price-amd";

type GiftCardValueSource = Pick<
  AdminGiftCardBatchRow,
  "amountAmd" | "type" | "classQuantity" | "classTypeName"
>;

export function useGiftCardValueLabel(card: GiftCardValueSource, locale: string): string {
  const t = useTranslations("adminPages.giftCards");
  if (card.type !== "FIXED_CLASS") {
    return formatAmdFromCents(card.amountAmd, locale);
  }
  const count = card.classQuantity ?? 0;
  const className = card.classTypeName?.trim() ?? "";
  if (className.length === 0) {
    return t("classGiftValueUnknown", { count });
  }
  return t("classGiftValue", { className, count });
}
