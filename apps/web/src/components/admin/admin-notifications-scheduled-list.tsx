"use client";

import type { useTranslations } from "next-intl";
import {
  ADMIN_NOTIFICATIONS_SCHEDULED_LIST_ACTIONS_CELL,
  ADMIN_NOTIFICATIONS_SCHEDULED_LIST_CELL,
  ADMIN_NOTIFICATIONS_SCHEDULED_LIST_EMPHASIZED_HEADER,
  ADMIN_NOTIFICATIONS_SCHEDULED_LIST_HEADER_CLASS,
  ADMIN_NOTIFICATIONS_SCHEDULED_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_NOTIFICATIONS_SCHEDULED_LIST_ROW_CLASS,
  ADMIN_NOTIFICATIONS_SCHEDULED_LIST_SPACER_CELL,
  ADMIN_NOTIFICATIONS_SCHEDULED_LIST_TABLE_CLASS,
} from "@/components/admin/admin-finance-notifications-list-layout";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { adminChrome } from "@/components/admin/admin-chrome";
import type { ScheduledBroadcast } from "@/components/admin/admin-notifications-types";
import { formatDateTimeForUi } from "@/lib/date-display";

type AdminNotificationsScheduledListProps = {
  locale: string;
  rows: readonly ScheduledBroadcast[];
  totalItems: number;
  busyId: string | null;
  onEdit: (row: ScheduledBroadcast) => void;
  onCancel: (id: string) => void;
  t: ReturnType<typeof useTranslations<"adminPages.notifications">>;
};

export function AdminNotificationsScheduledList({
  locale,
  rows,
  totalItems,
  busyId,
  onEdit,
  onCancel,
  t,
}: AdminNotificationsScheduledListProps) {
  return (
    <div className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_TABLE_CLASS}>
      <div className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_HEADER_CLASS}>
        <span>{t("table.subject")}</span>
        <span className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_EMPHASIZED_HEADER}>
          {t("table.audience")}
        </span>
        <span className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_EMPHASIZED_HEADER}>
          {t("table.scheduledFor")}
        </span>
        <span className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_EMPHASIZED_HEADER}>
          {t("table.status")}
        </span>
        <span className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_EMPHASIZED_HEADER}>
          {t("table.createdAt")}
        </span>
        <span aria-hidden="true" />
        <span className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_EMPHASIZED_HEADER}>
          {t("table.actions")}
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-[24px] border border-white/80 bg-white/95 px-5 py-8 text-center text-sm text-sage-600">
          {totalItems === 0 ? t("scheduledEmpty") : t("filters.noMatches")}
        </p>
      ) : (
        rows.map((row) => (
          <article key={row.id} className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_ROW_CLASS}>
            <div className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_CELL}>
              <AdminListMobileLabel label={t("table.subject")} />
              <p className="text-sm font-medium text-sage-900">{row.subject}</p>
            </div>
            <div className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_CELL}>
              <AdminListMobileLabel label={t("table.audience")} />
              <p className="text-sm text-sage-800">{row.audience}</p>
            </div>
            <div className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_CELL}>
              <AdminListMobileLabel label={t("table.scheduledFor")} />
              <p className="text-sm text-sage-600">{formatDateTimeForUi(row.scheduleAt, locale)}</p>
            </div>
            <div className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_CELL}>
              <AdminListMobileLabel label={t("table.status")} />
              <p className="text-sm text-sage-800">{row.status}</p>
            </div>
            <div className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_CELL}>
              <AdminListMobileLabel label={t("table.createdAt")} />
              <p className="text-sm text-sage-600">{formatDateTimeForUi(row.createdAt, locale)}</p>
            </div>
            <div className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_SPACER_CELL} aria-hidden="true" />
            <div
              className={`${ADMIN_NOTIFICATIONS_SCHEDULED_LIST_ACTIONS_CELL} ${ADMIN_NOTIFICATIONS_SCHEDULED_LIST_ROW_ACTIONS_HOVER_REVEAL}`}
            >
              <AdminListMobileLabel label={t("table.actions")} />
              {row.status === "PENDING" ? (
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className="ommm-cta-ghost text-xs"
                    disabled={busyId !== null}
                    onClick={() => onEdit(row)}
                  >
                    {t("actions.edit")}
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-50 disabled:opacity-50"
                    disabled={busyId !== null}
                    onClick={() => onCancel(row.id)}
                  >
                    {t("actions.cancel")}
                  </button>
                </div>
              ) : (
                <span className={adminChrome.metaText}>—</span>
              )}
            </div>
          </article>
        ))
      )}
    </div>
  );
}
