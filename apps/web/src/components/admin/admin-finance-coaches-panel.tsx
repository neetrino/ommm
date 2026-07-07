"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminCoachSessionsDrawer } from "@/components/admin/admin-coach-sessions-drawer";
import { AdminFinanceCoachCompactRow } from "@/components/admin/admin-finance-coach-compact-row";
import {
  ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER,
  ADMIN_FINANCE_COACH_LIST_HEADER_CELL,
  ADMIN_FINANCE_COACH_LIST_HEADER_CLASS,
  ADMIN_FINANCE_COACH_LIST_TABLE_CLASS,
} from "@/components/admin/admin-finance-notifications-list-layout";
import type {
  CoachFinanceFilters,
  CoachFinancePayload,
  CoachFinanceRow,
} from "@/components/admin/admin-finance-types";
import { FINANCE_COACH_PAGE_KEYS } from "@/components/admin/admin-finance-url";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { parseListPageParams, resetListPageQuery, syncListPageQuery } from "@/lib/list-pagination";

type Props = {
  locale: string;
  initial: CoachFinancePayload;
  filters: CoachFinanceFilters & { q: string };
};

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
      <div className={ADMIN_FINANCE_COACH_LIST_TABLE_CLASS}>
        <div className={ADMIN_FINANCE_COACH_LIST_HEADER_CLASS}>
          <span className={ADMIN_FINANCE_COACH_LIST_HEADER_CELL}>{t("colCoach")}</span>
          <span className={`${ADMIN_FINANCE_COACH_LIST_HEADER_CELL} ${ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER}`}>
            {t("colSalary")}
          </span>
          <span className={`${ADMIN_FINANCE_COACH_LIST_HEADER_CELL} ${ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER}`}>
            {t("colSessions")}
          </span>
          <span className={`${ADMIN_FINANCE_COACH_LIST_HEADER_CELL} ${ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER}`}>
            {t("colMonth")}
          </span>
          <span className={`${ADMIN_FINANCE_COACH_LIST_HEADER_CELL} ${ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER}`}>
            {t("colPayoutStatus")}
          </span>
        </div>
        {initial.items.length === 0 ? (
          <p className="rounded-[24px] border border-white/80 bg-white/95 px-5 py-8 text-center text-sm text-sage-600">
            {t("empty")}
          </p>
        ) : (
          initial.items.map((row) => (
            <AdminFinanceCoachCompactRow
              key={row.coachProfileId}
              locale={locale}
              row={row}
              month={filters.month}
              onOpenSessions={() => setDrawerCoach(row)}
            />
          ))
        )}
      </div>
      <OmmListPagination
        total={initial.total}
        page={listPage.page}
        pageSize={listPage.pageSize}
        offset={initial.offset}
        onPageChange={setListPage}
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
