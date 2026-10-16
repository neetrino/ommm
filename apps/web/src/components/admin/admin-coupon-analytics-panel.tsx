"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { couponPersonLabel } from "@/components/admin/admin-coupon-display";
import type { AdminCouponRow, CouponAnalyticsRow, CouponDisplayStatus } from "@/components/admin/admin-coupons-types";
import { parseAnalyticsFiltersFromSearch } from "@/components/admin/admin-analytics-url";
import {
  parseAnalyticsQuickFilters,
  resolveAnalyticsDateRange,
} from "@/components/admin/admin-analytics-helpers";
import { AmdMoneyText } from "@/components/ui/amd-money-text";
import { ApiError, apiFetch } from "@/lib/api";

const STATUSES: CouponDisplayStatus[] = [
  "DRAFT",
  "ACTIVE",
  "EXPIRED",
  "DISABLED",
  "USAGE_LIMIT_REACHED",
];

export function AdminCouponAnalyticsPanel({ locale }: { locale: string }) {
  const t = useTranslations("adminPages.coupons");
  const searchParams = useSearchParams();
  const search = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const range = resolveAnalyticsDateRange({
    rangeDays: parseAnalyticsFiltersFromSearch(search).rangeDays,
    from: typeof search.from === "string" ? search.from : undefined,
    to: typeof search.to === "string" ? search.to : undefined,
    quickFilters: parseAnalyticsQuickFilters(search.quick),
  });
  const [coupons, setCoupons] = useState<AdminCouponRow[]>([]);
  const [rows, setRows] = useState<CouponAnalyticsRow[]>([]);
  const [couponId, setCouponId] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [status, setStatus] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiFetch<AdminCouponRow[]>("/coupons").then(setCoupons).catch(() => setCoupons([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ from: range.fromIso, to: range.toIso });
    if (couponId) params.set("couponId", couponId);
    if (discountType) params.set("discountType", discountType);
    if (status) params.set("status", status);
    if (creatorId) params.set("creatorId", creatorId);
    if (userEmail.trim()) params.set("userEmail", userEmail.trim());
    void apiFetch<{ items: CouponAnalyticsRow[] }>(`/coupons/analytics?${params.toString()}`)
      .then((payload) => {
        setRows(payload.items);
        setError(null);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : t("loadFailed"));
      });
  }, [range.fromIso, range.toIso, couponId, discountType, status, creatorId, userEmail, t]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 rounded-3xl border border-sand-200/80 bg-white/80 p-4 sm:grid-cols-2 xl:grid-cols-3">
        <FilterSelect label={t("filterCoupon")} value={couponId} onChange={setCouponId} options={coupons.map((row) => ({ id: row.id, label: row.code }))} />
        <FilterSelect label={t("type")} value={discountType} onChange={setDiscountType} options={[{ id: "PERCENTAGE", label: t("percentage") }, { id: "FIXED_AMOUNT", label: t("fixed") }]} />
        <FilterSelect label={t("filterStatus")} value={status} onChange={setStatus} options={STATUSES.map((id) => ({ id, label: t(`status.${id}`) }))} />
        <FilterSelect label={t("filterCreator")} value={creatorId} onChange={setCreatorId} options={uniqueCreators(coupons)} />
        <label className="flex flex-col gap-1.5 sm:col-span-2 xl:col-span-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filterUser")}</span>
          <input value={userEmail} onChange={(event) => setUserEmail(event.target.value)} className="ommm-input" />
        </label>
      </div>
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
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-sand-50/80 text-[11px] uppercase tracking-wide text-sage-500">
          <tr>
            <th className="px-4 py-3">{t("code")}</th>
            <th className="px-4 py-3">{t("createdBy")}</th>
            <th className="px-4 py-3">{t("filterUser")}</th>
            <th className="px-4 py-3">{t("usedAt")}</th>
            <th className="px-4 py-3">{t("purchase")}</th>
            <th className="px-4 py-3">{t("original")}</th>
            <th className="px-4 py-3">{t("discount")}</th>
            <th className="px-4 py-3">{t("final")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-sand-100 text-sage-800">
              <td className="px-4 py-3 font-serif tracking-wide">{row.code}</td>
              <td className="px-4 py-3">{couponPersonLabel(row.createdBy)}</td>
              <td className="px-4 py-3">{couponPersonLabel(row.user)}</td>
              <td className="px-4 py-3">{new Date(row.usedAt).toLocaleString(locale)}</td>
              <td className="px-4 py-3">{row.purchase ?? row.source}</td>
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="ommm-label text-xs uppercase tracking-wide">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="ommm-input">
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function uniqueCreators(rows: AdminCouponRow[]): { id: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const row of rows) {
    seen.set(row.createdBy.id, couponPersonLabel(row.createdBy));
  }
  return [...seen.entries()].map(([id, label]) => ({ id, label }));
}
