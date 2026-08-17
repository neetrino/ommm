import type { ReactNode } from "react";
import { MemberHubSheetClientShell } from "@/components/account/member-hub-sheet-client-shell";

type MemberHubSheetPageProps = {
  titleNamespace: string;
  titleKey?: string;
  /** Tablet+ right-side panel overlay (notifications bell / hub link). */
  desktopSidePanel?: boolean;
  children: ReactNode;
};

/** Wraps intercepted member route content in the mobile bottom sheet. */
export function MemberHubSheetPage({
  titleNamespace,
  titleKey,
  desktopSidePanel = false,
  children,
}: MemberHubSheetPageProps) {
  return (
    <MemberHubSheetClientShell
      titleNamespace={titleNamespace}
      titleKey={titleKey}
      desktopSidePanel={desktopSidePanel}
    >
      {children}
    </MemberHubSheetClientShell>
  );
}
