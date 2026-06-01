import type { ReactNode } from "react";

type AdminContentFrameProps = {
  /** Optional lede under the shell page title (shell header shows the title). */
  description?: ReactNode;
  /** Wider main column for data-heavy tables (e.g. Bookings). */
  wide?: boolean;
  children: ReactNode;
};

/**
 * Admin page content wrapper — title lives in the dashboard shell header (Figma).
 */
export function AdminContentFrame({ description, wide = false, children }: AdminContentFrameProps) {
  const contentClass = wide
    ? "ommm-admin-content ommm-admin-content--wide"
    : "ommm-admin-content";

  return (
    <div className={`${contentClass} pb-6 pt-4 sm:pb-8 sm:pt-6`}>
      {description ? (
        <p className="ommm-body-muted mb-6 max-w-3xl text-sm">{description}</p>
      ) : null}
      {children}
    </div>
  );
}
