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

type UserPaymentBoardCardProps = {
  locale: string;
  payment: UserPaymentRow;
};

export function UserPaymentBoardCard({ locale, payment }: UserPaymentBoardCardProps) {
  const t = useTranslations("userPages.payments");
  const source = normalizePaymentSource(payment.description);
  const relatedItem = resolveRelatedItemName(payment.description);

  return (
    <article className="flex h-full flex-col rounded-[28px] border border-white/80 bg-white/95 p-5 shadow-[0_22px_54px_-34px_rgba(45,40,35,0.34)] transition-all hover:border-white hover:shadow-[0_28px_64px_-34px_rgba(45,40,35,0.4)] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-sand-600">
            {t(`source.${source}`)}
          </p>
          <h3 className="font-serif text-xl font-normal text-sage-900 sm:text-2xl">
            {formatAmdFromCents(payment.amountCents, locale)}
          </h3>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusBadgeClass(payment.status)}`}
        >
          {t(`status.${payment.status}`)}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-white/70 bg-white/60 p-4 text-xs text-sage-600">
        <div>
          <p className="text-sage-500">{t("table.date")}</p>
          <p className="mt-1 font-medium text-sage-900">
            {formatDateTimeForUi(payment.createdAt, locale)}
          </p>
        </div>
        <div>
          <p className="text-sage-500">{t("table.currency")}</p>
          <p className="mt-1 font-medium uppercase text-sage-900">
            {(payment.currency || "amd").toUpperCase()}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-sage-500">{t("table.related")}</p>
          <p className="mt-1 font-medium text-sage-900">
            {relatedItem ?? t("common.notAvailable")}
          </p>
        </div>
      </div>

      <dl className="mt-5 flex-1 space-y-2 text-xs text-sage-600">
        <div className="flex items-center justify-between gap-4">
          <dt>{t("table.reference")}</dt>
          <dd className="font-mono text-sage-800">
            {payment.paymentReference ?? t("common.notAvailable")}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt>{t("table.updated")}</dt>
          <dd className="text-sage-800">
            {formatDateTimeForUi(payment.updatedAt ?? payment.createdAt, locale)}
          </dd>
        </div>
      </dl>
    </article>
  );
}
