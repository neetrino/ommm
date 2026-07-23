import type { ReactNode } from "react";

type AdminContentFrameProps = {
  /** Optional lede under the shell page title (shell header shows the title). */
  description?: ReactNode;
  children: ReactNode;
};

/**
 * Admin page content wrapper — title lives in the dashboard shell header (Figma).
 * Matches the Bookings section width (1280px max) for consistent banner proportions.
 */
export function AdminContentFrame({ description, children }: AdminContentFrameProps) {
  return (
    <div className="ommm-admin-content pb-6 sm:pb-8">
      {description ? (
        <p className="ommm-body-muted mb-6 max-w-3xl text-sm">{description}</p>
      ) : null}
      {children}
    </div>
  );
}
