"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminClientDrawer } from "@/components/admin/admin-client-drawer";
import { AdminClientRowActions } from "@/components/admin/admin-client-row-actions";
import {
  parseAdminClientSegmentFilters,
  serializeAdminClientSegmentFilters,
  type AdminClientSegmentFilter,
} from "@/components/admin/admin-clients-segment-filters";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminFilterResetBar } from "@/components/ui/admin-filter-reset-bar";
import { OmmFilterMultiSelect } from "@/components/ui/omm-filter-multi-select";
import {
  OmmFilterDropdown,
  OmmSelectDropdown,
  ommOptionsFromTuples,
} from "@/components/ui/omm-select-dropdown";
import { apiFetch } from "@/lib/api";
import { formatDateForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import {
  ADMIN_CLIENTS_FILTER_KEYS,
  mergeAdminClientsUrlQuery,
  VIEW_CLIENT_QUERY_KEY,
} from "@/components/admin/admin-clients-query";
import type { AdminClientsPayload, ClientDetail, ClientRow } from "./admin-clients-types";

type Props = {
  initial: AdminClientsPayload;
  locale: string;
  initialFilters: Record<string, string>;
};

const filterKeys = ADMIN_CLIENTS_FILTER_KEYS;

const segmentFilterOptions: ReadonlyArray<readonly [AdminClientSegmentFilter, string]> = [
  ["new", "New Clients"],
  ["vip", "VIP Clients"],
  ["at-risk", "At Risk Clients"],
  ["unpaid", "Unpaid Clients"],
  ["birthday-this-month", "Birthday This Month"],
  ["inactive-30-days", "Inactive 30+ Days"],
  ["no-show", "No-show Clients"],
];

export function AdminClientsManagement({ initial, locale, initialFilters }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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

  const selected = useMemo(() => {
    if (!viewClientId) {
      return null;
    }
    const fromRows = payload.rows.find((row) => row.id === viewClientId);
    if (fromRows) {
      return fromRows;
    }
    if (fetchedClient?.id === viewClientId) {
      return fetchedClient;
    }
    return null;
  }, [fetchedClient, payload.rows, viewClientId]);

  const replaceSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutator(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const selectClient = useCallback(
    (row: ClientRow) => {
      replaceSearchParams((params) => {
        params.set(VIEW_CLIENT_QUERY_KEY, row.id);
      });
    },
    [replaceSearchParams],
  );

  const closeClientView = useCallback(() => {
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

    void apiFetch<ClientDetail>(`/clients/${viewClientId}`)
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
    return params.toString();
  }, [urlQueryString]);

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
      const currentQuery = window.location.search.replace(/^\?/, "");
      const nextQuery = mergeAdminClientsUrlQuery(
        urlQueryString,
        Object.fromEntries(new URLSearchParams(window.location.search)),
      );
      if (currentQuery !== nextQuery) {
        const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
        router.replace(nextUrl, { scroll: false });
      }
    }, 300);
    return () => window.clearTimeout(handle);
  }, [apiQueryString, pathname, router, urlQueryString]);

  function updateFilter(key: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
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
  }

  const activeFilterCount = useMemo(() => countActiveClientFilters(filters), [filters]);

  return (
    <div className="flex flex-col gap-6">
      <Summary payload={payload} locale={locale} />
      <FiltersPanel
        filters={filters}
        payload={payload}
        loading={loading}
        activeFilterCount={activeFilterCount}
        onChange={updateFilter}
        onReset={resetFilters}
      />
      {error ? <div className="app-alert-warn">{error}</div> : null}
      <ClientsTable
        rows={payload.rows}
        onSelect={selectClient}
        onChanged={refetchClients}
      />
      {payload.rows.length === 0 ? (
        <div className="rounded-2xl border border-white/60 bg-white/70 p-6 text-sm text-sage-600">
          No clients match the current search and filters.
        </div>
      ) : null}
      <AdminClientDrawer
        client={selected}
        locale={locale}
        onClose={closeClientView}
        onChanged={() => router.refresh()}
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

function countActiveClientFilters(
  filters: Record<(typeof filterKeys)[number], string>,
): number {
  return [
    filters.search.trim(),
    filters.tag,
    filters.status,
    filters.classLevel,
    filters.paymentStatus,
    filters.source,
    filters.preferredCoachId,
    filters.attendance,
    filters.birthdayMonth,
    filters.order !== "newest" ? filters.order : "",
    filters.quick.trim() ? "quick" : "",
  ].filter(Boolean).length;
}

function FilterField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 text-xs text-sage-700 ${className}`}>
      <span>{label}</span>
      {children}
    </div>
  );
}

function FiltersPanel(props: {
  filters: Record<(typeof filterKeys)[number], string>;
  payload: AdminClientsPayload;
  loading: boolean;
  activeFilterCount: number;
  onChange: (key: (typeof filterKeys)[number], value: string) => void;
  onReset: () => void;
}) {
  const t = useTranslations("adminPages.clients.filters");
  const selectedSegments = useMemo(
    () => parseAdminClientSegmentFilters(props.filters.quick),
    [props.filters.quick],
  );
  const segmentOptions = useMemo(
    () =>
      segmentFilterOptions.map(([value, label]) => ({
        value,
        label,
      })),
    [],
  );

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/70 p-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
        <FilterField label={t("searchLabel")} className="sm:col-span-2 xl:col-span-2">
          <input
            className="ommm-input h-10"
            placeholder="Search name, phone, email, client ID"
            value={props.filters.search}
            onChange={(event) => props.onChange("search", event.target.value)}
            aria-label={t("searchLabel")}
          />
        </FilterField>
        <FilterField label="Badge">
          <FilterSelect
            value={props.filters.tag}
            onChange={(value) => props.onChange("tag", value)}
            options={[
              ["", "All badges"],
              ["vip", "VIP"],
              ["new", "New"],
              ["at-risk", "At Risk"],
              ["beginner", "Beginner"],
            ]}
            ariaLabel="Badge"
          />
        </FilterField>
        <FilterField label="Status">
          <FilterSelect
            value={props.filters.status}
            onChange={(value) => props.onChange("status", value)}
            options={[
              ["", "All statuses"],
              ["active", "Active"],
              ["inactive", "Inactive"],
              ["frozen", "Frozen"],
              ["blocked", "Blocked"],
            ]}
            ariaLabel="Status"
          />
        </FilterField>
        <FilterField label="Payment">
          <FilterSelect
            value={props.filters.paymentStatus}
            onChange={(value) => props.onChange("paymentStatus", value)}
            options={[
              ["", "All payments"],
              ["paid", "Paid"],
              ["unpaid", "Unpaid"],
              ["overdue", "Overdue"],
              ["partial", "Partial"],
            ]}
            ariaLabel="Payment"
          />
        </FilterField>
        <FilterField label="Source">
          <FilterSelect
            value={props.filters.source}
            onChange={(value) => props.onChange("source", value)}
            options={[
              ["", "All sources"],
              ["website", "Website"],
              ["mobile-app", "Mobile App"],
              ["admin", "Admin"],
              ["instagram", "Instagram"],
              ["referral", "Referral"],
            ]}
            ariaLabel="Source"
          />
        </FilterField>
        <FilterField label="Attendance">
          <FilterSelect
            value={props.filters.attendance}
            onChange={(value) => props.onChange("attendance", value)}
            options={[
              ["", "All attendance"],
              ["regular", "Regular"],
              ["no-show", "No-show"],
              ["often-cancels", "Often cancels"],
              ["low-attendance", "Low attendance"],
            ]}
            ariaLabel="Attendance"
          />
        </FilterField>
        <FilterField label="Birthday month">
          <FilterSelect
            value={props.filters.birthdayMonth}
            onChange={(value) => props.onChange("birthdayMonth", value)}
            options={monthOptions()}
            ariaLabel="Birthday month"
          />
        </FilterField>
        <FilterField label="Class level">
          <FilterSelect
            value={props.filters.classLevel}
            onChange={(value) => props.onChange("classLevel", value)}
            options={[
              ["", "All levels"],
              ["beginner", "Beginner"],
              ["intermediate", "Intermediate"],
              ["advanced", "Advanced"],
              ...props.payload.filterOptions.classLevels.map(
                (level) => [level, level] as const,
              ),
            ]}
            ariaLabel="Class level"
          />
        </FilterField>
        <FilterField label="Preferred coach">
          <FilterSelect
            value={props.filters.preferredCoachId}
            onChange={(value) => props.onChange("preferredCoachId", value)}
            options={[
              ["", "All coaches"],
              ...props.payload.filterOptions.preferredCoaches.map(
                (coach) => [coach.id, coach.name] as const,
              ),
            ]}
            ariaLabel="Preferred coach"
          />
        </FilterField>
        <FilterField label={t("orderLabel")}>
          <OmmSelectDropdown
            ariaLabel={t("orderLabel")}
            label={orderLabel(props.filters.order)}
            value={props.filters.order}
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
            onChange={(value) => props.onChange("order", value)}
          />
        </FilterField>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <FilterField label="Client segments" className="w-full min-w-[14rem] max-w-sm shrink-0">
          <OmmFilterMultiSelect
            variant="accent"
            wrapLabel
            ariaLabel="Client segment filters"
            allLabel="All clients"
            selectedValues={selectedSegments}
            onChange={(values) =>
              props.onChange(
                "quick",
                serializeAdminClientSegmentFilters(values as AdminClientSegmentFilter[]),
              )
            }
            formatSelectedCount={(count) =>
              count === 1 ? "1 segment selected" : `${count} segments selected`
            }
            options={segmentOptions}
          />
        </FilterField>
        <AdminFilterResetBar
          onReset={props.onReset}
          label={t("resetFilters")}
          meta={
            <p className="whitespace-nowrap text-xs text-sage-500" role="status">
              {props.loading
                ? "Loading matching clients..."
                : `${props.activeFilterCount} active filters`}
            </p>
          }
        />
      </div>
    </div>
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

function FilterSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<readonly [string, string]>;
  ariaLabel: string;
}) {
  const allLabel = options.find(([optionValue]) => optionValue === "")?.[1] ?? "All";
  const dropdownOptions = options
    .filter(([optionValue]) => optionValue !== "")
    .map(([optionValue, label]) => ({ value: optionValue, label }));

  return (
    <OmmFilterDropdown
      allValue=""
      value={value}
      ariaLabel={ariaLabel}
      allLabel={allLabel}
      onChange={onChange}
      options={dropdownOptions}
    />
  );
}

function ClientsTable({
  rows,
  onSelect,
  onChanged,
}: {
  rows: ClientRow[];
  onSelect: (row: ClientRow) => void;
  onChanged: () => void;
}) {
  const t = useTranslations("adminPages.clients");

  return (
    <div className={adminChrome.tableWrap}>
      <table className={`${adminChrome.table} table-fixed min-w-[60rem]`}>
        <colgroup>
          <col className="w-[36%]" />
          <col className="w-[16%]" />
          <col className="w-[16%]" />
          <col className="w-[16%]" />
          <col className="w-[16%]" />
        </colgroup>
        <thead className={adminChrome.thead}>
          <tr>
            <th className={adminChrome.th}>{t("title")}</th>
            <th className={`${adminChrome.th} text-center`}>Date of birth</th>
            <th className={`${adminChrome.th} text-center`}>Register date</th>
            <th className={`${adminChrome.th} text-center`}>Notes</th>
            <th className={`${adminChrome.th} text-center`}>{t("colActions")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <ClientTableRow
              key={row.id}
              row={row}
              rowDivider={index < rows.length - 1 ? adminChrome.tableRowDivider : ""}
              onSelect={onSelect}
              onChanged={onChanged}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ClientTableRow({
  row,
  rowDivider,
  onSelect,
  onChanged,
}: {
  row: ClientRow;
  rowDivider: string;
  onSelect: (row: ClientRow) => void;
  onChanged: () => void;
}) {
  return (
    <tr>
      <td className={`${adminChrome.tdStrong} ${rowDivider}`}>
        <div className="flex items-center gap-3">
          <ClientAvatar row={row} />
          <div className="min-w-0">
            <button
              type="button"
              className="break-words text-left underline decoration-sage-300 underline-offset-4"
              onClick={() => onSelect(row)}
            >
              {fullName(row)}
            </button>
            <div className="break-words text-xs font-normal text-sage-500">
              {row.phone ?? "—"}
            </div>
            {row.tags.length > 0 ? (
              <div className="mt-1 flex flex-wrap gap-1">
                {row.tags.map((tag) => (
                  <ClientBadge key={tag} label={tag} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </td>
      <td className={`${adminChrome.td} text-center ${rowDivider}`}>
        {row.dateOfBirth ? formatDateForUi(row.dateOfBirth) : "—"}
      </td>
      <td className={`${adminChrome.td} text-center ${rowDivider}`}>
        {formatDateForUi(row.createdAt)}
      </td>
      <td className={`${adminChrome.td} text-center ${rowDivider}`}>
        {row.noteCount}
        {row.latestNote ? (
          <div className="truncate text-xs text-sage-500">{row.latestNote.body}</div>
        ) : null}
      </td>
      <td className={`${adminChrome.td} text-center ${rowDivider}`}>
        <div className="flex justify-center">
          <AdminClientRowActions client={row} onChanged={onChanged} />
        </div>
      </td>
    </tr>
  );
}

function ClientAvatar({ row }: { row: ClientRow }) {
  const src = resolveApiAssetUrl(row.avatarUrl);
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
        unoptimized
      />
    );
  }
  const initials = fullName(row)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-100 text-sm font-semibold text-sage-800">
      {initials || "?"}
    </div>
  );
}

function ClientBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full border border-mint-200 bg-mint-50 px-2 py-0.5 text-xs text-sage-900">
      {label}
    </span>
  );
}

function fullName(row: { name: string | null; lastName: string | null; email: string }) {
  return [row.name, row.lastName].filter(Boolean).join(" ").trim() || row.email;
}

function monthOptions(): ReadonlyArray<readonly [string, string]> {
  return [["", "Any birthday month"], ...Array.from({ length: 12 }, (_, index) => [`${index + 1}`, new Intl.DateTimeFormat("en", { month: "long" }).format(new Date(2026, index, 1))] as const)];
}
