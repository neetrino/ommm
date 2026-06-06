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
import { OmmButton } from "@/components/ui/omm-button";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { coachCardDisplayName } from "@/components/coaches/coach-card-display";
import { parseListPageParams, resetListPageQuery, syncListPageQuery } from "@/lib/list-pagination";
import { formatAmdFromCents } from "@/lib/price-amd";

type Props = {
  locale: string;
  initial: CoachFinancePayload;
  filters: CoachFinanceFilters & { q: string };
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

export function AdminFinanceCoachesPanel({ locale, initial, filters }: Props) {
  const t = useTranslations("adminPages.finance.coachTab");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerCoach, setDrawerCoach] = useState<CoachFinanceRow | null>(null);

  const listPage = useMemo(
    () => parseListPageParams(Object.fromEntries(searchParams.entries()), FINANCE_COACH_PAGE_KEYS),
    [searchParams],
  );

  const replaceSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutator(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setListPage = useCallback(
    (page: number, pageSize?: number) => {
      replaceSearchParams((params) => {
        syncListPageQuery(params, page, pageSize, FINANCE_COACH_PAGE_KEYS);
      });
    },
    [replaceSearchParams],
  );

  function setQuickFilter(value: string): void {
    const nextQuick = filters.quick === value ? "" : value;
    replaceSearchParams((params) => {
      resetListPageQuery(params, FINANCE_COACH_PAGE_KEYS);
      if (nextQuick) {
        params.set("quick", nextQuick);
      } else {
        params.delete("quick");
      }
    });
  }

  return (
    <div className="space-y-4">
      <p className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-xs text-amber-900">
        {t("unsupportedNote")}
      </p>
      <QuickFilters
        active={filters.quick}
        onChange={setQuickFilter}
        labels={{
          paid: t("quickPaid"),
          pending: t("quickPending"),
          highSalary: t("quickHighSalary"),
          recent: t("quickRecent"),
        }}
      />
      <p className="text-xs text-sage-500">{t("rowCount", { count: initial.total })}</p>
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
        {initial.items.length === 0 ? (
          <p className="rounded-[24px] border border-white/80 bg-white/95 px-5 py-8 text-center text-sm text-sage-600">
            {t("empty")}
          </p>
        ) : (
          initial.items.map((row) => {
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
          onClick={() => props.onChange(value)}
        >
          {label}
        </OmmButton>
      ))}
    </div>
  );
}
