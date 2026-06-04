"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { OmmFilterDropdown, OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";
import { formatDateTimeForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import type { UserPaymentRow } from "@/lib/user-package-types";

type UserPaymentSource = "package" | "dropin" | "gift" | "membership" | "other";
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

function statusBadgeClass(status: string): string {
  if (status === "SUCCEEDED") return "bg-mint-100 text-mint-900";
  if (status === "PENDING") return "bg-amber-100 text-amber-900";
  if (status === "REFUNDED") return "bg-sky-100 text-sky-900";
  if (status === "FAILED") return "bg-rose-100 text-rose-900";
  return "bg-sage-100 text-sage-700";
}

function normalizePaymentSource(description: string | null): UserPaymentSource {
  const normalized = (description ?? "").toLowerCase();
  if (normalized.startsWith("membership")) return "membership";
  if (normalized.startsWith("package")) return "package";
  if (normalized.startsWith("drop-in")) return "dropin";
  if (normalized.startsWith("gift")) return "gift";
  return "other";
}

function resolveRelatedItemName(description: string | null): string | null {
  if (!description) {
    return null;
  }
  const [head, ...tail] = description.split(":");
  if (tail.length === 0) {
    return null;
  }
  const candidate = tail.join(":").trim();
  return candidate.length > 0 ? candidate : head.trim() || null;
}

function statusSortRank(status: string): number {
  if (status === "PENDING") return 0;
  if (status === "FAILED") return 1;
  if (status === "REFUNDED") return 2;
  if (status === "SUCCEEDED") return 3;
  return 4;
}

function comparePayments(
  left: UserPaymentRow,
  right: UserPaymentRow,
  sortOrder: UserPaymentSortOrder,
): number {
  const leftTime = new Date(left.createdAt).getTime();
  const rightTime = new Date(right.createdAt).getTime();
  const dateDiff = leftTime - rightTime;
  if (dateDiff !== 0) {
    return sortOrder === "newest" ? -dateDiff : dateDiff;
  }
  const statusDiff = statusSortRank(left.status) - statusSortRank(right.status);
  if (statusDiff !== 0) {
    return statusDiff;
  }
  return left.id.localeCompare(right.id);
}

export function UserPaymentsHistory({ locale, payments }: UserPaymentsHistoryProps) {
  const t = useTranslations("userPages.payments");
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
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.status")}</span>
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
        </div>
        <div className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.type")}</span>
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
        </div>
        <div className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.sort")}</span>
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
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-sage-100 bg-white/80 p-5 text-sm">
          <p className="font-medium text-sage-900">{t("filteredEmptyTitle")}</p>
          <p className="mt-1 text-sage-600">{t("filteredEmptyDescription")}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {rows.map((row) => {
              const source = normalizePaymentSource(row.description);
              const relatedItem = resolveRelatedItemName(row.description);
              return (
                <article key={row.id} className="rounded-2xl border border-sage-100 bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-sage-500">
                      {formatDateTimeForUi(row.createdAt, locale)}
                    </p>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-medium ${statusBadgeClass(row.status)}`}
                    >
                      {t(`status.${row.status}`)}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-sage-600">
                    <div>
                      <p className="text-sage-500">{t("table.amount")}</p>
                      <p className="font-medium text-sage-900">
                        {formatAmdFromCents(row.amountCents, locale)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sage-500">{t("table.currency")}</p>
                      <p className="font-medium uppercase text-sage-900">
                        {(row.currency || "amd").toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sage-500">{t("table.type")}</p>
                      <p className="font-medium text-sage-900">{t(`source.${source}`)}</p>
                    </div>
                    <div>
                      <p className="text-sage-500">{t("table.updated")}</p>
                      <p className="font-medium text-sage-900">
                        {formatDateTimeForUi(row.updatedAt ?? row.createdAt, locale)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-sage-500">
                    {t("table.related")}: {relatedItem ?? t("common.notAvailable")}
                  </p>
                  <p className="mt-1 text-xs text-sage-500">
                    {t("table.reference")}:{" "}
                    {row.paymentReference ? (
                      <span className="font-mono">{row.paymentReference}</span>
                    ) : (
                      t("common.notAvailable")
                    )}
                  </p>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full border-collapse text-sm text-sage-700">
              <thead>
                <tr className="border-b border-sage-200 bg-sage-50/80 text-left text-xs uppercase tracking-wide text-sage-500">
                  <th className="px-3 py-3">{t("table.date")}</th>
                  <th className="px-3 py-3">{t("table.amount")}</th>
                  <th className="px-3 py-3">{t("table.currency")}</th>
                  <th className="px-3 py-3">{t("table.status")}</th>
                  <th className="px-3 py-3">{t("table.type")}</th>
                  <th className="px-3 py-3">{t("table.related")}</th>
                  <th className="px-3 py-3">{t("table.reference")}</th>
                  <th className="px-3 py-3">{t("table.updated")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const source = normalizePaymentSource(row.description);
                  const relatedItem = resolveRelatedItemName(row.description);
                  return (
                    <tr key={row.id} className="border-b border-sage-100/80 last:border-b-0">
                      <td className="px-3 py-3 align-top">
                        {formatDateTimeForUi(row.createdAt, locale)}
                      </td>
                      <td className="px-3 py-3 align-top font-medium text-sage-800">
                        {formatAmdFromCents(row.amountCents, locale)}
                      </td>
                      <td className="px-3 py-3 align-top uppercase">
                        {(row.currency || "amd").toUpperCase()}
                      </td>
                      <td className="px-3 py-3 align-top">
                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-medium ${statusBadgeClass(row.status)}`}
                        >
                          {t(`status.${row.status}`)}
                        </span>
                      </td>
                      <td className="px-3 py-3 align-top">{t(`source.${source}`)}</td>
                      <td className="px-3 py-3 align-top text-xs text-sage-600">
                        {relatedItem ?? t("common.notAvailable")}
                      </td>
                      <td className="px-3 py-3 align-top text-xs text-sage-600">
                        {row.paymentReference ? (
                          <span className="font-mono">{row.paymentReference}</span>
                        ) : (
                          t("common.notAvailable")
                        )}
                      </td>
                      <td className="px-3 py-3 align-top text-xs text-sage-600">
                        {formatDateTimeForUi(row.updatedAt ?? row.createdAt, locale)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
