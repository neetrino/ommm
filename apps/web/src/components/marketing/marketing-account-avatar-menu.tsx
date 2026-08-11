"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "next-intl";
import { LogoutButton } from "@/components/logout-button";
import {
  AvatarMenuTrigger,
  isOnProfileRoute,
  useDismissLogoutMenu,
  useHoverLogoutEnabled,
} from "@/components/marketing/marketing-account-avatar-menu-parts";
import { MemberProfileAvatar } from "@/components/shell/member-profile-avatar";
import { usePathname } from "@/i18n/navigation";

const HIDE_DELAY_MS = 300;
const MENU_GAP_PX = 4;
const MENU_Z_INDEX = 200;

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

function useAvatarLogoutPopover(pathname: string, onAccountPage: boolean) {
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const hoverLogoutEnabled = useHoverLogoutEnabled();
  const dismissMenu = useCallback(() => setOpen(false), []);

  const measureAndOpen = useCallback(() => {
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
  }, []);

  const toggleMenuFromTap = useCallback(() => {
    if (open) {
      setOpen(false);
      return;
    }
    measureAndOpen();
  }, [open, measureAndOpen]);

  useEffect(() => () => clearTimeout(hideTimerRef.current), []);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useDismissLogoutMenu(open, onAccountPage, rootRef, popoverRef, dismissMenu);

  const hoverHandlers = hoverLogoutEnabled
    ? {
        onMouseEnter: () => measureAndOpen(),
        onMouseLeave: () => {
          hideTimerRef.current = setTimeout(() => setOpen(false), HIDE_DELAY_MS);
        },
      }
    : {};

  return {
    open,
    position,
    rootRef,
    popoverRef,
    hoverHandlers,
    toggleMenuFromTap,
  };
}

/**
 * Logged-in header avatar:
 * - away from account → tap/click navigates to account;
 * - on account → tap toggles logout under the avatar;
 * - desktop hover also reveals logout anywhere.
 */
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
  const pathname = usePathname() ?? "";
  const onAccountPage = isOnProfileRoute(pathname, profileHref);
  const {
    open,
    position,
    rootRef,
    popoverRef,
    hoverHandlers,
    toggleMenuFromTap,
  } = useAvatarLogoutPopover(pathname, onAccountPage);

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
        <AvatarMenuTrigger
          onAccountPage={onAccountPage}
          hardNavigate={hardNavigate}
          locale={locale}
          profileHref={profileHref}
          triggerClassName={triggerClassName}
          displayName={displayName}
          open={open}
          avatar={avatar}
          onToggleLogout={toggleMenuFromTap}
          onAfterSelect={onAfterSelect}
        />
      </div>
      {open && position
        ? createPortal(
            <div
              ref={popoverRef}
              className="ommm-marketing-account-logout-popover"
              role="menu"
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
