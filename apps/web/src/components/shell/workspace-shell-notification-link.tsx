"use client";

import { Link } from "@/i18n/navigation";
import { WORKSPACE_ROUTE_PREFETCH } from "@/lib/workspace-nav-link";

type WorkspaceShellNotificationLinkProps = {
  href: string;
  label: string;
  active: boolean;
  className?: string;
  iconClassName?: string;
  onNavigate?: () => void;
};

/** Workspace site header — notification bell affordance. */
export function WorkspaceShellNotificationLink({
  href,
  label,
  active,
  className = "",
  iconClassName = "h-5 w-5 shrink-0",
  onNavigate,
}: WorkspaceShellNotificationLinkProps) {
  return (
    <Link
      href={href}
      prefetch={WORKSPACE_ROUTE_PREFETCH}
      className={className}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      title={label}
      onClick={onNavigate}
    >
      <svg
        className={iconClassName}
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
