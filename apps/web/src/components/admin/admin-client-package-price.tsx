"use client";

import { useTranslations } from "next-intl";
import type { ClientSheetPackageItem } from "@/components/admin/admin-clients-types";
import { AmdMoneyText } from "@/components/ui/amd-money-text";

type AdminClientPackagePriceProps = {
  item: ClientSheetPackageItem;
  locale: string;
};

/** Amount on the package payment, with the list price struck through when discounted. */
export function AdminClientPackagePrice({ item, locale }: AdminClientPackagePriceProps) {
  const tAdmin = useTranslations("adminPages.clients");
  const amountCents = item.paymentAmountCents;
  if (amountCents === null || amountCents === undefined) {
    return null;
  }
  const listPriceCents = item.paymentListPriceCents ?? null;
  const label =
    item.paymentMethod === "INFLUENCER"
      ? tAdmin("packages.studioCost")
      : tAdmin("packages.clientPays");

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sage-500">
        {label}
      </p>
      <div className="flex flex-wrap items-baseline justify-end gap-x-2 gap-y-1">
        {listPriceCents !== null ? (
          <AmdMoneyText
            cents={listPriceCents}
            locale={locale}
            className="text-sm text-sage-500 line-through"
          />
        ) : null}
        <AmdMoneyText
          cents={amountCents}
          locale={locale}
          className="font-serif text-xl font-semibold tracking-tight text-sage-950"
        />
        {item.paymentCouponCode ? (
          <span className="rounded-full border border-sage-200/80 bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-sage-700">
            {tAdmin("packages.promoCode", { code: item.paymentCouponCode })}
          </span>
        ) : null}
      </div>
    </div>
  );
}
