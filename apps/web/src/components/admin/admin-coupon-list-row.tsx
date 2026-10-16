"use client";

import { useLocale, useTranslations } from "next-intl";
import { CouponCopyButton } from "@/components/admin/admin-coupon-card-actions";
import {
  COUPON_STATUS_BADGE_CLASS,
  couponPersonLabel,
  couponStatusTone,
  couponValueLabel,
} from "@/components/admin/admin-coupon-display";
import {
  ADMIN_COUPONS_LIST_HEADER_CLASS,
  ADMIN_COUPONS_LIST_HEADER_LABEL_CLASS,
  ADMIN_COUPONS_LIST_ROW_CLASS,
  ADMIN_COUPONS_LIST_TABLE_CLASS,
} from "@/components/admin/admin-coupon-list-layout";
import type { AdminCouponRow } from "@/components/admin/admin-coupons-types";
import { USER_LIST_ACTIONS_CELL, USER_LIST_CELL_CLASS } from "@/components/admin/admin-list-table-layout";
import { OmmButton } from "@/components/ui/omm-button";

type AdminCouponsListProps = {
  rows: readonly AdminCouponRow[];
  selectedId: string | null;
  onEdit: (row: AdminCouponRow) => void;
  onActivate: (row: AdminCouponRow) => void;
  onDisable: (row: AdminCouponRow) => void;
};

export function AdminCouponsList({
  rows,
  selectedId,
  onEdit,
  onActivate,
  onDisable,
}: AdminCouponsListProps) {
  const t = useTranslations("adminPages.coupons");
  return (
    <div className={ADMIN_COUPONS_LIST_TABLE_CLASS}>
      <div className={ADMIN_COUPONS_LIST_HEADER_CLASS}>
        <span className={ADMIN_COUPONS_LIST_HEADER_LABEL_CLASS}>{t("code")}</span>
        <span className={ADMIN_COUPONS_LIST_HEADER_LABEL_CLASS}>{t("discount")}</span>
        <span className={ADMIN_COUPONS_LIST_HEADER_LABEL_CLASS}>{t("filterStatus")}</span>
        <span className={ADMIN_COUPONS_LIST_HEADER_LABEL_CLASS}>{t("used")}</span>
        <span className={ADMIN_COUPONS_LIST_HEADER_LABEL_CLASS}>{t("createdBy")}</span>
        <span className={`${ADMIN_COUPONS_LIST_HEADER_LABEL_CLASS} text-right`}>{t("colActions")}</span>
      </div>
      {rows.map((row) => (
        <AdminCouponListRow
          key={row.id}
          row={row}
          selected={selectedId === row.id}
          onEdit={() => onEdit(row)}
          onActivate={() => onActivate(row)}
          onDisable={() => onDisable(row)}
        />
      ))}
    </div>
  );
}

function AdminCouponListRow({
  row,
  selected,
  onEdit,
  onActivate,
  onDisable,
}: {
  row: AdminCouponRow;
  selected: boolean;
  onEdit: () => void;
  onActivate: () => void;
  onDisable: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("adminPages.coupons");
  const selectedClass = selected ? "ring-2 ring-sage-700/20" : "";

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={row.code}
      onClick={onEdit}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onEdit();
        }
      }}
      className={`${ADMIN_COUPONS_LIST_ROW_CLASS} cursor-pointer ${selectedClass}`}
    >
      <div className={`${USER_LIST_CELL_CLASS} flex items-center gap-1`}>
        <p className="truncate font-serif text-lg tracking-wide text-sage-900">{row.code}</p>
        <CouponCopyButton code={row.code} />
      </div>
      <p className={`${USER_LIST_CELL_CLASS} text-sm text-sage-800`}>
        {couponValueLabel(row.discountType, row.discountValue, locale)}
      </p>
      <div className={USER_LIST_CELL_CLASS}>
        <span className={`${COUPON_STATUS_BADGE_CLASS} ${couponStatusTone(row.displayStatus)}`}>
          {t(`status.${row.displayStatus}`)}
        </span>
      </div>
      <p className={`${USER_LIST_CELL_CLASS} text-sm text-sage-800`}>{row.usedCount}</p>
      <p className={`${USER_LIST_CELL_CLASS} truncate text-sm text-sage-700`}>
        {couponPersonLabel(row.createdBy)}
      </p>
      <CouponListAction row={row} onActivate={onActivate} onDisable={onDisable} labelActivate={t("activate")} labelDisable={t("disable")} />
    </article>
  );
}

function CouponListAction({
  row,
  onActivate,
  onDisable,
  labelActivate,
  labelDisable,
}: {
  row: AdminCouponRow;
  onActivate: () => void;
  onDisable: () => void;
  labelActivate: string;
  labelDisable: string;
}) {
  return (
    <div
      className={USER_LIST_ACTIONS_CELL}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {row.status === "ACTIVE" ? (
        <OmmButton size="sm" variant="ghost" onClick={onDisable}>{labelDisable}</OmmButton>
      ) : (
        <OmmButton size="sm" variant="primary" onClick={onActivate}>{labelActivate}</OmmButton>
      )}
    </div>
  );
}
