import {
  ADMIN_SCHEDULE_LEVEL_BADGE_CLASS,
  sessionLevelBadgeTone,
} from "@/components/admin/admin-schedule-session-list-badges";

type ScheduleSessionLevelLabelsProps = {
  levels: readonly string[];
  emptyLabel?: string;
};

export function ScheduleSessionLevelLabels({
  levels,
  emptyLabel = "—",
}: ScheduleSessionLevelLabelsProps) {
  if (levels.length === 0) {
    if (!emptyLabel) {
      return null;
    }
    return <span className="text-sm text-sage-400 max-md:hidden">{emptyLabel}</span>;
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
