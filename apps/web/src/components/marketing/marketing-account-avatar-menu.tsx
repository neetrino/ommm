"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { LogoutButton } from "@/components/logout-button";
import { MemberProfileAvatar } from "@/components/shell/member-profile-avatar";
import { Link } from "@/i18n/navigation";
import {
  localizedWorkspaceHref,
  WORKSPACE_ROUTE_PREFETCH,
} from "@/lib/workspace-nav-link";

const HIDE_DELAY_MS = 300;
const MENU_GAP_PX = 4;
const MENU_Z_INDEX = 200;
const HOVER_LOGOUT_MEDIA_QUERY = "(hover: hover) and (pointer: fine)";

type MarketingAccountAvatarMenuProps = {
  initials: string;
  imageSrc: string | null;
  displayName: string;
  profileHref: string;
  triggerClassName: string;
  avatarClassName: string;
  guestIconClassName: string;
  onAfterSelect?: () => void;
  /** Full document navigation — bypasses member hub intercept routes. */
  hardNavigate?: boolean;
};

type MenuPosition = { top: number; left: number };

function useHoverLogoutEnabled(): boolean {
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

/** Logged-in header avatar — tap navigates to account; desktop hover reveals logout. */
export function MarketingAccountAvatarMenu({
  initials,
  imageSrc,
  displayName,
  profileHref,
  triggerClassName,
  avatarClassName,
  guestIconClassName,
  onAfterSelect,
  hardNavigate = false,
}: MarketingAccountAvatarMenuProps) {
  const locale = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const hoverLogoutEnabled = useHoverLogoutEnabled();

  function openMenu() {
    if (!hoverLogoutEnabled) {
      return;
    }
    clearTimeout(hideTimerRef.current);
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    setPosition({
      top: rect.bottom + MENU_GAP_PX,
      left: rect.left + rect.width / 2,
    });
    setOpen(true);
  }

  function closeMenuSoon() {
    if (!hoverLogoutEnabled) {
      return;
    }
    hideTimerRef.current = setTimeout(() => setOpen(false), HIDE_DELAY_MS);
  }

  const hoverHandlers = hoverLogoutEnabled
    ? {
        onMouseEnter: openMenu,
        onMouseLeave: closeMenuSoon,
      }
    : {};

  useEffect(() => () => clearTimeout(hideTimerRef.current), []);

  const avatar = (
    <MemberProfileAvatar
      initials={initials}
      imageSrc={imageSrc}
      className={avatarClassName}
      guestIconClassName={guestIconClassName}
    />
  );

  return (
    <>
      <div ref={rootRef} className="ommm-marketing-account-menu" {...hoverHandlers}>
        {hardNavigate ? (
          <a
            href={localizedWorkspaceHref(locale, profileHref)}
            className={triggerClassName}
            aria-label={displayName}
            onClick={() => onAfterSelect?.()}
          >
            {avatar}
          </a>
        ) : (
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
        )}
      </div>
      {hoverLogoutEnabled && open && position
        ? createPortal(
            <div
              className="ommm-marketing-account-logout-popover"
              style={{
                position: "fixed",
                top: position.top,
                left: position.left,
                transform: "translateX(-50%)",
                zIndex: MENU_Z_INDEX,
              }}
              {...hoverHandlers}
            >
              <LogoutButton
                showLabel
                className="ommm-marketing-account-logout-btn"
                iconClassName="h-3.5 w-3.5 shrink-0 align-middle"
                spinnerClassName="h-6 w-6"
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
