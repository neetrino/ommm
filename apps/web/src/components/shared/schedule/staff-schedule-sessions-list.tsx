import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import {
  getScheduleSessionsListLayout,
  type ScheduleSessionsListPreset,
} from "@/components/shared/schedule/schedule-sessions-list-layout";
import type { ScheduleSessionListRow } from "@/components/shared/schedule/schedule-session-list-types";
import { StaffScheduleHeaderCell } from "@/components/shared/schedule/staff-schedule-column-chrome";
import { StaffScheduleSessionRow } from "@/components/shared/schedule/staff-schedule-session-row";

type StaffSchedulePreset = Extract<
  ScheduleSessionsListPreset,
  "staffReadOnly" | "staffWithCoach"
>;

type StaffScheduleSessionsListProps = {
  locale: string;
  sessions: readonly ScheduleSessionListRow[];
  emptyMessage: string;
  preset?: StaffSchedulePreset;
};

/** Read-only staff schedule list (coach, manager). */
export async function StaffScheduleSessionsList({
  locale,
  sessions,
  emptyMessage,
  preset = "staffReadOnly",
}: StaffScheduleSessionsListProps) {
  const tCols = await getTranslations({ locale, namespace: "adminPages.classes" });
  const layout = getScheduleSessionsListLayout(preset);
  const isStaffReadOnly = preset === "staffReadOnly";
  const showCoach = preset === "staffWithCoach";

  if (sessions.length === 0) {
    return <p className={adminChrome.metaText}>{emptyMessage}</p>;
  }

  return (
    <div className={layout.tableClass}>
      <div className={layout.headerClass}>
        {isStaffReadOnly ? (
          <>
            <StaffScheduleHeaderCell column="class" label={tCols("colClass")} />
            <StaffScheduleHeaderCell
              column="dateTime"
              label={tCols("colDateTime")}
              className={layout.dateTimeHeaderCellClass}
            />
            <StaffScheduleHeaderCell
              column="capacity"
              label={tCols("colCapacity")}
              className={layout.emphasizedHeaderClass}
            />
            <StaffScheduleHeaderCell
              column="level"
              label={tCols("colLevel")}
              className={layout.levelHeaderCellClass}
            />
          </>
        ) : (
          <>
            <span>{tCols("colClass")}</span>
            <span className={layout.dateTimeHeaderCellClass}>{tCols("colDateTime")}</span>
            {showCoach ? (
              <span className={layout.emphasizedHeaderClass}>{tCols("colCoach")}</span>
            ) : null}
            <span aria-hidden="true" />
            <span className={layout.emphasizedHeaderClass}>{tCols("colCapacity")}</span>
            <span className={layout.statusHeaderCellClass}>{tCols("colStatus")}</span>
          </>
        )}
      </div>
      {sessions.map((row) => (
        <StaffScheduleSessionRow key={row.id} locale={locale} row={row} preset={preset} />
      ))}
    </div>
  );
}
