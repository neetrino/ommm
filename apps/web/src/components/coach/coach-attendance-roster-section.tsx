import { getTranslations } from "next-intl/server";
import { MarkAttendanceButtons } from "@/components/coach/mark-attendance-buttons";
import type { CoachPanelBookingRow } from "@/lib/coach-panel-types";
import { StaffRosterList } from "@/components/shared/staff/staff-roster-list";

type CoachAttendanceRosterSectionProps = {
  locale: string;
  roster: CoachPanelBookingRow[];
};

export async function CoachAttendanceRosterSection({
  locale,
  roster,
}: CoachAttendanceRosterSectionProps) {
  const t = await getTranslations({
    locale,
    namespace: "coachPages.groups.attendanceRoster",
  });

  const items = roster.map((row) => ({
    row: {
      id: row.id,
      user: row.user,
      session: row.session,
    },
    actions: <MarkAttendanceButtons bookingId={row.id} />,
  }));

  return (
    <StaffRosterList locale={locale} items={items} emptyMessage={t("empty")} />
  );
}
