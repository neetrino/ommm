import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import {
  getScheduleSessionsListLayout,
  type ScheduleSessionsListPreset,
} from "@/components/shared/schedule/schedule-sessions-list-layout";
import type { ScheduleSessionListRow } from "@/components/shared/schedule/schedule-session-list-types";
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
  const showCoach = preset === "staffWithCoach";

  if (sessions.length === 0) {
    return <p className={adminChrome.metaText}>{emptyMessage}</p>;
  }

  return (
    <div className={layout.tableClass}>
      <div className={layout.headerClass}>
        <span>{tCols("colClass")}</span>
        <span className={layout.emphasizedHeaderClass}>{tCols("colDateTime")}</span>
        {showCoach ? (
          <span className={layout.emphasizedHeaderClass}>{tCols("colCoach")}</span>
        ) : null}
        {showCoach ? null : (
          <span className={layout.emphasizedHeaderClass}>{tCols("colTags")}</span>
        )}
        <span className={layout.emphasizedHeaderClass}>{tCols("colStatus")}</span>
        <span className={`${layout.emphasizedHeaderClass} md:justify-self-end md:text-right`}>
          {tCols("colCapacity")}
        </span>
      </div>
      {sessions.map((row) => (
        <StaffScheduleSessionRow key={row.id} locale={locale} row={row} preset={preset} />
      ))}
    </div>
  );
}
