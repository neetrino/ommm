"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminCoachSessionsDrawer } from "@/components/admin/admin-coach-sessions-drawer";
import { adminChrome } from "@/components/admin/admin-chrome";
import type { CoachFinanceFilters, CoachFinanceRow } from "@/components/admin/admin-finance-types";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";
import { coachCardDisplayName } from "@/components/coaches/coach-card-display";
import { formatAmdFromCents } from "@/lib/price-amd";

type Props = {
  locale: string;
  initialRows: CoachFinanceRow[];
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

export function AdminCoachFinanceTab({ locale, initialRows }: Props) {
  const t = useTranslations("adminPages.finance.coachTab");
  const [filters, setFilters] = useState<CoachFinanceFilters>(defaultFilters);
  const [drawerCoach, setDrawerCoach] = useState<CoachFinanceRow | null>(null);

  const filteredRows = useMemo(
    () => sortRows(applyFilters(initialRows, filters), filters.order),
    [filters, initialRows],
  );

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
        <OmmButton
          size="sm"
          variant="subtle"
          onClick={() => setFilters(defaultFilters)}
        >
          {t("clearFilters")}
        </OmmButton>
      </div>
      <p className="text-xs text-sage-500">{t("rowCount", { count: filteredRows.length })}</p>
      <div className={adminChrome.tableWrap}>
        <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
          <thead className={adminChrome.thead}>
            <tr>
              <th className={adminChrome.th}>{t("colCoach")}</th>
              <th className={adminChrome.th}>{t("colSalary")}</th>
              <th className={adminChrome.th}>{t("colSessions")}</th>
              <th className={adminChrome.th}>{t("colMonth")}</th>
              <th className={adminChrome.th}>{t("colPayoutStatus")}</th>
              <th className={adminChrome.th}>{t("colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sage-600">
                  {t("empty")}
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => {
                const status = payoutStatus(row);
                const sessionCount = row.salary?.completedSessions ?? row.totalClasses;
                return (
                  <tr key={row.coachProfileId} className={adminChrome.tr}>
                    <td className={adminChrome.tdStrong}>
                      <p>{displayName(row)}</p>
                      <p className="text-xs font-normal text-sage-500">{row.user.phone ?? "—"}</p>
                    </td>
                    <td className={adminChrome.td}>
                      {row.salary
                        ? formatAmdFromCents(row.salary.totalEarningsCents, locale)
                        : "—"}
                    </td>
                    <td className={adminChrome.td}>
                      <button
                        type="button"
                        className="font-medium text-sage-800 underline underline-offset-2"
                        onClick={() => setDrawerCoach(row)}
                      >
                        {sessionCount}
                      </button>
                    </td>
                    <td className={adminChrome.td}>{filters.month}</td>
                    <td className={adminChrome.td}>
                      <span className="rounded-full bg-sage-100 px-2 py-1 text-[11px] font-medium text-sage-700">
                        {status === "none" ? t("statusNone") : t(`status${status === "paid" ? "Paid" : "Pending"}`)}
                      </span>
                    </td>
                    <td className={adminChrome.td}>
                      <p className="text-xs text-sage-500">{t("actionsUnsupported")}</p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
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
