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
  "group inline-flex items-center gap-2 rounded-full",
  "border border-sand-500/30 bg-gradient-to-b from-sand-100 to-sand-100/70",
  "px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-sand-700",
  "shadow-[0_8px_20px_-14px_rgba(107,92,76,0.45)] backdrop-blur-sm",
  "transition-[background-color,border-color,box-shadow,transform,color]",
  "hover:border-sand-500/50 hover:from-white hover:to-sand-100 hover:text-sand-700",
  "hover:shadow-[0_12px_24px_-14px_rgba(107,92,76,0.5)]",
  "active:scale-[0.985]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

function PaymentHistoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-rotate-12"
      aria-hidden
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3 2" />
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
          <PaymentHistoryIcon />
          <span>{t("quickHistory")}</span>
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
