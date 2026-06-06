"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminCoachSessionsDrawer } from "@/components/admin/admin-coach-sessions-drawer";
import {
  ADMIN_FINANCE_COACH_LIST_CELL,
  ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER,
  ADMIN_FINANCE_COACH_LIST_HEADER_CLASS,
  ADMIN_FINANCE_COACH_LIST_ROW_CLASS,
  ADMIN_FINANCE_COACH_LIST_TABLE_CLASS,
} from "@/components/admin/admin-finance-notifications-list-layout";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import type {
  CoachFinanceFilters,
  CoachFinancePayload,
  CoachFinanceRow,
} from "@/components/admin/admin-finance-types";
import { FINANCE_COACH_PAGE_KEYS } from "@/components/admin/admin-finance-url";
import { AdminFilterResetBar } from "@/components/ui/admin-filter-reset-bar";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";
import { coachCardDisplayName } from "@/components/coaches/coach-card-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import { parseListPageParams, resetListPageQuery, syncListPageQuery } from "@/lib/list-pagination";

type Props = {
  locale: string;
  initial: CoachFinancePayload;
};

const defaultFilters: CoachFinanceFilters = {
  search: "",
  month: new Date().toISOString().slice(0, 7),
  payoutStatus: "",
  order: "newest",
  quick: "",
};

function displayName(row: CoachFinanceRow): string {
  return coachCardDisplayName({
    name: row.user.name,
    lastName: row.user.lastName,
    email: row.user.email,
    avatarUrl: null,
  });
}

function payoutStatus(row: CoachFinanceRow): "pending" | "paid" | "none" {
  if (!row.salary || row.salary.totalEarningsCents === 0) {
    return "none";
  }
  if (row.salary.pendingPayoutCents > 0) {
    return "pending";
  }
  return "paid";
}

function sortRows(rows: CoachFinanceRow[], order: string): CoachFinanceRow[] {
  const copy = [...rows];
  if (order === "oldest") {
    return copy.sort((a, b) => a.coachProfileId.localeCompare(b.coachProfileId));
  }
  if (order === "highest-salary") {
    return copy.sort(
      (a, b) => (b.salary?.totalEarningsCents ?? 0) - (a.salary?.totalEarningsCents ?? 0),
    );
  }
  return copy.sort(
    (a, b) => (b.salary?.totalEarningsCents ?? 0) - (a.salary?.totalEarningsCents ?? 0),
  );
}

function applyFilters(rows: CoachFinanceRow[], filters: CoachFinanceFilters): CoachFinanceRow[] {
  const q = filters.search.trim().toLowerCase();
  return rows.filter((row) => {
    if (q.length > 0) {
      const haystack = `${displayName(row)} ${row.user.phone ?? ""} ${row.user.email}`.toLowerCase();
      if (!haystack.includes(q)) {
        return false;
      }
    }
    const status = payoutStatus(row);
    if (filters.payoutStatus && status !== filters.payoutStatus) {
      return false;
    }
    if (filters.quick === "paid" && status !== "paid") return false;
    if (filters.quick === "pending" && status !== "pending") return false;
    if (filters.quick === "high-salary") {
      const earnings = row.salary?.totalEarningsCents ?? 0;
      if (earnings < 50000) return false;
    }
    if (filters.quick === "recent-payments" && status !== "paid") return false;
    return true;
  });
}

export function AdminCoachFinanceTab({ locale, initial }: Props) {
  const t = useTranslations("adminPages.finance.coachTab");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<CoachFinanceFilters>(defaultFilters);
  const [drawerCoach, setDrawerCoach] = useState<CoachFinanceRow | null>(null);
  const initialRows = initial.items;

  const listPage = useMemo(
    () => parseListPageParams(Object.fromEntries(searchParams.entries()), FINANCE_COACH_PAGE_KEYS),
    [searchParams],
  );

  const filteredRows = useMemo(
    () => sortRows(applyFilters(initialRows, filters), filters.order),
    [filters, initialRows],
  );

  const setListPage = useCallback(
    (page: number, pageSize?: number) => {
      const params = new URLSearchParams(searchParams.toString());
      syncListPageQuery(params, page, pageSize, FINANCE_COACH_PAGE_KEYS);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  function resetCoachFilters() {
    setFilters(defaultFilters);
    const params = new URLSearchParams(searchParams.toString());
    resetListPageQuery(params, FINANCE_COACH_PAGE_KEYS);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function updateFilter<K extends keyof CoachFinanceFilters>(
    key: K,
    value: CoachFinanceFilters[K],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="space-y-4">
      <p className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-xs text-amber-900">
        {t("unsupportedNote")}
      </p>
      <QuickFilters
        active={filters.quick}
        onChange={(value) => updateFilter("quick", value)}
        labels={{
          paid: t("quickPaid"),
          pending: t("quickPending"),
          highSalary: t("quickHighSalary"),
          recent: t("quickRecent"),
        }}
      />
      <div className="grid gap-2 rounded-2xl border border-white/60 bg-white/70 p-3 md:grid-cols-4 xl:grid-cols-5">
        <input
          className="ommm-input h-10 md:col-span-2"
          placeholder={t("searchPlaceholder")}
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
        />
        <label className="text-xs text-sage-600">
          <span className="mb-1 block">{t("monthLabel")}</span>
          <input
            type="month"
            className="ommm-input h-10 w-full"
            value={filters.month}
            onChange={(event) => updateFilter("month", event.target.value)}
          />
        </label>
        <OmmSelectDropdown
          ariaLabel={t("payoutStatusLabel")}
          label={t("payoutStatusLabel")}
          value={filters.payoutStatus || "all"}
          onChange={(value) => updateFilter("payoutStatus", value === "all" ? "" : value)}
          options={[
            { value: "all", label: t("filterAll") },
            { value: "paid", label: t("statusPaid") },
            { value: "pending", label: t("statusPending") },
            { value: "none", label: t("statusNone") },
          ]}
        />
        <OmmSelectDropdown
          ariaLabel={t("sortLabel")}
          label={t("sortLabel")}
          value={filters.order}
          onChange={(value) => updateFilter("order", value)}
          options={[
            { value: "newest", label: t("sortHighestSalary") },
            { value: "highest-salary", label: t("sortHighestSalary") },
            { value: "oldest", label: t("sortOldest") },
          ]}
        />
      </div>
      <AdminFilterResetBar
        onReset={resetCoachFilters}
        label={t("clearFilters")}
      />
      <p className="text-xs text-sage-500">{t("rowCount", { count: filteredRows.length })}</p>
      <div className={ADMIN_FINANCE_COACH_LIST_TABLE_CLASS}>
        <div className={ADMIN_FINANCE_COACH_LIST_HEADER_CLASS}>
          <span>{t("colCoach")}</span>
          <span className={ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER}>{t("colSalary")}</span>
          <span className={ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER}>{t("colSessions")}</span>
          <span className={ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER}>{t("colMonth")}</span>
          <span className={ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER}>{t("colPayoutStatus")}</span>
          <span aria-hidden="true" />
          <span className={ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER}>{t("colActions")}</span>
        </div>
        {filteredRows.length === 0 ? (
          <p className="rounded-[24px] border border-white/80 bg-white/95 px-5 py-8 text-center text-sm text-sage-600">
            {t("empty")}
          </p>
        ) : (
          filteredRows.map((row) => {
            const status = payoutStatus(row);
            const sessionCount = row.salary?.completedSessions ?? row.totalClasses;
            return (
              <article key={row.coachProfileId} className={ADMIN_FINANCE_COACH_LIST_ROW_CLASS}>
                <div className={ADMIN_FINANCE_COACH_LIST_CELL}>
                  <AdminListMobileLabel label={t("colCoach")} />
                  <p className="text-sm font-medium text-sage-900">{displayName(row)}</p>
                  <p className="mt-0.5 text-xs text-sage-500">{row.user.phone ?? "—"}</p>
                </div>
                <div className={ADMIN_FINANCE_COACH_LIST_CELL}>
                  <AdminListMobileLabel label={t("colSalary")} />
                  <p className="text-sm text-sage-800">
                    {row.salary
                      ? formatAmdFromCents(row.salary.totalEarningsCents, locale)
                      : "—"}
                  </p>
                </div>
                <div className={ADMIN_FINANCE_COACH_LIST_CELL}>
                  <AdminListMobileLabel label={t("colSessions")} />
                  <button
                    type="button"
                    className="text-sm font-medium text-sage-800 underline underline-offset-2"
                    onClick={() => setDrawerCoach(row)}
                  >
                    {sessionCount}
                  </button>
                </div>
                <div className={ADMIN_FINANCE_COACH_LIST_CELL}>
                  <AdminListMobileLabel label={t("colMonth")} />
                  <p className="text-sm text-sage-800">{filters.month}</p>
                </div>
                <div className={ADMIN_FINANCE_COACH_LIST_CELL}>
                  <AdminListMobileLabel label={t("colPayoutStatus")} />
                  <span className="inline-flex rounded-full bg-sage-100 px-2 py-1 text-[11px] font-medium text-sage-700">
                    {status === "none"
                      ? t("statusNone")
                      : t(`status${status === "paid" ? "Paid" : "Pending"}`)}
                  </span>
                </div>
                <span aria-hidden="true" className="hidden min-w-0 md:block" />
                <div className={`${ADMIN_FINANCE_COACH_LIST_CELL} md:justify-self-end`}>
                  <AdminListMobileLabel label={t("colActions")} />
                  <p className="text-xs text-sage-500">{t("actionsUnsupported")}</p>
                </div>
              </article>
            );
          })
        )}
      </div>
      <OmmListPagination
        total={initial.total}
        page={listPage.page}
        pageSize={listPage.pageSize}
        offset={initial.offset}
        onPageChange={setListPage}
        onPageSizeChange={(pageSize) => setListPage(1, pageSize)}
      />
      <AdminCoachSessionsDrawer
        coach={drawerCoach}
        locale={locale}
        month={filters.month}
        onClose={() => setDrawerCoach(null)}
      />
    </div>
  );
}

function QuickFilters(props: {
  active: string;
  onChange: (value: string) => void;
  labels: { paid: string; pending: string; highSalary: string; recent: string };
}) {
  const entries = [
    ["paid", props.labels.paid],
    ["pending", props.labels.pending],
    ["high-salary", props.labels.highSalary],
    ["recent-payments", props.labels.recent],
  ] as const;
  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([value, label]) => (
        <OmmButton
          key={value}
          size="sm"
          variant={props.active === value ? "primary" : "ghost"}
          onClick={() => props.onChange(props.active === value ? "" : value)}
        >
          {label}
        </OmmButton>
      ))}
    </div>
  );
}
