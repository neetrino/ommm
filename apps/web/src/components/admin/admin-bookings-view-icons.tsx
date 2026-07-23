import type { BookingsView } from "@/components/admin/admin-bookings-view";

export type { BookingsView };

type IconProps = {
  className?: string;
};

export function AdminBookingsListViewIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2.5 4h11M2.5 8h11M2.5 12h7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AdminBookingsWeeklyViewIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="3" width="2.5" height="10" rx="0.75" fill="currentColor" />
      <rect x="6.75" y="3" width="2.5" height="10" rx="0.75" fill="currentColor" opacity="0.55" />
      <rect x="11.5" y="3" width="2.5" height="10" rx="0.75" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

export function AdminBookingsViewIcon({
  view,
  className,
}: {
  view: BookingsView;
  className?: string;
}) {
  if (view === "list") {
    return <AdminBookingsListViewIcon className={className} />;
  }
  return <AdminBookingsWeeklyViewIcon className={className} />;
}
