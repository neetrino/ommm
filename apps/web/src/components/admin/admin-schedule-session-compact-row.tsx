"use client";

import { useTranslations } from "next-intl";
import {
  coachName,
  durationMinutes,
  spotsLeft,
  splitSessionLevels,
} from "@/components/admin/admin-schedule-session-display";
import { AdminScheduleSessionRowActions } from "@/components/admin/admin-schedule-session-row-actions";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-management";
import {
  ADMIN_SCHEDULE_SESSIONS_LIST_ACTIONS_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_CAPACITY_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_DATE_TIME_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_ROW_CLASS,
  ADMIN_SCHEDULE_SESSIONS_LIST_SPACER_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_TAGS_CELL,
} from "@/components/admin/admin-schedule-sessions-list-layout";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { ADMIN_LIST_TITLE_LINK_CLASS } from "@/components/admin/admin-list-table-layout";
import { ScheduleSessionRegistrationsCapacity } from "@/components/shared/schedule/schedule-session-registrations-capacity";
import { ScheduleSessionDateTimeCellClient } from "@/components/shared/schedule/schedule-session-datetime-cell-client";
import { ScheduleSessionLevelLabels } from "@/components/shared/schedule/schedule-session-level-labels";

type AdminScheduleSessionCompactRowProps = {
  row: AdminScheduleSession;
  locale: string;
  busy: boolean;
  onDetails: (row: AdminScheduleSession) => void;
  onDuplicate?: (row: AdminScheduleSession) => void;
  onCancel?: (row: AdminScheduleSession) => void;
  onActivate?: (row: AdminScheduleSession) => void;
  onDelete?: (row: AdminScheduleSession) => void;
};

export function AdminScheduleSessionCompactRow({
  row,
  locale,
  busy,
  onDetails,
  onDuplicate,
  onCancel,
  onActivate,
  onDelete,
}: AdminScheduleSessionCompactRowProps) {
  const t = useTranslations("adminPages.classes");
  const classFormat = row.classFormat?.trim();
  const levels = splitSessionLevels(row.level);
  const booked = row._count.bookings;
  const capacityLabel = t("fields.spotsBooked", { booked, capacity: row.capacity });
  const spotsLeftLabel = t("fields.spotsLeft", { count: spotsLeft(row) });

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={row.title}
      onClick={() => onDetails(row)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onDetails(row);
        }
      }}
      className={ADMIN_SCHEDULE_SESSIONS_LIST_ROW_CLASS}
    >
      <div className={ADMIN_SCHEDULE_SESSIONS_LIST_CELL}>
        <AdminListMobileLabel label={t("colClass")} />
        <button
          type="button"
          className={ADMIN_LIST_TITLE_LINK_CLASS}
          title={row.title}
          onClick={(event) => {
            event.stopPropagation();
            onDetails(row);
          }}
        >
          {row.title}
        </button>
        <p className="mt-0.5 truncate text-xs text-sage-500">
          {row.classType.name}
          {classFormat ? ` · ${classFormat}` : ""}
          {` · ${durationMinutes(row)}m`}
        </p>
      </div>

      <div className={ADMIN_SCHEDULE_SESSIONS_LIST_DATE_TIME_CELL}>
        <AdminListMobileLabel label={t("colDateTime")} />
        <ScheduleSessionDateTimeCellClient
          locale={locale}
          startsAt={row.startsAt}
          endsAt={row.endsAt}
        />
      </div>

      <div className={ADMIN_SCHEDULE_SESSIONS_LIST_CELL}>
        <AdminListMobileLabel label={t("colCoach")} />
        <p className="truncate text-sm text-sage-800" title={coachName(row.coach)}>
          {coachName(row.coach)}
        </p>
      </div>

      <div className={ADMIN_SCHEDULE_SESSIONS_LIST_SPACER_CELL} aria-hidden="true" />

      <div
        className={ADMIN_SCHEDULE_SESSIONS_LIST_CAPACITY_CELL}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <AdminListMobileLabel label={t("colCapacity")} />
        <ScheduleSessionRegistrationsCapacity
          sessionId={row.id}
          sessionTitle={row.title}
          startsAt={row.startsAt}
          locale={locale}
          booked={booked}
          capacity={row.capacity}
          spotsLabel={capacityLabel}
          secondaryLabel={spotsLeftLabel}
          bookedCountAriaLabel={t("registrationsModal.viewBookedAria", { count: booked })}
        />
      </div>

      <div className={ADMIN_SCHEDULE_SESSIONS_LIST_TAGS_CELL}>
        <AdminListMobileLabel label={t("colTags")} />
        <ScheduleSessionLevelLabels levels={levels} />
      </div>

      <div
        className={ADMIN_SCHEDULE_SESSIONS_LIST_ACTIONS_CELL}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <AdminListMobileLabel label={t("colActions")} />
        <AdminScheduleSessionRowActions
          row={row}
          busy={busy}
          includeDelete={onDelete !== undefined}
          onDuplicate={onDuplicate}
          onCancel={onCancel}
          onActivate={onActivate}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}
