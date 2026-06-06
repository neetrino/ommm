import { ScheduleSessionCapacityIndicator } from "@/components/shared/schedule/schedule-session-capacity-indicator";

type SessionSpotsIndicatorProps = {
  booked: number;
  capacity: number;
  pricingLabel: string;
  spotsLabel: string;
};

export function SessionSpotsIndicator({
  booked,
  capacity,
  pricingLabel,
  spotsLabel,
}: SessionSpotsIndicatorProps) {
  return (
    <ScheduleSessionCapacityIndicator
      booked={booked}
      capacity={capacity}
      spotsLabel={spotsLabel}
      secondaryLabel={pricingLabel}
    />
  );
}
