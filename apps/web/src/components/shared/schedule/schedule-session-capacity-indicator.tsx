type ScheduleSessionCapacityIndicatorProps = {
  booked: number;
  capacity: number;
  spotsLabel: string;
  secondaryLabel: string;
};

/** Empty-track background — solid enough to read on white list cards. */
const CAPACITY_TRACK_CLASS = "bg-sand-300/90 ring-1 ring-inset ring-sand-400/30";

function fillTone(full: boolean, fewLeft: boolean): string {
  if (full) return "bg-amber-400";
  if (fewLeft) return "bg-orange-300";
  return "bg-mint-500";
}

function fillWidthPercent(booked: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.min(100, Math.round((booked / capacity) * 100));
}

type CapacityFillBarProps = {
  booked: number;
  capacity: number;
  spotsLabel: string;
};

function CapacityFillBar({ booked, capacity, spotsLabel }: CapacityFillBarProps) {
  const full = booked >= capacity;
  const fewLeft = !full && capacity - booked <= 2;
  const fillWidth = fillWidthPercent(booked, capacity);

  return (
    <div
      className={`mt-1 h-2 w-full min-w-0 overflow-hidden rounded-full ${CAPACITY_TRACK_CLASS}`}
      role="progressbar"
      aria-valuenow={booked}
      aria-valuemin={0}
      aria-valuemax={capacity}
      aria-label={spotsLabel}
    >
      <div
        className={`h-full rounded-full transition-[width] ${fillTone(full, fewLeft)}`}
        style={{ width: `${fillWidth}%` }}
      />
    </div>
  );
}

/** Capacity fill bar — fits existing list column; booked + empty segments. */
export function ScheduleSessionCapacityIndicator({
  booked,
  capacity,
  spotsLabel,
  secondaryLabel,
}: ScheduleSessionCapacityIndicatorProps) {
  return (
    <div className="min-w-0 w-full max-w-full" aria-label={spotsLabel}>
      <div className="flex items-baseline gap-1">
        <span className="font-serif text-lg leading-none tabular-nums text-sage-950">
          {booked}
        </span>
        <span className="text-[10px] font-medium text-sage-500">/ {capacity}</span>
      </div>
      <CapacityFillBar booked={booked} capacity={capacity} spotsLabel={spotsLabel} />
      <p className="mt-0.5 truncate text-[10px] font-medium leading-tight text-sage-500">
        {secondaryLabel}
      </p>
    </div>
  );
}
