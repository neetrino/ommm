import type { AdminCalendarView } from "@/components/admin/admin-calendar-view-switcher";
import {
  AdminBookingsListViewIcon,
  AdminBookingsWeeklyViewIcon,
} from "@/components/admin/admin-bookings-view-icons";

type IconProps = {
  className?: string;
};

export function AdminScheduleMonthViewIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="3"
        width="12"
        height="11"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M5.25 2.5v2M10.75 2.5v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="4.25" y="8.25" width="1.75" height="1.75" rx="0.4" fill="currentColor" />
      <rect x="7.125" y="8.25" width="1.75" height="1.75" rx="0.4" fill="currentColor" />
      <rect x="10" y="8.25" width="1.75" height="1.75" rx="0.4" fill="currentColor" />
      <rect x="4.25" y="11" width="1.75" height="1.75" rx="0.4" fill="currentColor" opacity="0.45" />
      <rect x="7.125" y="11" width="1.75" height="1.75" rx="0.4" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

export function AdminScheduleViewModeIcon({
  view,
  className,
}: {
  view: AdminCalendarView;
  className?: string;
}) {
  if (view === "list") {
    return <AdminBookingsListViewIcon className={className} />;
  }
  if (view === "monthly") {
    return <AdminScheduleMonthViewIcon className={className} />;
  }
  return <AdminBookingsWeeklyViewIcon className={className} />;
}
