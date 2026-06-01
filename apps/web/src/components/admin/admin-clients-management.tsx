"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminClientDrawer } from "@/components/admin/admin-client-drawer";
import { AdminClientRowActions } from "@/components/admin/admin-client-row-actions";
import { adminChrome } from "@/components/admin/admin-chrome";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmSelectDropdown, ommOptionsFromTuples } from "@/components/ui/omm-select-dropdown";
import { apiFetch } from "@/lib/api";
import { formatDateForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import {
  ADMIN_CLIENTS_FILTER_KEYS,
  mergeAdminClientsUrlQuery,
  VIEW_CLIENT_QUERY_KEY,
} from "@/components/admin/admin-clients-query";
import type { AdminClientsPayload, ClientDetail, ClientRow, PackageOption } from "./admin-clients-types";

type Props = {
  initial: AdminClientsPayload;
  packages: PackageOption[];
  locale: string;
  initialFilters: Record<string, string>;
};

const filterKeys = ADMIN_CLIENTS_FILTER_KEYS;

const quickFilters = [
  ["new", "New Clients"],
  ["vip", "VIP Clients"],
  ["at-risk", "At Risk Clients"],
  ["unpaid", "Unpaid Clients"],
  ["birthday-this-month", "Birthday This Month"],
  ["inactive-30-days", "Inactive 30+ Days"],
  ["no-show", "No-show Clients"],
] as const;

export function AdminClientsManagement({ initial, packages, locale, initialFilters }: Props) {
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
    packageType: initialFilters.packageType ?? "",
    classLevel: initialFilters.classLevel ?? "",
    paymentStatus: initialFilters.paymentStatus ?? "",
    source: initialFilters.source ?? "",
    preferredCoachId: initialFilters.preferredCoachId ?? "",
    attendance: initialFilters.attendance ?? "",
    birthdayMonth: initialFilters.birthdayMonth ?? "",
    order: initialFilters.order ?? "newest",
    quick: initialFilters.quick ?? "",
  }));
  const [selected, setSelected] = useState<ClientRow | null>(null);
  const [loading, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const viewClientId = searchParams.get(VIEW_CLIENT_QUERY_KEY);

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
      setSelected(row);
      replaceSearchParams((params) => {
        params.set(VIEW_CLIENT_QUERY_KEY, row.id);
      });
    },
    [replaceSearchParams],
  );

  const closeClientView = useCallback(() => {
    setSelected(null);
    replaceSearchParams((params) => {
      params.delete(VIEW_CLIENT_QUERY_KEY);
    });
  }, [replaceSearchParams]);

  const restoredViewClientIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!viewClientId) {
      restoredViewClientIdRef.current = null;
      setSelected(null);
      return undefined;
    }

    const fromRows = payload.rows.find((row) => row.id === viewClientId);
    if (fromRows) {
      restoredViewClientIdRef.current = viewClientId;
      setSelected(fromRows);
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
          setSelected(detail.activity);
        }
      })
      .catch(() => {
        if (!cancelled) {
          restoredViewClientIdRef.current = null;
          setSelected(null);
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
      packageType: "",
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

  return (
    <div className="space-y-4">
      <Summary payload={payload} locale={locale} />
      <QuickFilters active={filters.quick} onChange={(value) => updateFilter("quick", value)} />
      <Filters
        filters={filters}
        payload={payload}
        onChange={updateFilter}
        onReset={resetFilters}
      />
      {error ? <div className="app-alert-warn">{error}</div> : null}
      {loading ? <p className="text-sm text-sage-500">Loading...</p> : null}
      <ClientsTable
        rows={payload.rows}
        locale={locale}
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
        packages={packages}
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
  return <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">{cards.map(([label, value]) => <div key={label} className={adminChrome.metricCard}><p className={adminChrome.metricLabel}>{label}</p><p className={adminChrome.metricValue}>{value}</p></div>)}</div>;
}

function QuickFilters({ active, onChange }: { active: string; onChange: (value: string) => void }) {
  return <div className="flex flex-wrap gap-2">{quickFilters.map(([value, label]) => <OmmButton key={value} size="sm" variant={active === value ? "primary" : "ghost"} onClick={() => onChange(active === value ? "" : value)}>{label}</OmmButton>)}</div>;
}

function Filters(props: {
  filters: Record<(typeof filterKeys)[number], string>;
  payload: AdminClientsPayload;
  onChange: (key: (typeof filterKeys)[number], value: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="grid gap-2 rounded-2xl border border-white/60 bg-white/70 p-3 md:grid-cols-4 xl:grid-cols-6">
      <input className="ommm-input h-10 md:col-span-2" placeholder="Search name, phone, email, client ID" value={props.filters.search} onChange={(event) => props.onChange("search", event.target.value)} />
      <Select value={props.filters.tag} onChange={(value) => props.onChange("tag", value)} options={[["", "All badges"], ["vip", "VIP"], ["new", "New"], ["at-risk", "At Risk"], ["beginner", "Beginner"]]} />
      <Select value={props.filters.status} onChange={(value) => props.onChange("status", value)} options={[["", "All statuses"], ["active", "Active"], ["inactive", "Inactive"], ["frozen", "Frozen"], ["blocked", "Blocked"]]} />
      <Select value={props.filters.packageType} onChange={(value) => props.onChange("packageType", value)} options={[["", "All packages"], ["single-class", "Single class"], ["monthly-package", "Monthly package"], ["vip-package", "VIP package"]]} />
      <Select value={props.filters.paymentStatus} onChange={(value) => props.onChange("paymentStatus", value)} options={[["", "All payments"], ["paid", "Paid"], ["unpaid", "Unpaid"], ["overdue", "Overdue"], ["partial", "Partial"]]} />
      <Select value={props.filters.source} onChange={(value) => props.onChange("source", value)} options={[["", "All sources"], ["website", "Website"], ["mobile-app", "Mobile App"], ["admin", "Admin"], ["instagram", "Instagram"], ["referral", "Referral"]]} />
      <Select value={props.filters.attendance} onChange={(value) => props.onChange("attendance", value)} options={[["", "All attendance"], ["regular", "Regular"], ["no-show", "No-show"], ["often-cancels", "Often cancels"], ["low-attendance", "Low attendance"]]} />
      <Select value={props.filters.birthdayMonth} onChange={(value) => props.onChange("birthdayMonth", value)} options={monthOptions()} />
      <Select value={props.filters.classLevel} onChange={(value) => props.onChange("classLevel", value)} options={[["", "All levels"], ["beginner", "Beginner"], ["intermediate", "Intermediate"], ["advanced", "Advanced"], ...props.payload.filterOptions.classLevels.map((level) => [level, level] as const)]} />
      <Select value={props.filters.preferredCoachId} onChange={(value) => props.onChange("preferredCoachId", value)} options={[["", "All coaches"], ...props.payload.filterOptions.preferredCoaches.map((coach) => [coach.id, coach.name] as const)]} />
      <Select value={props.filters.order} onChange={(value) => props.onChange("order", value)} options={[["newest", "Newest clients first"], ["oldest", "Oldest clients first"], ["most-active", "Most active"], ["highest-lifetime-value", "Highest lifetime value"], ["last-visit-newest", "Last visit newest"], ["last-visit-oldest", "Last visit oldest"], ["most-bookings", "Most bookings"], ["most-cancellations", "Most cancellations"]]} />
      <OmmButton size="sm" variant="subtle" onClick={props.onReset}>Clear filters</OmmButton>
    </div>
  );
}

function ClientsTable({
  rows,
  locale,
  onSelect,
  onChanged,
}: {
  rows: ClientRow[];
  locale: string;
  onSelect: (row: ClientRow) => void;
  onChanged: () => void;
}) {
  return (
    <div className={adminChrome.tableWrap}>
      <table className={`${adminChrome.table} table-fixed min-w-[72rem]`}>
        <colgroup>
          <col className="w-16" />
          <col className="w-[24%]" />
          <col className="w-[12%]" />
          <col className="w-[10%]" />
          <col className="w-[12%]" />
          <col className="w-[10%]" />
          <col className="w-32" />
        </colgroup>
        <thead className={adminChrome.thead}>
          <tr>
            <th className={adminChrome.th}>Photo</th>
            <th className={adminChrome.th}>Name / Phone</th>
            <th className={`${adminChrome.th} text-center`}>Date of birth</th>
            <th className={`${adminChrome.th} text-center`}>Sessions</th>
            <th className={`${adminChrome.th} text-center`}>Register date</th>
            <th className={`${adminChrome.th} text-center`}>Notes</th>
            <th className={`${adminChrome.th} text-center`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <ClientTableRow
              key={row.id}
              row={row}
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
  onSelect,
  onChanged,
}: {
  row: ClientRow;
  onSelect: (row: ClientRow) => void;
  onChanged: () => void;
}) {
  return (
    <tr className={adminChrome.tr}>
      <td className={adminChrome.td}>
        <Avatar row={row} />
      </td>
      <td className={adminChrome.tdStrong}>
        <button
          type="button"
          className="break-words text-left underline decoration-sage-300 underline-offset-4"
          onClick={() => onSelect(row)}
        >
          {fullName(row)}
        </button>
        <div className="break-words text-xs font-normal text-sage-500">{row.phone ?? "—"}</div>
        <div className="mt-1 flex flex-wrap gap-1">
          {row.tags.map((tag) => (
            <Badge key={tag} label={tag} />
          ))}
        </div>
      </td>
      <td className={`${adminChrome.tdMuted} text-center`}>
        {row.dateOfBirth ? formatDateForUi(row.dateOfBirth) : "—"}
      </td>
      <td className={`${adminChrome.td} text-center`}>{sessionText(row)}</td>
      <td className={`${adminChrome.tdMuted} text-center`}>
        {formatDateForUi(row.createdAt)}
      </td>
      <td className={`${adminChrome.td} text-center`}>
        {row.noteCount}
        {row.latestNote ? (
          <div className="truncate text-xs text-sage-500">{row.latestNote.body}</div>
        ) : null}
      </td>
      <td className={`${adminChrome.td} overflow-hidden text-center`}>
        <div className="mx-auto flex w-32 justify-center">
          <AdminClientRowActions client={row} onChanged={onChanged} />
        </div>
      </td>
    </tr>
  );
}

function Select({
  value,
  onChange,
  options,
  ariaLabel = "Filter",
}: {
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<readonly [string, string]>;
  ariaLabel?: string;
}) {
  const dropdownOptions = ommOptionsFromTuples(options);
  const selected = dropdownOptions.find((option) => option.value === value);

  return (
    <OmmSelectDropdown
      ariaLabel={ariaLabel}
      label={selected?.label ?? ariaLabel}
      value={value}
      options={dropdownOptions}
      onChange={onChange}
    />
  );
}

function Avatar({ row }: { row: ClientRow }) {
  const src = resolveApiAssetUrl(row.avatarUrl);
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 rounded-full object-cover"
        unoptimized
      />
    );
  }
  return <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sand-100 text-sm font-semibold text-sage-800">{fullName(row).slice(0, 2).toUpperCase()}</div>;
}

function Badge({ label }: { label: string }) {
  return <span className="rounded-full border border-mint-200 bg-mint-50 px-2 py-0.5 text-[11px] text-sage-800">{label}</span>;
}

function sessionText(row: ClientRow) {
  const membership = row.activeMembership;
  if (!membership) return "—";
  if (membership.plan.isUnlimited) return "∞";
  return `${membership.sessionsRemaining ?? 0}/${membership.plan.sessionsPerMonth ?? "—"}`;
}

function fullName(row: { name: string | null; lastName: string | null; email: string }) {
  return [row.name, row.lastName].filter(Boolean).join(" ").trim() || row.email;
}

function monthOptions(): ReadonlyArray<readonly [string, string]> {
  return [["", "Any birthday month"], ...Array.from({ length: 12 }, (_, index) => [`${index + 1}`, new Intl.DateTimeFormat("en", { month: "long" }).format(new Date(2026, index, 1))] as const)];
}
