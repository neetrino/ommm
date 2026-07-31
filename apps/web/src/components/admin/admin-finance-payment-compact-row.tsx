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
import {
  AdminFinancePaymentStatusPicker,
  type AdminUpdatablePaymentStatus,
} from "@/components/admin/admin-finance-payment-status-picker";
import { PaymentStatusReasonText } from "@/components/shared/payment-status-reason-text";
import {
  ADMIN_FINANCE_PAYMENTS_LIST_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_DATE_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_METHOD_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_METHOD_VALUE_CLASS,
  ADMIN_FINANCE_PAYMENTS_LIST_PACKAGE_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_PACKAGE_TITLE_CLASS,
  ADMIN_FINANCE_PAYMENTS_LIST_ROW_CLASS,
  ADMIN_FINANCE_PAYMENTS_LIST_SOURCE_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_STATUS_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_TIME_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_USER_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_USER_META_CLASS,
  ADMIN_FINANCE_PAYMENTS_LIST_USER_TITLE_CLASS,
} from "@/components/admin/admin-finance-payments-list-layout";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
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
  return t(`paymentMethods.${paymentMethod}`);
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
      <div className={ADMIN_FINANCE_PAYMENTS_LIST_USER_CELL}>
        <AdminListMobileLabel label={tTable("colUser")} />
        <p className={ADMIN_FINANCE_PAYMENTS_LIST_USER_TITLE_CLASS}>{userLabel}</p>
        <p className={ADMIN_FINANCE_PAYMENTS_LIST_USER_META_CLASS}>
          {displayPhoneOrEmail(row.user.phone, row.user.email)}
        </p>
      </div>

      <div className={ADMIN_FINANCE_PAYMENTS_LIST_PACKAGE_CELL}>
        <AdminListMobileLabel label={tTable("colPlan")} />
        {row.source === "package" && row.relatedItemName ? (
          <>
            <p className={ADMIN_FINANCE_PAYMENTS_LIST_PACKAGE_TITLE_CLASS}>
              {row.relatedItemName}
            </p>
            {row.relatedItemGroupName ? (
              <p className={ADMIN_FINANCE_PAYMENTS_LIST_USER_META_CLASS}>
                {row.relatedItemGroupName}
              </p>
            ) : null}
          </>
        ) : (
          <p className={ADMIN_FINANCE_PAYMENTS_LIST_PACKAGE_TITLE_CLASS}>—</p>
        )}
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
        <div className="flex flex-col items-start">
          <AdminFinancePaymentStatusPicker
            status={row.status}
            paymentMethod={row.paymentMethod}
            busy={busy}
            onChangeStatus={onChangeStatus}
          />
          <PaymentStatusReasonText status={row.status} reason={row.statusReason} />
        </div>
      </div>

      <div className={ADMIN_FINANCE_PAYMENTS_LIST_METHOD_CELL}>
        <AdminListMobileLabel label={tTable("colPaymentMethod")} />
        <p className={ADMIN_FINANCE_PAYMENTS_LIST_METHOD_VALUE_CLASS}>
          {resolveMethodLabel(t, row.paymentMethod)}
        </p>
      </div>
    </article>
  );
}
