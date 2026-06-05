"use client";

import { useTranslations } from "next-intl";
import {
  normalizePaymentSource,
  resolveRelatedItemName,
  statusBadgeClass,
} from "@/components/account/user-payment-display";
import { formatDateTimeForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { UserPaymentRow } from "@/lib/user-package-types";

type UserPaymentCompactRowProps = {
  locale: string;
  payment: UserPaymentRow;
};

export function UserPaymentCompactRow({ locale, payment }: UserPaymentCompactRowProps) {
  const t = useTranslations("userPages.payments");
  const source = normalizePaymentSource(payment.description);
  const relatedItem = resolveRelatedItemName(payment.description);
  const amountLabel = formatAmdFromCents(payment.amountCents, locale);
  const dateLabel = formatDateTimeForUi(payment.createdAt, locale);

  return (
    <div className="ommm-list-row flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,0.8fr)] md:items-center md:gap-3">
      <div className="min-w-0">
        <p className="font-medium text-sage-800">{dateLabel}</p>
        <p className="mt-0.5 text-xs text-sage-500 md:hidden">{t(`source.${source}`)}</p>
      </div>
      <p className="font-medium text-sage-800">{amountLabel}</p>
      <p className="hidden text-xs uppercase text-sage-600 md:block">
        {(payment.currency || "amd").toUpperCase()}
      </p>
      <span
        className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusBadgeClass(payment.status)}`}
      >
        {t(`status.${payment.status}`)}
      </span>
      <p className="hidden text-sm text-sage-600 md:block">{t(`source.${source}`)}</p>
      <p className="hidden truncate text-xs text-sage-600 md:block">
        {relatedItem ?? t("common.notAvailable")}
      </p>
    </div>
  );
}
