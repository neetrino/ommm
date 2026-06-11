import { Suspense, type ReactNode } from "react";
import { MemberHubSheetBodySkeleton } from "@/components/account/member-hub-sheet-body-skeleton";
import { MemberHubSheetClientShell } from "@/components/account/member-hub-sheet-client-shell";

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
      <Suspense fallback={<MemberHubSheetBodySkeleton />}>{children}</Suspense>
    </MemberHubSheetClientShell>
  );
}
