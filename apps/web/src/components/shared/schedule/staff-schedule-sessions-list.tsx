import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { getScheduleSessionsListLayout } from "@/components/shared/schedule/schedule-sessions-list-layout";
import type { ScheduleSessionListRow } from "@/components/shared/schedule/schedule-session-list-types";
import { StaffScheduleSessionRow } from "@/components/shared/schedule/staff-schedule-session-row";

type StaffScheduleSessionsListProps = {
  locale: string;
  sessions: readonly ScheduleSessionListRow[];
  emptyMessage: string;
};

/** Read-only staff schedule list (coach, manager). */
export async function StaffScheduleSessionsList({
  locale,
  sessions,
  emptyMessage,
}: StaffScheduleSessionsListProps) {
  const tCols = await getTranslations({ locale, namespace: "adminPages.classes" });
  const layout = getScheduleSessionsListLayout("staffReadOnly");

  if (sessions.length === 0) {
    return <p className={adminChrome.metaText}>{emptyMessage}</p>;
  }

  return (
    <div className={layout.tableClass}>
      <div className={layout.headerClass}>
        <span>{tCols("colClass")}</span>
        <span className={layout.emphasizedHeaderClass}>{tCols("colDateTime")}</span>
        <span className={layout.emphasizedHeaderClass}>{tCols("colCapacity")}</span>
        <span className={layout.emphasizedHeaderClass}>{tCols("colTags")}</span>
        <span className={layout.emphasizedHeaderClass}>{tCols("colStatus")}</span>
      </div>
      {sessions.map((row) => (
        <StaffScheduleSessionRow key={row.id} locale={locale} row={row} />
      ))}
    </div>
  );
}
