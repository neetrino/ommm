"use client";

import { useTranslations } from "next-intl";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { ADMIN_LIST_TITLE_LINK_CLASS } from "@/components/admin/admin-list-table-layout";
import {
  ADMIN_CALL_TASKS_LIST_ACTIONS_CELL,
  ADMIN_CALL_TASKS_LIST_CELL,
  ADMIN_CALL_TASKS_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_CALL_TASKS_LIST_ROW_CLASS,
  ADMIN_CALL_TASKS_LIST_SPACER_CELL,
} from "@/components/admin/admin-call-tasks-list-layout";
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

  return (
    <article className={ADMIN_CALL_TASKS_LIST_ROW_CLASS}>
      <div className={ADMIN_CALL_TASKS_LIST_CELL}>
        <AdminListMobileLabel label={t("colContact")} />
        <button type="button" className={ADMIN_LIST_TITLE_LINK_CLASS} onClick={onEdit}>
          {row.contactName}
        </button>
        {row.isOverdue && pending ? (
          <p className="mt-0.5 text-xs font-medium text-red-700">{t("overdue")}</p>
        ) : null}
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
      <div className={ADMIN_CALL_TASKS_LIST_SPACER_CELL} aria-hidden="true" />
      <div className={`${ADMIN_CALL_TASKS_LIST_ACTIONS_CELL} ${ADMIN_CALL_TASKS_LIST_ROW_ACTIONS_HOVER_REVEAL}`}>
        <p className="text-xs font-medium uppercase tracking-wide text-sage-500">
          {t(`status.${row.status}`)}
        </p>
        {pending ? (
          <div className="mt-2 flex flex-wrap gap-2">
            <OmmButton type="button" size="sm" variant="primary" disabled={rowBusy} onClick={onComplete}>
              {t("markDone")}
            </OmmButton>
            <OmmButton type="button" size="sm" variant="ghost" disabled={rowBusy} onClick={onEdit}>
              {t("edit")}
            </OmmButton>
            <OmmButton type="button" size="sm" variant="subtle" disabled={rowBusy} onClick={onCancel}>
              {t("cancelTask")}
            </OmmButton>
          </div>
        ) : null}
      </div>
    </article>
  );
}
