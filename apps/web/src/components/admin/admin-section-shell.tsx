"use client";

import type { ReactNode } from "react";

type AdminSectionShellProps = {
  banner?: string | null;
  toolbar?: ReactNode;
  children: ReactNode;
};

/**
 * Shared admin section surface — glass card wrapper used by Packages and other admin pages.
 */
export function AdminSectionShell({ banner, toolbar, children }: AdminSectionShellProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="ommm-card flex flex-col gap-6 p-5 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
        {banner !== null && banner !== undefined && banner.length > 0 ? (
          <p
            className="rounded-2xl border border-mint-200/80 bg-mint-50/90 px-4 py-3 text-sm text-sage-800 shadow-[0_12px_28px_-18px_rgba(45,40,35,0.18)]"
            role="status"
          >
            {banner}
          </p>
        ) : null}
        {toolbar ? <div className="flex flex-col gap-4">{toolbar}</div> : null}
        {children}
      </div>
    </div>
  );
}
