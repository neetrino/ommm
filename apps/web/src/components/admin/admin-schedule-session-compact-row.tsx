"use client";

import { useTranslations } from "next-intl";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import {
  ADMIN_SCHEDULE_LEVEL_BADGE_CLASS,
  sessionLevelBadgeTone,
} from "@/components/admin/admin-schedule-session-list-badges";
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
import { adminChrome } from "@/components/admin/admin-chrome";

type AdminScheduleSessionCompactRowProps = {
  row: AdminScheduleSession;
  locale: string;
  busy: boolean;
  includeDelete?: boolean;
  onDetails: (row: AdminScheduleSession) => void;
  onEdit: (row: AdminScheduleSession) => void;
  onDuplicate: (row: AdminScheduleSession) => void;
  onCancel: (row: AdminScheduleSession) => void;
  onActivate: (row: AdminScheduleSession) => void;
  onDelete?: (row: AdminScheduleSession) => void;
};

export function AdminScheduleSessionCompactRow({
  row,
  locale,
  busy,
  includeDelete = false,
  onDetails,
  onEdit,
  onDuplicate,
  onCancel,
  onActivate,
  onDelete,
}: AdminScheduleSessionCompactRowProps) {
  const t = useTranslations("adminPages.classes");
  const classFormat = row.classFormat?.trim();
  const levels = splitSessionLevels(row.level);

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
          className="block max-w-full truncate text-left text-sm font-medium text-sage-900 underline-offset-2 hover:underline"
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
        <div className="flex min-w-0 items-center gap-3">
          <SessionDateTimeHighlight
            locale={locale}
            startsAt={row.startsAt}
            endsAt={row.endsAt}
            variant="listDate"
          />
          <SessionDateTimeHighlight
            locale={locale}
            startsAt={row.startsAt}
            endsAt={row.endsAt}
            variant="listTime"
          />
        </div>
      </div>

      <div className={ADMIN_SCHEDULE_SESSIONS_LIST_CELL}>
        <AdminListMobileLabel label={t("colCoach")} />
        <p className="truncate text-sm text-sage-800" title={coachName(row.coach)}>
          {coachName(row.coach)}
        </p>
      </div>

      <div className={ADMIN_SCHEDULE_SESSIONS_LIST_CAPACITY_CELL}>
        <AdminListMobileLabel label={t("colCapacity")} />
        <p className="text-sm font-medium text-sage-800">
          {row._count.bookings}/{row.capacity}
        </p>
        <p className={`${adminChrome.metaText} mt-0.5`}>
          {t("fields.spotsLeft", { count: spotsLeft(row) })}
        </p>
      </div>

      <div className={ADMIN_SCHEDULE_SESSIONS_LIST_TAGS_CELL}>
        <AdminListMobileLabel label={t("colTags")} />
        <SessionLevelLabels levels={levels} />
      </div>

      <div className={ADMIN_SCHEDULE_SESSIONS_LIST_SPACER_CELL} aria-hidden="true" />

      <div
        className={ADMIN_SCHEDULE_SESSIONS_LIST_ACTIONS_CELL}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <AdminListMobileLabel label={t("colActions")} />
        <AdminScheduleSessionRowActions
          variant="list"
          row={row}
          busy={busy}
          includeDelete={includeDelete}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onCancel={onCancel}
          onActivate={onActivate}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}

function SessionLevelLabels({ levels }: { levels: readonly string[] }) {
  if (levels.length === 0) {
    return <span className="text-sm text-sage-400">—</span>;
  }

  return (
    <>
      {levels.map((level, index) => (
        <span
          key={`${level}-${index}`}
          className={`${ADMIN_SCHEDULE_LEVEL_BADGE_CLASS} ${sessionLevelBadgeTone(level, index)}`}
        >
          {level}
        </span>
      ))}
    </>
  );
}
