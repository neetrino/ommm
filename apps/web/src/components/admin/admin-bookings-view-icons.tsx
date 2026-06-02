type IconProps = {
  className?: string;
};

export type BookingsView = "list" | "monthly" | "weekly" | "daily";

export function AdminBookingsListViewIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  );
}

export function AdminBookingsMonthlyViewIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3 10h18" />
      <circle cx="8" cy="14.5" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14.5" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="16" cy="14.5" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="8" cy="18" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="16" cy="18" r="0.85" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function AdminBookingsWeeklyViewIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3 10h18" />
      <path d="M5.5 13.5v6M8 13.5v6M10.5 13.5v6M13 13.5v6M15.5 13.5v6M18 13.5v6M20.5 13.5v6" />
    </svg>
  );
}

export function AdminBookingsDailyViewIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3 10h18" />
      <rect x="9" y="13" width="6" height="6" rx="1.25" fill="currentColor" fillOpacity="0.22" />
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
  if (view === "monthly") {
    return <AdminBookingsMonthlyViewIcon className={className} />;
  }
  if (view === "weekly") {
    return <AdminBookingsWeeklyViewIcon className={className} />;
  }
  return <AdminBookingsDailyViewIcon className={className} />;
}
