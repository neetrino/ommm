"use client";

import type { ReactNode, Ref } from "react";
import {
  ADMIN_PAGE_HERO_STICKY_SHELL_CLASS,
  ADMIN_PAGE_STICKY_SHELL_CLASS,
} from "@/components/shell/dashboard-shell-classes";
import { WORKSPACE_STICKY_TOPCSSValue } from "@/components/shell/workspace-sticky-top";

export type WorkspaceStickyPageHeaderProps = {
  headerRef?: Ref<HTMLElement>;
  /** `hero` — page title banner (My bookings). `module` — finance/analytics section headers. */
  spacing?: "hero" | "module";
  className?: string;
  children: ReactNode;
};

/**
 * Opaque sticky page banner below the fixed global site header.
 * Shared by all workspace roles (admin, coach, manager, content-admin, member).
 */
export function WorkspaceStickyPageHeader({
  headerRef,
  spacing = "hero",
  className,
  children,
}: WorkspaceStickyPageHeaderProps) {
  const shellClass =
    spacing === "hero" ? ADMIN_PAGE_HERO_STICKY_SHELL_CLASS : ADMIN_PAGE_STICKY_SHELL_CLASS;

  return (
    <header
      ref={headerRef}
      className={[shellClass, className].filter(Boolean).join(" ")}
      style={{ top: WORKSPACE_STICKY_TOPCSSValue }}
    >
      {children}
    </header>
  );
}
