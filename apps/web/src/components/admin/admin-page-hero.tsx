"use client";

import type { ReactNode } from "react";
import { useAdminStickyHeaderOffset } from "@/components/shell/use-admin-sticky-header-offset";

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
      className="sticky z-20 -mx-4 mb-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      style={{ top: "var(--ommm-marketing-site-header-offset, 4.25rem)" }}
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
