"use client";

type CallsNavPendingBadgeProps = {
  count: number;
  active: boolean;
};

export function CallsNavPendingBadge({ count, active }: CallsNavPendingBadgeProps) {
  if (count <= 0) {
    return null;
  }

  const tone = active
    ? "bg-[var(--ommm-admin-olive)] text-[var(--ommm-admin-cream)]"
    : "bg-[var(--ommm-admin-cream)]/20 text-[var(--ommm-admin-cream)]";

  return (
    <span
      className={`ml-auto inline-flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none ${tone}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
