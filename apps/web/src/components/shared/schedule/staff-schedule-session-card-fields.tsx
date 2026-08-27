import type { ReactNode } from "react";
import { ScheduleSessionClassHeading } from "@/components/shared/schedule/schedule-session-class-heading";
import { ScheduleSessionLevelLabels } from "@/components/shared/schedule/schedule-session-level-labels";
import {
  ADMIN_SCHEDULE_STATUS_BADGE_CLASS,
  sessionStatusBadgeTone,
} from "@/components/admin/admin-schedule-session-list-badges";
import { splitSessionLevels } from "@/components/admin/admin-schedule-session-display";
import type { ScheduleSessionsListLayout } from "@/components/shared/schedule/schedule-sessions-list-layout";
import type { ScheduleSessionListRow } from "@/components/shared/schedule/schedule-session-list-types";

type StaffScheduleSessionCardFieldsProps = {
  row: ScheduleSessionListRow;
  layout: ScheduleSessionsListLayout;
  subtitle: string | null;
  coachLine: string | null;
  coachLabel: string;
  statusLabel: string;
  datetime: ReactNode;
  capacity: ReactNode;
  showCoach: boolean;
  showStatus: boolean;
};

/** Shared staff session card cells — admin list uses a separate compact row. */
export function StaffScheduleSessionCardFields({
  row,
  layout,
  subtitle,
  coachLine,
  coachLabel,
  statusLabel,
  datetime,
  capacity,
  showCoach,
  showStatus,
}: StaffScheduleSessionCardFieldsProps) {
  const levels = splitSessionLevels(row.level);

  return (
    <>
      <div className={`${layout.cellClass} ${layout.classAreaClass}`}>
        <ScheduleSessionClassHeading
          title={row.title}
          subtitle={subtitle}
          coachLine={coachLine}
          titleClass={layout.titleClass}
          subtitleClass={layout.subtitleClass}
        />
      </div>
      <div className={`${layout.dateTimeCellClass} ${layout.datetimeAreaClass}`}>{datetime}</div>
      {showCoach ? (
        <div className={`${layout.coachCellClass} ${layout.coachAreaClass}`}>
          <p className="text-sm text-sage-800">{coachLabel}</p>
        </div>
      ) : null}
      {showCoach ? <div className={layout.spacerCellClass} aria-hidden="true" /> : null}
      <div className={`${layout.capacityCellClass} ${layout.capacityAreaClass}`}>{capacity}</div>
      {showStatus ? (
        <div className={`${layout.statusCellClass} ${layout.statusAreaClass}`}>
          <span className={`${ADMIN_SCHEDULE_STATUS_BADGE_CLASS} ${sessionStatusBadgeTone(row.status)}`}>
            {statusLabel}
          </span>
        </div>
      ) : (
        <div
          className={`${layout.levelCellClass} ${layout.tagsAreaClass} ${
            levels.length === 0 ? "max-md:hidden" : ""
          }`}
        >
          <ScheduleSessionLevelLabels levels={levels} emptyLabel="" />
        </div>
      )}
    </>
  );
}
