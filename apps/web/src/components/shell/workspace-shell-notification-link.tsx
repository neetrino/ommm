"use client";

import { useLocale } from "next-intl";
import type { MouseEvent, ReactNode } from "react";
import { useRouter, usePathname, Link } from "@/i18n/navigation";
import {
  isMemberUserHubSheetHref,
  markMemberHubSheetNavigation,
  shouldUseMemberHubSheetNavigation,
} from "@/lib/member-hub-sheet-navigation";
import { USER_ACCOUNT_PATH } from "@/lib/role-home";
import {
  localizedWorkspaceHref,
  WORKSPACE_ROUTE_PREFETCH,
} from "@/lib/workspace-nav-link";
import { useMemberHubSheetPhone } from "@/hooks/use-member-hub-sheet-phone";

type WorkspaceShellNotificationLinkProps = {
  href: string;
  label: string;
  active: boolean;
  className?: string;
  iconClassName?: string;
  onNavigate?: () => void;
};

function reopenMemberHubSheetRoute(
  router: ReturnType<typeof useRouter>,
  href: string,
): void {
  router.push(USER_ACCOUNT_PATH);
  queueMicrotask(() => {
    router.push(href);
  });
}

function NotificationBellIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path d="M6 10a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
      <path d="M10 21h4" />
    </svg>
  );
}

/** Workspace site header — notification bell affordance. */
export function WorkspaceShellNotificationLink({
  href,
  label,
  active,
  className = "",
  iconClassName = "h-5 w-5 shrink-0",
  onNavigate,
}: WorkspaceShellNotificationLinkProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isPhone = useMemberHubSheetPhone();
  const memberSheetHref = isMemberUserHubSheetHref(href);
  const useHardNav = !isPhone && memberSheetHref;
  const useMobileSheetNav =
    isPhone &&
    memberSheetHref &&
    shouldUseMemberHubSheetNavigation(href, pathname ?? "");

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onNavigate?.();

    if (!useMobileSheetNav) {
      return;
    }

    markMemberHubSheetNavigation();

    if (active) {
      event.preventDefault();
      reopenMemberHubSheetRoute(router, href);
    }
  }

  const content: ReactNode = (
    <>
      <NotificationBellIcon className={iconClassName} />
      <span className="sr-only">{label}</span>
    </>
  );

  if (useHardNav) {
    return (
      <a
        href={localizedWorkspaceHref(locale, href)}
        className={className}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        title={label}
        onClick={handleClick}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      prefetch={WORKSPACE_ROUTE_PREFETCH}
      className={className}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      title={label}
      onClick={handleClick}
    >
      {content}
    </Link>
  );
}
