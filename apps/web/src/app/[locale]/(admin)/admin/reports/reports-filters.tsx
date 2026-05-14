"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";

const DATE_RANGE_OPTIONS = [7, 30, 90] as const;
const SOURCE_OPTIONS = ["all", "membership", "dropin", "gift", "other"] as const;
const STATUS_OPTIONS = ["all", "SUCCEEDED", "FAILED", "PENDING", "REFUNDED"] as const;

type DateRangeOption = (typeof DATE_RANGE_OPTIONS)[number];
type SourceOption = (typeof SOURCE_OPTIONS)[number];
type StatusOption = (typeof STATUS_OPTIONS)[number];

type FilterOption<T extends string> = DropdownOption<T>;

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

  const rangeOptions = useMemo<readonly FilterOption<`${DateRangeOption}`>[]>(
    () => [
      { value: "7", label: t("range7") },
      { value: "30", label: t("range30") },
      { value: "90", label: t("range90") },
    ],
    [t],
  );
  const sourceOptions = useMemo<readonly FilterOption<SourceOption>[]>(
    () => [
      { value: "all", label: t("sourceAll") },
      { value: "membership", label: t("sourceMembership") },
      { value: "dropin", label: t("sourceDropIn") },
      { value: "gift", label: t("sourceGift") },
      { value: "other", label: t("sourceOther") },
    ],
    [t],
  );
  const statusOptions = useMemo<readonly FilterOption<StatusOption>[]>(
    () => [
      { value: "all", label: t("statusAll") },
      { value: "SUCCEEDED", label: t("statusSucceeded") },
      { value: "FAILED", label: t("statusFailed") },
      { value: "PENDING", label: t("statusPending") },
      { value: "REFUNDED", label: t("statusRefunded") },
    ],
    [t],
  );

  return (
    <section className="rounded-[20px] border border-white/60 bg-white/70 p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm text-sage-700">
          <span className="mb-1 block text-xs text-sage-500">{t("rangeLabel")}</span>
          <DropdownSelect
            label={t("rangeLabel")}
            ariaLabel={t("rangeLabel")}
            value={String(values.rangeDays) as `${DateRangeOption}`}
            options={rangeOptions}
            onChange={(value) => update("rangeDays", value)}
          />
        </label>
        <label className="text-sm text-sage-700">
          <span className="mb-1 block text-xs text-sage-500">{t("sourceLabel")}</span>
          <DropdownSelect
            label={t("sourceLabel")}
            ariaLabel={t("sourceLabel")}
            value={values.source}
            options={sourceOptions}
            onChange={(value) => update("source", value)}
          />
        </label>
        <label className="text-sm text-sage-700">
          <span className="mb-1 block text-xs text-sage-500">{t("statusLabel")}</span>
          <DropdownSelect
            label={t("statusLabel")}
            ariaLabel={t("statusLabel")}
            value={values.status}
            options={statusOptions}
            onChange={(value) => update("status", value)}
          />
        </label>
      </div>
    </section>
  );
}
