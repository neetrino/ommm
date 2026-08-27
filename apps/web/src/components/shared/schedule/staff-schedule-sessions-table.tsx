"use client";

import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import { ScheduleSessionRegistrationsCapacity } from "@/components/shared/schedule/schedule-session-registrations-capacity";
import {
  coachName,
  sessionClassSubtitle,
  spotsLeft,
} from "@/components/admin/admin-schedule-session-display";
import { ScheduleSessionDateTimeCellClient } from "@/components/shared/schedule/schedule-session-datetime-cell-client";
import { StaffScheduleHeaderCell } from "@/components/shared/schedule/staff-schedule-column-chrome";
import { StaffScheduleSessionCardFields } from "@/components/shared/schedule/staff-schedule-session-card-fields";
import { getScheduleSessionsListLayout } from "@/components/shared/schedule/schedule-sessions-list-layout";
import type { ScheduleSessionListRow } from "@/components/shared/schedule/schedule-session-list-types";
import { SCHEDULE_PAST_LIST_ROW_CLASS } from "@/components/shared/schedule/schedule-week-view-tokens";
import { isScheduleSessionOnPastDay } from "@/components/shared/schedule/schedule-week-view-utils";
import { scheduleTodayIsoDate } from "@/lib/local-iso-date";

type StaffScheduleSessionsTableProps = {
  locale: string;
  rows: readonly ScheduleSessionListRow[];
  emptyTitle: string;
  emptyBody: string;
  preset?: "staffReadOnly" | "staffWithCoach";
};

export function StaffScheduleSessionsTable({
  locale,
  rows,
  emptyTitle,
  emptyBody,
  preset = "staffWithCoach",
}: StaffScheduleSessionsTableProps) {
  const t = useTranslations("adminPages.classes");
  const layout = getScheduleSessionsListLayout(preset);
  const isStaffReadOnly = preset === "staffReadOnly";
  const showCoach = preset === "staffWithCoach";
  const sorted = [...rows].sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  if (sorted.length === 0) {
    return (
      <div className={adminChrome.panel}>
        <p className="font-medium text-sage-900">{emptyTitle}</p>
        <p className="mt-1 text-sm text-sage-600">{emptyBody}</p>
      </div>
    );
  }

  return (
    <div className={layout.tableClass}>
      <div className={layout.headerClass}>
        {isStaffReadOnly ? (
          <>
            <StaffScheduleHeaderCell column="class" label={t("colClass")} />
            <StaffScheduleHeaderCell
              column="dateTime"
              label={t("colDateTime")}
              className={layout.dateTimeHeaderCellClass}
            />
            <StaffScheduleHeaderCell
              column="capacity"
              label={t("colCapacity")}
              className={layout.emphasizedHeaderClass}
            />
            <StaffScheduleHeaderCell
              column="level"
              label={t("colLevel")}
              className={layout.levelHeaderCellClass}
            />
          </>
        ) : (
          <>
            <span>{t("colClass")}</span>
            <span className={layout.dateTimeHeaderCellClass}>{t("colDateTime")}</span>
            {showCoach ? (
              <span className={layout.emphasizedHeaderClass}>{t("colCoach")}</span>
            ) : null}
            <span aria-hidden="true" />
            <span className={layout.emphasizedHeaderClass}>{t("colCapacity")}</span>
            <span className={layout.statusHeaderCellClass}>{t("colStatus")}</span>
          </>
        )}
      </div>
      {sorted.map((row) => (
        <StaffScheduleSessionRowClient
          key={row.id}
          locale={locale}
          row={row}
          preset={preset}
        />
      ))}
    </div>
  );
}

function StaffScheduleSessionRowClient({
  locale,
  row,
  preset,
}: {
  locale: string;
  row: ScheduleSessionListRow;
  preset: "staffReadOnly" | "staffWithCoach";
}) {
  const t = useTranslations("adminPages.classes");
  const layout = getScheduleSessionsListLayout(preset);
  const showCoach = preset === "staffWithCoach";
  const booked = row._count.bookings;
  const coachLabel = row.coach ? coachName(row.coach) : t("fallback.notSpecified");

  return (
    <article
      className={`${layout.rowClass} ${
        isScheduleSessionOnPastDay(row.startsAt, scheduleTodayIsoDate())
          ? SCHEDULE_PAST_LIST_ROW_CLASS
          : ""
      }`.trim()}
    >
      <StaffScheduleSessionCardFields
        row={row}
        layout={layout}
        subtitle={sessionClassSubtitle(row.title, row.classType.name, row.classFormat)}
        coachLine={showCoach && row.coach ? t("withCoach", { name: coachLabel }) : null}
        coachLabel={coachLabel}
        statusLabel={t(`status.${row.status}`)}
        datetime={
          <ScheduleSessionDateTimeCellClient
            locale={locale}
            startsAt={row.startsAt}
            endsAt={row.endsAt}
          />
        }
        capacity={
          <ScheduleSessionRegistrationsCapacity
            sessionId={row.id}
            sessionTitle={row.title}
            startsAt={row.startsAt}
            locale={locale}
            booked={booked}
            capacity={row.capacity}
            spotsLabel={t("fields.spotsBooked", { booked, capacity: row.capacity })}
            secondaryLabel={t("fields.spotsLeft", { count: spotsLeft(row) })}
            bookedCountAriaLabel={t("registrationsModal.viewBookedAria", { count: booked })}
          />
        }
        showCoach={showCoach}
        showStatus={showCoach}
      />
    </article>
  );
}
