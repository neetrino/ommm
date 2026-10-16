type IconProps = { className?: string };

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true as const,
};

export function CouponTicketIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...STROKE}>
      <path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4V7z" />
      <path d="M9 9.5h.01M15 14.5h.01M14.5 9.5 9.5 14.5" />
    </svg>
  );
}

export function CouponPercentIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...STROKE}>
      <circle cx="7.5" cy="7.5" r="2.2" />
      <circle cx="16.5" cy="16.5" r="2.2" />
      <path d="M16 6 8 18" />
    </svg>
  );
}

export function CouponCalendarIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...STROKE}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </svg>
  );
}

export function CouponLimitIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...STROKE}>
      <path d="M5 19V9M12 19V5M19 19v-6" />
    </svg>
  );
}

export function CouponPeopleIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...STROKE}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19v-1a5.5 5.5 0 0 1 11 0v1" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M17 13.5a4.5 4.5 0 0 1 4 3.5" />
    </svg>
  );
}

export function CouponBagIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} {...STROKE}>
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </svg>
  );
}
