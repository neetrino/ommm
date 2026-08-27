"use client";

import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { useAdminPageHeaderSticky, useAdminStickyHeaderOffset } from "@/components/shell/use-admin-sticky-header-offset";
import { WorkspaceStickyPageHeader } from "@/components/shell/workspace-sticky-page-header";

type AdminPageHeroProps = {
  title: string;
  description?: ReactNode;
  search?: ReactNode;
  /** Primary CTA (Add …) — full-width below search on phone, beside search on tablet+. */
  primaryAction?: ReactNode;
  trailing?: ReactNode;
  /** Mobile-only back control inside the banner (e.g. member reviews). */
  mobileBackHref?: string;
  mobileBackLabel?: string;
  /** Defaults to sticky; set false so the hero scrolls away (e.g. mobile schedule). */
  sticky?: boolean;
};

function MobileBackChevronIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Admin / manager page header — title, full-width search on mobile, trailing actions.
 * Sticky by default so content does not show through under the site navbar.
 * On mobile, the title is centered in the banner for all workspace roles.
 */
export function AdminPageHero({
  title,
  description,
  search,
  primaryAction,
  trailing,
  mobileBackHref,
  mobileBackLabel,
  sticky = true,
}: AdminPageHeroProps) {
  const stickyEnabled = useAdminPageHeaderSticky(sticky);
  const headerRef = useAdminStickyHeaderOffset(stickyEnabled);

  return (
    <WorkspaceStickyPageHeader headerRef={headerRef} spacing="hero" sticky={stickyEnabled}>
      <div className="ommm-admin-header-bar relative flex !flex-col !flex-nowrap !items-stretch gap-3 max-sm:!justify-center sm:!flex-row sm:!flex-nowrap sm:!items-center sm:!justify-start">
        {mobileBackHref && mobileBackLabel ? (
          <Link
            href={mobileBackHref}
            className="absolute left-3 top-1/2 z-[1] inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-sage-700 transition-colors hover:bg-white/70 hover:text-sage-900 sm:hidden"
            aria-label={mobileBackLabel}
          >
            <MobileBackChevronIcon />
          </Link>
        ) : null}
        <div
          className={
            trailing
              ? "relative flex min-w-0 items-center justify-end gap-3 max-sm:w-full sm:contents"
              : "flex min-w-0 items-center justify-center gap-3 max-sm:w-full sm:contents"
          }
        >
          <div
            className={
              trailing
                ? "min-w-0 max-sm:absolute max-sm:inset-x-0 max-sm:text-center sm:relative sm:shrink-0"
                : [
                    "min-w-0 w-full text-center sm:w-auto sm:shrink-0 sm:text-left",
                    mobileBackHref ? "max-sm:px-10" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")
            }
          >
            <h1 className="ommm-admin-header-title">{title}</h1>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm text-sage-600 max-sm:mx-auto sm:mx-0">
                {description}
              </p>
            ) : null}
          </div>
          {trailing ? (
            <div className="relative z-[1] flex shrink-0 flex-wrap items-center gap-2 sm:order-last">
              {trailing}
            </div>
          ) : null}
        </div>
        {search || primaryAction ? (
          <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            {search ? (
              <div className="flex w-full min-w-0 flex-1 items-center">{search}</div>
            ) : null}
            {primaryAction ? (
              <div className="w-full shrink-0 sm:w-auto">{primaryAction}</div>
            ) : null}
          </div>
        ) : null}
      </div>
    </WorkspaceStickyPageHeader>
  );
}
