import { getTranslations } from "next-intl/server";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { ScheduleSessionCapacityIndicator } from "@/components/shared/schedule/schedule-session-capacity-indicator";
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
import { ScheduleSessionDateTimeCell } from "@/components/shared/schedule/schedule-session-datetime-cell";
import { ScheduleSessionLevelLabels } from "@/components/shared/schedule/schedule-session-level-labels";
import {
  getScheduleSessionsListLayout,
  type ScheduleSessionsListPreset,
} from "@/components/shared/schedule/schedule-sessions-list-layout";
import type { ScheduleSessionListRow } from "@/components/shared/schedule/schedule-session-list-types";

type StaffSchedulePreset = Extract<
  ScheduleSessionsListPreset,
  "staffReadOnly" | "staffWithCoach"
>;

type StaffScheduleSessionRowProps = {
  locale: string;
  row: ScheduleSessionListRow;
  preset?: StaffSchedulePreset;
};

/** Read-only schedule session row — coach/manager staff views. */
export async function StaffScheduleSessionRow({
  locale,
  row,
  preset = "staffReadOnly",
}: StaffScheduleSessionRowProps) {
  const t = await getTranslations({ locale, namespace: "adminPages.classes" });
  const layout = getScheduleSessionsListLayout(preset);
  const classFormat = row.classFormat?.trim();
  const levels = splitSessionLevels(row.level);
  const duration = durationMinutes(row);
  const showCoach = preset === "staffWithCoach";
  const booked = row._count.bookings;
  const capacityLabel = t("fields.spotsBooked", { booked, capacity: row.capacity });
  const spotsLeftLabel = t("fields.spotsLeft", { count: spotsLeft(row) });

  return (
    <article className={layout.rowClass}>
      <div className={layout.cellClass}>
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

      <div className={layout.dateTimeCellClass}>
        <AdminListMobileLabel label={t("colDateTime")} />
        <ScheduleSessionDateTimeCell
          locale={locale}
          startsAt={row.startsAt}
          endsAt={row.endsAt}
        />
      </div>

      {showCoach ? (
        <div className={layout.coachCellClass}>
          <AdminListMobileLabel label={t("colCoach")} />
          <p
            className="truncate text-sm text-sage-800"
            title={row.coach ? coachName(row.coach) : undefined}
          >
            {row.coach ? coachName(row.coach) : t("fallback.notSpecified")}
          </p>
        </div>
      ) : null}

      {showCoach ? null : (
        <div className={layout.tagsCellClass}>
          <AdminListMobileLabel label={t("colTags")} />
          <ScheduleSessionLevelLabels
            levels={levels}
            emptyLabel={t("fallback.notSpecified")}
          />
        </div>
      )}

      <div className={layout.statusCellClass}>
        <AdminListMobileLabel label={t("colStatus")} />
        <span
          className={`${ADMIN_SCHEDULE_STATUS_BADGE_CLASS} ${sessionStatusBadgeTone(row.status)}`}
        >
          {t(`status.${row.status}`)}
        </span>
      </div>

      <div className={layout.capacityCellClass}>
        <AdminListMobileLabel label={t("colCapacity")} />
        <ScheduleSessionCapacityIndicator
          booked={booked}
          capacity={row.capacity}
          spotsLabel={capacityLabel}
          secondaryLabel={spotsLeftLabel}
        />
      </div>
    </article>
  );
}
