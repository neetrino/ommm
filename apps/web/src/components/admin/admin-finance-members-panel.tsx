"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminClientDrawer } from "@/components/admin/admin-client-drawer";
import { AdminFinanceUserCompactRow } from "@/components/admin/admin-finance-user-compact-row";
import {
  ADMIN_FINANCE_USER_LIST_ACTIONS_HEADER_CELL,
  ADMIN_FINANCE_USER_LIST_EMPHASIZED_HEADER,
  ADMIN_FINANCE_USER_LIST_HEADER_CLASS,
  ADMIN_FINANCE_USER_LIST_TABLE_CLASS,
} from "@/components/admin/admin-finance-notifications-list-layout";
import { FINANCE_USER_PAGE_KEYS } from "@/components/admin/admin-finance-url";
import type { UserFinanceFilters } from "@/components/admin/admin-finance-types";
import type { AdminClientsPayload, ClientRow } from "@/components/admin/admin-clients-types";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { parseListPageParams, resetListPageQuery, syncListPageQuery } from "@/lib/list-pagination";

type Props = {
  locale: string;
  initialClients: AdminClientsPayload;
  filters: UserFinanceFilters & { q: string };
};

export function AdminFinanceMembersPanel({ locale, initialClients, filters }: Props) {
  const t = useTranslations("adminPages.finance.userTab");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<ClientRow | null>(null);

  const userListPage = useMemo(
    () =>
      parseListPageParams(Object.fromEntries(searchParams.entries()), FINANCE_USER_PAGE_KEYS),
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

  function setQuickFilter(value: string): void {
    const nextQuick = filters.quick === value ? "" : value;
    replaceSearchParams((params) => {
      resetListPageQuery(params, FINANCE_USER_PAGE_KEYS);
      if (nextQuick) {
        params.set("quick", nextQuick);
      } else {
        params.delete("quick");
      }
    });
  }

  function refetchClients(): void {
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <QuickFilters
        active={filters.quick}
        onChange={setQuickFilter}
        labels={{
          paid: t("quickPaid"),
          pending: t("quickPending"),
          overdue: t("quickOverdue"),
          giftCard: t("quickGiftCard"),
          active: t("quickActive"),
        }}
      />
      <div className={ADMIN_FINANCE_USER_LIST_TABLE_CLASS}>
        <div className={ADMIN_FINANCE_USER_LIST_HEADER_CLASS}>
          <span>{t("colUser")}</span>
          <span className={ADMIN_FINANCE_USER_LIST_EMPHASIZED_HEADER}>{t("colPlan")}</span>
          <span className={ADMIN_FINANCE_USER_LIST_EMPHASIZED_HEADER}>{t("colCost")}</span>
          <span className={ADMIN_FINANCE_USER_LIST_EMPHASIZED_HEADER}>{t("colExpiration")}</span>
          <span className={ADMIN_FINANCE_USER_LIST_EMPHASIZED_HEADER}>{t("colPaymentStatus")}</span>
          <span className={ADMIN_FINANCE_USER_LIST_EMPHASIZED_HEADER}>{t("colGiftCard")}</span>
          <span aria-hidden="true" />
          <span className={ADMIN_FINANCE_USER_LIST_ACTIONS_HEADER_CELL}>{t("colActions")}</span>
        </div>
        {initialClients.rows.length === 0 ? (
          <p className="rounded-[24px] border border-white/80 bg-white/95 px-5 py-8 text-center text-sm text-sage-600">
            {t("empty")}
          </p>
        ) : (
          initialClients.rows.map((row) => (
            <AdminFinanceUserCompactRow
              key={row.id}
              row={row}
              locale={locale}
              onEdit={() => setSelected(row)}
              onChanged={refetchClients}
            />
          ))
        )}
      </div>

      <OmmListPagination
        total={initialClients.pagination.total}
        page={userListPage.page}
        pageSize={userListPage.pageSize}
        offset={initialClients.pagination.offset}
        onPageChange={(page) => setUserListPage(page)}
      />

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
          onClick={() => props.onChange(value)}
        >
          {label}
        </OmmButton>
      ))}
    </div>
  );
}
