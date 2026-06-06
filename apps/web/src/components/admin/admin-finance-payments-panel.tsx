"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminFinancePaymentCompactRow } from "@/components/admin/admin-finance-payment-compact-row";
import {
  ADMIN_FINANCE_PAYMENTS_LIST_ACTIONS_HEADER_CELL,
  ADMIN_FINANCE_PAYMENTS_LIST_EMPHASIZED_HEADER,
  ADMIN_FINANCE_PAYMENTS_LIST_HEADER_CLASS,
  ADMIN_FINANCE_PAYMENTS_LIST_TABLE_CLASS,
} from "@/components/admin/admin-finance-payments-list-layout";
import type {
  FinancePaymentsPayload,
  FinanceSourceFilter,
  FinanceStatusFilter,
} from "@/components/admin/admin-finance-types";
import { FINANCE_PAYMENTS_PAGE_KEYS } from "@/components/admin/admin-finance-url";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { apiFetch } from "@/lib/api";
import { parseListPageParams, syncListPageQuery } from "@/lib/list-pagination";

type Props = {
  locale: string;
  initialPayments: FinancePaymentsPayload;
  paymentsFrom: string;
  paymentsStatus: FinanceStatusFilter;
  paymentsSource: FinanceSourceFilter;
  searchQuery: string;
};

function buildPaymentsQuery(
  from: string,
  status: FinanceStatusFilter,
  source: FinanceSourceFilter,
  searchQuery: string,
  listPage: ReturnType<typeof parseListPageParams>,
): string {
  const params = new URLSearchParams({
    from,
    take: String(listPage.take),
    offset: String(listPage.offset),
  });
  if (status !== "all") {
    params.set("status", status);
  }
  if (source !== "all") {
    params.set("source", source);
  }
  if (searchQuery.trim()) {
    params.set("q", searchQuery.trim());
  }
  return `/payments/admin?${params.toString()}`;
}

export function AdminFinancePaymentsPanel({
  locale,
  initialPayments,
  paymentsFrom,
  paymentsStatus,
  paymentsSource,
  searchQuery,
}: Props) {
  const t = useTranslations("adminPages.finance.paymentsTab");
  const tTable = useTranslations("adminPages.finance.table");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [paymentsPayload, setPaymentsPayload] = useState(initialPayments);
  const [loading, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const hasMounted = useRef(false);

  const payListPage = useMemo(
    () =>
      parseListPageParams(Object.fromEntries(searchParams.entries()), FINANCE_PAYMENTS_PAGE_KEYS),
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

  const setPayListPage = useCallback(
    (page: number, pageSize?: number) => {
      replaceSearchParams((params) => {
        syncListPageQuery(params, page, pageSize, FINANCE_PAYMENTS_PAGE_KEYS);
      });
    },
    [replaceSearchParams],
  );

  useEffect(() => {
    setPaymentsPayload(initialPayments);
  }, [initialPayments]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }

    const nextRequestId = requestId.current + 1;
    requestId.current = nextRequestId;
    startTransition(() => {
      void apiFetch<FinancePaymentsPayload>(
        buildPaymentsQuery(
          paymentsFrom,
          paymentsStatus,
          paymentsSource,
          searchQuery,
          payListPage,
        ),
      )
        .then((payload) => {
          if (requestId.current !== nextRequestId) return;
          setPaymentsPayload(payload);
          setError(null);
        })
        .catch(() => {
          if (requestId.current === nextRequestId) {
            setError(t("loadFailed"));
          }
        });
    });
  }, [
    payListPage.offset,
    payListPage.take,
    paymentsFrom,
    paymentsSource,
    paymentsStatus,
    searchQuery,
    t,
  ]);

  return (
    <div className="space-y-4">
      {error ? <div className="app-alert-warn">{error}</div> : null}
      {loading ? <p className="text-sm text-sage-500">{t("loading")}</p> : null}
      <p className="text-sm text-sage-600">{t("rowCount", { count: paymentsPayload.total })}</p>

      <div className={ADMIN_FINANCE_PAYMENTS_LIST_TABLE_CLASS}>
        <div className={ADMIN_FINANCE_PAYMENTS_LIST_HEADER_CLASS}>
          <span>{tTable("colUser")}</span>
          <span className={ADMIN_FINANCE_PAYMENTS_LIST_EMPHASIZED_HEADER}>{tTable("colAmount")}</span>
          <span className={ADMIN_FINANCE_PAYMENTS_LIST_EMPHASIZED_HEADER}>{tTable("colDate")}</span>
          <span className={ADMIN_FINANCE_PAYMENTS_LIST_EMPHASIZED_HEADER}>{tTable("colTime")}</span>
          <span className={ADMIN_FINANCE_PAYMENTS_LIST_EMPHASIZED_HEADER}>{tTable("colSource")}</span>
          <span className={ADMIN_FINANCE_PAYMENTS_LIST_EMPHASIZED_HEADER}>{tTable("colStatus")}</span>
          <span className={ADMIN_FINANCE_PAYMENTS_LIST_EMPHASIZED_HEADER}>
            {tTable("colPaymentMethod")}
          </span>
          <span aria-hidden="true" />
          <span className={ADMIN_FINANCE_PAYMENTS_LIST_ACTIONS_HEADER_CELL}>{tTable("colActions")}</span>
        </div>
        {paymentsPayload.items.length === 0 ? (
          <p className="rounded-[24px] border border-white/80 bg-white/95 px-5 py-8 text-center text-sm text-sage-600">
            {tTable("empty")}
          </p>
        ) : (
          paymentsPayload.items.map((row) => (
            <AdminFinancePaymentCompactRow key={row.id} locale={locale} row={row} />
          ))
        )}
      </div>

      <OmmListPagination
        total={paymentsPayload.total}
        page={payListPage.page}
        pageSize={payListPage.pageSize}
        offset={paymentsPayload.offset}
        onPageChange={(page) => setPayListPage(page)}
        onPageSizeChange={(pageSize) => setPayListPage(1, pageSize)}
        disabled={loading}
      />
    </div>
  );
}
