"use client";

import { useTranslations } from "next-intl";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import {
  formatPaymentTime,
  toPaymentIso,
} from "@/components/account/user-payment-display";
import { AdminFinancePaymentActions } from "@/components/admin/admin-finance-payment-actions";
import {
  ADMIN_FINANCE_MONEY_CLASS,
  ADMIN_FINANCE_VALUE_BADGE_CLASS,
  financePaymentStatusTone,
  financeSourceTone,
} from "@/components/admin/admin-finance-list-display";
import {
  ADMIN_FINANCE_PAYMENTS_LIST_ACTIONS_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_DATE_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_METHOD_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_FINANCE_PAYMENTS_LIST_ROW_CLASS,
  ADMIN_FINANCE_PAYMENTS_LIST_SOURCE_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_SPACER_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_STATUS_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_TIME_CELL,
} from "@/components/admin/admin-finance-payments-list-layout";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import type { FinancePaymentItem } from "@/components/admin/admin-finance-types";
import { isManualPaymentMethod } from "@/lib/manual-payment-method";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminFinancePaymentCompactRowProps = {
  locale: string;
  row: FinancePaymentItem;
};

function displayName(row: FinancePaymentItem): string {
  const merged = [row.user.name, row.user.lastName].filter(Boolean).join(" ").trim();
  return merged.length > 0 ? merged : row.user.email;
}

function paymentStatusLabel(
  t: ReturnType<typeof useTranslations<"adminPages.finance">>,
  status: string,
): string {
  if (status === "SUCCEEDED") return t("filters.statusSucceeded");
  if (status === "PENDING") return t("filters.statusPending");
  if (status === "FAILED") return t("filters.statusFailed");
  if (status === "REFUNDED") return t("filters.statusRefunded");
  return status;
}

function resolveMethodLabel(
  t: ReturnType<typeof useTranslations<"adminPages.finance">>,
  paymentMethod: string | null,
): string {
  if (paymentMethod === null || !isManualPaymentMethod(paymentMethod)) {
    return "—";
  }
  return t(`paymentMethods.${paymentMethod as "CASH"}`);
}

export function AdminFinancePaymentCompactRow({
  locale,
  row,
}: AdminFinancePaymentCompactRowProps) {
  const t = useTranslations("adminPages.finance");
  const tTable = useTranslations("adminPages.finance.table");
  const paidAtIso = toPaymentIso(row.createdAt);
  const userLabel = displayName(row);

  return (
    <article className={ADMIN_FINANCE_PAYMENTS_LIST_ROW_CLASS}>
      <div className={ADMIN_FINANCE_PAYMENTS_LIST_CELL}>
        <AdminListMobileLabel label={tTable("colUser")} />
        <p className="truncate text-sm font-medium text-sage-900">{userLabel}</p>
        <p className="mt-0.5 truncate text-xs text-sage-500">{row.user.phone ?? row.user.email}</p>
      </div>

      <div className={ADMIN_FINANCE_PAYMENTS_LIST_CELL}>
        <AdminListMobileLabel label={tTable("colAmount")} />
        <p className={ADMIN_FINANCE_MONEY_CLASS}>
          {formatAmdFromCents(row.amountCents, locale)}
        </p>
      </div>

      <div className={ADMIN_FINANCE_PAYMENTS_LIST_DATE_CELL}>
        <AdminListMobileLabel label={tTable("colDate")} />
        <SessionDateTimeHighlight
          locale={locale}
          startsAt={paidAtIso}
          endsAt={paidAtIso}
          variant="listDateYear"
        />
      </div>

      <div className={ADMIN_FINANCE_PAYMENTS_LIST_TIME_CELL}>
        <AdminListMobileLabel label={tTable("colTime")} />
        <p className="font-serif text-xl leading-none tracking-tight text-sage-950">
          {formatPaymentTime(row.createdAt, locale)}
        </p>
      </div>

      <div className={ADMIN_FINANCE_PAYMENTS_LIST_SOURCE_CELL}>
        <AdminListMobileLabel label={tTable("colSource")} />
        <span className={`${ADMIN_FINANCE_VALUE_BADGE_CLASS} ${financeSourceTone(row.source)}`}>
          {t(`sources.${row.source}`)}
        </span>
      </div>

      <div className={ADMIN_FINANCE_PAYMENTS_LIST_STATUS_CELL}>
        <AdminListMobileLabel label={tTable("colStatus")} />
        <span
          className={`${ADMIN_FINANCE_VALUE_BADGE_CLASS} ${financePaymentStatusTone(row.status)}`}
        >
          {paymentStatusLabel(t, row.status)}
        </span>
      </div>

      <div className={ADMIN_FINANCE_PAYMENTS_LIST_METHOD_CELL}>
        <AdminListMobileLabel label={tTable("colPaymentMethod")} />
        <p className="truncate text-sm font-medium text-sage-800">
          {resolveMethodLabel(t, row.paymentMethod)}
        </p>
      </div>

      <div className={ADMIN_FINANCE_PAYMENTS_LIST_SPACER_CELL} aria-hidden="true" />

      <div
        className={`${ADMIN_FINANCE_PAYMENTS_LIST_ACTIONS_CELL} ${ADMIN_FINANCE_PAYMENTS_LIST_ROW_ACTIONS_HOVER_REVEAL}`}
      >
        <AdminListMobileLabel label={tTable("colActions")} />
        <AdminFinancePaymentActions paymentId={row.id} status={row.status} />
      </div>
    </article>
  );
}
