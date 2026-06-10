type ScheduleSessionCapacityIndicatorProps = {
  booked: number;
  capacity: number;
  spotsLabel: string;
  secondaryLabel: string;
};

const CAPACITY_TRACK_CLASS = "bg-white/90 ring-1 ring-inset ring-sand-500/20";
/** Slightly deeper than ACTIVE badge — `mint-200` (mint-100 + sage). */
const CAPACITY_FILL_CLASS = "bg-mint-200";
const CAPACITY_FILL_MIN_PERCENT = 8;

function fillWidthPercent(booked: number, capacity: number): number {
  if (capacity <= 0 || booked <= 0) return 0;
  const ratio = Math.min(100, (booked / capacity) * 100);
  return Math.max(ratio, CAPACITY_FILL_MIN_PERCENT);
}

type CapacityFillBarProps = {
  booked: number;
  capacity: number;
  spotsLabel: string;
};

function CapacityFillBar({ booked, capacity, spotsLabel }: CapacityFillBarProps) {
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
        className={`block h-full min-w-0 rounded-full transition-[width] duration-300 ease-out ${CAPACITY_FILL_CLASS}`}
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
