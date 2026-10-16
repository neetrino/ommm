"use client";

import { useLocale, useTranslations } from "next-intl";
import { CouponCopyButton } from "@/components/admin/admin-coupon-card-actions";
import {
  COUPON_STATUS_BADGE_CLASS,
  couponPersonLabel,
  couponStatusTone,
  couponValueLabel,
} from "@/components/admin/admin-coupon-display";
import type { AdminCouponRow } from "@/components/admin/admin-coupons-types";
import { OmmButton } from "@/components/ui/omm-button";

type AdminCouponListRowProps = {
  row: AdminCouponRow;
  selected: boolean;
  onEdit: () => void;
  onActivate: () => void;
  onDisable: () => void;
};

export function AdminCouponListRow({
  row,
  selected,
  onEdit,
  onActivate,
  onDisable,
}: AdminCouponListRowProps) {
  const locale = useLocale();
  const t = useTranslations("adminPages.coupons");

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
      className={`flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border bg-white/90 px-4 py-3 text-left transition-[border-color,box-shadow] hover:border-sand-300 ${
        selected ? "border-sage-700/40 ring-2 ring-sage-700/20" : "border-sand-200/80"
      }`}
    >
      <div className="flex min-w-0 items-center gap-1">
        <p className="truncate font-serif text-lg tracking-wide text-sage-900">{row.code}</p>
        <CouponCopyButton code={row.code} />
      </div>
      <p className="text-sm text-sage-800">{couponValueLabel(row.discountType, row.discountValue, locale)}</p>
      <span className={`${COUPON_STATUS_BADGE_CLASS} ${couponStatusTone(row.displayStatus)}`}>
        {t(`status.${row.displayStatus}`)}
      </span>
      <p className="text-sm text-sage-600">
        {t("used")} {row.usedCount}
      </p>
      <p className="min-w-0 truncate text-sm text-sage-600">{couponPersonLabel(row.createdBy)}</p>
      <div
        className="ml-auto"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {row.status === "ACTIVE" ? (
          <OmmButton size="sm" variant="ghost" onClick={onDisable}>{t("disable")}</OmmButton>
        ) : (
          <OmmButton size="sm" variant="primary" onClick={onActivate}>{t("activate")}</OmmButton>
        )}
      </div>
    </article>
  );
}
