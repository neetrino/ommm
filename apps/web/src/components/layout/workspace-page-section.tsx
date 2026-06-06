import type { ReactNode } from "react";
import {
  isWorkspacePageSectionCardEnabled,
  WORKSPACE_SECTION_CARD_CLASS,
} from "@/lib/workspace-section-surface";

type WorkspacePageSectionProps = {
  children: ReactNode;
};

/** Applies global {@link WORKSPACE_SECTION_SURFACE} page-level glass wrapper when enabled. */
export function WorkspacePageSection({ children }: WorkspacePageSectionProps) {
  if (!isWorkspacePageSectionCardEnabled()) {
    return children;
  }

  return <div className={WORKSPACE_SECTION_CARD_CLASS}>{children}</div>;
}
