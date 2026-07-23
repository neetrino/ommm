"use client";

import type { ReactNode } from "react";
import { useAdminStickyHeaderOffset } from "@/components/shell/use-admin-sticky-header-offset";
import { WorkspaceStickyPageHeader } from "@/components/shell/workspace-sticky-page-header";

type AdminPageHeroProps = {
  title: string;
  description?: ReactNode;
  search?: ReactNode;
  trailing?: ReactNode;
  /** Defaults to sticky; set false so the hero scrolls away (e.g. mobile schedule). */
  sticky?: boolean;
};

/**
 * Admin page header — title plus compact search/filters row (NBOS PageHero pattern).
 * Sticky by default so content does not show through under the site navbar.
 */
export function AdminPageHero({
  title,
  description,
  search,
  trailing,
  sticky = true,
}: AdminPageHeroProps) {
  const headerRef = useAdminStickyHeaderOffset(sticky);

  return (
    <WorkspaceStickyPageHeader headerRef={headerRef} spacing="hero" sticky={sticky}>
      <div className="ommm-admin-header-bar flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 shrink-0">
          <h1 className="ommm-admin-header-title">{title}</h1>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-sage-600">{description}</p>
          ) : null}
        </div>
        {search || trailing ? (
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-nowrap">
            {search ? (
              <div className="flex min-w-0 flex-1 items-center">{search}</div>
            ) : null}
            {trailing ? (
              <div className="flex shrink-0 flex-wrap items-center gap-2">{trailing}</div>
            ) : null}
          </div>
        ) : null}
      </div>
    </WorkspaceStickyPageHeader>
  );
}
