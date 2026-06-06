type ScheduleSessionCapacityIndicatorProps = {
  booked: number;
  capacity: number;
  spotsLabel: string;
  secondaryLabel: string;
};

function fillTone(full: boolean, fewLeft: boolean): string {
  if (full) return "bg-amber-400";
  if (fewLeft) return "bg-orange-300";
  return "bg-mint-500";
}

function fillWidthPercent(booked: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return Math.min(100, Math.round((booked / capacity) * 100));
}

/** Booked/capacity numbers with a colored fill bar — staff schedule list views. */
export function ScheduleSessionCapacityIndicator({
  booked,
  capacity,
  spotsLabel,
  secondaryLabel,
}: ScheduleSessionCapacityIndicatorProps) {
  const full = booked >= capacity;
  const fewLeft = !full && capacity - booked <= 2;
  const fillWidth = fillWidthPercent(booked, capacity);

  return (
    <div className="min-w-[5.5rem] md:min-w-[6.25rem]" aria-label={spotsLabel}>
      <div className="flex items-baseline gap-1">
        <span className="font-serif text-xl leading-none tabular-nums text-sage-950 md:text-2xl">
          {booked}
        </span>
        <span className="text-[11px] font-medium text-sage-500 md:text-xs">/ {capacity}</span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-sand-200/80"
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
      <p className="mt-1 truncate text-[11px] font-medium leading-tight text-sage-600 md:text-xs">
        {secondaryLabel}
      </p>
    </div>
  );
}
