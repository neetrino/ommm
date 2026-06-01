"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Link } from "@/i18n/navigation";
import type { DashboardRoleNotificationRoute } from "@/lib/dashboard-nav";

type AdminDashboardHeaderProps = {
  title: string;
  notificationRoute: DashboardRoleNotificationRoute | null;
  notificationsLabel: string | null;
  notificationsActive: boolean;
  onMenuToggle: () => void;
  drawerOpen: boolean;
};

function SearchGlyph() {
  return (
    <svg
      className="h-[17px] w-[17px] text-sage-500/70"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  );
}

export function AdminDashboardHeader({
  title,
  notificationRoute,
  notificationsLabel,
  notificationsActive,
  onMenuToggle,
  drawerOpen,
}: AdminDashboardHeaderProps) {
  const tShell = useTranslations("dashboard.shell");

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
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
      </button>

      <h1 className="ommm-admin-header-title min-w-0 shrink-0">{title}</h1>

      <div className="relative mx-auto hidden min-w-0 max-w-md flex-1 px-4 md:block">
        <span className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2">
          <SearchGlyph />
        </span>
        <input
          type="search"
          disabled
          className="ommm-admin-header-search w-full"
          placeholder={tShell("globalSearchPlaceholder")}
          aria-label={tShell("globalSearchAria")}
          title={tShell("globalSearchHint")}
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
        <LanguageSwitcher context="dashboard" dashboardVariant="admin" />
        {notificationRoute && notificationsLabel ? (
          <Link
            href={notificationRoute.href}
            className={
              notificationsActive
                ? "ommm-admin-icon-button ommm-admin-icon-button-active"
                : "ommm-admin-icon-button"
            }
            aria-label={notificationsLabel}
            title={notificationsLabel}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden
            >
              <path d="M6 10a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
              <path d="M10 21h4" />
            </svg>
          </Link>
        ) : null}
        <Link href="/admin/profile" className="ommm-admin-profile-chip">
          <span className="ommm-admin-profile-avatar" aria-hidden>
            A
          </span>
          <span className="hidden text-xs font-semibold uppercase tracking-[0.12em] text-sage-800 sm:inline">
            {tShell("adminProfileLabel")}
          </span>
        </Link>
      </div>
    </div>
  );
}
