"use client";

import { useTranslations } from "next-intl";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import {
  normalizePaymentSource,
  resolvePaymentMethodLabel,
  resolveRelatedItemName,
  statusBadgeClass,
  toPaymentIso,
  formatPaymentTime,
} from "@/components/account/user-payment-display";
import {
  USER_PAYMENTS_LIST_CELL_CLASS,
  USER_PAYMENTS_LIST_DATE_CELL,
  USER_PAYMENTS_LIST_METHOD_CELL,
  USER_PAYMENTS_LIST_ROW_CLASS,
  USER_PAYMENTS_LIST_STATUS_CELL,
  USER_PAYMENTS_LIST_TIME_CELL,
} from "@/components/account/user-payments-list-layout";
import { USER_LIST_TITLE_SERIF_CLASS } from "@/components/account/user-list-table-layout";
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
  const paidAtIso = toPaymentIso(payment.createdAt);
  const timeLabel = formatPaymentTime(payment.createdAt, locale);
  const itemLabel = relatedItem ?? t(`source.${source}`);
  const methodLabel = resolvePaymentMethodLabel(payment.paymentMethod, t);

  return (
    <article className={USER_PAYMENTS_LIST_ROW_CLASS}>
      <div className={USER_PAYMENTS_LIST_CELL_CLASS}>
        <MobileLabel label={t("table.related")} />
        <p className={USER_LIST_TITLE_SERIF_CLASS} title={itemLabel}>
          {itemLabel}
        </p>
        <p className="mt-1 truncate text-xs font-medium text-sage-500">{t(`source.${source}`)}</p>
      </div>

      <div className={USER_PAYMENTS_LIST_CELL_CLASS}>
        <MobileLabel label={t("table.amount")} />
        <p className="whitespace-nowrap font-serif text-xl tabular-nums leading-none text-sage-950">
          {amountLabel}
        </p>
      </div>

      <div className={USER_PAYMENTS_LIST_DATE_CELL}>
        <MobileLabel label={t("table.date")} />
        <SessionDateTimeHighlight
          locale={locale}
          startsAt={paidAtIso}
          endsAt={paidAtIso}
          variant="listDateYear"
        />
      </div>

      <div className={USER_PAYMENTS_LIST_TIME_CELL}>
        <MobileLabel label={t("table.time")} />
        <p className="font-serif text-xl leading-none tracking-tight text-sage-950">{timeLabel}</p>
      </div>

      <div className={USER_PAYMENTS_LIST_STATUS_CELL}>
        <MobileLabel label={t("table.status")} />
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusBadgeClass(payment.status)}`}
        >
          {t(`status.${payment.status}`)}
        </span>
      </div>

      <div className={USER_PAYMENTS_LIST_METHOD_CELL}>
        <MobileLabel label={t("table.paymentMethod")} />
        <p className="truncate text-sm font-medium text-sage-800">{methodLabel}</p>
      </div>
    </article>
  );
}

function MobileLabel({ label }: { label: string }) {
  return (
    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-sage-500 md:hidden">
      {label}
    </p>
  );
}
