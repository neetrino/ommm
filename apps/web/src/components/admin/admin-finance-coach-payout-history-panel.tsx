"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminFinanceCoachPayoutHistoryEmptyState } from "@/components/admin/admin-finance-coach-payout-history-empty-state";
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
      <CircularBackLink
        href={FINANCE_SECTION_HREF.coaches}
        ariaLabel={t("backToCoaches")}
      />

      <AdminFinanceCoachPayoutMonthNav
        locale={locale}
        month={filters.month}
        onMonthChange={setMonth}
      />

      {initial.items.length === 0 ? (
        <AdminFinanceCoachPayoutHistoryEmptyState />
      ) : (
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
          {initial.items.map((row) => (
            <AdminFinanceCoachPayoutHistoryRow
              key={row.id}
              locale={locale}
              row={row}
              labels={rowLabels}
            />
          ))}
        </div>
      )}

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
