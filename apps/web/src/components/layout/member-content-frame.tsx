import type { ReactNode } from "react";
import { WorkspacePageSection } from "@/components/layout/workspace-page-section";

type MemberContentFrameProps = {
  /** Optional lede under the shell page title (shell header shows the title). */
  description?: ReactNode;
  children: ReactNode;
};

/**
 * Member dashboard page wrapper — title lives in the dashboard shell header.
 * Page-level glass surface: `WORKSPACE_SECTION_SURFACE` in `workspace-section-surface.ts`.
 */
export function MemberContentFrame({
  description,
  children,
}: MemberContentFrameProps) {
  return (
    <div className="ommm-admin-content pb-6 pt-4 sm:pb-8 sm:pt-6">
      <WorkspacePageSection>
        {description ? (
          <p className="ommm-body-muted mb-6 text-sm">{description}</p>
        ) : null}
        {children}
      </WorkspacePageSection>
    </div>
  );
}
