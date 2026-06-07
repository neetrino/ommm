"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { UserListBoardViewSwitcher } from "@/components/account/user-list-board-view-switcher";
import { UserPaymentBoardCard } from "@/components/account/user-payment-board-card";
import { UserPaymentCompactRow } from "@/components/account/user-payment-compact-row";
import {
  buildUserPaymentsFilterFields,
  userPaymentsIntegratedFilterValues,
  type UserPaymentFilterValues,
  type UserPaymentSortOrder,
  type UserPaymentSourceFilter,
  type UserPaymentStatusFilter,
} from "@/components/account/user-payments-filter-fields";
import {
  USER_PAYMENTS_LIST_CENTER_HEADER_CELL,
  USER_PAYMENTS_LIST_HEADER_CLASS,
  USER_PAYMENTS_LIST_METHOD_HEADER_CELL,
  USER_PAYMENTS_LIST_TABLE_CLASS,
} from "@/components/account/user-payments-list-layout";
import {
  comparePayments,
  normalizePaymentSource,
} from "@/components/account/user-payment-display";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { useUserListBoardView } from "@/hooks/use-user-list-board-view";
import { usePropSyncedState } from "@/hooks/use-prop-synced-state";
import { apiFetch } from "@/lib/api";
import { formatAmdFromCents } from "@/lib/price-amd";
import {
  parseListPageParams,
  resetListPageQuery,
  syncListPageQuery,
} from "@/lib/list-pagination";
import type { UserPaymentsPayload } from "@/lib/user-package-types";

type UserPaymentsHistoryProps = {
  locale: string;
  initialPayments: UserPaymentsPayload;
};

const DEFAULT_FILTER_VALUES: UserPaymentFilterValues = {
  search: "",
  status: "all",
  source: "all",
  order: "newest",
};

function buildPaymentsEndpoint(
  listPage: ReturnType<typeof parseListPageParams>,
  status: UserPaymentStatusFilter,
  order: UserPaymentSortOrder,
): string {
  const params = new URLSearchParams({
    take: String(listPage.take),
    offset: String(listPage.offset),
    order,
  });
  if (status !== "all") {
    params.set("status", status);
  }
  return `/payments/me?${params.toString()}`;
}

export function UserPaymentsHistory({ locale, initialPayments }: UserPaymentsHistoryProps) {
  const t = useTranslations("userPages.payments");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewMode, setView] = useUserListBoardView("payments");
  const [paymentsPayload, setPaymentsPayload] = usePropSyncedState(initialPayments);
  const [filters, setFilters] = useState<UserPaymentFilterValues>(DEFAULT_FILTER_VALUES);
  const [loading, startTransition] = useTransition();
  const requestId = useRef(0);
  const hasMounted = useRef(false);

  const listPage = useMemo(
    () => parseListPageParams(Object.fromEntries(searchParams.entries())),
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
        syncListPageQuery(params, page, pageSize);
      });
    },
    [replaceSearchParams],
  );

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return undefined;
    }

    const nextRequestId = requestId.current + 1;
    requestId.current = nextRequestId;
    startTransition(() => {
      void apiFetch<UserPaymentsPayload>(
        buildPaymentsEndpoint(listPage, filters.status, filters.order),
      )
        .then((payload) => {
          if (requestId.current !== nextRequestId) return;
          setPaymentsPayload(payload);
        })
        .catch(() => {
          if (requestId.current === nextRequestId) {
            setPaymentsPayload({
              items: [],
              total: 0,
              take: listPage.take,
              offset: listPage.offset,
            });
          }
        });
    });
  }, [filters.order, filters.status, listPage, setPaymentsPayload]);

  const filterFields = useMemo(
    () =>
      buildUserPaymentsFilterFields({
        labels: {
          status: t("filters.status"),
          allStatuses: t("filters.allStatuses"),
          statusValues: {
            SUCCEEDED: t("status.SUCCEEDED"),
            PENDING: t("status.PENDING"),
            FAILED: t("status.FAILED"),
            REFUNDED: t("status.REFUNDED"),
          },
          type: t("filters.type"),
          allTypes: t("filters.allTypes"),
          sourceValues: {
            package: t("source.package"),
            membership: t("source.membership"),
            dropin: t("source.dropin"),
            gift: t("source.gift"),
            other: t("source.other"),
          },
          sort: t("filters.sort"),
          sortLabels: {
            newest: t("sort.newest"),
            oldest: t("sort.oldest"),
          },
        },
      }),
    [t],
  );

  const integratedFilterValues = useMemo(
    () => userPaymentsIntegratedFilterValues(filters),
    [filters],
  );

  const rows = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return paymentsPayload.items
      .filter((payment) => {
        if (filters.source !== "all") {
          if (normalizePaymentSource(payment.description) !== filters.source) {
            return false;
          }
        }
        if (search.length === 0) {
          return true;
        }
        const haystack = `${payment.description ?? ""} ${payment.amountCents} ${formatAmdFromCents(payment.amountCents, locale)}`.toLowerCase();
        return haystack.includes(search);
      })
      .slice()
      .sort((left, right) => comparePayments(left, right, filters.order));
  }, [filters.order, filters.search, filters.source, locale, paymentsPayload.items]);

  function handleIntegratedFilterChange(key: string, value: string): void {
    switch (key) {
      case "status":
        setFilters((current) => ({ ...current, status: value as UserPaymentStatusFilter }));
        replaceSearchParams((params) => {
          resetListPageQuery(params);
        });
        break;
      case "source":
        setFilters((current) => ({ ...current, source: value as UserPaymentSourceFilter }));
        break;
      case "order":
        setFilters((current) => ({ ...current, order: value as UserPaymentSortOrder }));
        replaceSearchParams((params) => {
          resetListPageQuery(params);
        });
        break;
      default:
        break;
    }
  }

  function resetFilters(): void {
    setFilters(DEFAULT_FILTER_VALUES);
    replaceSearchParams((params) => {
      resetListPageQuery(params);
    });
  }

  const hasDefaultFilters =
    filters.status === "all" &&
    filters.source === "all" &&
    filters.search.trim().length === 0;
  const isEmpty = paymentsPayload.total === 0 && hasDefaultFilters;

  const heroSearch = (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <ListPageSearchFilters
        search={filters.search}
        onSearchChange={(value) => setFilters((current) => ({ ...current, search: value }))}
        searchPlaceholder={t("filters.searchPlaceholder")}
        fields={filterFields}
        filterValues={integratedFilterValues}
        onFilterChange={handleIntegratedFilterChange}
        onClearAll={resetFilters}
        resetLabel={t("filters.resetFilters")}
      />
      <UserListBoardViewSwitcher
        pageId="payments"
        namespace="userPages.payments"
        value={viewMode}
        onChange={setView}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <AdminPageHero title={t("title")} description={t("description")} search={heroSearch} />

      {isEmpty ? (
        <section className="rounded-[20px] border border-white/60 bg-white/75 p-5 sm:p-6">
          <h2 className="ommm-h3 text-sage-800">{t("emptyTitle")}</h2>
          <p className="ommm-body-muted mt-2 text-sm">{t("emptyDescription")}</p>
        </section>
      ) : (
        <>
          <p className="text-sm text-sage-600">{t("paymentsCount", { count: paymentsPayload.total })}</p>

          {rows.length === 0 ? (
            <div className="rounded-2xl border border-sage-100 bg-white/80 p-5 text-sm">
              <p className="font-medium text-sage-900">{t("filteredEmptyTitle")}</p>
              <p className="mt-1 text-sage-600">{t("filteredEmptyDescription")}</p>
            </div>
          ) : viewMode === "board" ? (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {rows.map((row) => (
                <li key={row.id} className="min-w-0 list-none">
                  <UserPaymentBoardCard locale={locale} payment={row} />
                </li>
              ))}
            </ul>
          ) : (
            <div className={USER_PAYMENTS_LIST_TABLE_CLASS}>
              <div className={USER_PAYMENTS_LIST_HEADER_CLASS}>
                <span>{t("table.related")}</span>
                <span className={USER_PAYMENTS_LIST_CENTER_HEADER_CELL}>{t("table.amount")}</span>
                <span className={USER_PAYMENTS_LIST_CENTER_HEADER_CELL}>{t("table.date")}</span>
                <span className={USER_PAYMENTS_LIST_CENTER_HEADER_CELL}>{t("table.time")}</span>
                <span className={USER_PAYMENTS_LIST_CENTER_HEADER_CELL}>{t("table.status")}</span>
                <span className={USER_PAYMENTS_LIST_METHOD_HEADER_CELL}>{t("table.paymentMethod")}</span>
              </div>
              {rows.map((row) => (
                <UserPaymentCompactRow key={row.id} locale={locale} payment={row} />
              ))}
            </div>
          )}

          <OmmListPagination
            namespace="userPages.pagination"
            total={paymentsPayload.total}
            page={listPage.page}
            pageSize={listPage.pageSize}
            offset={paymentsPayload.offset}
            onPageChange={(page) => setListPage(page)}
            onPageSizeChange={(pageSize) => setListPage(1, pageSize)}
            disabled={loading}
          />
        </>
      )}
    </div>
  );
}
