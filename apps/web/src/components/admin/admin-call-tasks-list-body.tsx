"use client";

import type { useTranslations } from "next-intl";
import {
  ADMIN_CALL_TASKS_LIST_ACTIONS_HEADER_CELL,
  ADMIN_CALL_TASKS_LIST_EMPHASIZED_HEADER,
  ADMIN_CALL_TASKS_LIST_HEADER_CLASS,
  ADMIN_CALL_TASKS_LIST_TABLE_CLASS,
} from "@/components/admin/admin-call-tasks-list-layout";
import { AdminCallTasksRow } from "@/components/admin/admin-call-tasks-row";
import type { CallTaskRow } from "@/components/admin/admin-call-tasks-query";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";

type AdminCallTasksListBodyProps = {
  rows: readonly CallTaskRow[];
  total: number;
  listPage: { page: number; pageSize: number };
  offset: number;
  busyAction: string | null;
  onEdit: (row: CallTaskRow) => void;
  onComplete: (row: CallTaskRow) => void;
  onCancel: (row: CallTaskRow) => void;
  onPageChange: (page: number) => void;
  t: ReturnType<typeof useTranslations<"adminPages.calls">>;
};

export function AdminCallTasksListBody({
  rows,
  total,
  listPage,
  offset,
  busyAction,
  onEdit,
  onComplete,
  onCancel,
  onPageChange,
  t,
}: AdminCallTasksListBodyProps) {
  return (
    <>
      <div className={ADMIN_CALL_TASKS_LIST_TABLE_CLASS}>
        <div className={ADMIN_CALL_TASKS_LIST_HEADER_CLASS}>
          <span>{t("colContact")}</span>
          <span className={ADMIN_CALL_TASKS_LIST_EMPHASIZED_HEADER}>{t("colPhone")}</span>
          <span className={ADMIN_CALL_TASKS_LIST_EMPHASIZED_HEADER}>{t("colDue")}</span>
          <span className={ADMIN_CALL_TASKS_LIST_EMPHASIZED_HEADER}>{t("colComment")}</span>
          <span className={ADMIN_CALL_TASKS_LIST_EMPHASIZED_HEADER}>{t("colStatus")}</span>
          <span className={ADMIN_CALL_TASKS_LIST_ACTIONS_HEADER_CELL}>{t("colActions")}</span>
        </div>
        {rows.map((row) => (
          <AdminCallTasksRow
            key={row.id}
            row={row}
            rowBusy={busyAction?.startsWith(`${row.id}:`) ?? false}
            onEdit={() => onEdit(row)}
            onComplete={() => onComplete(row)}
            onCancel={() => onCancel(row)}
          />
        ))}
      </div>
      {total > 0 ? (
        <OmmListPagination
          total={total}
          page={listPage.page}
          pageSize={listPage.pageSize}
          offset={offset}
          onPageChange={onPageChange}
        />
      ) : null}
    </>
  );
}
