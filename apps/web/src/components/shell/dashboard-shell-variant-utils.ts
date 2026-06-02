import type { DashboardShellVariant } from "@/components/shell/dashboard-shell-types";

/** Olive sidebar + admin page chrome (Admin and Member dashboards). */
export function isOliveDashboardShell(variant: DashboardShellVariant): boolean {
  return variant === "admin" || variant === "member";
}
