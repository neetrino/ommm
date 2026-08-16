"use client";

import { useTranslations } from "next-intl";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { ADMIN_LIST_TITLE_TEXT_CLASS } from "@/components/admin/admin-list-table-layout";
import {
  ADMIN_CALL_TASKS_LIST_CELL,
  ADMIN_CALL_TASKS_LIST_ROW_CLASS,
} from "@/components/admin/admin-call-tasks-list-layout";
import {
  ADMIN_CALL_TASK_STATUS_BADGE_CLASS,
  callTaskStatusBadgeTone,
} from "@/components/admin/admin-call-tasks-list-badges";
import type { CallTaskRow } from "@/components/admin/admin-call-tasks-query";
import { formatDateForUi } from "@/lib/date-display";
import { displayPhoneOrFallback } from "@/lib/phone";

type AdminCallTasksRowProps = {
  row: CallTaskRow;
  onOpenDetails: () => void;
};

export function AdminCallTasksRow({ row, onOpenDetails }: AdminCallTasksRowProps) {
  const t = useTranslations("adminPages.calls");
  const pending = row.status === "PENDING";
  const statusLabel = row.isOverdue && pending ? t("overdue") : t(`status.${row.status}`);

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={t("viewDetailsFor", { name: row.contactName })}
      onClick={onOpenDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails();
        }
      }}
      className={ADMIN_CALL_TASKS_LIST_ROW_CLASS}
    >
      <div className={ADMIN_CALL_TASKS_LIST_CELL}>
        <AdminListMobileLabel label={t("colContact")} />
        <p className={ADMIN_LIST_TITLE_TEXT_CLASS}>{row.contactName}</p>
      </div>
      <div className={ADMIN_CALL_TASKS_LIST_CELL}>
        <AdminListMobileLabel label={t("colPhone")} />
        <p className="text-sm text-sage-800">{displayPhoneOrFallback(row.phone)}</p>
      </div>
      <div className={ADMIN_CALL_TASKS_LIST_CELL}>
        <AdminListMobileLabel label={t("colDue")} />
        <p className="text-sm text-sage-800">{formatDateForUi(row.dueOnDate)}</p>
      </div>
      <div className={ADMIN_CALL_TASKS_LIST_CELL}>
        <AdminListMobileLabel label={t("colComment")} />
        <p className="line-clamp-2 text-sm text-sage-700">{row.comment}</p>
      </div>
      <div className={`${ADMIN_CALL_TASKS_LIST_CELL} md:self-center`}>
        <AdminListMobileLabel label={t("colStatus")} />
        <span
          className={`${ADMIN_CALL_TASK_STATUS_BADGE_CLASS} ${callTaskStatusBadgeTone(row.status, row.isOverdue)}`}
        >
          {statusLabel}
        </span>
      </div>
    </article>
  );
}
