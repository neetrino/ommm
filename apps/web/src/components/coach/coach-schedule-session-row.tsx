import { getTranslations } from "next-intl/server";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { adminChrome } from "@/components/admin/admin-chrome";
import {
  durationMinutes,
  spotsLeft,
  splitSessionLevels,
} from "@/components/admin/admin-schedule-session-display";
import {
  ADMIN_SCHEDULE_LEVEL_BADGE_CLASS,
  ADMIN_SCHEDULE_STATUS_BADGE_CLASS,
  sessionLevelBadgeTone,
  sessionStatusBadgeTone,
} from "@/components/admin/admin-schedule-session-list-badges";
import { CoachScheduleSessionDateTime } from "@/components/coach/coach-schedule-session-datetime";
import {
  COACH_SCHEDULE_SESSIONS_LIST_CAPACITY_CELL,
  COACH_SCHEDULE_SESSIONS_LIST_CELL,
  COACH_SCHEDULE_SESSIONS_LIST_DATE_TIME_CELL,
  COACH_SCHEDULE_SESSIONS_LIST_ROW_CLASS,
  COACH_SCHEDULE_SESSIONS_LIST_STATUS_CELL,
  COACH_SCHEDULE_SESSIONS_LIST_TAGS_CELL,
} from "@/components/coach/coach-schedule-sessions-list-layout";
import type { CoachPanelSessionRow } from "@/lib/coach-panel-types";

type CoachScheduleSessionRowProps = {
  locale: string;
  row: CoachPanelSessionRow;
};

export async function CoachScheduleSessionRow({
  locale,
  row,
}: CoachScheduleSessionRowProps) {
  const t = await getTranslations({ locale, namespace: "adminPages.classes" });
  const classFormat = row.classFormat?.trim();
  const levels = splitSessionLevels(row.level);
  const duration = durationMinutes(row);

  return (
    <article className={COACH_SCHEDULE_SESSIONS_LIST_ROW_CLASS}>
      <div className={COACH_SCHEDULE_SESSIONS_LIST_CELL}>
        <AdminListMobileLabel label={t("colClass")} />
        <p className="truncate text-sm font-medium text-sage-900" title={row.title}>
          {row.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-sage-500">
          {row.classType.name}
          {classFormat ? ` · ${classFormat}` : ""}
          {` · ${duration}m`}
        </p>
      </div>

      <div className={COACH_SCHEDULE_SESSIONS_LIST_DATE_TIME_CELL}>
        <AdminListMobileLabel label={t("colDateTime")} />
        <CoachScheduleSessionDateTime
          locale={locale}
          startsAt={row.startsAt}
          endsAt={row.endsAt}
        />
      </div>

      <div className={COACH_SCHEDULE_SESSIONS_LIST_CAPACITY_CELL}>
        <AdminListMobileLabel label={t("colCapacity")} />
        <p className="text-sm font-medium text-sage-800">
          {row._count.bookings}/{row.capacity}
        </p>
        <p className={`${adminChrome.metaText} mt-0.5`}>
          {t("fields.spotsLeft", { count: spotsLeft(row) })}
        </p>
      </div>

      <div className={COACH_SCHEDULE_SESSIONS_LIST_TAGS_CELL}>
        <AdminListMobileLabel label={t("colTags")} />
        <SessionLevelLabels levels={levels} fallback={t("fallback.notSpecified")} />
      </div>

      <div className={COACH_SCHEDULE_SESSIONS_LIST_STATUS_CELL}>
        <AdminListMobileLabel label={t("colStatus")} />
        <span
          className={`${ADMIN_SCHEDULE_STATUS_BADGE_CLASS} ${sessionStatusBadgeTone(row.status)}`}
        >
          {t(`status.${row.status}`)}
        </span>
      </div>
    </article>
  );
}

function SessionLevelLabels({
  levels,
  fallback,
}: {
  levels: readonly string[];
  fallback: string;
}) {
  if (levels.length === 0) {
    return <span className="text-sm text-sage-400">{fallback}</span>;
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
