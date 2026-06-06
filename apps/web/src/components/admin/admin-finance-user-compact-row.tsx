"use client";

import { useTranslations } from "next-intl";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import { AdminFinanceUserActions } from "@/components/admin/admin-finance-user-actions";
import {
  ADMIN_FINANCE_MONEY_CLASS,
  ADMIN_FINANCE_PRIMARY_TITLE_CLASS,
  ADMIN_FINANCE_VALUE_BADGE_CLASS,
  financeMemberPaymentTone,
} from "@/components/admin/admin-finance-list-display";
import {
  ADMIN_FINANCE_USER_LIST_ACTIONS_CELL,
  ADMIN_FINANCE_USER_LIST_CELL,
  ADMIN_FINANCE_USER_LIST_DATE_CELL,
  ADMIN_FINANCE_USER_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_FINANCE_USER_LIST_ROW_CLASS,
  ADMIN_FINANCE_USER_LIST_SPACER_CELL,
} from "@/components/admin/admin-finance-notifications-list-layout";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import { formatAmdFromCents } from "@/lib/price-amd";

type AdminFinanceUserCompactRowProps = {
  row: ClientRow;
  locale: string;
  onEdit: () => void;
  onChanged: () => void;
};

function displayName(row: ClientRow): string {
  const merged = [row.name, row.lastName].filter(Boolean).join(" ").trim();
  return merged.length > 0 ? merged : row.email;
}

function memberPaymentStatusLabel(
  t: ReturnType<typeof useTranslations<"adminPages.finance.userTab">>,
  behavior: string,
): string {
  if (behavior === "paid") return t("statusPaid");
  if (behavior === "unpaid") return t("statusUnpaid");
  if (behavior === "overdue") return t("statusOverdue");
  if (behavior === "partial") return t("statusPartial");
  return behavior;
}

export function AdminFinanceUserCompactRow({
  row,
  locale,
  onEdit,
  onChanged,
}: AdminFinanceUserCompactRowProps) {
  const t = useTranslations("adminPages.finance.userTab");
  const userLabel = displayName(row);
  const expiresAtIso =
    row.activePlanExpiresAt !== null ? `${row.activePlanExpiresAt}T12:00:00.000Z` : null;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={userLabel}
      onClick={onEdit}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onEdit();
        }
      }}
      className={ADMIN_FINANCE_USER_LIST_ROW_CLASS}
    >
      <div className={ADMIN_FINANCE_USER_LIST_CELL}>
        <AdminListMobileLabel label={t("colUser")} />
        <p className="truncate text-sm font-medium text-sage-900">{userLabel}</p>
        <p className="mt-0.5 truncate text-xs text-sage-500">{row.phone ?? row.email}</p>
      </div>

      <div className={ADMIN_FINANCE_USER_LIST_CELL}>
        <AdminListMobileLabel label={t("colPlan")} />
        <p className={ADMIN_FINANCE_PRIMARY_TITLE_CLASS}>
          {row.activePlanName ?? t("noActivePackage")}
        </p>
      </div>

      <div className={ADMIN_FINANCE_USER_LIST_CELL}>
        <AdminListMobileLabel label={t("colCost")} />
        <p className={ADMIN_FINANCE_MONEY_CLASS}>
          {row.activePlanCostCents !== null
            ? formatAmdFromCents(row.activePlanCostCents, locale)
            : "—"}
        </p>
      </div>

      <div className={ADMIN_FINANCE_USER_LIST_DATE_CELL}>
        <AdminListMobileLabel label={t("colExpiration")} />
        {expiresAtIso ? (
          <SessionDateTimeHighlight
            locale={locale}
            startsAt={expiresAtIso}
            endsAt={expiresAtIso}
            variant="listDateYear"
          />
        ) : (
          <p className="text-sm text-sage-800">—</p>
        )}
      </div>

      <div className={ADMIN_FINANCE_USER_LIST_CELL}>
        <AdminListMobileLabel label={t("colPaymentStatus")} />
        <span
          className={`${ADMIN_FINANCE_VALUE_BADGE_CLASS} ${financeMemberPaymentTone(row.paymentBehavior)}`}
        >
          {memberPaymentStatusLabel(t, row.paymentBehavior)}
        </span>
      </div>

      <div className={ADMIN_FINANCE_USER_LIST_CELL}>
        <AdminListMobileLabel label={t("colGiftCard")} />
        <p className="text-sm font-medium text-sage-800">
          {row.hasGiftCardActivity ? t("giftCardYes") : t("giftCardNo")}
        </p>
      </div>

      <div className={ADMIN_FINANCE_USER_LIST_SPACER_CELL} aria-hidden="true" />

      <div
        className={`${ADMIN_FINANCE_USER_LIST_ACTIONS_CELL} ${ADMIN_FINANCE_USER_LIST_ROW_ACTIONS_HOVER_REVEAL}`}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <AdminListMobileLabel label={t("colActions")} />
        <AdminFinanceUserActions row={row} onEdit={onEdit} onChanged={onChanged} />
      </div>
    </article>
  );
}
