type SessionSpotsIndicatorProps = {
  booked: number;
  capacity: number;
  pricingLabel: string;
  spotsLabel: string;
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

export function SessionSpotsIndicator({
  booked,
  capacity,
  pricingLabel,
  spotsLabel,
}: SessionSpotsIndicatorProps) {
  const full = booked >= capacity;
  const fewLeft = !full && capacity - booked <= 2;
  const fillWidth = fillWidthPercent(booked, capacity);

  return (
    <div className="min-w-[5.25rem]" aria-label={spotsLabel}>
      <div className="flex items-baseline gap-1">
        <span className="font-serif text-lg leading-none tabular-nums text-sage-950">
          {booked}
        </span>
        <span className="text-[10px] font-medium text-sage-500">/ {capacity}</span>
      </div>
      <div
        className="mt-1 h-1.5 overflow-hidden rounded-full bg-sand-200/80"
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
      <p className="mt-0.5 truncate text-[10px] font-medium leading-tight text-sage-500">
        {pricingLabel}
      </p>
    </div>
  );
}
