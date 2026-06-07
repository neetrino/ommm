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
import { AdminClientDrawer } from "@/components/admin/admin-client-drawer";
import { AdminClientCompactRow } from "@/components/admin/admin-client-compact-row";
import {
  ADMIN_CLIENTS_LIST_ACTIONS_HEADER_CELL,
  ADMIN_CLIENTS_LIST_EMPHASIZED_HEADER,
  ADMIN_CLIENTS_LIST_HEADER_CLASS,
  ADMIN_CLIENTS_LIST_TABLE_CLASS,
  ADMIN_CLIENTS_LIST_TABLE_READONLY_CLASS,
} from "@/components/admin/admin-clients-list-layout";
import {
  adminClientsFilterValuesFromState,
  buildAdminClientsFilterFields,
  segmentFilterOptions,
  serializeAdminClientSegmentFilters,
} from "@/components/admin/admin-clients-filter-fields";
import {
  parseAdminClientSegmentFilters,
  type AdminClientSegmentFilter,
} from "@/components/admin/admin-clients-segment-filters";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { adminChrome } from "@/components/admin/admin-chrome";
import { OmmFilterMultiSelect } from "@/components/ui/omm-filter-multi-select";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import {
  OmmSelectDropdown,
  ommOptionsFromTuples,
} from "@/components/ui/omm-select-dropdown";
import { apiFetch } from "@/lib/api";
import {
  parseListPageParams,
  resetListPageQuery,
  syncListPageQuery,
} from "@/lib/list-pagination";
import { formatAmdFromCents } from "@/lib/price-amd";
import {
  ADMIN_CLIENTS_FILTER_KEYS,
  areUrlSearchQueriesEqual,
  mergeAdminClientsUrlQuery,
  VIEW_CLIENT_QUERY_KEY,
} from "@/components/admin/admin-clients-query";
import type { AdminClientsPayload, ClientRow } from "./admin-clients-types";

type Props = {
  initial: AdminClientsPayload;
  locale: string;
  initialFilters: Record<string, string>;
  /** Staff surfaces (manager): list canon without hero/filters/summary. */
  variant?: "full" | "staff";
  staffBanner?: string;
  readOnly?: boolean;
};

const filterKeys = ADMIN_CLIENTS_FILTER_KEYS;

export function AdminClientsManagement({
  initial,
  locale,
  initialFilters,
  variant = "full",
  staffBanner,
  readOnly = false,
}: Props) {
  const isStaff = variant === "staff";
  const t = useTranslations("adminPages.clients");
  const tFilters = useTranslations("adminPages.clients.filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsStringRef = useRef(searchParams.toString());
  const hasMounted = useRef(false);
  const requestId = useRef(0);
  const [payload, setPayload] = useState(initial);
  const [filters, setFilters] = useState(() => ({
    search: initialFilters.search ?? "",
    tag: initialFilters.tag ?? "",
    status: initialFilters.status ?? "",
    classLevel: initialFilters.classLevel ?? "",
    paymentStatus: initialFilters.paymentStatus ?? "",
    source: initialFilters.source ?? "",
    preferredCoachId: initialFilters.preferredCoachId ?? "",
    attendance: initialFilters.attendance ?? "",
    birthdayMonth: initialFilters.birthdayMonth ?? "",
    order: initialFilters.order ?? "newest",
    quick: initialFilters.quick ?? "",
  }));
  const [fetchedClient, setFetchedClient] = useState<ClientRow | null>(null);
  const [loading, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const viewClientId = searchParams.get(VIEW_CLIENT_QUERY_KEY);
  const [visibleClientId, setVisibleClientId] = useState<string | null>(viewClientId);
  const [prevViewClientId, setPrevViewClientId] = useState(viewClientId);
  if (viewClientId !== prevViewClientId) {
    setPrevViewClientId(viewClientId);
    setVisibleClientId(viewClientId);
  }
  const listPage = useMemo(
    () => parseListPageParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  useEffect(() => {
    searchParamsStringRef.current = searchParams.toString();
  }, [searchParams]);

  const selected = useMemo(() => {
    if (visibleClientId === null) {
      return null;
    }
    const fromRows = payload.rows.find((row) => row.id === visibleClientId);
    if (fromRows) {
      return fromRows;
    }
    if (fetchedClient?.id === visibleClientId) {
      return fetchedClient;
    }
    return null;
  }, [fetchedClient, payload.rows, visibleClientId]);

  const replaceSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParamsStringRef.current);
      mutator(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const selectClient = useCallback(
    (row: ClientRow) => {
      setVisibleClientId(row.id);
      replaceSearchParams((params) => {
        params.set(VIEW_CLIENT_QUERY_KEY, row.id);
      });
    },
    [replaceSearchParams],
  );

  const closeClientView = useCallback(() => {
    setVisibleClientId(null);
    replaceSearchParams((params) => {
      params.delete(VIEW_CLIENT_QUERY_KEY);
    });
  }, [replaceSearchParams]);

  const restoredViewClientIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!viewClientId) {
      restoredViewClientIdRef.current = null;
      return undefined;
    }

    const fromRows = payload.rows.find((row) => row.id === viewClientId);
    if (fromRows) {
      restoredViewClientIdRef.current = viewClientId;
      return undefined;
    }

    if (restoredViewClientIdRef.current === viewClientId) {
      return undefined;
    }

    restoredViewClientIdRef.current = viewClientId;
    let cancelled = false;

    void apiFetch<{ activity: ClientRow }>(`/clients/${viewClientId}`)
      .then((detail) => {
        if (!cancelled) {
          setFetchedClient(detail.activity);
        }
      })
      .catch(() => {
        if (!cancelled) {
          restoredViewClientIdRef.current = null;
          replaceSearchParams((params) => {
            params.delete(VIEW_CLIENT_QUERY_KEY);
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [payload.rows, replaceSearchParams, viewClientId]);

  const urlQueryString = useMemo(() => {
    const params = new URLSearchParams();
    for (const key of filterKeys) {
      const value = filters[key].trim();
      if (value !== "" && !(key === "order" && value === "newest")) {
        params.set(key, value);
      }
    }
    return params.toString();
  }, [filters]);

  const apiQueryString = useMemo(() => {
    const params = new URLSearchParams(urlQueryString);
    params.set("meta", "true");
    params.set("take", String(listPage.take));
    params.set("offset", String(listPage.offset));
    return params.toString();
  }, [listPage.offset, listPage.take, urlQueryString]);

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

    const handle = window.setTimeout(() => {
      const nextRequestId = requestId.current + 1;
      requestId.current = nextRequestId;
      startTransition(() => {
        void apiFetch<AdminClientsPayload>(`/clients?${apiQueryString}`)
          .then((next) => {
            if (requestId.current !== nextRequestId) return;
            setPayload(next);
            setError(null);
          })
          .catch(() => {
            if (requestId.current === nextRequestId) {
              setError("Could not load matching clients.");
            }
          });
      });
      const currentQuery = searchParamsStringRef.current;
      const nextQuery = mergeAdminClientsUrlQuery(
        urlQueryString,
        Object.fromEntries(new URLSearchParams(currentQuery)),
      );
      if (!areUrlSearchQueriesEqual(currentQuery, nextQuery)) {
        const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
        routerRef.current.replace(nextUrl, { scroll: false });
      }
    }, 300);
    return () => window.clearTimeout(handle);
  }, [apiQueryString, listPage.offset, listPage.page, pathname, urlQueryString]);

  const handleClientChanged = useCallback(() => {
    routerRef.current.refresh();
  }, []);

  function updateFilter(key: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
    replaceSearchParams((params) => {
      resetListPageQuery(params);
    });
  }

  function refetchClients(): void {
    startTransition(() => {
      void apiFetch<AdminClientsPayload>(`/clients?${apiQueryString}`)
        .then((next) => {
          setPayload(next);
          setError(null);
        })
        .catch(() => {
          setError("Could not load matching clients.");
        });
    });
  }

  function resetFilters() {
    setFilters({
      search: "",
      tag: "",
      status: "",
      classLevel: "",
      paymentStatus: "",
      source: "",
      preferredCoachId: "",
      attendance: "",
      birthdayMonth: "",
      order: "newest",
      quick: "",
    });
    replaceSearchParams((params) => {
      resetListPageQuery(params);
    });
  }

  const segmentOptions = useMemo(
    () =>
      segmentFilterOptions.map(([value, label]) => ({
        value,
        label,
      })),
    [],
  );

  const filterFields = useMemo(
    () =>
      buildAdminClientsFilterFields({
        payload,
        resolveOrderChipLabel: orderLabel,
        renderSegments: ({ value, onChange }) => (
          <OmmFilterMultiSelect
            variant="accent"
            wrapLabel
            ariaLabel="Client segment filters"
            allLabel="All clients"
            selectedValues={parseAdminClientSegmentFilters(value)}
            onChange={(values) =>
              onChange(
                serializeAdminClientSegmentFilters(values as AdminClientSegmentFilter[]),
              )
            }
            formatSelectedCount={(count) =>
              count === 1 ? "1 segment selected" : `${count} segments selected`
            }
            options={segmentOptions}
          />
        ),
        renderOrder: ({ value, onChange }) => (
          <OmmSelectDropdown
            ariaLabel={tFilters("orderLabel")}
            label={orderLabel(value)}
            value={value}
            options={ommOptionsFromTuples([
              ["newest", "Newest clients first"],
              ["oldest", "Oldest clients first"],
              ["most-active", "Most active"],
              ["highest-lifetime-value", "Highest lifetime value"],
              ["last-visit-newest", "Last visit newest"],
              ["last-visit-oldest", "Last visit oldest"],
              ["most-bookings", "Most bookings"],
              ["most-cancellations", "Most cancellations"],
            ])}
            onChange={onChange}
          />
        ),
      }),
    [payload, segmentOptions, tFilters],
  );

  const integratedFilterValues = useMemo(
    () => adminClientsFilterValuesFromState(filters),
    [filters],
  );

  function handleIntegratedFilterChange(key: string, value: string) {
    updateFilter(key as keyof typeof filters, value);
  }

  const clientsList = (
    <>
      <ClientsTable
        rows={payload.rows}
        onSelect={selectClient}
        onChanged={refetchClients}
        readOnly={readOnly || isStaff}
      />
      <OmmListPagination
        total={payload.pagination.total}
        page={listPage.page}
        pageSize={listPage.pageSize}
        offset={payload.pagination.offset}
        onPageChange={(nextPage) => setListPage(nextPage)}
        onPageSizeChange={(nextSize) => setListPage(1, nextSize)}
        disabled={loading}
      />
      {payload.rows.length === 0 ? (
        <div className="rounded-2xl border border-white/60 bg-white/70 p-6 text-sm text-sage-600">
          {t("emptyList")}
        </div>
      ) : null}
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      {isStaff ? (
        <StaffListPageLayout
          title={t("title")}
          banner={staffBanner}
          search={
            <ListPageSearchFilters
              search={filters.search}
              onSearchChange={(value) => updateFilter("search", value)}
              searchPlaceholder={tFilters("searchPlaceholder")}
              fields={filterFields}
              filterValues={integratedFilterValues}
              onFilterChange={handleIntegratedFilterChange}
              onClearAll={resetFilters}
              resetLabel={tFilters("resetFilters")}
            />
          }
          metrics={<Summary payload={payload} locale={locale} />}
          status={error ? <div className="app-alert-warn">{error}</div> : null}
        >
          {clientsList}
        </StaffListPageLayout>
      ) : (
        <>
          <AdminPageHero
            title={t("title")}
            search={
              <ListPageSearchFilters
                search={filters.search}
                onSearchChange={(value) => updateFilter("search", value)}
                searchPlaceholder={tFilters("searchPlaceholder")}
                fields={filterFields}
                filterValues={integratedFilterValues}
                onFilterChange={handleIntegratedFilterChange}
                onClearAll={resetFilters}
                resetLabel={tFilters("resetFilters")}
              />
            }
          />
          <Summary payload={payload} locale={locale} />
          {error ? <div className="app-alert-warn">{error}</div> : null}
          {clientsList}
        </>
      )}
      <AdminClientDrawer
        client={selected}
        locale={locale}
        onClose={closeClientView}
        onChanged={handleClientChanged}
      />
    </div>
  );
}

function Summary({ payload, locale }: { payload: AdminClientsPayload; locale: string }) {
  const cards = [
    ["Total", payload.summary.total],
    ["Active", payload.summary.active],
    ["VIP", payload.summary.vip],
    ["At risk", payload.summary.atRisk],
    ["Visits", payload.summary.totalVisits],
    ["Lifetime value", formatAmdFromCents(payload.summary.lifetimeValueCents, locale)],
  ];
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {cards.map(([label, value]) => (
        <article key={label} className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{label}</p>
          <p className={adminChrome.metricValue}>{value}</p>
        </article>
      ))}
    </section>
  );
}

function orderLabel(order: string): string {
  const labels: Record<string, string> = {
    newest: "Newest clients first",
    oldest: "Oldest clients first",
    "most-active": "Most active",
    "highest-lifetime-value": "Highest lifetime value",
    "last-visit-newest": "Last visit newest",
    "last-visit-oldest": "Last visit oldest",
    "most-bookings": "Most bookings",
    "most-cancellations": "Most cancellations",
  };
  return labels[order] ?? "Newest clients first";
}

function ClientsTable({
  rows,
  onSelect,
  onChanged,
  readOnly = false,
}: {
  rows: ClientRow[];
  onSelect: (row: ClientRow) => void;
  onChanged: () => void;
  readOnly?: boolean;
}) {
  const t = useTranslations("adminPages.clients");
  const tableClass = readOnly
    ? ADMIN_CLIENTS_LIST_TABLE_READONLY_CLASS
    : ADMIN_CLIENTS_LIST_TABLE_CLASS;

  return (
    <div className={tableClass}>
      <div className={ADMIN_CLIENTS_LIST_HEADER_CLASS}>
        <span>{t("colName")}</span>
        <span className={ADMIN_CLIENTS_LIST_EMPHASIZED_HEADER}>{t("fieldBirthday")}</span>
        <span className={ADMIN_CLIENTS_LIST_EMPHASIZED_HEADER}>{t("colTags")}</span>
        <span className={ADMIN_CLIENTS_LIST_EMPHASIZED_HEADER}>{t("colJoined")}</span>
        {readOnly ? null : (
          <>
            <span aria-hidden="true" />
            <span className={ADMIN_CLIENTS_LIST_ACTIONS_HEADER_CELL}>{t("colActions")}</span>
          </>
        )}
      </div>
      {rows.map((row) => (
        <AdminClientCompactRow
          key={row.id}
          row={row}
          onSelect={onSelect}
          onChanged={onChanged}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
