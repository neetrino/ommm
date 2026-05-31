"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type {
  AnalyticsBookingStatusFilter,
  AnalyticsQuickFilter,
  AnalyticsRangeDays,
  AnalyticsSortKey,
} from "@/components/admin/admin-analytics-types";
import { DropdownSelect, type DropdownOption } from "@/components/ui/dropdown-select";

type AdminAnalyticsFiltersProps = {
  filterOptions: {
    classTypes: Array<{ id: string; name: string }>;
    coaches: Array<{ id: string; name: string }>;
  };
};

export function AdminAnalyticsFilters({ filterOptions }: AdminAnalyticsFiltersProps) {
  const t = useTranslations("adminPages.analytics.filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const values = useMemo(
    () => ({
      rangeDays: (Number(searchParams.get("rangeDays")) || 30) as AnalyticsRangeDays,
      coachId: searchParams.get("coachId") ?? "",
      classTypeId: searchParams.get("classTypeId") ?? "",
      bookingStatus: (searchParams.get("bookingStatus") ?? "") as AnalyticsBookingStatusFilter,
      sort: (searchParams.get("sort") ?? "revenue-desc") as AnalyticsSortKey,
      quick: (searchParams.get("quick") ?? "none") as AnalyticsQuickFilter,
    }),
    [searchParams],
  );

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.length === 0) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const updateMany = (entries: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(entries)) {
      if (value.length === 0) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const reset = () => {
    const view = searchParams.get("view");
    const params = new URLSearchParams();
    if (view) {
      params.set("view", view);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const rangeOptions = useMemo<readonly DropdownOption<`${AnalyticsRangeDays}`>[]>(
    () => [
      { value: "7", label: t("range7") },
      { value: "30", label: t("range30") },
      { value: "90", label: t("range90") },
    ],
    [t],
  );

  const coachOptions = useMemo<readonly DropdownOption<string>[]>(
    () => [
      { value: "", label: t("coachAll") },
      ...filterOptions.coaches.map((coach) => ({
        value: coach.id,
        label: coach.name,
      })),
    ],
    [filterOptions.coaches, t],
  );

  const classTypeOptions = useMemo<readonly DropdownOption<string>[]>(
    () => [
      { value: "", label: t("classTypeAll") },
      ...filterOptions.classTypes.map((classType) => ({
        value: classType.id,
        label: classType.name,
      })),
    ],
    [filterOptions.classTypes, t],
  );

  const sortOptions = useMemo<readonly DropdownOption<AnalyticsSortKey>[]>(
    () => [
      { value: "revenue-desc", label: t("sortRevenueDesc") },
      { value: "revenue-asc", label: t("sortRevenueAsc") },
      { value: "bookings-desc", label: t("sortBookingsDesc") },
      { value: "bookings-asc", label: t("sortBookingsAsc") },
      { value: "attendance-desc", label: t("sortAttendanceDesc") },
      { value: "attendance-asc", label: t("sortAttendanceAsc") },
      { value: "name-asc", label: t("sortNameAsc") },
    ],
    [t],
  );

  const quickDateFilters: Array<{ key: AnalyticsQuickFilter; label: string }> = [
    { key: "today", label: t("quickToday") },
    { key: "week", label: t("quickWeek") },
    { key: "month", label: t("quickMonth") },
    { key: "last30", label: t("quickLast30") },
  ];

  const quickSortPresets: Array<{ key: AnalyticsQuickFilter; sort: AnalyticsSortKey }> = [
    { key: "topCoaches", sort: "bookings-desc" },
    { key: "popularClasses", sort: "bookings-desc" },
  ];

  const bookingStatusOptions = useMemo<
    readonly DropdownOption<AnalyticsBookingStatusFilter>[]
  >(
    () => [
      { value: "", label: t("bookingStatusAll") },
      { value: "BOOKED", label: t("bookingStatusBooked") },
      { value: "COMPLETED", label: t("bookingStatusCompleted") },
      { value: "CANCELLED", label: t("bookingStatusCancelled") },
      { value: "MISSED", label: t("bookingStatusMissed") },
    ],
    [t],
  );

  return (
    <section className="rounded-[20px] border border-white/60 bg-white/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-sage-900">{t("heading")}</p>
        <button
          type="button"
          onClick={reset}
          className="rounded-xl border border-sage-300 bg-white px-3 py-1.5 text-xs font-medium text-sage-700"
        >
          {t("reset")}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {quickDateFilters.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={values.quick === item.key}
            onClick={() => update("quick", values.quick === item.key ? "none" : item.key)}
            className={
              values.quick === item.key
                ? "rounded-full bg-sand-500 px-3 py-1.5 text-xs font-medium text-white"
                : "rounded-full border border-sage-200 bg-white px-3 py-1.5 text-xs font-medium text-sage-700"
            }
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {quickSortPresets.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={values.quick === item.key}
            onClick={() => {
              const active = values.quick === item.key;
              updateMany({
                quick: active ? "none" : item.key,
                sort: active ? values.sort : item.sort,
              });
            }}
            className={
              values.quick === item.key
                ? "rounded-full bg-sand-500 px-3 py-1.5 text-xs font-medium text-white"
                : "rounded-full border border-sage-200 bg-white px-3 py-1.5 text-xs font-medium text-sage-700"
            }
          >
            {item.key === "topCoaches" ? t("quickTopCoaches") : t("quickPopularClasses")}
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="text-sm text-sage-700">
          <span className="mb-1 block text-xs text-sage-500">{t("rangeLabel")}</span>
          <DropdownSelect
            label={t("rangeLabel")}
            ariaLabel={t("rangeLabel")}
            value={String(values.rangeDays) as `${AnalyticsRangeDays}`}
            options={rangeOptions}
            onChange={(value) => update("rangeDays", value)}
          />
        </label>
        <label className="text-sm text-sage-700">
          <span className="mb-1 block text-xs text-sage-500">{t("coachLabel")}</span>
          <DropdownSelect
            label={t("coachLabel")}
            ariaLabel={t("coachLabel")}
            value={values.coachId}
            options={coachOptions}
            onChange={(value) => update("coachId", value)}
          />
        </label>
        <label className="text-sm text-sage-700">
          <span className="mb-1 block text-xs text-sage-500">{t("classTypeLabel")}</span>
          <DropdownSelect
            label={t("classTypeLabel")}
            ariaLabel={t("classTypeLabel")}
            value={values.classTypeId}
            options={classTypeOptions}
            onChange={(value) => update("classTypeId", value)}
          />
        </label>
        <label className="text-sm text-sage-700">
          <span className="mb-1 block text-xs text-sage-500">{t("bookingStatusLabel")}</span>
          <DropdownSelect
            label={t("bookingStatusLabel")}
            ariaLabel={t("bookingStatusLabel")}
            value={values.bookingStatus}
            options={bookingStatusOptions}
            onChange={(value) => update("bookingStatus", value)}
          />
        </label>
        <label className="text-sm text-sage-700">
          <span className="mb-1 block text-xs text-sage-500">{t("sortLabel")}</span>
          <DropdownSelect
            label={t("sortLabel")}
            ariaLabel={t("sortLabel")}
            value={values.sort}
            options={sortOptions}
            onChange={(value) => update("sort", value)}
          />
        </label>
      </div>
    </section>
  );
}
