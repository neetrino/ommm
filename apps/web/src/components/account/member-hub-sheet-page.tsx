import type { ReactNode } from "react";
import { MemberHubSheetClientShell } from "@/components/account/member-hub-sheet-client-shell";
import { MemberUserContentEnter } from "@/components/account/member-user-content-enter";

type MemberHubSheetPageProps = {
  titleNamespace: string;
  /** Tablet+ right-side panel overlay (notifications bell / hub link). */
  desktopSidePanel?: boolean;
  children: ReactNode;
};

/** Wraps intercepted member route content in the mobile bottom sheet. */
export function MemberHubSheetPage({
  titleNamespace,
  desktopSidePanel = false,
  children,
}: MemberHubSheetPageProps) {
  return (
    <MemberHubSheetClientShell
      titleNamespace={titleNamespace}
      desktopSidePanel={desktopSidePanel}
    >
      <MemberUserContentEnter>{children}</MemberUserContentEnter>
    </MemberHubSheetClientShell>
  );
}
