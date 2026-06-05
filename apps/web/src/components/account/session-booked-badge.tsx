"use client";

import { useTranslations } from "next-intl";

export const SESSION_BOOKED_BADGE_CLASS =
  "rounded-full bg-mint-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-mint-900";

export const SESSION_BOOKED_CARD_CLASS =
  "border-mint-200/90 bg-mint-50/55 shadow-[0_22px_54px_-34px_rgba(45,120,95,0.2)]";

export const SESSION_BOOKED_ROW_CLASS = "border-mint-200/90 bg-mint-50/45";

export function SessionBookedBadge() {
  const t = useTranslations("userPages.classes");
  return <span className={SESSION_BOOKED_BADGE_CLASS}>{t("bookedBadge")}</span>;
}
