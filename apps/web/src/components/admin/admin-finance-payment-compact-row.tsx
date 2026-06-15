"use client";

import { useTranslations } from "next-intl";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import {
  formatPaymentTime,
  toPaymentIso,
} from "@/components/account/user-payment-display";
import {
  ADMIN_FINANCE_MONEY_CLASS,
  ADMIN_FINANCE_VALUE_BADGE_CLASS,
  financeSourceTone,
} from "@/components/admin/admin-finance-list-display";
import { AdminFinancePaymentRowActions } from "@/components/admin/admin-finance-payment-row-actions";
import {
  AdminFinancePaymentStatusPicker,
  type AdminUpdatablePaymentStatus,
} from "@/components/admin/admin-finance-payment-status-picker";
import {
  ADMIN_FINANCE_PAYMENTS_LIST_ACTIONS_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_DATE_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_METHOD_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_FINANCE_PAYMENTS_LIST_ROW_CLASS,
  ADMIN_FINANCE_PAYMENTS_LIST_SOURCE_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_STATUS_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_TIME_CELL,
} from "@/components/admin/admin-finance-payments-list-layout";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { ADMIN_LIST_TITLE_TEXT_CLASS } from "@/components/admin/admin-list-table-layout";
import type { FinancePaymentItem } from "@/components/admin/admin-finance-types";
import { displayPhoneOrEmail } from "@/lib/phone";
import { AmdMoneyText } from "@/components/ui/amd-money-text";
import { isManualPaymentMethod } from "@/lib/manual-payment-method";

type AdminFinancePaymentCompactRowProps = {
  locale: string;
  row: FinancePaymentItem;
  busy: boolean;
  onOpenDetails: () => void;
  onChangeStatus: (nextStatus: AdminUpdatablePaymentStatus) => void;
};

function displayName(row: FinancePaymentItem): string {
  const merged = [row.user.name, row.user.lastName].filter(Boolean).join(" ").trim();
  return merged.length > 0 ? merged : row.user.email;
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
  busy,
  onOpenDetails,
  onChangeStatus,
}: AdminFinancePaymentCompactRowProps) {
  const t = useTranslations("adminPages.finance");
  const tTable = useTranslations("adminPages.finance.table");
  const paidAtIso = toPaymentIso(row.createdAt);
  const userLabel = displayName(row);

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={t("paymentDetails.viewFor", { name: userLabel })}
      onClick={onOpenDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails();
        }
      }}
      className={ADMIN_FINANCE_PAYMENTS_LIST_ROW_CLASS}
    >
      <div className={ADMIN_FINANCE_PAYMENTS_LIST_CELL}>
        <AdminListMobileLabel label={tTable("colUser")} />
        <p className={ADMIN_LIST_TITLE_TEXT_CLASS}>{userLabel}</p>
        <p className="mt-0.5 truncate text-xs text-sage-500">{displayPhoneOrEmail(row.user.phone, row.user.email)}</p>
      </div>

      <div className={ADMIN_FINANCE_PAYMENTS_LIST_CELL}>
        <AdminListMobileLabel label={tTable("colAmount")} />
        <AmdMoneyText
          cents={row.amountCents}
          locale={locale}
          className={ADMIN_FINANCE_MONEY_CLASS}
        />
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

      <div
        className={ADMIN_FINANCE_PAYMENTS_LIST_STATUS_CELL}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <AdminListMobileLabel label={tTable("colStatus")} />
        <AdminFinancePaymentStatusPicker
          status={row.status}
          paymentMethod={row.paymentMethod}
          busy={busy}
          onChangeStatus={onChangeStatus}
        />
      </div>

      <div className={ADMIN_FINANCE_PAYMENTS_LIST_METHOD_CELL}>
        <AdminListMobileLabel label={tTable("colPaymentMethod")} />
        <p className="truncate text-sm font-medium text-sage-800">
          {resolveMethodLabel(t, row.paymentMethod)}
        </p>
      </div>

      <div
        className={`${ADMIN_FINANCE_PAYMENTS_LIST_ACTIONS_CELL} ${ADMIN_FINANCE_PAYMENTS_LIST_ROW_ACTIONS_HOVER_REVEAL}`}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <AdminListMobileLabel label={tTable("colActions")} />
        <AdminFinancePaymentRowActions busy={busy} onEdit={onOpenDetails} />
      </div>
    </article>
  );
}
