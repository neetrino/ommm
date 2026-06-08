"use client";

import type { ReactNode } from "react";
import { AdminPageHero } from "@/components/admin/admin-page-hero";

type StaffListPageLayoutProps = {
  title: string;
  description?: ReactNode;
  /** Optional mint operational hint below the hero. */
  banner?: string | null;
  search?: ReactNode;
  searchTrailing?: ReactNode;
  headerTrailing?: ReactNode;
  metrics?: ReactNode;
  status?: ReactNode;
  children: ReactNode;
};

/**
 * Shared staff workspace list chrome — same hero, search bar, and metrics rhythm as admin.
 */
export function StaffListPageLayout({
  title,
  description,
  banner,
  search,
  searchTrailing,
  headerTrailing,
  metrics,
  status,
  children,
}: StaffListPageLayoutProps) {
  const hasSearchRow = search !== undefined || searchTrailing !== undefined;

  return (
    <div className="space-y-4">
      <AdminPageHero
        title={title}
        description={description}
        search={
          hasSearchRow ? (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {search}
              {searchTrailing}
            </div>
          ) : undefined
        }
        trailing={headerTrailing}
      />

      {banner !== null && banner !== undefined && banner.length > 0 ? (
        <p
          className="rounded-2xl border border-mint-200/80 bg-mint-50/90 px-4 py-3 text-sm text-sage-800 shadow-[0_12px_28px_-18px_rgba(45,40,35,0.18)]"
          role="status"
        >
          {banner}
        </p>
      ) : null}

      {metrics}
      {status}
      {children}
    </div>
  );
}
