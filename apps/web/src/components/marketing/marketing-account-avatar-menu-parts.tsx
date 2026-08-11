"use client";

import {
  useEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Link } from "@/i18n/navigation";
import {
  localizedWorkspaceHref,
  WORKSPACE_ROUTE_PREFETCH,
} from "@/lib/workspace-nav-link";

const HOVER_LOGOUT_MEDIA_QUERY = "(hover: hover) and (pointer: fine)";

export function useHoverLogoutEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(HOVER_LOGOUT_MEDIA_QUERY);
    const update = (): void => setEnabled(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return enabled;
}

export function isOnProfileRoute(pathname: string, profileHref: string): boolean {
  return pathname === profileHref || pathname.startsWith(`${profileHref}/`);
}

export function useDismissLogoutMenu(
  open: boolean,
  enabled: boolean,
  rootRef: RefObject<HTMLDivElement | null>,
  popoverRef: RefObject<HTMLDivElement | null>,
  onDismiss: () => void,
): void {
  useEffect(() => {
    if (!open || !enabled) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (rootRef.current?.contains(target) || popoverRef.current?.contains(target)) {
        return;
      }
      onDismiss();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onDismiss();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, enabled, rootRef, popoverRef, onDismiss]);
}

type AvatarMenuTriggerProps = {
  onAccountPage: boolean;
  hardNavigate: boolean;
  locale: string;
  profileHref: string;
  triggerClassName: string;
  displayName: string;
  open: boolean;
  avatar: ReactNode;
  onToggleLogout: () => void;
  onAfterSelect?: () => void;
};

export function AvatarMenuTrigger({
  onAccountPage,
  hardNavigate,
  locale,
  profileHref,
  triggerClassName,
  displayName,
  open,
  avatar,
  onToggleLogout,
  onAfterSelect,
}: AvatarMenuTriggerProps) {
  if (onAccountPage) {
    return (
      <button
        type="button"
        className={triggerClassName}
        aria-label={displayName}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => {
          onToggleLogout();
          onAfterSelect?.();
        }}
      >
        {avatar}
      </button>
    );
  }

  if (hardNavigate) {
    return (
      <a
        href={localizedWorkspaceHref(locale, profileHref)}
        className={triggerClassName}
        aria-label={displayName}
        onClick={() => onAfterSelect?.()}
      >
        {avatar}
      </a>
    );
  }

  return (
    <Link
      href={profileHref}
      prefetch={WORKSPACE_ROUTE_PREFETCH}
      scroll
      className={triggerClassName}
      aria-label={displayName}
      onClick={() => onAfterSelect?.()}
    >
      {avatar}
    </Link>
  );
}
