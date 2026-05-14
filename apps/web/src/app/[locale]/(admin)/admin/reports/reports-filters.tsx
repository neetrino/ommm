"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const DATE_RANGE_OPTIONS = [7, 30, 90] as const;
const SOURCE_OPTIONS = ["all", "membership", "dropin", "gift", "other"] as const;
const STATUS_OPTIONS = ["all", "SUCCEEDED", "FAILED", "PENDING", "REFUNDED"] as const;

type DateRangeOption = (typeof DATE_RANGE_OPTIONS)[number];
type SourceOption = (typeof SOURCE_OPTIONS)[number];
type StatusOption = (typeof STATUS_OPTIONS)[number];

function parseDateRangeDays(value: string | null): DateRangeOption {
  const parsed = Number(value);
  if (DATE_RANGE_OPTIONS.includes(parsed as DateRangeOption)) {
    return parsed as DateRangeOption;
  }
  return 30;
}

function parseSource(value: string | null): SourceOption {
  if (value && SOURCE_OPTIONS.includes(value as SourceOption)) {
    return value as SourceOption;
  }
  return "all";
}

function parseStatus(value: string | null): StatusOption {
  if (value && STATUS_OPTIONS.includes(value as StatusOption)) {
    return value as StatusOption;
  }
  return "all";
}

export function ReportsFilters() {
  const t = useTranslations("adminPages.reports.filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const values = useMemo(
    () => ({
      rangeDays: parseDateRangeDays(searchParams.get("rangeDays")),
      source: parseSource(searchParams.get("source")),
      status: parseStatus(searchParams.get("status")),
    }),
    [searchParams],
  );

  const update = (key: "rangeDays" | "source" | "status", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <section className="rounded-[20px] border border-white/60 bg-white/70 p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm text-sage-700">
          <span className="mb-1 block text-xs text-sage-500">{t("rangeLabel")}</span>
          <select
            className="w-full rounded-xl border border-sage-200 bg-white px-3 py-2 text-sm"
            value={String(values.rangeDays)}
            onChange={(event) => update("rangeDays", event.target.value)}
          >
            <option value="7">{t("range7")}</option>
            <option value="30">{t("range30")}</option>
            <option value="90">{t("range90")}</option>
          </select>
        </label>
        <label className="text-sm text-sage-700">
          <span className="mb-1 block text-xs text-sage-500">{t("sourceLabel")}</span>
          <select
            className="w-full rounded-xl border border-sage-200 bg-white px-3 py-2 text-sm"
            value={values.source}
            onChange={(event) => update("source", event.target.value)}
          >
            <option value="all">{t("sourceAll")}</option>
            <option value="membership">{t("sourceMembership")}</option>
            <option value="dropin">{t("sourceDropIn")}</option>
            <option value="gift">{t("sourceGift")}</option>
            <option value="other">{t("sourceOther")}</option>
          </select>
        </label>
        <label className="text-sm text-sage-700">
          <span className="mb-1 block text-xs text-sage-500">{t("statusLabel")}</span>
          <select
            className="w-full rounded-xl border border-sage-200 bg-white px-3 py-2 text-sm"
            value={values.status}
            onChange={(event) => update("status", event.target.value)}
          >
            <option value="all">{t("statusAll")}</option>
            <option value="SUCCEEDED">{t("statusSucceeded")}</option>
            <option value="FAILED">{t("statusFailed")}</option>
            <option value="PENDING">{t("statusPending")}</option>
            <option value="REFUNDED">{t("statusRefunded")}</option>
          </select>
        </label>
      </div>
    </section>
  );
}
