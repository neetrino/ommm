"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { couponPersonLabel } from "@/components/admin/admin-coupon-display";
import type { CouponAnalyticsRow } from "@/components/admin/admin-coupons-types";
import { parseAnalyticsFiltersFromSearch } from "@/components/admin/admin-analytics-url";
import {
  parseAnalyticsQuickFilters,
  resolveAnalyticsDateRange,
} from "@/components/admin/admin-analytics-helpers";
import { AmdMoneyText } from "@/components/ui/amd-money-text";
import { ApiError, apiFetch } from "@/lib/api";

export function AdminCouponAnalyticsPanel({ locale }: { locale: string }) {
  const t = useTranslations("adminPages.coupons");
  const searchParams = useSearchParams();
  const search = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const filters = parseAnalyticsFiltersFromSearch(search);
  const range = resolveAnalyticsDateRange({
    rangeDays: filters.rangeDays,
    from: filters.from || undefined,
    to: filters.to || undefined,
    quickFilters: parseAnalyticsQuickFilters(filters.quick),
  });
  const [rows, setRows] = useState<CouponAnalyticsRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ from: range.fromIso, to: range.toIso });
    if (filters.couponId) params.set("couponId", filters.couponId);
    if (filters.discountType) params.set("discountType", filters.discountType);
    if (filters.couponStatus) params.set("status", filters.couponStatus);
    if (filters.creatorId) params.set("creatorId", filters.creatorId);
    if (filters.userEmail.trim()) params.set("userEmail", filters.userEmail.trim());
    void apiFetch<{ items: CouponAnalyticsRow[] }>(`/coupons/analytics?${params.toString()}`)
      .then((payload) => {
        setRows(payload.items);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : t("loadFailed"));
      });
  }, [
    range.fromIso,
    range.toIso,
    filters.couponId,
    filters.discountType,
    filters.couponStatus,
    filters.creatorId,
    filters.userEmail,
    t,
  ]);

  return (
    <div className="flex flex-col gap-4">
      {error ? <p className="text-sm text-red-800" role="alert">{error}</p> : null}
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-sand-300 bg-white/70 px-6 py-10 text-center text-sm text-sage-600">
          {t("analyticsEmpty")}
        </p>
      ) : (
        <CouponUseTable rows={rows} locale={locale} />
      )}
    </div>
  );
}

function CouponUseTable({ rows, locale }: { rows: CouponAnalyticsRow[]; locale: string }) {
  const t = useTranslations("adminPages.coupons");
  return (
    <div className="overflow-x-auto rounded-2xl border border-sand-200/80 bg-white/90">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead className="bg-sand-50/80 text-[11px] uppercase tracking-wide text-sage-500">
          <tr>
            <th className="px-4 py-3">{t("code")}</th>
            <th className="px-4 py-3">{t("filterUser")}</th>
            <th className="px-4 py-3">{t("purchase")}</th>
            <th className="px-4 py-3">{t("useState")}</th>
            <th className="px-4 py-3">{t("usedAt")}</th>
            <th className="px-4 py-3">{t("createdBy")}</th>
            <th className="px-4 py-3">{t("original")}</th>
            <th className="px-4 py-3">{t("discount")}</th>
            <th className="px-4 py-3">{t("final")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-sand-100 text-sage-800">
              <td className="px-4 py-3 font-serif tracking-wide">{row.code}</td>
              <td className="px-4 py-3">{couponPersonLabel(row.user)}</td>
              <td className="px-4 py-3">{purchaseText(row, (kind) => t(`kind.${kind}`))}</td>
              <td className="px-4 py-3">{redemptionStateText(row.redemptionStatus, (key) => t(key))}</td>
              <td className="px-4 py-3">{new Date(row.usedAt).toLocaleString(locale)}</td>
              <td className="px-4 py-3">{couponPersonLabel(row.createdBy)}</td>
              <td className="px-4 py-3"><AmdMoneyText cents={row.originalAmountCents} locale={locale} /></td>
              <td className="px-4 py-3"><AmdMoneyText cents={row.discountAmountCents} locale={locale} /></td>
              <td className="px-4 py-3"><AmdMoneyText cents={row.finalAmountCents} locale={locale} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function purchaseText(
  row: CouponAnalyticsRow,
  kindLabel: (kind: "PACKAGE" | "DROPIN" | "GIFT" | "OTHER") => string,
): string {
  const purchase = row.purchase?.trim() ?? "";
  if (purchase.length > 0) {
    return purchase;
  }
  return kindLabel(purchaseKind(row.source));
}

function purchaseKind(source: string): "PACKAGE" | "DROPIN" | "GIFT" | "OTHER" {
  if (source === "PACKAGE" || source === "DROPIN" || source === "GIFT") {
    return source;
  }
  return "OTHER";
}

function redemptionStateText(
  status: CouponAnalyticsRow["redemptionStatus"],
  label: (key: "useStateReserved" | "useStateApplied") => string,
): string {
  return status === "RESERVED" ? label("useStateReserved") : label("useStateApplied");
}

