"use client";

import { useTranslations } from "next-intl";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { ADMIN_LIST_TITLE_LINK_CLASS } from "@/components/admin/admin-list-table-layout";
import {
  ADMIN_CALL_TASKS_LIST_ACTIONS_CELL,
  ADMIN_CALL_TASKS_LIST_CELL,
  ADMIN_CALL_TASKS_LIST_ROW_CLASS,
} from "@/components/admin/admin-call-tasks-list-layout";
import {
  ADMIN_CALL_TASK_STATUS_BADGE_CLASS,
  callTaskStatusBadgeTone,
} from "@/components/admin/admin-call-tasks-list-badges";
import type { CallTaskRow } from "@/components/admin/admin-call-tasks-query";
import { OmmButton } from "@/components/ui/omm-button";
import { formatDateForUi } from "@/lib/date-display";
import { displayPhoneOrFallback } from "@/lib/phone";

type AdminCallTasksRowProps = {
  row: CallTaskRow;
  rowBusy: boolean;
  onEdit: () => void;
  onComplete: () => void;
  onCancel: () => void;
};

export function AdminCallTasksRow({
  row,
  rowBusy,
  onEdit,
  onComplete,
  onCancel,
}: AdminCallTasksRowProps) {
  const t = useTranslations("adminPages.calls");
  const pending = row.status === "PENDING";
  const statusLabel = row.isOverdue && pending ? t("overdue") : t(`status.${row.status}`);

  return (
    <article className={ADMIN_CALL_TASKS_LIST_ROW_CLASS}>
      <div className={ADMIN_CALL_TASKS_LIST_CELL}>
        <AdminListMobileLabel label={t("colContact")} />
        <button type="button" className={ADMIN_LIST_TITLE_LINK_CLASS} onClick={onEdit}>
          {row.contactName}
        </button>
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
      <div className={`${ADMIN_CALL_TASKS_LIST_ACTIONS_CELL} md:self-center`}>
        <AdminListMobileLabel label={t("colActions")} />
        <CallTaskRowActions
          pending={pending}
          rowBusy={rowBusy}
          onComplete={onComplete}
          onEdit={onEdit}
          onCancel={onCancel}
        />
      </div>
    </article>
  );
}

function CallTaskRowActions({
  pending,
  rowBusy,
  onComplete,
  onEdit,
  onCancel,
}: {
  pending: boolean;
  rowBusy: boolean;
  onComplete: () => void;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("adminPages.calls");
  if (!pending) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <OmmButton type="button" size="sm" variant="primary" disabled={rowBusy} onClick={onComplete}>
        {t("markDone")}
      </OmmButton>
      <OmmButton type="button" size="sm" variant="ghost" disabled={rowBusy} onClick={onEdit}>
        {t("edit")}
      </OmmButton>
      <OmmButton type="button" size="sm" variant="danger" disabled={rowBusy} onClick={onCancel}>
        {t("cancelTask")}
      </OmmButton>
    </div>
  );
}

