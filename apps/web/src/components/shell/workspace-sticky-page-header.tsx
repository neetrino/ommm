"use client";

import type { ReactNode, Ref } from "react";
import {
  ADMIN_PAGE_HERO_STATIC_SHELL_CLASS,
  ADMIN_PAGE_HERO_STICKY_SHELL_CLASS,
  ADMIN_PAGE_STATIC_SHELL_CLASS,
  ADMIN_PAGE_STICKY_SHELL_CLASS,
} from "@/components/shell/dashboard-shell-classes";
import { WORKSPACE_STICKY_TOPCSSValue } from "@/components/shell/workspace-sticky-top";

export type WorkspaceStickyPageHeaderProps = {
  headerRef?: Ref<HTMLElement>;
  /** `hero` — page title banner (My bookings). `module` — finance/analytics section headers. */
  spacing?: "hero" | "module";
  /** When false, header scrolls with the page (no sticky / no opaque sticky backdrop). */
  sticky?: boolean;
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
  sticky = true,
  className,
  children,
}: WorkspaceStickyPageHeaderProps) {
  const shellClass = sticky
    ? spacing === "hero"
      ? ADMIN_PAGE_HERO_STICKY_SHELL_CLASS
      : ADMIN_PAGE_STICKY_SHELL_CLASS
    : spacing === "hero"
      ? ADMIN_PAGE_HERO_STATIC_SHELL_CLASS
      : ADMIN_PAGE_STATIC_SHELL_CLASS;

  return (
    <header
      ref={headerRef}
      className={[shellClass, className].filter(Boolean).join(" ")}
      style={sticky ? { top: WORKSPACE_STICKY_TOPCSSValue } : undefined}
    >
      {children}
    </header>
  );
}
