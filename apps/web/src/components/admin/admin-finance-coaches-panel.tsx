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
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { parseListPageParams, syncListPageQuery } from "@/lib/list-pagination";

type Props = {
  locale: string;
  initial: CoachFinancePayload;
  filters: CoachFinanceFilters & { q: string };
};

const HISTORY_LINK_CLASS = [
  "group relative inline-flex items-center gap-3 overflow-hidden rounded-full",
  "border border-white/80 bg-white/90 py-1.5 pr-4 pl-1.5",
  "text-sand-700 shadow-[0_10px_28px_-18px_rgba(45,40,35,0.35)] backdrop-blur-md",
  "transition-[border-color,box-shadow,transform,background-color]",
  "hover:border-sand-500/35 hover:bg-white",
  "hover:shadow-[0_16px_34px_-18px_rgba(107,92,76,0.42)]",
  "active:scale-[0.985]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

function PaymentHistoryIcon() {
  return (
    <span
      className={[
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
        "bg-gradient-to-br from-sand-500 to-sand-700 text-white",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_14px_-8px_rgba(107,92,76,0.55)]",
        "transition-transform duration-300 ease-out group-hover:rotate-[-8deg] group-hover:scale-105",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden
      >
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5" />
        <path d="M12 7v5l3 2" />
      </svg>
    </span>
  );
}

function PaymentHistoryChevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0 text-sand-500/80 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-sand-700"
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={FINANCE_COACH_PAYOUT_HISTORY_HREF} className={HISTORY_LINK_CLASS}>
          <span
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sand-300/80 to-transparent"
            aria-hidden
          />
          <PaymentHistoryIcon />
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
            {t("quickHistory")}
          </span>
          <PaymentHistoryChevron />
        </Link>
      </div>
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
