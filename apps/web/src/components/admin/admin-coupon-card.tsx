"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  COUPON_STATUS_BADGE_CLASS,
  couponPersonLabel,
  couponStatusTone,
  couponValueLabel,
} from "@/components/admin/admin-coupon-display";
import type { AdminCouponRow } from "@/components/admin/admin-coupons-types";
import { OmmButton } from "@/components/ui/omm-button";

type AdminCouponCardProps = {
  row: AdminCouponRow;
  selected: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onActivate: () => void;
  onDisable: () => void;
  onDelete: () => void;
};

export function AdminCouponCard({
  row,
  selected,
  canDelete,
  onEdit,
  onActivate,
  onDisable,
  onDelete,
}: AdminCouponCardProps) {
  const locale = useLocale();
  const t = useTranslations("adminPages.coupons");
  const windowLabel = couponWindowLabel(row.validFrom, row.validUntil, locale);

  return (
    <article
      className={`flex h-full flex-col rounded-2xl border bg-white/90 p-5 shadow-[0_12px_28px_-22px_rgba(45,40,35,0.2)] ${
        selected ? "border-sage-700/40 ring-2 ring-sage-700/20" : "border-sand-200/80"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-serif text-2xl tracking-wide text-sage-900">{row.code}</p>
        <span className={`${COUPON_STATUS_BADGE_CLASS} ${couponStatusTone(row.displayStatus)}`}>
          {t(`status.${row.displayStatus}`)}
        </span>
      </div>
      <p className="mt-3 font-serif text-xl text-sage-800">
        {couponValueLabel(row.discountType, row.discountValue, locale)}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wide text-sage-500">
        {row.discountType === "PERCENTAGE" ? t("percentage") : t("fixed")}
      </p>
      <dl className="mt-4 grid gap-2 text-sm text-sage-700">
        <Meta label={t("used")} value={usageLabel(row, t("remaining"))} />
        <Meta label={t("createdBy")} value={couponPersonLabel(row.createdBy)} />
        {windowLabel ? <Meta label={t("validFrom")} value={windowLabel} /> : null}
      </dl>
      <div className="mt-5 flex flex-wrap gap-2">
        <OmmButton size="sm" variant="secondary" onClick={onEdit}>
          {t("edit")}
        </OmmButton>
        {row.status === "ACTIVE" ? (
          <OmmButton size="sm" variant="ghost" onClick={onDisable}>
            {t("disable")}
          </OmmButton>
        ) : (
          <OmmButton size="sm" variant="primary" onClick={onActivate}>
            {t("activate")}
          </OmmButton>
        )}
        {canDelete && row.status === "DRAFT" && row.usedCount === 0 ? (
          <OmmButton size="sm" variant="danger" onClick={onDelete}>
            {t("delete")}
          </OmmButton>
        ) : null}
      </div>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-sage-500">{label}</dt>
      <dd className="text-right text-sage-800">{value}</dd>
    </div>
  );
}

function usageLabel(row: AdminCouponRow, remainingLabel: string): string {
  if (row.remainingUses === null) {
    return String(row.usedCount);
  }
  return `${row.usedCount} · ${remainingLabel} ${row.remainingUses}`;
}

function couponWindowLabel(from: string | null, until: string | null, locale: string): string | null {
  if (from === null && until === null) {
    return null;
  }
  const start = from ? formatCouponDate(from, locale) : "…";
  const end = until ? formatCouponDate(until, locale) : "…";
  return `${start} – ${end}`;
}

function formatCouponDate(value: string, locale: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(date);
}
