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
 * Admin / manager page header — title, full-width search on mobile, trailing actions.
 * Sticky by default so content does not show through under the site navbar.
 * On mobile, the title is centered in the banner for all workspace roles.
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
      <div className="ommm-admin-header-bar flex !flex-col !flex-nowrap !items-stretch gap-3 max-sm:!justify-center sm:!flex-row sm:!flex-nowrap sm:!items-center sm:!justify-start">
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
                : "min-w-0 w-full text-center sm:w-auto sm:shrink-0 sm:text-left"
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
        {search ? (
          <div className="flex w-full min-w-0 flex-1 items-center">{search}</div>
        ) : null}
      </div>
    </WorkspaceStickyPageHeader>
  );
}
