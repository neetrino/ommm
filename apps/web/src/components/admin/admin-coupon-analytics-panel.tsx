"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { AdminCouponRow, CouponAnalyticsRow } from "@/components/admin/admin-coupons-types";
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

  const creators = uniqueCreators(coupons);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Select label={t("filterCoupon")} value={couponId} onChange={setCouponId} options={coupons.map((row) => ({ id: row.id, label: row.code }))} />
        <Select label={t("type")} value={discountType} onChange={setDiscountType} options={[{ id: "PERCENTAGE", label: t("percentage") }, { id: "FIXED_AMOUNT", label: t("fixed") }]} />
        <Select label={t("filterStatus")} value={status} onChange={setStatus} options={["DRAFT", "ACTIVE", "EXPIRED", "DISABLED", "USAGE_LIMIT_REACHED"].map((id) => ({ id, label: t(`status.${id}`) }))} />
        <Select label={t("filterCreator")} value={creatorId} onChange={setCreatorId} options={creators} />
        <label className="flex flex-col gap-1 text-sm">
          {t("filterUser")}
          <input value={userEmail} onChange={(event) => setUserEmail(event.target.value)} className="rounded-xl border border-black/10 px-3 py-2" />
        </label>
      </div>
      {error ? <p className="text-sm text-red-800">{error}</p> : null}
      {rows.length === 0 ? <p className="text-sm text-sage-600">{t("analyticsEmpty")}</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="text-sage-500">
              <th className="py-2 pr-3">{t("code")}</th>
              <th className="py-2 pr-3">{t("createdBy")}</th>
              <th className="py-2 pr-3">{t("filterUser")}</th>
              <th className="py-2 pr-3">{t("usedAt")}</th>
              <th className="py-2 pr-3">{t("purchase")}</th>
              <th className="py-2 pr-3">{t("original")}</th>
              <th className="py-2 pr-3">{t("discount")}</th>
              <th className="py-2">{t("final")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-black/5">
                <td className="py-2 pr-3">{row.code}</td>
                <td className="py-2 pr-3">{personLabel(row.createdBy)}</td>
                <td className="py-2 pr-3">{personLabel(row.user)}</td>
                <td className="py-2 pr-3">{new Date(row.usedAt).toLocaleString(locale)}</td>
                <td className="py-2 pr-3">{row.purchase ?? row.source}</td>
                <td className="py-2 pr-3"><AmdMoneyText cents={row.originalAmountCents} locale={locale} /></td>
                <td className="py-2 pr-3"><AmdMoneyText cents={row.discountAmountCents} locale={locale} /></td>
                <td className="py-2"><AmdMoneyText cents={row.finalAmountCents} locale={locale} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { id: string; label: string }[] }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-black/10 px-3 py-2">
        <option value="">{label}</option>
        {options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
      </select>
    </label>
  );
}

function uniqueCreators(rows: AdminCouponRow[]): { id: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const row of rows) {
    seen.set(row.createdBy.id, personLabel(row.createdBy));
  }
  return [...seen.entries()].map(([id, label]) => ({ id, label }));
}

function personLabel(person: { name: string | null; lastName: string | null; email: string }): string {
  const name = [person.name, person.lastName].filter(Boolean).join(" ");
  return name.length > 0 ? name : person.email;
}
