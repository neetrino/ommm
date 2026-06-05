import type { ReactNode } from "react";

type MemberContentFrameProps = {
  /** Optional lede under the shell page title (shell header shows the title). */
  description?: ReactNode;
  children: ReactNode;
};

/**
 * Member dashboard page wrapper — title lives in the dashboard shell header.
 * Uses the same content width as the admin dashboard for visual consistency.
 */
export function MemberContentFrame({
  description,
  children,
}: MemberContentFrameProps) {
  return (
    <div className="ommm-admin-content pb-6 pt-4 sm:pb-8 sm:pt-6">
      {description ? (
        <p className="ommm-body-muted mb-6 text-sm">{description}</p>
      ) : null}
      {children}
    </div>
  );
}
