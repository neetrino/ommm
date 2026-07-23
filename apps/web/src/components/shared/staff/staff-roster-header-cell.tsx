import type { ReactNode } from "react";
import { DashboardNavIcon } from "@/components/shell/dashboard-nav-icon";
import { CheckCircleGlyph } from "@/components/ui/admin-action-glyphs";
import type { DashboardNavIcon as DashboardNavIconName } from "@/lib/dashboard-nav";

const STAFF_ROSTER_HEADER_ICON_CLASS = "h-3.5 w-3.5 shrink-0 text-mint-600";

type StaffRosterHeaderCellProps = {
  label: string;
  icon: "userPhone" | "classType" | "dateTime" | "attendance";
  className?: string;
};

const NAV_ICON_BY_COLUMN: Record<
  Exclude<StaffRosterHeaderCellProps["icon"], "attendance">,
  DashboardNavIconName
> = {
  userPhone: "user",
  classType: "layoutGrid",
  dateTime: "calendar",
};

function StaffRosterHeaderIcon({ icon }: Pick<StaffRosterHeaderCellProps, "icon">): ReactNode {
  if (icon === "attendance") {
    return <CheckCircleGlyph className={STAFF_ROSTER_HEADER_ICON_CLASS} />;
  }

  return (
    <DashboardNavIcon
      name={NAV_ICON_BY_COLUMN[icon]}
      className={STAFF_ROSTER_HEADER_ICON_CLASS}
    />
  );
}

/** Column label with a small accent icon for staff roster tables. */
export function StaffRosterHeaderCell({
  label,
  icon,
  className,
}: StaffRosterHeaderCellProps) {
  return (
    <span
      className={["flex w-full min-w-0 items-center gap-1.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <StaffRosterHeaderIcon icon={icon} />
      <span className="truncate">{label}</span>
    </span>
  );
}
