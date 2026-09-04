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
  /** Back control in document flow under the page title. */
  titleBackHref?: string;
  titleBackLabel?: string;
  /** Defaults to sticky; set false so the hero scrolls away (e.g. mobile schedule). */
  sticky?: boolean;
};

const TITLE_BACK_LINK_CLASS =
  "mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full text-sage-700 transition-colors hover:bg-white/70 hover:text-sage-900";

const MOBILE_BACK_LINK_CLASS =
  "absolute left-3 top-4 z-[1] inline-flex h-10 w-10 items-center justify-center rounded-full text-sage-700 transition-colors hover:bg-white/70 hover:text-sage-900 sm:top-1/2 sm:-translate-y-1/2";

function HeroBackChevronIcon() {
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
 * Sticky only on tablet+; on phone the banner scrolls with the page (site navbar stays fixed).
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
  titleBackHref,
  titleBackLabel,
  sticky = true,
}: AdminPageHeroProps) {
  const stickyEnabled = useAdminPageHeaderSticky(sticky);
  const headerRef = useAdminStickyHeaderOffset(stickyEnabled);
  const barAlignClass = titleBackHref
    ? "sm:items-start sm:flex-nowrap"
    : "sm:items-center";

  return (
    <WorkspaceStickyPageHeader headerRef={headerRef} spacing="hero" sticky={stickyEnabled}>
      <div
        className={[
          "ommm-admin-header-bar relative flex flex-col items-stretch gap-3 overflow-visible",
          "max-sm:min-h-0 max-sm:py-4 max-sm:!justify-center sm:flex-row sm:flex-wrap sm:!justify-start",
          barAlignClass,
        ].join(" ")}
      >
        {mobileBackHref && mobileBackLabel ? (
          <Link href={mobileBackHref} className={MOBILE_BACK_LINK_CLASS} aria-label={mobileBackLabel}>
            <HeroBackChevronIcon />
          </Link>
        ) : null}
        <HeroTitleCluster
          title={title}
          description={description}
          titleBackHref={titleBackHref}
          titleBackLabel={titleBackLabel}
          padForMobileBack={Boolean(mobileBackHref)}
          trailing={trailing}
        />
        <HeroSearchRow search={search} primaryAction={primaryAction} />
      </div>
    </WorkspaceStickyPageHeader>
  );
}

function HeroTitleCluster({
  title,
  description,
  titleBackHref,
  titleBackLabel,
  padForMobileBack,
  trailing,
}: {
  title: string;
  description?: ReactNode;
  titleBackHref?: string;
  titleBackLabel?: string;
  padForMobileBack: boolean;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex w-full min-w-0 items-center justify-center gap-3 sm:w-auto sm:justify-start">
      <div
        className={[
          "min-w-0 w-full text-center sm:w-auto sm:shrink-0 sm:text-left",
          padForMobileBack ? "max-sm:px-10" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <h1 className="ommm-admin-header-title">{title}</h1>
        {titleBackHref && titleBackLabel ? (
          <Link href={titleBackHref} className={TITLE_BACK_LINK_CLASS} aria-label={titleBackLabel}>
            <HeroBackChevronIcon />
          </Link>
        ) : null}
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-sage-600 max-sm:mx-auto sm:mx-0">
            {description}
          </p>
        ) : null}
      </div>
      {trailing ? (
        <div className="relative z-[1] hidden shrink-0 flex-wrap items-center gap-2 sm:flex sm:order-last">
          {trailing}
        </div>
      ) : null}
    </div>
  );
}

function HeroSearchRow({
  search,
  primaryAction,
}: {
  search?: ReactNode;
  primaryAction?: ReactNode;
}) {
  if (!search && !primaryAction) {
    return null;
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:min-w-0 sm:flex-1 sm:flex-row sm:items-center">
      {search ? <div className="flex w-full min-w-0 flex-1 items-center">{search}</div> : null}
      {primaryAction ? <div className="w-full shrink-0 sm:w-auto">{primaryAction}</div> : null}
    </div>
  );
}
