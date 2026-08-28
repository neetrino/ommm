"use client";

import type { ReactNode } from "react";

type WorkspacePageAppearProps = {
  pathname: string;
  children: ReactNode;
};

/**
 * Workspace route content slot.
 * No enter animation — opacity/motion layers made admin list cards look like they were
 * loading and jittered during phone scroll.
 */
export function WorkspacePageAppear({ children }: WorkspacePageAppearProps) {
  return children;
}
