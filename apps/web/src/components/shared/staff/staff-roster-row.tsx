import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { SessionClassTitle } from "@/components/account/session-class-title";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { ScheduleSessionDateTimeCell } from "@/components/shared/schedule/schedule-session-datetime-cell";
import {
  STAFF_ROSTER_LIST_ACTIONS_CELL,
  STAFF_ROSTER_LIST_CLASS_CELL,
  STAFF_ROSTER_LIST_DATE_TIME_CELL,
  STAFF_ROSTER_LIST_PARTICIPANT_CELL,
  STAFF_ROSTER_LIST_ROW_CLASS,
} from "@/components/shared/staff/staff-roster-list-layout";

export type StaffRosterRowData = {
  id: string;
  user: { name: string | null; email: string; phone?: string | null };
  session: {
    startsAt: string;
    endsAt: string;
    classType: { name: string };
  };
};

type StaffRosterRowProps = {
  locale: string;
  row: StaffRosterRowData;
  actions: ReactNode;
};

/** Read-only roster row with role-specific actions slot (coach attendance). */
export async function StaffRosterRow({ locale, row, actions }: StaffRosterRowProps) {
  const t = await getTranslations({ locale, namespace: "adminPages.bookings" });
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
        <ScheduleSessionDateTimeCell
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
