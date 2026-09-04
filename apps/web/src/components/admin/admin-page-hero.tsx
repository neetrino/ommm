"use client";

import type { ReactNode } from "react";
import { CircularBackLink } from "@/components/ui/circular-back-link";
import { useAdminPageHeaderSticky, useAdminStickyHeaderOffset } from "@/components/shell/use-admin-sticky-header-offset";
import { WorkspaceStickyPageHeader } from "@/components/shell/workspace-sticky-page-header";

type AdminPageHeroProps = {
  title: string;
  description?: ReactNode;
  search?: ReactNode;
  /** Primary CTA (Add …) — full-width below search on phone, beside search on tablet+. */
  primaryAction?: ReactNode;
  trailing?: ReactNode;
  /** Mobile-only back control below the banner (e.g. member reviews). */
  mobileBackHref?: string;
  mobileBackLabel?: string;
  /** Back control below the banner (e.g. sold packages → packages). */
  titleBackHref?: string;
  titleBackLabel?: string;
  /** Defaults to sticky; set false so the hero scrolls away (e.g. mobile schedule). */
  sticky?: boolean;
};

const BELOW_BANNER_BACK_CLASS = "mt-3";

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
  const backHref = titleBackHref ?? mobileBackHref;
  const backLabel = titleBackHref && titleBackLabel ? titleBackLabel : mobileBackLabel;

  return (
    <WorkspaceStickyPageHeader headerRef={headerRef} spacing="hero" sticky={stickyEnabled}>
      <div
        className={[
          "ommm-admin-header-bar relative flex flex-col items-stretch gap-3 overflow-visible",
          "max-sm:min-h-0 max-sm:py-4 max-sm:!justify-center sm:flex-row sm:flex-wrap sm:items-center sm:!justify-start",
        ].join(" ")}
      >
        <HeroTitleCluster title={title} description={description} trailing={trailing} />
        <HeroSearchRow search={search} primaryAction={primaryAction} />
      </div>
      {backHref && backLabel ? (
        <CircularBackLink href={backHref} ariaLabel={backLabel} className={BELOW_BANNER_BACK_CLASS} />
      ) : null}
    </WorkspaceStickyPageHeader>
  );
}

function HeroTitleCluster({
  title,
  description,
  trailing,
}: {
  title: string;
  description?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex w-full min-w-0 items-center justify-center gap-3 sm:w-auto sm:justify-start">
      <div className="min-w-0 w-full text-center sm:w-auto sm:shrink-0 sm:text-left">
        <h1 className="ommm-admin-header-title">{title}</h1>
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
