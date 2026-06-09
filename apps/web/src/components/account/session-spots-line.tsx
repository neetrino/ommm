"use client";

import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";

type SessionSpotsLineProps = {
  spotsLabel: string;
  pricingLabel: string;
  className?: string;
};

/** Mobile class card — group icon, booked count, pricing. */
export function SessionSpotsLine({
  spotsLabel,
  pricingLabel,
  className = "",
}: SessionSpotsLineProps) {
  return (
    <div className={className}>
      <p className="flex min-w-0 items-center gap-2">
        <DashboardNavIcon name="users" className="h-4 w-4 shrink-0 text-sand-600" />
        <span className="min-w-0 truncate text-sm font-semibold text-sage-900">{spotsLabel}</span>
      </p>
      <p className="mt-0.5 pl-6 text-[10px] font-medium leading-tight text-sage-500">
        {pricingLabel}
      </p>
    </div>
  );
}
