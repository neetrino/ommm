"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { UserListBoardViewSwitcher } from "@/components/account/user-list-board-view-switcher";
import { UserPaymentBoardCard } from "@/components/account/user-payment-board-card";
import { UserPaymentCompactRow } from "@/components/account/user-payment-compact-row";
import {
  comparePayments,
  normalizePaymentSource,
  type UserPaymentSource,
} from "@/components/account/user-payment-display";
import { OmmFilterDropdown, OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";
import { useUserListBoardView } from "@/hooks/use-user-list-board-view";
import type { UserPaymentRow } from "@/lib/user-package-types";

type UserPaymentSortOrder = "newest" | "oldest";
type UserPaymentStatusFilter = "all" | "SUCCEEDED" | "PENDING" | "FAILED" | "REFUNDED";
type UserPaymentSourceFilter = "all" | UserPaymentSource;

type UserPaymentsHistoryProps = {
  locale: string;
  payments: UserPaymentRow[];
};

const PAYMENT_STATUS_OPTIONS: readonly Exclude<UserPaymentStatusFilter, "all">[] = [
  "SUCCEEDED",
  "PENDING",
  "FAILED",
  "REFUNDED",
];

const PAYMENT_SOURCE_OPTIONS: readonly UserPaymentSource[] = [
  "package",
  "membership",
  "dropin",
  "gift",
  "other",
];

export function UserPaymentsHistory({ locale, payments }: UserPaymentsHistoryProps) {
  const t = useTranslations("userPages.payments");
  const [viewMode, setView] = useUserListBoardView("payments");
  const [statusFilter, setStatusFilter] = useState<UserPaymentStatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<UserPaymentSourceFilter>("all");
  const [sortOrder, setSortOrder] = useState<UserPaymentSortOrder>("newest");

  const rows = useMemo(() => {
    return payments
      .filter((payment) => statusFilter === "all" || payment.status === statusFilter)
      .filter((payment) => {
        if (sourceFilter === "all") return true;
        return normalizePaymentSource(payment.description) === sourceFilter;
      })
      .slice()
      .sort((left, right) => comparePayments(left, right, sortOrder));
  }, [payments, sortOrder, sourceFilter, statusFilter]);

  if (payments.length === 0) {
    return (
      <section className="rounded-[20px] border border-white/60 bg-white/75 p-5 sm:p-6">
        <h2 className="ommm-h3 text-sage-800">{t("emptyTitle")}</h2>
        <p className="ommm-body-muted mt-2 text-sm">{t("emptyDescription")}</p>
      </section>
    );
  }

  return (
    <section className="rounded-[20px] border border-white/60 bg-white/75 p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-sage-600">{t("paymentsCount", { count: rows.length })}</p>
        <UserListBoardViewSwitcher
          pageId="payments"
          namespace="userPages.payments"
          value={viewMode}
          onChange={setView}
        />
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <FilterField label={t("filters.status")}>
          <OmmFilterDropdown
            allValue="all"
            value={statusFilter}
            ariaLabel={t("filters.status")}
            allLabel={t("filters.allStatuses")}
            onChange={(value) => setStatusFilter(value as UserPaymentStatusFilter)}
            options={PAYMENT_STATUS_OPTIONS.map((status) => ({
              value: status,
              label: t(`status.${status}`),
            }))}
          />
        </FilterField>
        <FilterField label={t("filters.type")}>
          <OmmFilterDropdown
            allValue="all"
            value={sourceFilter}
            ariaLabel={t("filters.type")}
            allLabel={t("filters.allTypes")}
            onChange={(value) => setSourceFilter(value as UserPaymentSourceFilter)}
            options={PAYMENT_SOURCE_OPTIONS.map((source) => ({
              value: source,
              label: t(`source.${source}`),
            }))}
          />
        </FilterField>
        <FilterField label={t("filters.sort")}>
          <OmmSelectDropdown
            ariaLabel={t("filters.sort")}
            label={t(`sort.${sortOrder}`)}
            value={sortOrder}
            onChange={(value) => setSortOrder(value as UserPaymentSortOrder)}
            options={[
              { value: "newest", label: t("sort.newest") },
              { value: "oldest", label: t("sort.oldest") },
            ]}
          />
        </FilterField>
      </div>

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
        <div className="overflow-hidden rounded-[20px] border border-white/60 bg-white/75">
          <div className="hidden border-b border-white/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-sage-500 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] md:gap-3">
            <span>{t("table.date")}</span>
            <span>{t("table.amount")}</span>
            <span>{t("table.currency")}</span>
            <span>{t("table.status")}</span>
            <span>{t("table.type")}</span>
            <span>{t("table.related")}</span>
          </div>
          <ul className="divide-y divide-white/70">
            {rows.map((row) => (
              <li key={row.id}>
                <UserPaymentCompactRow locale={locale} payment={row} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="ommm-label text-xs uppercase tracking-wide">{label}</span>
      {children}
    </div>
  );
}
