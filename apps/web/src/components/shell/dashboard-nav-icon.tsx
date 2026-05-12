import type { DashboardNavIcon } from "@/lib/dashboard-nav";

type DashboardNavIconProps = {
  name: DashboardNavIcon;
  className?: string;
};

const STROKE = 1.75;

/** Small line icons for sidebar rows (no icon dependency). */
export function DashboardNavIcon({
  name,
  className = "h-5 w-5 shrink-0",
}: DashboardNavIconProps) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: STROKE,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 10v10h14V10" />
        </svg>
      );
    case "layoutDashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="11" width="7" height="10" rx="1" />
          <rect x="3" y="15" width="7" height="6" rx="1" />
        </svg>
      );
    case "trendingUp":
      return (
        <svg {...common}>
          <path d="M3 17h4l3-6 4 8 3-10h4" />
        </svg>
      );
    case "layoutGrid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      );
    case "ticket":
      return (
        <svg {...common}>
          <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z" />
        </svg>
      );
    case "tag":
      return (
        <svg {...common}>
          <path d="M3 6h12l6 6v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" />
          <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "gift":
      return (
        <svg {...common}>
          <rect x="3" y="8" width="18" height="13" rx="2" />
          <path d="M12 8V21M8 8h8M8 5a2 2 0 0 1 4 0 2 2 0 0 1 4 0v3H8V5z" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21v-1a7 7 0 0 1 14 0v1" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M6 10a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
          <path d="M10 21h4" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      );
    case "barChart":
      return (
        <svg {...common}>
          <path d="M4 20V10M10 20V4M16 20v-6M22 20V14" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="7" r="3" />
          <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
          <circle cx="17" cy="7" r="2.5" />
          <path d="M21 21v-1.5a3 3 0 0 0-3-3h-1" />
        </svg>
      );
    case "userCheck":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20v-2a4 4 0 0 1 3.5-4M17 8l2 2 3-3" />
          <path d="M14 21h7" />
        </svg>
      );
    case "listOrdered":
      return (
        <svg {...common}>
          <path d="M4 6h2M4 12h2M4 18h2M8 6h12M8 12h12M8 18h12" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...common}>
          <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
          <path d="M17 12h3v4h-3a2 2 0 1 1 0-4z" />
        </svg>
      );
    case "fileText":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
          <path d="M14 2v6h6M8 13h8M8 17h6" />
        </svg>
      );
    case "send":
      return (
        <svg {...common}>
          <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      );
    case "pieChart":
      return (
        <svg {...common}>
          <path d="M21 12A9 9 0 1 1 12 3v9h9" />
          <path d="M12 12 3.5 3.5" />
        </svg>
      );
  }
}
