import type { BookingHistoryCancelActorKind } from "@/components/admin/admin-client-bookings-history.helpers";

const BADGE_CLASS: Record<BookingHistoryCancelActorKind, string> = {
  client: "border-sage-200 bg-mint-100/90 text-sage-800",
  staff: "border-sand-500/80 bg-sand-100 text-sand-950",
};

const DOT_CLASS: Record<BookingHistoryCancelActorKind, string> = {
  client: "bg-sage-400",
  staff: "bg-sand-700",
};

type BookingBookedByBadgeProps = {
  kind: BookingHistoryCancelActorKind;
  label: string;
};

/** Who created the booking. Staff is warmer and heavier so it reads at a glance. */
export function BookingBookedByBadge({ kind, label }: BookingBookedByBadgeProps) {
  return (
    <span
      className={[
        "mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-full border",
        "px-2.5 py-1 text-[11px] font-semibold leading-none tracking-tight",
        BADGE_CLASS[kind],
      ].join(" ")}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_CLASS[kind]}`}
        aria-hidden
      />
      <span className="truncate">{label}</span>
    </span>
  );
}
