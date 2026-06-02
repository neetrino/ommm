"use client";



import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { useTranslations } from "next-intl";

import { AdminClientDrawer } from "@/components/admin/admin-client-drawer";

import { AdminFinancePaymentActions } from "@/components/admin/admin-finance-payment-actions";

import { AdminFinanceUserActions } from "@/components/admin/admin-finance-user-actions";

import { adminChrome } from "@/components/admin/admin-chrome";

import type {

  FinancePaymentItem,

  UserFinanceFilters,

} from "@/components/admin/admin-finance-types";

import type { AdminClientsPayload, ClientRow } from "@/components/admin/admin-clients-types";

import { AdminFilterResetBar } from "@/components/ui/admin-filter-reset-bar";

import { OmmButton } from "@/components/ui/omm-button";

import { OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";

import { apiFetch } from "@/lib/api";

import { formatDateForUi } from "@/lib/date-display";

import { formatAmdFromCents } from "@/lib/price-amd";



const SEARCH_DEBOUNCE_MS = 300;



type Props = {

  locale: string;

  initialRows: ClientRow[];

  initialPayments: FinancePaymentItem[];

  paymentsFrom: string;

};



const defaultFilters: UserFinanceFilters = {

  search: "",

  paymentStatus: "",

  giftCardOnly: false,

  order: "newest",

  quick: "",

};



function displayName(row: ClientRow): string {

  const merged = [row.name, row.lastName].filter(Boolean).join(" ").trim();

  return merged.length > 0 ? merged : row.email;

}



function paymentBadgeClass(status: string): string {

  if (status === "paid") return "bg-mint-100 text-mint-900";

  if (status === "overdue") return "bg-rose-100 text-rose-900";

  if (status === "partial") return "bg-sky-100 text-sky-900";

  if (status === "unpaid") return "bg-amber-100 text-amber-900";

  return "bg-sage-100 text-sage-700";

}



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



export function AdminUserFinanceTab({

  locale,

  initialRows,

  initialPayments,

}: Props) {

  const t = useTranslations("adminPages.finance.userTab");

  const [rows, setRows] = useState(initialRows);

  const [payments] = useState(initialPayments);

  const [filters, setFilters] = useState<UserFinanceFilters>(defaultFilters);

  const [selected, setSelected] = useState<ClientRow | null>(null);

  const [loading, startTransition] = useTransition();

  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0);

  const hasMounted = useRef(false);



  const filteredRows = useMemo(

    () => sortRows(applyLocalFilters(rows, filters), filters.order),

    [filters, rows],

  );



  useEffect(() => {

    if (!hasMounted.current) {

      hasMounted.current = true;

      return undefined;

    }

    const handle = window.setTimeout(() => {

      const params = new URLSearchParams({ meta: "true" });

      if (filters.search.trim()) params.set("search", filters.search.trim());

      if (filters.paymentStatus) params.set("paymentStatus", filters.paymentStatus);

      if (filters.order === "oldest" || filters.order === "newest") {

        params.set("order", filters.order);

      }

      const nextRequestId = requestId.current + 1;

      requestId.current = nextRequestId;

      startTransition(() => {

        void apiFetch<AdminClientsPayload>(`/clients?${params.toString()}`)

          .then((payload) => {

            if (requestId.current !== nextRequestId) return;

            setRows(payload.rows);

            setError(null);

          })

          .catch(() => {

            if (requestId.current === nextRequestId) {

              setError(t("loadFailed"));

            }

          });

      });

    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);

  }, [filters.search, filters.paymentStatus, filters.order, t]);



  function updateFilter<K extends keyof UserFinanceFilters>(key: K, value: UserFinanceFilters[K]) {

    setFilters((current) => ({ ...current, [key]: value }));

  }



  function resetFilters() {

    setFilters(defaultFilters);

  }



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

      <p className="text-xs text-sage-500">{t("rowCount", { count: filteredRows.length })}</p>

      <div className={adminChrome.tableWrap}>

        <table className="w-full min-w-[48rem] border-collapse text-left text-sm">

          <thead className={adminChrome.thead}>

            <tr>

              <th className={adminChrome.th}>{t("colUser")}</th>

              <th className={adminChrome.th}>{t("colPaymentStatus")}</th>

              <th className={adminChrome.th}>{t("colGiftCard")}</th>

              <th className={adminChrome.th}>{t("colActions")}</th>

            </tr>

          </thead>

          <tbody>

            {filteredRows.length === 0 ? (

              <tr>

                <td colSpan={4} className="px-4 py-8 text-center text-sage-600">

                  {t("empty")}

                </td>

              </tr>

            ) : (

              filteredRows.map((row) => (

                <tr key={row.id} className={adminChrome.tr}>

                  <td className={adminChrome.tdStrong}>

                    <p>{displayName(row)}</p>

                    <p className="text-xs font-normal text-sage-500">{row.phone ?? "—"}</p>

                  </td>

                  <td className={adminChrome.td}>

                    <span

                      className={`rounded-full px-2 py-1 text-[11px] font-medium ${paymentBadgeClass(row.paymentBehavior)}`}

                    >

                      {row.paymentBehavior}

                    </span>

                  </td>

                  <td className={adminChrome.td}>

                    {row.hasGiftCardActivity ? t("giftCardYes") : t("giftCardNo")}

                  </td>

                  <td className={adminChrome.td}>

                    <AdminFinanceUserActions

                      row={row}

                      onEdit={() => setSelected(row)}

                      onChanged={() => {

                        void apiFetch<AdminClientsPayload>("/clients?meta=true").then((payload) => {

                          setRows(payload.rows);

                        });

                      }}

                    />

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      <section className="space-y-2">

        <h3 className="text-base font-semibold text-sage-900">{t("billingHistory")}</h3>

        <p className="text-xs text-sage-500">{t("billingHint")}</p>

        <BillingHistoryTable

          items={payments}

          locale={locale}

        />

      </section>

      <AdminClientDrawer

        client={selected}

        locale={locale}

        onClose={() => setSelected(null)}

        onChanged={() => {

          void apiFetch<AdminClientsPayload>("/clients?meta=true").then((payload) => {

            setRows(payload.rows);

          });

        }}

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

          {items.slice(0, 25).map((row) => (

            <tr key={row.id} className={adminChrome.tr}>

              <td className={adminChrome.td}>{formatDateForUi(row.createdAt)}</td>

              <td className={adminChrome.td}>

                <p>

                  {[row.user.name, row.user.lastName].filter(Boolean).join(" ") ||

                    row.user.email}

                </p>

                <p className="text-xs text-sage-500">

                  {row.user.phone ?? row.user.email}

                </p>

              </td>

              <td className={adminChrome.td}>{formatAmdFromCents(row.amountCents, locale)}</td>

              <td className={adminChrome.td}>

                {row.paymentMethod

                  ? tMethods(row.paymentMethod as "CASH")

                  : "—"}

              </td>

              <td className={adminChrome.td}>{row.source}</td>

              <td className={adminChrome.td}>{row.status}</td>

              <td className={adminChrome.td}>

                <AdminFinancePaymentActions />

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}


