"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_NOTIFICATIONS_LIST_CELL,
  ADMIN_NOTIFICATIONS_LIST_EMPHASIZED_HEADER,
  ADMIN_NOTIFICATIONS_LIST_HEADER_CLASS,
  ADMIN_NOTIFICATIONS_LIST_ROW_CLASS,
  ADMIN_NOTIFICATIONS_LIST_TABLE_CLASS,
} from "@/components/admin/admin-finance-notifications-list-layout";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminFilterResetBar } from "@/components/ui/admin-filter-reset-bar";
import { OmmSelectDropdown, ommOptionsFromTuples } from "@/components/ui/omm-select-dropdown";
import { formatDateTimeForUi } from "@/lib/date-display";
import type {
  AdminNotificationsListPayload,
  BroadcastAudience,
  DeliveryRow,
} from "./admin-notifications-types";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  ADMIN_NOTIFICATIONS_DELIVERIES_PAGE_KEYS,
  parseAdminNotificationsDeliveriesPageParams,
} from "@/components/admin/admin-notifications-query";
import {
  ADMIN_NOTIFICATIONS_DELIVERIES_FILTER_KEYS,
  buildDeliveriesFiltersQuery,
  defaultDeliveriesListFilters,
  type DeliveriesListFilters,
} from "@/components/admin/admin-notifications-url";
import { resetListPageQuery, syncListPageQuery } from "@/lib/list-pagination";

const SEARCH_DEBOUNCE_MS = 300;

type Props = {
  locale: string;
  payload: AdminNotificationsListPayload<DeliveryRow>;
  loadFailed: boolean;
  initialFilters: DeliveriesListFilters;
};

type DeliveryQuickFilter = DeliveriesListFilters["quick"];

const audienceOptions: Array<[BroadcastAudience | "", string]> = [
  ["", "audienceAll"],
  ["users", "audienceUsers"],
  ["coaches", "audienceCoaches"],
  ["staff", "audienceStaff"],
  ["all", "audienceAllRoles"],
];

const sortOptions = [
  ["newest", "sortNewest"],
  ["oldest", "sortOldest"],
] as const;

export function AdminNotificationsDeliveriesSection({
  locale,
  payload,
  loadFailed,
  initialFilters,
}: Props) {
  const t = useTranslations("adminPages.notifications");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const items = payload.items;
  const listPage = parseAdminNotificationsDeliveriesPageParams(
    Object.fromEntries(searchParams.entries()),
  );
  const hasMounted = useRef(false);
  const filtersRef = useRef(initialFilters);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const syncFiltersToUrl = useCallback(
    (values: DeliveriesListFilters, resetPage = false) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const key of ADMIN_NOTIFICATIONS_DELIVERIES_FILTER_KEYS) {
        params.delete(key);
      }
      if (resetPage) {
        resetListPageQuery(params, ADMIN_NOTIFICATIONS_DELIVERIES_PAGE_KEYS);
      }
      const filterQuery = buildDeliveriesFiltersQuery(values);
      if (filterQuery.length > 0) {
        for (const [key, value] of new URLSearchParams(filterQuery)) {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  function patchFilters(patch: Partial<DeliveriesListFilters>, resetPage = true): void {
    const next = { ...filtersRef.current, ...patch };
    setFilters(next);
    syncFiltersToUrl(next, resetPage);
  }

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }
    const handle = window.setTimeout(() => {
      syncFiltersToUrl(filtersRef.current, true);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [filters.search, syncFiltersToUrl]);

  const channels = useMemo(() => {
    const unique = new Set(items.map((item) => item.channel).filter(Boolean));
    return [...unique].sort();
  }, [items]);

  function resetFilters() {
    setFilters(defaultDeliveriesListFilters);
    syncFiltersToUrl(defaultDeliveriesListFilters, true);
  }

  function setListPage(page: number, pageSize?: number) {
    const params = new URLSearchParams(searchParams.toString());
    syncListPageQuery(params, page, pageSize, ADMIN_NOTIFICATIONS_DELIVERIES_PAGE_KEYS);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const quickFilters: Array<[DeliveryQuickFilter, string]> = [
    ["", "quickAll"],
    ["sent-today", "quickSentToday"],
    ["scheduled", "quickScheduledDeliveries"],
    ["immediate", "quickImmediateDeliveries"],
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className={adminChrome.sectionTitle}>{t("deliveryListHeading")}</h2>
        <p className={adminChrome.metaText}>{t("deliveryListHint")}</p>
      </div>
      {loadFailed ? <p className="app-alert-warn text-sm">{t("loadFailedDeliveries")}</p> : null}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map(([value, labelKey]) => (
          <button
            key={value || "all"}
            type="button"
            className={
              filters.quick === value
                ? "rounded-full bg-sage-800 px-3 py-1 text-xs font-medium text-white"
                : "rounded-full border border-white/60 bg-white/55 px-3 py-1 text-xs font-medium text-sage-700"
            }
            onClick={() => patchFilters({ quick: filters.quick === value ? "" : value })}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="flex flex-col gap-1 xl:col-span-2">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.search")}</span>
          <input
            className="ommm-input"
            value={filters.search}
            onChange={(ev) => setFilters((current) => ({ ...current, search: ev.target.value }))}
            placeholder={t("filters.searchPlaceholder")}
            autoComplete="off"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.audience")}</span>
          <OmmSelectDropdown
            ariaLabel={t("filters.audience")}
            label={t(audienceOptions.find(([value]) => value === filters.audience)?.[1] ?? "audienceAll")}
            value={filters.audience}
            options={ommOptionsFromTuples(
              audienceOptions.map(([value, labelKey]) => [value, t(labelKey)]),
            )}
            onChange={(value) => patchFilters({ audience: value as BroadcastAudience | "" })}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.channel")}</span>
          <OmmSelectDropdown
            ariaLabel={t("filters.channel")}
            label={filters.channel === "" ? t("filters.channelAll") : filters.channel}
            value={filters.channel}
            options={[
              { value: "", label: t("filters.channelAll") },
              ...channels.map((value) => ({ value, label: value })),
            ]}
            onChange={(value) => patchFilters({ channel: value })}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.timing")}</span>
          <OmmSelectDropdown
            ariaLabel={t("filters.timing")}
            label={
              filters.timing === "scheduled"
                ? t("scheduledTag")
                : filters.timing === "immediate"
                  ? t("immediateTag")
                  : t("filters.timingAll")
            }
            value={filters.timing}
            options={[
              { value: "", label: t("filters.timingAll") },
              { value: "scheduled", label: t("scheduledTag") },
              { value: "immediate", label: t("immediateTag") },
            ]}
            onChange={(value) =>
              patchFilters({ timing: value as "" | "scheduled" | "immediate" })
            }
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.sort")}</span>
          <OmmSelectDropdown
            ariaLabel={t("filters.sort")}
            label={t(sortOptions.find(([value]) => value === filters.order)?.[1] ?? "sortNewest")}
            value={filters.order}
            options={sortOptions.map(([value, labelKey]) => ({ value, label: t(labelKey) }))}
            onChange={(value) => patchFilters({ order: value as "newest" | "oldest" })}
          />
        </label>
      </div>
      <AdminFilterResetBar
        onReset={resetFilters}
        label={t("filters.reset")}
        meta={
          <span className={adminChrome.metaText}>
            {t("filters.resultCount", { count: payload.total })}
          </span>
        }
      />
      <div className={ADMIN_NOTIFICATIONS_LIST_TABLE_CLASS}>
        <div className={ADMIN_NOTIFICATIONS_LIST_HEADER_CLASS}>
          <span className={ADMIN_NOTIFICATIONS_LIST_EMPHASIZED_HEADER}>{t("table.sentAt")}</span>
          <span>{t("table.subject")}</span>
          <span className={ADMIN_NOTIFICATIONS_LIST_EMPHASIZED_HEADER}>{t("table.recipient")}</span>
          <span className={ADMIN_NOTIFICATIONS_LIST_EMPHASIZED_HEADER}>{t("table.audience")}</span>
          <span className={ADMIN_NOTIFICATIONS_LIST_EMPHASIZED_HEADER}>{t("table.channel")}</span>
          <span className={ADMIN_NOTIFICATIONS_LIST_EMPHASIZED_HEADER}>{t("table.timing")}</span>
        </div>
        {items.length === 0 ? (
          <p className="rounded-[24px] border border-white/80 bg-white/95 px-5 py-8 text-center text-sm text-sage-600">
            {payload.total === 0 ? t("deliveryListEmpty") : t("filters.noMatches")}
          </p>
        ) : (
          items.map((row) => (
            <article key={row.id} className={ADMIN_NOTIFICATIONS_LIST_ROW_CLASS}>
              <div className={ADMIN_NOTIFICATIONS_LIST_CELL}>
                <AdminListMobileLabel label={t("table.sentAt")} />
                <p className="text-sm text-sage-600">{formatDateTimeForUi(row.createdAt, locale)}</p>
              </div>
              <div className={ADMIN_NOTIFICATIONS_LIST_CELL}>
                <AdminListMobileLabel label={t("table.subject")} />
                <p className="text-sm font-medium text-sage-900">{row.subject}</p>
              </div>
              <div className={ADMIN_NOTIFICATIONS_LIST_CELL}>
                <AdminListMobileLabel label={t("table.recipient")} />
                <p className="truncate font-mono text-xs text-sage-900">{row.recipientEmail}</p>
              </div>
              <div className={ADMIN_NOTIFICATIONS_LIST_CELL}>
                <AdminListMobileLabel label={t("table.audience")} />
                <p className="text-sm text-sage-800">{row.audience}</p>
              </div>
              <div className={ADMIN_NOTIFICATIONS_LIST_CELL}>
                <AdminListMobileLabel label={t("table.channel")} />
                <p className="text-sm text-sage-800">{row.channel}</p>
              </div>
              <div className={ADMIN_NOTIFICATIONS_LIST_CELL}>
                <AdminListMobileLabel label={t("table.timing")} />
                <p className="text-sm text-sage-800">
                  {row.scheduled ? t("scheduledTag") : t("immediateTag")}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
      <OmmListPagination
        total={payload.total}
        page={listPage.page}
        pageSize={listPage.pageSize}
        offset={payload.offset}
        onPageChange={setListPage}
        onPageSizeChange={(pageSize) => setListPage(1, pageSize)}
      />
      <p className={adminChrome.metaText}>{t("deliveryNote")}</p>
    </section>
  );
}
