"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminFinanceCoachPayoutHistoryFilters } from "@/components/admin/admin-finance-coach-payout-history-filters";
import { AdminFinanceCoachPayoutHistoryRow } from "@/components/admin/admin-finance-coach-payout-history-row";
import { AdminFinanceCoachPayoutMonthNav } from "@/components/admin/admin-finance-coach-payout-month-nav";
import {
  ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER,
  ADMIN_FINANCE_COACH_LIST_HEADER_CELL,
  ADMIN_FINANCE_COACH_LIST_HEADER_CELL_START,
  ADMIN_FINANCE_COACH_PAYOUT_HISTORY_HEADER_CLASS,
  ADMIN_FINANCE_COACH_PAYOUT_HISTORY_TABLE_CLASS,
} from "@/components/admin/admin-finance-notifications-list-layout";
import { FINANCE_SECTION_HREF } from "@/components/admin/admin-finance-module";
import type {
  CoachSalaryPayoutHistoryFilters,
  CoachSalaryPayoutHistoryPayload,
} from "@/components/admin/admin-finance-types";
import { FINANCE_COACH_PAYOUT_PAGE_KEYS } from "@/components/admin/admin-finance-url";
import { CircularBackLink } from "@/components/ui/circular-back-link";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import {
  parseListPageParams,
  resetListPageQuery,
  syncListPageQuery,
} from "@/lib/list-pagination";

type Props = {
  locale: string;
  initial: CoachSalaryPayoutHistoryPayload;
  filters: CoachSalaryPayoutHistoryFilters;
};

export function AdminFinanceCoachPayoutHistoryPanel({ locale, initial, filters }: Props) {
  const t = useTranslations("adminPages.finance.coachPayoutHistory");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const listPage = useMemo(
    () =>
      parseListPageParams(
        Object.fromEntries(searchParams.entries()),
        FINANCE_COACH_PAYOUT_PAGE_KEYS,
      ),
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
        syncListPageQuery(params, page, pageSize, FINANCE_COACH_PAYOUT_PAGE_KEYS);
      });
    },
    [replaceSearchParams],
  );

  const setMonth = useCallback(
    (month: string) => {
      replaceSearchParams((params) => {
        resetListPageQuery(params, FINANCE_COACH_PAYOUT_PAGE_KEYS);
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        if (month === currentMonth) {
          params.delete("month");
        } else {
          params.set("month", month);
        }
      });
    },
    [replaceSearchParams],
  );

  const rowLabels = {
    colCoach: t("colCoach"),
    colAmount: t("colAmount"),
    colMonth: t("colMonth"),
    colPaidAt: t("colPaidAt"),
    statusPaid: t("statusPaid"),
  };

  return (
    <div className="space-y-4">
      <div className="flex min-w-0 items-start gap-3">
        <CircularBackLink
          href={FINANCE_SECTION_HREF.coaches}
          ariaLabel={t("backToCoaches")}
          className="mt-0.5 shrink-0"
        />
        <div className="min-w-0 space-y-1">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-sage-900">
            {t("title")}
          </h2>
        </div>
      </div>

      <AdminFinanceCoachPayoutMonthNav
        locale={locale}
        month={filters.month}
        onMonthChange={setMonth}
      />

      <AdminFinanceCoachPayoutHistoryFilters
        key={`${filters.q}|${filters.month}`}
        initialValues={filters}
      />

      <div className={ADMIN_FINANCE_COACH_PAYOUT_HISTORY_TABLE_CLASS}>
        <div className={ADMIN_FINANCE_COACH_PAYOUT_HISTORY_HEADER_CLASS}>
          <span
            className={`${ADMIN_FINANCE_COACH_LIST_HEADER_CELL_START} ${ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER}`}
          >
            {t("colCoach")}
          </span>
          <span className={`${ADMIN_FINANCE_COACH_LIST_HEADER_CELL} ${ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER}`}>
            {t("colAmount")}
          </span>
          <span className={`${ADMIN_FINANCE_COACH_LIST_HEADER_CELL} ${ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER}`}>
            {t("colMonth")}
          </span>
          <span className={`${ADMIN_FINANCE_COACH_LIST_HEADER_CELL} ${ADMIN_FINANCE_COACH_LIST_EMPHASIZED_HEADER}`}>
            {t("colPaidAt")}
          </span>
        </div>
        {initial.items.length === 0 ? (
          <p className="rounded-[24px] border border-white/80 bg-white/95 px-5 py-8 text-center text-sm text-sage-600">
            {t("empty")}
          </p>
        ) : (
          initial.items.map((row) => (
            <AdminFinanceCoachPayoutHistoryRow
              key={row.id}
              locale={locale}
              row={row}
              labels={rowLabels}
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
    </div>
  );
}
