"use client";

import { useTranslations } from "next-intl";
import {
  ADMIN_SCHEDULE_STATUS_BADGE_CLASS,
  sessionStatusBadgeTone,
} from "@/components/admin/admin-schedule-session-list-badges";
import {
  canDeleteAdminScheduleSession,
  coachName,
  spotsLeft,
} from "@/components/admin/admin-schedule-session.helpers";
import { AdminScheduleSessionRowActions } from "@/components/admin/admin-schedule-session-row-actions";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-session.types";
import styles from "@/components/admin/admin-schedule-session-sheet-card.module.css";
import { ADMIN_LIST_ROW_SURFACE } from "@/components/admin/admin-list-table-layout";
import { ScheduleSessionRegistrationsCapacity } from "@/components/shared/schedule/schedule-session-registrations-capacity";
import { SCHEDULE_PAST_LIST_ROW_CLASS } from "@/components/shared/schedule/schedule-week-view-tokens";
import { isScheduleSessionOnPastDay } from "@/components/shared/schedule/schedule-week-view-utils";
import { buildSessionDateTimeDisplay } from "@/lib/session-datetime-display";
import { scheduleTodayIsoDate } from "@/lib/local-iso-date";

type AdminScheduleSessionSheetCardProps = {
  row: AdminScheduleSession;
  locale: string;
  busy: boolean;
  onDetails: (row: AdminScheduleSession) => void;
  onDuplicate?: (row: AdminScheduleSession) => void;
  onCancel?: (row: AdminScheduleSession) => void;
  onActivate?: (row: AdminScheduleSession) => void;
  onDelete?: (row: AdminScheduleSession) => void;
};

function SheetCardTime({
  startTime,
  durationLabel,
}: {
  startTime: string;
  durationLabel: string | null;
}) {
  return (
    <div className={styles.time}>
      <p className={styles.startTime}>{startTime}</p>
      {durationLabel !== null ? <span className={styles.duration}>{durationLabel}</span> : null}
    </div>
  );
}

/** Compact day-sheet session card — time, class, occupancy, actions in one row. */
export function AdminScheduleSessionSheetCard({
  row,
  locale,
  busy,
  onDetails,
  onDuplicate,
  onCancel,
  onActivate,
  onDelete,
}: AdminScheduleSessionSheetCardProps) {
  const t = useTranslations("adminPages.classes");
  const tCommon = useTranslations("common");
  const display = buildSessionDateTimeDisplay(locale, row.startsAt, row.endsAt);
  const booked = row._count.bookings;
  const durationLabel =
    display !== null && display.durationMinutes > 0
      ? tCommon("sessionDurationMinutes", { minutes: display.durationMinutes })
      : null;
  const cardClass = [
    styles.card,
    ADMIN_LIST_ROW_SURFACE,
    isScheduleSessionOnPastDay(row.startsAt, scheduleTodayIsoDate())
      ? SCHEDULE_PAST_LIST_ROW_CLASS
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={row.title}
      className={cardClass}
      onClick={() => onDetails(row)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onDetails(row);
        }
      }}
    >
      <SheetCardTime startTime={display?.startTime ?? ""} durationLabel={durationLabel} />
      <div className={styles.main}>
        <p className={styles.title}>{row.title}</p>
        <p className={styles.coach}>{coachName(row.coach)}</p>
      </div>
      <div className={styles.meta}>
        <span
          className={`${ADMIN_SCHEDULE_STATUS_BADGE_CLASS} ${sessionStatusBadgeTone(row.status)}`}
        >
          {t(`status.${row.status}`)}
        </span>
      </div>
      <div
        className={styles.capacity}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
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
          canAdd
        />
      </div>
      <div
        className={styles.actions}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <AdminScheduleSessionRowActions
          row={row}
          busy={busy}
          includeDelete={onDelete !== undefined && canDeleteAdminScheduleSession(row)}
          onDuplicate={onDuplicate}
          onCancel={onCancel}
          onActivate={onActivate}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}
