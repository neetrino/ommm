import { getTranslations } from "next-intl/server";
import {
  coachName,
  sessionClassSubtitle,
  spotsLeft,
} from "@/components/admin/admin-schedule-session-display";
import { ScheduleSessionCapacityIndicator } from "@/components/shared/schedule/schedule-session-capacity-indicator";
import { ScheduleSessionDateTimeCell } from "@/components/shared/schedule/schedule-session-datetime-cell";
import { StaffScheduleSessionCardFields } from "@/components/shared/schedule/staff-schedule-session-card-fields";
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
  const showCoach = preset === "staffWithCoach";
  const booked = row._count.bookings;
  const coachLabel = row.coach ? coachName(row.coach) : t("fallback.notSpecified");

  return (
    <article className={layout.rowClass}>
      <StaffScheduleSessionCardFields
        row={row}
        layout={layout}
        subtitle={sessionClassSubtitle(row.title, row.classType.name, row.classFormat)}
        coachLine={showCoach && row.coach ? t("withCoach", { name: coachLabel }) : null}
        coachLabel={coachLabel}
        statusLabel={t(`status.${row.status}`)}
        datetime={
          <ScheduleSessionDateTimeCell
            locale={locale}
            startsAt={row.startsAt}
            endsAt={row.endsAt}
          />
        }
        capacity={
          <ScheduleSessionCapacityIndicator
            booked={booked}
            capacity={row.capacity}
            spotsLabel={t("fields.spotsBooked", { booked, capacity: row.capacity })}
            secondaryLabel={t("fields.spotsLeft", { count: spotsLeft(row) })}
          />
        }
        showCoach={showCoach}
        showStatus={showCoach}
      />
    </article>
  );
}
