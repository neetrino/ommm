"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type MemberMobileWorkspaceBarProps = {
  title: string;
  drawerOpen: boolean;
  onMenuToggle: () => void;
  notificationHref: string | null;
  notificationsLabel: string | null;
  notificationsActive: boolean;
  onAfterNavigate: () => void;
};

function MenuGlyph({ open }: { open: boolean }) {
  if (open) {
    return (
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    );
  }

  return (
    <path
      d="M4 7h16M4 12h16M4 17h16"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/** Mobile/tablet workspace nav trigger — opens the member sidebar drawer. */
export function MemberMobileWorkspaceBar({
  title,
  drawerOpen,
  onMenuToggle,
  notificationHref,
  notificationsLabel,
  notificationsActive,
  onAfterNavigate,
}: MemberMobileWorkspaceBarProps) {
  const tShell = useTranslations("dashboard.shell");

  return (
    <div className="ommm-admin-content shrink-0 px-4 pb-2 pt-3 lg:hidden sm:px-6">
      <div className="ommm-admin-header-bar">
        <button
          type="button"
          className="ommm-admin-menu-button"
          aria-expanded={drawerOpen}
          aria-controls="dashboard-mobile-drawer"
          aria-label={drawerOpen ? tShell("closeMenu") : tShell("openMenu")}
          onClick={onMenuToggle}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <MenuGlyph open={drawerOpen} />
          </svg>
        </button>

        <h1 className="ommm-admin-header-title min-w-0 flex-1 truncate">{title}</h1>

        {notificationHref && notificationsLabel ? (
          <Link
            href={notificationHref}
            className={
              notificationsActive
                ? "ommm-admin-icon-button ommm-admin-icon-button-active"
                : "ommm-admin-icon-button"
            }
            aria-label={notificationsLabel}
            title={notificationsLabel}
            onClick={onAfterNavigate}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              aria-hidden
            >
              <path d="M6 10a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
              <path d="M10 21h4" />
            </svg>
            <span className="sr-only">{notificationsLabel}</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
