import type { MouseEvent, ReactNode } from "react";

type ScheduleSessionCapacityIndicatorProps = {
  booked: number;
  capacity: number;
  spotsLabel: string;
  secondaryLabel: string;
  onBookedCountClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  bookedCountAriaLabel?: string;
};

const CAPACITY_TRACK_CLASS = "bg-white/90 ring-1 ring-inset ring-sand-500/20";
/** Slightly deeper than ACTIVE badge — `mint-200` (mint-100 + sage). */
const CAPACITY_FILL_CLASS = "bg-mint-200";
const CAPACITY_FILL_MIN_PERCENT = 8;
const CAPACITY_HIT_AREA_CLASS =
  "min-w-0 w-full max-w-full rounded-xl px-2 py-2 text-left transition-colors";
const CAPACITY_HIT_AREA_INTERACTIVE_CLASS =
  "cursor-pointer hover:bg-sand-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2";

function fillWidthPercent(booked: number, capacity: number): number {
  if (capacity <= 0 || booked <= 0) return 0;
  const ratio = Math.min(100, (booked / capacity) * 100);
  return Math.max(ratio, CAPACITY_FILL_MIN_PERCENT);
}

type CapacityFillBarProps = {
  booked: number;
  capacity: number;
  spotsLabel: string;
  decorative?: boolean;
};

function CapacityFillBar({
  booked,
  capacity,
  spotsLabel,
  decorative = false,
}: CapacityFillBarProps) {
  const fillWidth = fillWidthPercent(booked, capacity);

  return (
    <div
      className={`mt-1 h-2 w-full min-w-0 overflow-hidden rounded-full ${CAPACITY_TRACK_CLASS}`}
      role={decorative ? undefined : "progressbar"}
      aria-hidden={decorative ? true : undefined}
      aria-valuenow={decorative ? undefined : booked}
      aria-valuemin={decorative ? undefined : 0}
      aria-valuemax={decorative ? undefined : capacity}
      aria-label={decorative ? undefined : spotsLabel}
    >
      <div
        className={`block h-full min-w-0 rounded-full transition-[width] duration-300 ease-out ${CAPACITY_FILL_CLASS}`}
        style={{ width: `${fillWidth}%` }}
      />
    </div>
  );
}

type CapacityBodyProps = {
  booked: number;
  capacity: number;
  spotsLabel: string;
  secondaryLabel: string;
  bookedInteractive: boolean;
};

function CapacityBody({
  booked,
  capacity,
  spotsLabel,
  secondaryLabel,
  bookedInteractive,
}: CapacityBodyProps) {
  return (
    <>
      <div className="flex items-baseline gap-1" aria-hidden={bookedInteractive}>
        <span
          className={
            bookedInteractive
              ? "font-serif text-lg leading-none tabular-nums text-sage-950 underline decoration-sand-300/80 decoration-dotted underline-offset-[5px]"
              : "font-serif text-lg leading-none tabular-nums text-sage-950"
          }
        >
          {booked}
        </span>
        <span className="text-[10px] font-medium text-sage-500">/ {capacity}</span>
      </div>
      <CapacityFillBar
        booked={booked}
        capacity={capacity}
        spotsLabel={spotsLabel}
        decorative={bookedInteractive}
      />
      <p
        className="mt-0.5 truncate text-[10px] font-medium leading-tight text-sage-500"
        aria-hidden={bookedInteractive}
      >
        {secondaryLabel}
      </p>
    </>
  );
}

function CapacityHitArea({
  interactive,
  ariaLabel,
  onClick,
  children,
}: {
  interactive: boolean;
  ariaLabel: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
}) {
  if (!interactive || onClick === undefined) {
    return (
      <div className={CAPACITY_HIT_AREA_CLASS} aria-label={ariaLabel}>
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`${CAPACITY_HIT_AREA_CLASS} ${CAPACITY_HIT_AREA_INTERACTIVE_CLASS}`}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** Capacity fill bar — fits existing list column; booked + empty segments. */
export function ScheduleSessionCapacityIndicator({
  booked,
  capacity,
  spotsLabel,
  secondaryLabel,
  onBookedCountClick,
  bookedCountAriaLabel,
}: ScheduleSessionCapacityIndicatorProps) {
  const bookedIsInteractive = onBookedCountClick !== undefined;

  return (
    <CapacityHitArea
      interactive={bookedIsInteractive}
      ariaLabel={bookedCountAriaLabel ?? spotsLabel}
      onClick={onBookedCountClick}
    >
      <CapacityBody
        booked={booked}
        capacity={capacity}
        spotsLabel={spotsLabel}
        secondaryLabel={secondaryLabel}
        bookedInteractive={bookedIsInteractive}
      />
    </CapacityHitArea>
  );
}
