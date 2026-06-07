"use client";

import type { ReactNode } from "react";
import { useAdminStickyHeaderOffset } from "@/components/shell/use-admin-sticky-header-offset";
import { ADMIN_PAGE_HERO_STICKY_SHELL_CLASS } from "@/components/shell/dashboard-shell-classes";
import { WORKSPACE_STICKY_TOPCSSValue } from "@/components/shell/workspace-sticky-top";
type AdminPageHeroProps = {
  title: string;
  description?: ReactNode;
  search?: ReactNode;
  trailing?: ReactNode;
};

/**
 * Sticky admin page header — title plus compact search/filters row (NBOS PageHero pattern).
 */
export function AdminPageHero({ title, description, search, trailing }: AdminPageHeroProps) {
  const headerRef = useAdminStickyHeaderOffset(true);

  return (
    <header
      ref={headerRef}
      className={ADMIN_PAGE_HERO_STICKY_SHELL_CLASS}
      style={{ top: WORKSPACE_STICKY_TOPCSSValue }}
    >
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
    </header>
  );
}
