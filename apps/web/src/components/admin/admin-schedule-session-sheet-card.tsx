"use client";

import {
  ADMIN_SCHEDULE_STATUS_BADGE_CLASS,
  sessionStatusBadgeTone,
} from "@/components/admin/admin-schedule-session-list-badges";
import { coachName } from "@/components/admin/admin-schedule-session.helpers";
import { AdminScheduleSessionSelectCheckbox } from "@/components/admin/admin-schedule-session-select-checkbox";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-session.types";
import styles from "@/components/admin/admin-schedule-session-sheet-card.module.css";
import { ADMIN_LIST_ROW_SURFACE } from "@/components/admin/admin-list-table-layout";
import { ScheduleSessionRegistrationsCapacity } from "@/components/shared/schedule/schedule-session-registrations-capacity";
import { SCHEDULE_PAST_LIST_ROW_CLASS } from "@/components/shared/schedule/schedule-week-view-tokens";
import { isScheduleSessionOnPastDay } from "@/components/shared/schedule/schedule-week-view-utils";
import { buildSessionDateTimeDisplay } from "@/lib/session-datetime-display";
import { scheduleTodayIsoDate } from "@/lib/local-iso-date";
import { useTranslations } from "next-intl";

type SheetCardSelectProps = {
  checked: boolean;
  disabled: boolean;
  ariaLabel: string;
  onChange: (checked: boolean) => void;
};

type AdminScheduleSessionSheetCardProps = {
  row: AdminScheduleSession;
  locale: string;
  onDetails: (row: AdminScheduleSession) => void;
  canAddVisitor?: boolean;
  showCoach?: boolean;
  select?: SheetCardSelectProps | null;
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

/** Day-sheet / mobile-list session card — class + status on top, time opposite occupancy. */
export function AdminScheduleSessionSheetCard({
  row,
  locale,
  onDetails,
  canAddVisitor = true,
  showCoach = true,
  select = null,
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
    select !== null ? styles.cardWithSelect : "",
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
      {select !== null ? (
        <div
          className={styles.select}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <AdminScheduleSessionSelectCheckbox
            checked={select.checked}
            disabled={select.disabled}
            ariaLabel={select.ariaLabel}
            onChange={select.onChange}
          />
        </div>
      ) : null}
      <div className={styles.main}>
        <p className={styles.title}>{row.title}</p>
        {showCoach ? <p className={styles.coach}>{coachName(row.coach)}</p> : null}
      </div>
      <div className={styles.status}>
        <span
          className={`${ADMIN_SCHEDULE_STATUS_BADGE_CLASS} ${sessionStatusBadgeTone(row.status)}`}
        >
          {t(`status.${row.status}`)}
        </span>
      </div>
      <div className={styles.footer}>
        <SheetCardTime startTime={display?.startTime ?? ""} durationLabel={durationLabel} />
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
            bookedCountAriaLabel={t("registrationsModal.viewBookedAria", { count: booked })}
            canAdd={canAddVisitor}
          />
        </div>
      </div>
    </article>
  );
}
