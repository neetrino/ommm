"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Link } from "@/i18n/navigation";

type MemberDashboardHeaderProps = {
  title: string;
  onMenuToggle: () => void;
  drawerOpen: boolean;
  notificationHref?: string;
  notificationLabel?: string;
  notificationsActive?: boolean;
};

export function MemberDashboardHeader({
  title,
  onMenuToggle,
  drawerOpen,
  notificationHref,
  notificationLabel,
  notificationsActive = false,
}: MemberDashboardHeaderProps) {
  const tShell = useTranslations("dashboard.shell");

  const notificationClass = notificationsActive
    ? "ommm-admin-icon-button ommm-admin-icon-button-active"
    : "ommm-admin-icon-button";

  return (
    <div className="ommm-admin-header-bar">
      <button
        type="button"
        className="ommm-admin-menu-button lg:hidden"
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
          {drawerOpen ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <path
              d="M4 7h16M4 12h16M4 17h16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </button>

      <h1 className="ommm-admin-header-title min-w-0 flex-1">{title}</h1>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        {notificationHref && notificationLabel ? (
          <Link
            href={notificationHref}
            className={notificationClass}
            aria-label={notificationLabel}
            title={notificationLabel}
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
            <span className="sr-only">{notificationLabel}</span>
          </Link>
        ) : null}
        <LanguageSwitcher context="dashboard" dashboardVariant="member" />
      </div>
    </div>
  );
}
