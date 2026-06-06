"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminFinancePaymentActions } from "@/components/admin/admin-finance-payment-actions";
import { adminChrome } from "@/components/admin/admin-chrome";
import type {
  FinancePaymentItem,
  FinancePaymentsPayload,
  FinanceSourceFilter,
  FinanceStatusFilter,
} from "@/components/admin/admin-finance-types";
import { FINANCE_PAYMENTS_PAGE_KEYS } from "@/components/admin/admin-finance-url";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { apiFetch } from "@/lib/api";
import { formatDateForUi } from "@/lib/date-display";
import { parseListPageParams, syncListPageQuery } from "@/lib/list-pagination";
import { formatAmdFromCents } from "@/lib/price-amd";

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
      <p className="text-xs text-sage-500">
        {t("rowCount", { count: paymentsPayload.total })}
      </p>
      <FinancePaymentsTable items={paymentsPayload.items} locale={locale} />
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

function FinancePaymentsTable({
  items,
  locale,
}: {
  items: FinancePaymentItem[];
  locale: string;
}) {
  const tTable = useTranslations("adminPages.finance.table");
  const tMethods = useTranslations("adminPages.finance.paymentMethods");
  if (items.length === 0) {
    return <p className="text-sm text-sage-600">{tTable("empty")}</p>;
  }

  return (
    <div className={adminChrome.tableWrap}>
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <thead className={adminChrome.thead}>
          <tr>
            <th className={adminChrome.th}>{tTable("colDate")}</th>
            <th className={adminChrome.th}>{tTable("colUser")}</th>
            <th className={adminChrome.th}>{tTable("colAmount")}</th>
            <th className={adminChrome.th}>{tTable("colPaymentMethod")}</th>
            <th className={adminChrome.th}>{tTable("colSource")}</th>
            <th className={adminChrome.th}>{tTable("colStatus")}</th>
            <th className={adminChrome.th}>{tTable("colActions")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id} className={adminChrome.tr}>
              <td className={adminChrome.td}>{formatDateForUi(row.createdAt)}</td>
              <td className={adminChrome.td}>
                <p>
                  {[row.user.name, row.user.lastName].filter(Boolean).join(" ") || row.user.email}
                </p>
                <p className="text-xs text-sage-500">{row.user.phone ?? row.user.email}</p>
              </td>
              <td className={adminChrome.td}>{formatAmdFromCents(row.amountCents, locale)}</td>
              <td className={adminChrome.td}>
                {row.paymentMethod ? tMethods(row.paymentMethod as "CASH") : "—"}
              </td>
              <td className={adminChrome.td}>{row.source}</td>
              <td className={adminChrome.td}>{row.status}</td>
              <td className={adminChrome.td}>
                <AdminFinancePaymentActions paymentId={row.id} status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
