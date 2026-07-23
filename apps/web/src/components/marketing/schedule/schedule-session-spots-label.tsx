import {
  SCHEDULE_SPOTS_LABEL,
  SCHEDULE_SPOTS_LABEL_URGENT,
} from "@/components/marketing/schedule/schedule-public-design";
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
        className={`${SCHEDULE_SPOTS_LABEL} ${className ?? ""}`}
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
  const toneClass = full || urgent ? SCHEDULE_SPOTS_LABEL_URGENT : "";

  return (
    <p
      className={`${SCHEDULE_SPOTS_LABEL} ${toneClass} ${className ?? ""}`}
      aria-label={label}
    >
      {label}
    </p>
  );
}
