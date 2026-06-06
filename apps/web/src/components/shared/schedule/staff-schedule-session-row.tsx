import { getTranslations } from "next-intl/server";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { adminChrome } from "@/components/admin/admin-chrome";
import {
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
import { getScheduleSessionsListLayout } from "@/components/shared/schedule/schedule-sessions-list-layout";
import type { ScheduleSessionListRow } from "@/components/shared/schedule/schedule-session-list-types";

type StaffScheduleSessionRowProps = {
  locale: string;
  row: ScheduleSessionListRow;
};

/** Read-only schedule session row — coach/manager staff views. */
export async function StaffScheduleSessionRow({
  locale,
  row,
}: StaffScheduleSessionRowProps) {
  const t = await getTranslations({ locale, namespace: "adminPages.classes" });
  const layout = getScheduleSessionsListLayout("staffReadOnly");
  const classFormat = row.classFormat?.trim();
  const levels = splitSessionLevels(row.level);
  const duration = durationMinutes(row);

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

      <div className={layout.capacityCellClass}>
        <AdminListMobileLabel label={t("colCapacity")} />
        <p className="text-sm font-medium text-sage-800">
          {row._count.bookings}/{row.capacity}
        </p>
        <p className={`${adminChrome.metaText} mt-0.5`}>
          {t("fields.spotsLeft", { count: spotsLeft(row) })}
        </p>
      </div>

      <div className={layout.tagsCellClass}>
        <AdminListMobileLabel label={t("colTags")} />
        <ScheduleSessionLevelLabels
          levels={levels}
          emptyLabel={t("fallback.notSpecified")}
        />
      </div>

      <div className={layout.statusCellClass}>
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
