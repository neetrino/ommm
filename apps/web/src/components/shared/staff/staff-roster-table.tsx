"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { adminChrome } from "@/components/admin/admin-chrome";
import { ScheduleSessionDateTimeCellClient } from "@/components/shared/schedule/schedule-session-datetime-cell-client";
import {
  STAFF_ROSTER_LIST_ACTIONS_CELL,
  STAFF_ROSTER_LIST_CLASS_CELL,
  STAFF_ROSTER_LIST_DATE_TIME_CELL,
  STAFF_ROSTER_LIST_HEADER_CLASS,
  STAFF_ROSTER_LIST_PARTICIPANT_CELL,
  STAFF_ROSTER_LIST_ROW_CLASS,
  STAFF_ROSTER_LIST_TABLE_CLASS,
} from "@/components/shared/staff/staff-roster-list-layout";
import type { StaffRosterRowData } from "@/components/shared/staff/staff-roster-row";

export type StaffRosterTableItem = {
  row: StaffRosterRowData;
  actions: ReactNode;
};

type StaffRosterTableProps = {
  locale: string;
  items: readonly StaffRosterTableItem[];
  emptyTitle: string;
  emptyBody: string;
};

export function StaffRosterTable({
  locale,
  items,
  emptyTitle,
  emptyBody,
}: StaffRosterTableProps) {
  const t = useTranslations("adminPages.bookings");

  if (items.length === 0) {
    return (
      <div className={adminChrome.panel}>
        <p className="font-medium text-sage-900">{emptyTitle}</p>
        <p className="mt-1 text-sm text-sage-600">{emptyBody}</p>
      </div>
    );
  }

  return (
    <div className={STAFF_ROSTER_LIST_TABLE_CLASS}>
      <div className={STAFF_ROSTER_LIST_HEADER_CLASS}>
        <span>{t("colUserPhone")}</span>
        <span>{t("colClassType")}</span>
        <span>{t("colDateTime")}</span>
        <span>{t("colAttendanceStatus")}</span>
      </div>
      {items.map(({ row, actions }) => (
        <StaffRosterTableRow key={row.id} locale={locale} row={row} actions={actions} />
      ))}
    </div>
  );
}

function StaffRosterTableRow({
  locale,
  row,
  actions,
}: {
  locale: string;
  row: StaffRosterRowData;
  actions: ReactNode;
}) {
  const t = useTranslations("adminPages.bookings");
  const userLabel = row.user.name ?? row.user.email;

  return (
    <article className={STAFF_ROSTER_LIST_ROW_CLASS}>
      <div className={STAFF_ROSTER_LIST_PARTICIPANT_CELL}>
        <AdminListMobileLabel label={t("colUserPhone")} />
        <p className="truncate text-sm font-medium text-sage-900" title={userLabel}>
          {userLabel}
        </p>
        <p className="mt-0.5 truncate text-xs text-sage-500">
          {row.user.phone ?? row.user.email}
        </p>
      </div>

      <div className={STAFF_ROSTER_LIST_CLASS_CELL}>
        <AdminListMobileLabel label={t("colClassType")} />
        <SessionClassTitle variant="list" name={row.session.classType.name} />
      </div>

      <div className={STAFF_ROSTER_LIST_DATE_TIME_CELL}>
        <AdminListMobileLabel label={t("colDateTime")} />
        <ScheduleSessionDateTimeCellClient
          locale={locale}
          startsAt={row.session.startsAt}
          endsAt={row.session.endsAt}
        />
      </div>

      <div className={STAFF_ROSTER_LIST_ACTIONS_CELL}>
        <AdminListMobileLabel label={t("colAttendanceStatus")} />
        {actions}
      </div>
    </article>
  );
}
