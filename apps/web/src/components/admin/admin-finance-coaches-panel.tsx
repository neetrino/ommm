"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { AdminCoachSessionsDrawer } from "@/components/admin/admin-coach-sessions-drawer";
import { AdminFinanceCoachCompactRow } from "@/components/admin/admin-finance-coach-compact-row";
import {
  ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER,
  ADMIN_FINANCE_COACH_LIST_HEADER_CELL,
  ADMIN_FINANCE_COACH_LIST_HEADER_CELL_START,
  ADMIN_FINANCE_COACH_LIST_HEADER_CLASS,
  ADMIN_FINANCE_COACH_LIST_TABLE_CLASS,
} from "@/components/admin/admin-finance-notifications-list-layout";
import { FINANCE_COACH_PAYOUT_HISTORY_HREF } from "@/components/admin/admin-finance-module";
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

const QUICK_FILTER_GHOST_LINK_CLASS =
  "inline-flex cursor-pointer items-center justify-center rounded-full border border-white/75 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-sage-700 shadow-sm backdrop-blur-sm transition-[background-color,box-shadow,transform,color,border-color] hover:border-white hover:bg-white hover:text-sage-900 hover:shadow-md active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

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
      <QuickFilters
        active={filters.quick}
        onChange={setQuickFilter}
        historyHref={FINANCE_COACH_PAYOUT_HISTORY_HREF}
        labels={{
          paid: t("quickPaid"),
          pending: t("quickPending"),
          highSalary: t("quickHighSalary"),
          recent: t("quickRecent"),
          history: t("quickHistory"),
        }}
      />
      <div className={ADMIN_FINANCE_COACH_LIST_TABLE_CLASS}>
        <div className={ADMIN_FINANCE_COACH_LIST_HEADER_CLASS}>
          <span className={`${ADMIN_FINANCE_COACH_LIST_HEADER_CELL_START} ${ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER}`}>
            {t("colCoach")}
          </span>
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
          <span className={`${ADMIN_FINANCE_COACH_LIST_HEADER_CELL} ${ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER}`}>
            {t("colActions")}
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
  historyHref: string;
  labels: {
    paid: string;
    pending: string;
    highSalary: string;
    recent: string;
    history: string;
  };
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
      <Link href={props.historyHref} className={QUICK_FILTER_GHOST_LINK_CLASS}>
        {props.labels.history}
      </Link>
    </div>
  );
}
