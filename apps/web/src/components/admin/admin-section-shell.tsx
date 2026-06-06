"use client";

import type { ReactNode } from "react";

type AdminSectionShellProps = {
  banner?: string | null;
  toolbar?: ReactNode;
  children: ReactNode;
  /**
   * `plain` (default) — section stack on the page background (lists, filters, tables).
   * `card` — single grouped glass surface; use for isolated panels (packages-style blocks).
   */
  surface?: "plain" | "card";
};

/**
 * Admin section layout — spacing + optional toolbar/banner.
 * List pages: `surface="plain"` (default). Avoid nesting `ommm-card` around lists that
 * already use row cards or `adminChrome.tableWrap`.
 */
export function AdminSectionShell({
  banner,
  toolbar,
  children,
  surface = "plain",
}: AdminSectionShellProps) {
  const body = (
    <>
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
    </>
  );

  if (surface === "card") {
    return (
      <div className="flex flex-col gap-6">
        <div className="ommm-card flex flex-col gap-6 p-5 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
          {body}
        </div>
      </div>
    );
  }

  return <div className="flex flex-col gap-6">{body}</div>;
}
