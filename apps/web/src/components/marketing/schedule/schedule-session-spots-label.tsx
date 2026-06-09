import { SCHEDULE_MUTED } from "@/components/marketing/schedule/schedule-public-design";
import { isScheduleSessionFull } from "@/lib/schedule-session-spots";

type ScheduleSessionSpotsLabelProps = {
  availableSpots: number;
  status: string;
  fullLabel: string;
  spotsLeftLabel: string;
  className?: string;
};

export function ScheduleSessionSpotsLabel({
  availableSpots,
  status,
  fullLabel,
  spotsLeftLabel,
  className,
}: ScheduleSessionSpotsLabelProps) {
  const full = isScheduleSessionFull(availableSpots, status);
  const urgent = !full && availableSpots <= 2;
  const label = full ? fullLabel : spotsLeftLabel;
  const toneClass = full || urgent ? "font-medium text-amber-800" : SCHEDULE_MUTED;

  return (
    <p
      className={`mt-1 text-sm tabular-nums ${toneClass} ${className ?? ""}`}
      aria-label={label}
    >
      {label}
    </p>
  );
}
