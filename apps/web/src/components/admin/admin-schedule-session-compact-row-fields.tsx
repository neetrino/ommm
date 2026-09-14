"use client";

import { useTranslations } from "next-intl";
import {
  coachName,
  sessionClassSubtitle,
  splitSessionLevels,
} from "@/components/admin/admin-schedule-session-display";
import {
  ADMIN_SCHEDULE_STATUS_BADGE_CLASS,
  sessionStatusBadgeTone,
} from "@/components/admin/admin-schedule-session-list-badges";
import {
  canDeleteAdminScheduleSession,
  hasAdminScheduleSessionRowActions,
} from "@/components/admin/admin-schedule-session.helpers";
import { AdminScheduleSessionRowActions } from "@/components/admin/admin-schedule-session-row-actions";
import { AdminScheduleSessionSelectCheckbox } from "@/components/admin/admin-schedule-session-select-checkbox";
import type { AdminScheduleSession } from "@/components/admin/admin-schedule-management";
import {
  ADMIN_SCHEDULE_SESSIONS_LIST_ACTIONS_AREA_CLASS,
  ADMIN_SCHEDULE_SESSIONS_LIST_ACTIONS_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_CAPACITY_AREA_CLASS,
  ADMIN_SCHEDULE_SESSIONS_LIST_CAPACITY_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_CLASS_AREA_CLASS,
  ADMIN_SCHEDULE_SESSIONS_LIST_COACH_AREA_CLASS,
  ADMIN_SCHEDULE_SESSIONS_LIST_COACH_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_DATETIME_AREA_CLASS,
  ADMIN_SCHEDULE_SESSIONS_LIST_DATE_TIME_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_SELECT_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_SPACER_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_SUBTITLE_CLASS,
  ADMIN_SCHEDULE_SESSIONS_LIST_TAGS_AREA_CLASS,
  ADMIN_SCHEDULE_SESSIONS_LIST_TAGS_CELL,
  ADMIN_SCHEDULE_SESSIONS_LIST_TITLE_CLASS,
} from "@/components/admin/admin-schedule-sessions-list-layout";
import { ScheduleSessionClassHeading } from "@/components/shared/schedule/schedule-session-class-heading";
import { ScheduleSessionRegistrationsCapacity } from "@/components/shared/schedule/schedule-session-registrations-capacity";
import { ScheduleSessionDateTimeCellClient } from "@/components/shared/schedule/schedule-session-datetime-cell-client";
import { ScheduleSessionLevelLabels } from "@/components/shared/schedule/schedule-session-level-labels";

const SELECT_CHECKBOX_PASSIVE_VISIBILITY_CLASS = [
  "opacity-0 invisible",
  "group-hover:opacity-100 group-hover:visible",
  "group-focus-within:opacity-100 group-focus-within:visible",
].join(" ");

export type ScheduleSessionCardFieldsProps = {
  row: AdminScheduleSession;
  locale: string;
  busy: boolean;
  selected: boolean;
  selectionEnabled: boolean;
  onToggleSelect?: (rowId: string, selected: boolean) => void;
  onDuplicate?: (row: AdminScheduleSession) => void;
  onCancel?: (row: AdminScheduleSession) => void;
  onActivate?: (row: AdminScheduleSession) => void;
  onDelete?: (row: AdminScheduleSession) => void;
  canAddVisitor?: boolean;
  showCoach?: boolean;
};

export function ScheduleSessionCardFields({
  row,
  locale,
  busy,
  selected,
  selectionEnabled,
  onToggleSelect,
  onDuplicate,
  onCancel,
  onActivate,
  onDelete,
  canAddVisitor = true,
  showCoach = true,
}: ScheduleSessionCardFieldsProps) {
  const t = useTranslations("adminPages.classes");
  const subtitle = sessionClassSubtitle(row.title, row.classType.name, row.classFormat);
  const coachLabel = coachName(row.coach);
  const levels = splitSessionLevels(row.level);
  const showActions = hasAdminScheduleSessionRowActions({
    onDuplicate,
    onCancel,
    onActivate,
    onDelete,
  });
  const statusLabel = t(`status.${row.status}`);

  return (
    <>
      <ScheduleSessionSelectCell
        row={row}
        busy={busy}
        selected={selected}
        selectionEnabled={selectionEnabled}
        onToggleSelect={onToggleSelect}
      />
      <div
        className={`${ADMIN_SCHEDULE_SESSIONS_LIST_CELL} ${ADMIN_SCHEDULE_SESSIONS_LIST_CLASS_AREA_CLASS} ${
          selectionEnabled ? "max-md:pl-8" : ""
        }`}
      >
        <ScheduleSessionClassHeading
          title={row.title}
          subtitle={subtitle}
          coachLine={showCoach ? t("withCoach", { name: coachLabel }) : null}
          titleClass={ADMIN_SCHEDULE_SESSIONS_LIST_TITLE_CLASS}
          subtitleClass={ADMIN_SCHEDULE_SESSIONS_LIST_SUBTITLE_CLASS}
        />
      </div>
      <ScheduleSessionMetaCells
        row={row}
        locale={locale}
        coachLabel={coachLabel}
        canAddVisitor={canAddVisitor}
        showCoach={showCoach}
      />
      <ScheduleSessionTagsCell
        levels={levels}
        status={row.status}
        statusLabel={statusLabel}
        showMobileStatus={!showActions}
      />
      {showActions ? (
        <ScheduleSessionActionsCell
          row={row}
          busy={busy}
          statusLabel={statusLabel}
          onDuplicate={onDuplicate}
          onCancel={onCancel}
          onActivate={onActivate}
          onDelete={onDelete}
        />
      ) : null}
    </>
  );
}

function ScheduleSessionSelectCell({
  row,
  busy,
  selected,
  selectionEnabled,
  onToggleSelect,
}: {
  row: AdminScheduleSession;
  busy: boolean;
  selected: boolean;
  selectionEnabled: boolean;
  onToggleSelect?: (rowId: string, selected: boolean) => void;
}) {
  const t = useTranslations("adminPages.classes");
  if (!selectionEnabled || onToggleSelect === undefined) {
    return <div className={ADMIN_SCHEDULE_SESSIONS_LIST_SELECT_CELL} aria-hidden="true" />;
  }

  return (
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
  );
}

function ScheduleSessionMetaCells({
  row,
  locale,
  coachLabel,
  canAddVisitor,
  showCoach,
}: {
  row: AdminScheduleSession;
  locale: string;
  coachLabel: string;
  canAddVisitor: boolean;
  showCoach: boolean;
}) {
  const t = useTranslations("adminPages.classes");
  const booked = row._count.bookings;

  return (
    <>
      <div
        className={`${ADMIN_SCHEDULE_SESSIONS_LIST_DATE_TIME_CELL} ${ADMIN_SCHEDULE_SESSIONS_LIST_DATETIME_AREA_CLASS}`}
      >
        <ScheduleSessionDateTimeCellClient
          locale={locale}
          startsAt={row.startsAt}
          endsAt={row.endsAt}
        />
      </div>
      {showCoach ? (
        <div
          className={`${ADMIN_SCHEDULE_SESSIONS_LIST_COACH_CELL} ${ADMIN_SCHEDULE_SESSIONS_LIST_COACH_AREA_CLASS}`}
        >
          <p className="text-sm text-sage-800">{coachLabel}</p>
        </div>
      ) : null}
      <div className={ADMIN_SCHEDULE_SESSIONS_LIST_SPACER_CELL} aria-hidden="true" />
      <div
        className={`${ADMIN_SCHEDULE_SESSIONS_LIST_CAPACITY_CELL} ${ADMIN_SCHEDULE_SESSIONS_LIST_CAPACITY_AREA_CLASS}`}
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
    </>
  );
}

function ScheduleSessionTagsCell({
  levels,
  status,
  statusLabel,
  showMobileStatus,
}: {
  levels: readonly string[];
  status: AdminScheduleSession["status"];
  statusLabel: string;
  showMobileStatus: boolean;
}) {
  const hideOnMobile = levels.length === 0 && !showMobileStatus;
  return (
    <div
      className={`${ADMIN_SCHEDULE_SESSIONS_LIST_TAGS_CELL} ${ADMIN_SCHEDULE_SESSIONS_LIST_TAGS_AREA_CLASS} ${
        hideOnMobile ? "max-md:hidden" : ""
      }`}
    >
      <span
        className={`${showMobileStatus ? "" : "max-md:hidden"} ${ADMIN_SCHEDULE_STATUS_BADGE_CLASS} ${sessionStatusBadgeTone(status)}`}
      >
        {statusLabel}
      </span>
      <ScheduleSessionLevelLabels levels={levels} emptyLabel="" />
    </div>
  );
}

function ScheduleSessionActionsCell({
  row,
  busy,
  statusLabel,
  onDuplicate,
  onCancel,
  onActivate,
  onDelete,
}: {
  row: AdminScheduleSession;
  busy: boolean;
  statusLabel: string;
  onDuplicate?: (row: AdminScheduleSession) => void;
  onCancel?: (row: AdminScheduleSession) => void;
  onActivate?: (row: AdminScheduleSession) => void;
  onDelete?: (row: AdminScheduleSession) => void;
}) {
  return (
    <div
      className={`${ADMIN_SCHEDULE_SESSIONS_LIST_ACTIONS_CELL} ${ADMIN_SCHEDULE_SESSIONS_LIST_ACTIONS_AREA_CLASS}`}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <div className="flex flex-col items-end gap-1.5 md:flex-row md:items-center md:gap-2">
        <span
          className={`md:hidden ${ADMIN_SCHEDULE_STATUS_BADGE_CLASS} ${sessionStatusBadgeTone(row.status)}`}
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
  );
}
