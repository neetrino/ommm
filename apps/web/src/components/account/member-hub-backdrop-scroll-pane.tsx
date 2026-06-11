"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import {
  peekMemberHubSheetScrollY,
  subscribeMemberHubSheetNavigation,
} from "@/lib/member-hub-sheet-navigation";

function subscribeMemberHubBackdropScroll(onStoreChange: () => void): () => void {
  return subscribeMemberHubSheetNavigation(onStoreChange);
}

function readMemberHubBackdropScrollY(): number {
  return peekMemberHubSheetScrollY() ?? 0;
}

type MemberHubBackdropScrollPaneProps = {
  children: ReactNode;
};

/** Aligns the frozen hub backdrop with the scroll position before the sheet opened. */
export function MemberHubBackdropScrollPane({ children }: MemberHubBackdropScrollPaneProps) {
  const scrollY = useSyncExternalStore(
    subscribeMemberHubBackdropScroll,
    readMemberHubBackdropScrollY,
    () => 0,
  );

  if (scrollY <= 0) {
    return children;
  }

  return (
    <div style={{ transform: `translate3d(0, -${scrollY}px, 0)` }}>{children}</div>
  );
}
