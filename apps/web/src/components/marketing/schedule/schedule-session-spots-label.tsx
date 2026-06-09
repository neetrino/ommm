import { SCHEDULE_MUTED } from "@/components/marketing/schedule/schedule-public-design";
import { isScheduleSessionFull } from "@/lib/schedule-session-spots";

type ScheduleSessionSpotsLabelProps = {
  availableSpots: number;
  status: string;
  fullLabel: string;
  spotsLeftLabel: string;
  spotsReady?: boolean;
  spotsLoadingLabel?: string;
  className?: string;
};

export function ScheduleSessionSpotsLabel({
  availableSpots,
  status,
  fullLabel,
  spotsLeftLabel,
  spotsReady = true,
  spotsLoadingLabel = "…",
  className,
}: ScheduleSessionSpotsLabelProps) {
  if (!spotsReady) {
    return (
      <p
        className={`mt-1 text-sm tabular-nums ${SCHEDULE_MUTED} ${className ?? ""}`}
        aria-busy="true"
        aria-label={spotsLoadingLabel}
      >
        {spotsLoadingLabel}
      </p>
    );
  }

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
