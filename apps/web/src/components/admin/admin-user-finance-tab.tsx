"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminClientDrawer } from "@/components/admin/admin-client-drawer";
import { AdminFinancePaymentActions } from "@/components/admin/admin-finance-payment-actions";
import { AdminFinanceUserCompactRow } from "@/components/admin/admin-finance-user-compact-row";
import {
  ADMIN_FINANCE_USER_LIST_ACTIONS_HEADER_CELL,
  ADMIN_FINANCE_USER_LIST_EMPHASIZED_HEADER,
  ADMIN_FINANCE_USER_LIST_HEADER_CLASS,
  ADMIN_FINANCE_USER_LIST_TABLE_CLASS,
} from "@/components/admin/admin-finance-notifications-list-layout";
import {
  FINANCE_PAYMENTS_PAGE_KEYS,
  FINANCE_USER_PAGE_KEYS,
} from "@/components/admin/admin-finance-url";
import { adminChrome } from "@/components/admin/admin-chrome";
import type {
  FinancePaymentItem,
  FinancePaymentsPayload,
  FinanceSourceFilter,
  FinanceStatusFilter,
  UserFinanceFilters,
} from "@/components/admin/admin-finance-types";
import type { AdminClientsPayload, ClientRow } from "@/components/admin/admin-clients-types";
import { AdminFilterResetBar } from "@/components/ui/admin-filter-reset-bar";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";
import { apiFetch } from "@/lib/api";
import { formatDateForUi } from "@/lib/date-display";
import {
  parseListPageParams,
  resetListPageQuery,
  syncListPageQuery,
} from "@/lib/list-pagination";
import { formatAmdFromCents } from "@/lib/price-amd";

const SEARCH_DEBOUNCE_MS = 300;

type Props = {
  locale: string;
  initialClients: AdminClientsPayload;
  initialPayments: FinancePaymentsPayload;
  paymentsFrom: string;
  paymentsStatus: FinanceStatusFilter;
  paymentsSource: FinanceSourceFilter;
};

const defaultFilters: UserFinanceFilters = {
  search: "",
  paymentStatus: "",
  giftCardOnly: false,
  order: "newest",
  quick: "",
};

function sortRows(rows: ClientRow[], order: string): ClientRow[] {
  const copy = [...rows];
  if (order === "oldest") {
    return copy.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }
  if (order === "highest-lifetime-value") {
    return copy.sort((a, b) => b.lifetimeValueCents - a.lifetimeValueCents);
  }
  if (order === "lowest-lifetime-value") {
    return copy.sort((a, b) => a.lifetimeValueCents - b.lifetimeValueCents);
  }
  return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function applyLocalFilters(rows: ClientRow[], filters: UserFinanceFilters): ClientRow[] {
  return rows.filter((row) => {
    if (filters.giftCardOnly && !row.hasGiftCardActivity) {
      return false;
    }
    if (filters.quick === "paid" && row.paymentBehavior !== "paid") return false;
    if (filters.quick === "pending" && row.paymentBehavior !== "unpaid") return false;
    if (filters.quick === "overdue" && row.paymentBehavior !== "overdue") return false;
    if (filters.quick === "gift-card" && !row.hasGiftCardActivity) return false;
    if (filters.quick === "active" && row.status !== "Active") return false;
    return true;
  });
}

function buildPaymentsQuery(
  from: string,
  status: FinanceStatusFilter,
  source: FinanceSourceFilter,
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
  return `/payments/admin?${params.toString()}`;
}

export function AdminUserFinanceTab({
  locale,
  initialClients,
  initialPayments,
  paymentsFrom,
  paymentsStatus,
  paymentsSource,
}: Props) {
  const t = useTranslations("adminPages.finance.userTab");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [clientsPayload, setClientsPayload] = useState(initialClients);
  const [paymentsPayload, setPaymentsPayload] = useState(initialPayments);
  const [filters, setFilters] = useState<UserFinanceFilters>(defaultFilters);
  const [selected, setSelected] = useState<ClientRow | null>(null);
  const [loadingClients, startClientsTransition] = useTransition();
  const [loadingPayments, startPaymentsTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const clientsRequestId = useRef(0);
  const paymentsRequestId = useRef(0);
  const clientsHasMounted = useRef(false);
  const paymentsHasMounted = useRef(false);

  const userListPage = useMemo(
    () =>
      parseListPageParams(Object.fromEntries(searchParams.entries()), FINANCE_USER_PAGE_KEYS),
    [searchParams],
  );
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

  const setUserListPage = useCallback(
    (page: number, pageSize?: number) => {
      replaceSearchParams((params) => {
        syncListPageQuery(params, page, pageSize, FINANCE_USER_PAGE_KEYS);
      });
    },
    [replaceSearchParams],
  );

  const setPayListPage = useCallback(
    (page: number, pageSize?: number) => {
      replaceSearchParams((params) => {
        syncListPageQuery(params, page, pageSize, FINANCE_PAYMENTS_PAGE_KEYS);
      });
    },
    [replaceSearchParams],
  );

  const filteredRows = useMemo(
    () => sortRows(applyLocalFilters(clientsPayload.rows, filters), filters.order),
    [clientsPayload.rows, filters],
  );

  useEffect(() => {
    setClientsPayload(initialClients);
  }, [initialClients]);

  useEffect(() => {
    setPaymentsPayload(initialPayments);
  }, [initialPayments]);

  useEffect(() => {
    if (!clientsHasMounted.current) {
      clientsHasMounted.current = true;
      return undefined;
    }

    const handle = window.setTimeout(() => {
      const params = new URLSearchParams({
        meta: "true",
        take: String(userListPage.take),
        offset: String(userListPage.offset),
      });
      if (filters.search.trim()) params.set("search", filters.search.trim());
      if (filters.paymentStatus) params.set("paymentStatus", filters.paymentStatus);
      if (filters.order === "oldest" || filters.order === "newest") {
        params.set("order", filters.order);
      }

      const nextRequestId = clientsRequestId.current + 1;
      clientsRequestId.current = nextRequestId;
      startClientsTransition(() => {
        void apiFetch<AdminClientsPayload>(`/clients?${params.toString()}`)
          .then((payload) => {
            if (clientsRequestId.current !== nextRequestId) return;
            setClientsPayload(payload);
            setError(null);
          })
          .catch(() => {
            if (clientsRequestId.current === nextRequestId) {
              setError(t("loadFailed"));
            }
          });
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [
    filters.order,
    filters.paymentStatus,
    filters.search,
    t,
    userListPage.offset,
    userListPage.take,
  ]);

  useEffect(() => {
    if (!paymentsHasMounted.current) {
      paymentsHasMounted.current = true;
      return undefined;
    }

    const nextRequestId = paymentsRequestId.current + 1;
    paymentsRequestId.current = nextRequestId;
    startPaymentsTransition(() => {
      void apiFetch<FinancePaymentsPayload>(
        buildPaymentsQuery(paymentsFrom, paymentsStatus, paymentsSource, payListPage),
      )
        .then((payload) => {
          if (paymentsRequestId.current !== nextRequestId) return;
          setPaymentsPayload(payload);
        })
        .catch(() => {
          if (paymentsRequestId.current === nextRequestId) {
            setError(t("loadFailed"));
          }
        });
    });
  }, [payListPage.offset, payListPage.take, paymentsFrom, paymentsSource, paymentsStatus, t]);

  function updateFilter<K extends keyof UserFinanceFilters>(key: K, value: UserFinanceFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
    replaceSearchParams((params) => {
      resetListPageQuery(params, FINANCE_USER_PAGE_KEYS);
    });
  }

  function resetFilters() {
    setFilters(defaultFilters);
    replaceSearchParams((params) => {
      resetListPageQuery(params, FINANCE_USER_PAGE_KEYS);
    });
  }

  function refetchClients(): void {
    const params = new URLSearchParams({
      meta: "true",
      take: String(userListPage.take),
      offset: String(userListPage.offset),
    });
    void apiFetch<AdminClientsPayload>(`/clients?${params.toString()}`).then(setClientsPayload);
  }

  const loading = loadingClients || loadingPayments;

  return (
    <div className="space-y-4">
      <QuickFilters
        active={filters.quick}
        onChange={(value) => updateFilter("quick", value)}
        labels={{
          paid: t("quickPaid"),
          pending: t("quickPending"),
          overdue: t("quickOverdue"),
          giftCard: t("quickGiftCard"),
          active: t("quickActive"),
        }}
      />

      <div className="grid gap-2 rounded-2xl border border-white/60 bg-white/70 p-3 md:grid-cols-4 xl:grid-cols-5">
        <input
          className="ommm-input h-10 md:col-span-2"
          placeholder={t("searchPlaceholder")}
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
        />
        <OmmSelectDropdown
          ariaLabel={t("filterPaymentStatus")}
          label={t("filterPaymentStatus")}
          value={filters.paymentStatus || "all"}
          onChange={(value) => updateFilter("paymentStatus", value === "all" ? "" : value)}
          options={[
            { value: "all", label: t("filterAll") },
            { value: "paid", label: t("statusPaid") },
            { value: "unpaid", label: t("statusUnpaid") },
            { value: "overdue", label: t("statusOverdue") },
            { value: "partial", label: t("statusPartial") },
          ]}
        />
        <OmmSelectDropdown
          ariaLabel={t("sortLabel")}
          label={t("sortLabel")}
          value={filters.order}
          onChange={(value) => updateFilter("order", value)}
          options={[
            { value: "newest", label: t("sortNewest") },
            { value: "oldest", label: t("sortOldest") },
            { value: "highest-lifetime-value", label: t("sortHighestCost") },
            { value: "lowest-lifetime-value", label: t("sortLowestCost") },
          ]}
        />
        <label className="flex items-center gap-2 self-end pb-2 text-xs text-sage-700">
          <input
            type="checkbox"
            checked={filters.giftCardOnly}
            onChange={(event) => updateFilter("giftCardOnly", event.target.checked)}
          />
          {t("giftCardOnly")}
        </label>
      </div>

      <AdminFilterResetBar onReset={resetFilters} label={t("clearFilters")} />
      {error ? <div className="app-alert-warn">{error}</div> : null}
      {loading ? <p className="text-sm text-sage-500">{t("loading")}</p> : null}
      <p className="text-xs text-sage-500">{t("rowCount", { count: clientsPayload.pagination.total })}</p>

      <div className={ADMIN_FINANCE_USER_LIST_TABLE_CLASS}>
        <div className={ADMIN_FINANCE_USER_LIST_HEADER_CLASS}>
          <span>{t("colUser")}</span>
          <span className={ADMIN_FINANCE_USER_LIST_EMPHASIZED_HEADER}>{t("colPaymentStatus")}</span>
          <span className={ADMIN_FINANCE_USER_LIST_EMPHASIZED_HEADER}>{t("colGiftCard")}</span>
          <span aria-hidden="true" />
          <span className={ADMIN_FINANCE_USER_LIST_ACTIONS_HEADER_CELL}>{t("colActions")}</span>
        </div>
        {filteredRows.length === 0 ? (
          <p className="rounded-[24px] border border-white/80 bg-white/95 px-5 py-8 text-center text-sm text-sage-600">
            {t("empty")}
          </p>
        ) : (
          filteredRows.map((row) => (
            <AdminFinanceUserCompactRow
              key={row.id}
              row={row}
              onEdit={() => setSelected(row)}
              onChanged={refetchClients}
            />
          ))
        )}
      </div>

      <OmmListPagination
        total={clientsPayload.pagination.total}
        page={userListPage.page}
        pageSize={userListPage.pageSize}
        offset={clientsPayload.pagination.offset}
        onPageChange={(page) => setUserListPage(page)}
        onPageSizeChange={(pageSize) => setUserListPage(1, pageSize)}
        disabled={loadingClients}
      />

      <section className="space-y-2">
        <h3 className="text-base font-semibold text-sage-900">{t("billingHistory")}</h3>
        <p className="text-xs text-sage-500">{t("billingHint")}</p>
        <BillingHistoryTable items={paymentsPayload.items} locale={locale} />
        <OmmListPagination
          total={paymentsPayload.total}
          page={payListPage.page}
          pageSize={payListPage.pageSize}
          offset={paymentsPayload.offset}
          onPageChange={(page) => setPayListPage(page)}
          onPageSizeChange={(pageSize) => setPayListPage(1, pageSize)}
          disabled={loadingPayments}
        />
      </section>

      <AdminClientDrawer
        client={selected}
        locale={locale}
        onClose={() => setSelected(null)}
        onChanged={refetchClients}
      />
    </div>
  );
}

function QuickFilters(props: {
  active: string;
  onChange: (value: string) => void;
  labels: Record<string, string>;
}) {
  const entries = [
    ["paid", props.labels.paid],
    ["pending", props.labels.pending],
    ["overdue", props.labels.overdue],
    ["gift-card", props.labels.giftCard],
    ["active", props.labels.active],
  ] as const;

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([value, label]) => (
        <OmmButton
          key={value}
          size="sm"
          variant={props.active === value ? "primary" : "ghost"}
          onClick={() => props.onChange(props.active === value ? "" : value)}
        >
          {label}
        </OmmButton>
      ))}
    </div>
  );
}

function BillingHistoryTable({
  items,
  locale,
}: {
  items: FinancePaymentItem[];
  locale: string;
}) {
  const t = useTranslations("adminPages.finance.table");
  const tMethods = useTranslations("adminPages.finance.paymentMethods");

  if (items.length === 0) {
    return <p className="text-sm text-sage-600">{t("empty")}</p>;
  }

  return (
    <div className={adminChrome.tableWrap}>
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <thead className={adminChrome.thead}>
          <tr>
            <th className={adminChrome.th}>{t("colDate")}</th>
            <th className={adminChrome.th}>{t("colUser")}</th>
            <th className={adminChrome.th}>{t("colAmount")}</th>
            <th className={adminChrome.th}>{t("colPaymentMethod")}</th>
            <th className={adminChrome.th}>{t("colSource")}</th>
            <th className={adminChrome.th}>{t("colStatus")}</th>
            <th className={adminChrome.th}>{t("colActions")}</th>
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
