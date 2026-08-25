"use client";

import { useTranslations } from "next-intl";
import { AdminCallTasksCard } from "@/components/admin/admin-call-tasks-card";
import type { CallTaskRow } from "@/components/admin/admin-call-tasks-query";
import { MarkAllAsReadIcon } from "@/components/shell/mark-all-as-read-button";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";

type AdminCallTasksListBodyProps = {
  rows: readonly CallTaskRow[];
  total: number;
  listPage: { page: number; pageSize: number };
  offset: number;
  badgeCount: number;
  markingBadge: boolean;
  onMarkBadgeRead: () => void;
  onOpenDetails: (row: CallTaskRow) => void;
  onPageChange: (page: number) => void;
};

export function AdminCallTasksListBody({
  rows,
  total,
  listPage,
  offset,
  badgeCount,
  markingBadge,
  onMarkBadgeRead,
  onOpenDetails,
  onPageChange,
}: AdminCallTasksListBodyProps) {
  const t = useTranslations("adminPages.calls");
  return (
    <>
      <div className="space-y-3">
        <div className="flex justify-start">
          <OmmButton
            type="button"
            variant="secondary"
            size="sm"
            className="inline-flex items-center gap-1.5"
            disabled={markingBadge || badgeCount === 0}
            onClick={onMarkBadgeRead}
          >
            <MarkAllAsReadIcon className="h-3.5 w-3.5" />
            {t("markAllRead")}
          </OmmButton>
        </div>
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
