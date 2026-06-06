"use client";

import { useTranslations } from "next-intl";
import { AdminFinanceUserActions } from "@/components/admin/admin-finance-user-actions";
import {
  ADMIN_FINANCE_USER_LIST_ACTIONS_CELL,
  ADMIN_FINANCE_USER_LIST_CELL,
  ADMIN_FINANCE_USER_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_FINANCE_USER_LIST_ROW_CLASS,
  ADMIN_FINANCE_USER_LIST_SPACER_CELL,
} from "@/components/admin/admin-finance-notifications-list-layout";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import { formatDateForUi } from "@/lib/date-display";
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

function paymentBadgeClass(status: string): string {
  if (status === "paid") return "bg-mint-100 text-mint-900";
  if (status === "overdue") return "bg-rose-100 text-rose-900";
  if (status === "partial") return "bg-sky-100 text-sky-900";
  if (status === "unpaid") return "bg-amber-100 text-amber-900";
  return "bg-sage-100 text-sage-700";
}

export function AdminFinanceUserCompactRow({
  row,
  locale,
  onEdit,
  onChanged,
}: AdminFinanceUserCompactRowProps) {
  const t = useTranslations("adminPages.finance.userTab");

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={displayName(row)}
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
        <p className="text-sm font-medium text-sage-900">{displayName(row)}</p>
        <p className="mt-0.5 text-xs text-sage-500">{row.phone ?? "—"}</p>
      </div>

      <div className={ADMIN_FINANCE_USER_LIST_CELL}>
        <AdminListMobileLabel label={t("colPlan")} />
        <p className="text-sm text-sage-800">{row.activePlanName ?? t("noActivePackage")}</p>
      </div>

      <div className={ADMIN_FINANCE_USER_LIST_CELL}>
        <AdminListMobileLabel label={t("colCost")} />
        <p className="text-sm text-sage-800">
          {row.activePlanCostCents !== null
            ? formatAmdFromCents(row.activePlanCostCents, locale)
            : "—"}
        </p>
      </div>

      <div className={ADMIN_FINANCE_USER_LIST_CELL}>
        <AdminListMobileLabel label={t("colExpiration")} />
        <p className="text-sm text-sage-800">
          {row.activePlanExpiresAt ? formatDateForUi(row.activePlanExpiresAt) : "—"}
        </p>
      </div>

      <div className={ADMIN_FINANCE_USER_LIST_CELL}>
        <AdminListMobileLabel label={t("colPaymentStatus")} />
        <span
          className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${paymentBadgeClass(row.paymentBehavior)}`}
        >
          {row.paymentBehavior}
        </span>
      </div>

      <div className={ADMIN_FINANCE_USER_LIST_CELL}>
        <AdminListMobileLabel label={t("colGiftCard")} />
        <p className="text-sm text-sage-800">
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
