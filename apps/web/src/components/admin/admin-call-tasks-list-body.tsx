"use client";

import { AdminCallTasksCard } from "@/components/admin/admin-call-tasks-card";
import type { CallTaskRow } from "@/components/admin/admin-call-tasks-query";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";

type AdminCallTasksListBodyProps = {
  rows: readonly CallTaskRow[];
  total: number;
  listPage: { page: number; pageSize: number };
  offset: number;
  onOpenDetails: (row: CallTaskRow) => void;
  onPageChange: (page: number) => void;
};

export function AdminCallTasksListBody({
  rows,
  total,
  listPage,
  offset,
  onOpenDetails,
  onPageChange,
}: AdminCallTasksListBodyProps) {
  return (
    <>
      <div className="space-y-3">
        {rows.map((row) => (
          <AdminCallTasksCard
            key={row.id}
            row={row}
            onOpenDetails={() => onOpenDetails(row)}
          />
        ))}
      </div>
      {total > listPage.pageSize ? (
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
