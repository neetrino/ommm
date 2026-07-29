"use client";

import { useTranslations } from "next-intl";
import {
  coachName,
  durationMinutes,
  spotsLeft,
  splitSessionLevels,
} from "@/components/admin/admin-schedule-session-display";
import {
  ADMIN_SCHEDULE_STATUS_BADGE_CLASS,
  sessionStatusBadgeTone,
} from "@/components/admin/admin-schedule-session-list-badges";
import { canDeleteAdminScheduleSession } from "@/components/admin/admin-schedule-session.helpers";
import { AdminScheduleSessionRowActions } from "@/components/admin/admin-schedule-session-row-actions";
import { AdminScheduleSessionSelectCheckbox } from "@/components/admin/admin-schedule-session-select-checkbox";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-management";
import {
  ADMIN_SCHEDULE_SESSIONS_LIST_ACTIONS_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_CAPACITY_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_DATE_TIME_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_ROW_CLASS,
  ADMIN_SCHEDULE_SESSIONS_LIST_SELECT_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_SPACER_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_TAGS_CELL,
} from "@/components/admin/admin-schedule-sessions-list-layout";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { ADMIN_LIST_TITLE_LINK_CLASS } from "@/components/admin/admin-list-table-layout";
import { ScheduleSessionRegistrationsCapacity } from "@/components/shared/schedule/schedule-session-registrations-capacity";
import { ScheduleSessionDateTimeCellClient } from "@/components/shared/schedule/schedule-session-datetime-cell-client";
import { ScheduleSessionLevelLabels } from "@/components/shared/schedule/schedule-session-level-labels";

const MOBILE_STATUS_BADGE_CLASS =
  "pointer-events-none absolute right-3 top-3 z-10 md:hidden";

const DESKTOP_STATUS_BADGE_CLASS = "hidden md:inline-flex";

const SELECT_CHECKBOX_PASSIVE_VISIBILITY_CLASS = [
  "opacity-0 invisible",
  "group-hover:opacity-100 group-hover:visible",
  "group-focus-within:opacity-100 group-focus-within:visible",
].join(" ");

type AdminScheduleSessionCompactRowProps = {
  row: AdminScheduleSession;
  locale: string;
  busy: boolean;
  selected?: boolean;
  selectionEnabled?: boolean;
  onToggleSelect?: (rowId: string, selected: boolean) => void;
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
  selected = false,
  selectionEnabled = false,
  onToggleSelect,
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
  const statusLabel = t(`status.${row.status}`);

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
      className={`${ADMIN_SCHEDULE_SESSIONS_LIST_ROW_CLASS} group relative`}
    >
      {selectionEnabled && onToggleSelect ? (
        <div
          className={`${ADMIN_SCHEDULE_SESSIONS_LIST_SELECT_CELL} ${
            selected ? "visible opacity-100" : SELECT_CHECKBOX_PASSIVE_VISIBILITY_CLASS
          }`}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <AdminScheduleSessionSelectCheckbox
            checked={selected}
            disabled={busy}
            ariaLabel={t("bulk.selectRowAria", { title: row.title })}
            onChange={(next) => onToggleSelect(row.id, next)}
          />
        </div>
      ) : (
        <div className={ADMIN_SCHEDULE_SESSIONS_LIST_SELECT_CELL} aria-hidden="true" />
      )}

      <span
        className={`${MOBILE_STATUS_BADGE_CLASS} ${ADMIN_SCHEDULE_STATUS_BADGE_CLASS} ${sessionStatusBadgeTone(row.status)}`}
      >
        {statusLabel}
      </span>

      <div className={`${ADMIN_SCHEDULE_SESSIONS_LIST_CELL} max-md:pr-20 ${selectionEnabled ? "max-md:pl-8" : ""}`}>
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
        <div className="flex items-center justify-end gap-2">
          <span
            className={`${DESKTOP_STATUS_BADGE_CLASS} shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${sessionStatusBadgeTone(row.status)}`}
          >
            {statusLabel}
          </span>
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
      </div>
    </article>
  );
}
