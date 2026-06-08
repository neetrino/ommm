"use client";

import { Link } from "@/i18n/navigation";
import { marketingHeaderIconButtonClass } from "@/components/marketing/marketing-site-header-layout";
import { WORKSPACE_ROUTE_PREFETCH } from "@/lib/workspace-nav-link";

type WorkspaceShellNotificationLinkProps = {
  href: string;
  label: string;
  active: boolean;
  className?: string;
  onNavigate?: () => void;
};

/** Workspace site header — notification bell affordance. */
export function WorkspaceShellNotificationLink({
  href,
  label,
  active,
  className = "",
  onNavigate,
}: WorkspaceShellNotificationLinkProps) {
  const stateClass = active
    ? "ring-2 ring-[var(--ommm-marketing-header-focus-ring)]"
    : "";

  return (
    <Link
      href={href}
      prefetch={WORKSPACE_ROUTE_PREFETCH}
      className={`${marketingHeaderIconButtonClass()} ${stateClass} ${className}`.trim()}
      aria-label={label}
      title={label}
      onClick={onNavigate}
    >
      <svg
        className="h-5 w-5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden
      >
        <path d="M6 10a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
        <path d="M10 21h4" />
      </svg>
      <span className="sr-only">{label}</span>
    </Link>
  );
}
