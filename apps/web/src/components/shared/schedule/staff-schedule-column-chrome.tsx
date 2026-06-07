import type { ReactNode } from "react";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import type { DashboardNavIcon as DashboardNavIconName } from "@/lib/dashboard-nav";

export type StaffScheduleColumnKey = "class" | "dateTime" | "capacity" | "level";

const STAFF_SCHEDULE_HEADER_ICON_CLASS = "h-3.5 w-3.5 shrink-0 text-mint-600";
const STAFF_SCHEDULE_VALUE_ICON_CLASS = "mt-0.5 h-3.5 w-3.5 shrink-0 text-mint-600";

const ICON_BY_COLUMN: Record<StaffScheduleColumnKey, DashboardNavIconName> = {
  class: "layoutGrid",
  dateTime: "calendar",
  capacity: "users",
  level: "trendingUp",
};

type StaffScheduleHeaderCellProps = {
  column: StaffScheduleColumnKey;
  label: string;
  className?: string;
};

/** Column label with accent icon — coach/manager read-only schedule tables. */
export function StaffScheduleHeaderCell({
  column,
  label,
  className,
}: StaffScheduleHeaderCellProps) {
  return (
    <span
      className={["flex w-full min-w-0 items-center gap-1.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <DashboardNavIcon name={ICON_BY_COLUMN[column]} className={STAFF_SCHEDULE_HEADER_ICON_CLASS} />
      <span className="truncate">{label}</span>
    </span>
  );
}

type StaffScheduleMobileLabelProps = {
  column: StaffScheduleColumnKey;
  label: string;
};

/** Mobile stack label with the same icon set as desktop headers. */
export function StaffScheduleMobileLabel({ column, label }: StaffScheduleMobileLabelProps) {
  return (
    <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-sage-600 md:hidden">
      <DashboardNavIcon name={ICON_BY_COLUMN[column]} className="h-3 w-3 shrink-0 text-mint-600" />
      <span>{label}</span>
    </p>
  );
}

type StaffScheduleValueWithIconProps = {
  column: StaffScheduleColumnKey;
  children: ReactNode;
  className?: string;
};

/** Wraps cell content with a subtle leading icon on all breakpoints. */
export function StaffScheduleValueWithIcon({
  column,
  children,
  className,
}: StaffScheduleValueWithIconProps) {
  return (
    <div className={["flex min-w-0 items-start gap-2", className].filter(Boolean).join(" ")}>
      <DashboardNavIcon name={ICON_BY_COLUMN[column]} className={STAFF_SCHEDULE_VALUE_ICON_CLASS} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
