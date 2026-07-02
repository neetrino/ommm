"use client";

import type { useTranslations } from "next-intl";
import { AdminWaitlistCompactRow } from "@/components/admin/admin-waitlist-compact-row";
import {
  ADMIN_WAITLIST_LIST_ACTIONS_HEADER_CELL,
  ADMIN_WAITLIST_LIST_EMPHASIZED_HEADER,
  ADMIN_WAITLIST_LIST_HEADER_CLASS,
  ADMIN_WAITLIST_LIST_TABLE_CLASS,
} from "@/components/admin/admin-waitlist-list-layout";
import type { AdminWaitlistRow } from "@/components/admin/admin-waitlist-query";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";

type AdminWaitlistListBodyProps = {
  locale: string;
  rows: readonly AdminWaitlistRow[];
  total: number;
  listPage: { page: number; pageSize: number };
  offset: number;
  loading: boolean;
  busyAction: string | null;
  userLabelForRow: (row: AdminWaitlistRow) => string;
  onOpenUser: (userId: string) => void;
  onPromote: (row: AdminWaitlistRow) => void;
  onNotify: (row: AdminWaitlistRow) => void;
  onRemove: (row: AdminWaitlistRow) => void;
  onPageChange: (page: number) => void;
  t: ReturnType<typeof useTranslations<"adminPages.waitlists">>;
};

export function AdminWaitlistListBody({
  locale,
  rows,
  total,
  listPage,
  offset,
  loading,
  busyAction,
  userLabelForRow,
  onOpenUser,
  onPromote,
  onNotify,
  onRemove,
  onPageChange,
  t,
}: AdminWaitlistListBodyProps) {
  return (
    <>
      <div className={ADMIN_WAITLIST_LIST_TABLE_CLASS}>
        <div className={ADMIN_WAITLIST_LIST_HEADER_CLASS}>
          <span>{t("colUser")}</span>
          <span className={ADMIN_WAITLIST_LIST_EMPHASIZED_HEADER}>{t("colClassType")}</span>
          <span className={`${ADMIN_WAITLIST_LIST_EMPHASIZED_HEADER} md:text-center`}>
            {t("colWaitlistCount")}
          </span>
          <span className={`${ADMIN_WAITLIST_LIST_EMPHASIZED_HEADER} md:text-center`}>
            {t("colWaitlistDate")}
          </span>
          <span aria-hidden="true" />
          <span className={ADMIN_WAITLIST_LIST_ACTIONS_HEADER_CELL}>{t("colActions")}</span>
        </div>
        {rows.map((row) => {
          const rowBusy = busyAction?.startsWith(`${row.id}:`) ?? false;
          return (
            <AdminWaitlistCompactRow
              key={row.id}
              locale={locale}
              row={row}
              rowBusy={rowBusy}
              userLabel={userLabelForRow(row)}
              onOpenUser={onOpenUser}
              onPromote={() => onPromote(row)}
              onNotify={() => onNotify(row)}
              onRemove={() => onRemove(row)}
            />
          );
        })}
      </div>
      {total > 0 ? (
        <OmmListPagination
          total={total}
          page={listPage.page}
          pageSize={listPage.pageSize}
          offset={offset}
          onPageChange={onPageChange}
          disabled={loading || busyAction !== null}
        />
      ) : null}
    </>
  );
}
