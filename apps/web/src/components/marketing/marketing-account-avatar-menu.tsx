"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { LogoutButton } from "@/components/logout-button";
import { MemberProfileAvatar } from "@/components/shell/member-profile-avatar";
import { MARKETING_ACCOUNT_MENU_GAP_PX } from "@/components/marketing/marketing-account-menu-constants";
import { useFloatingMenuPosition } from "@/components/ui/use-floating-menu-position";
import { Link } from "@/i18n/navigation";

const MENU_MIN_HEIGHT_PX = 120;
const FLOATING_MENU_Z_INDEX = 200;

type MarketingAccountAvatarMenuProps = {
  initials: string;
  imageSrc: string | null;
  displayName: string;
  profileHref: string;
  triggerClassName: string;
  onAfterSelect?: () => void;
};

function ProfileMenuGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21v-1a7 7 0 0 1 14 0v1" />
    </svg>
  );
}

/** Logged-in marketing header avatar — click opens profile and logout actions below. */
export function MarketingAccountAvatarMenu({
  initials,
  imageSrc,
  displayName,
  profileHref,
  triggerClassName,
  onAfterSelect,
}: MarketingAccountAvatarMenuProps) {
  const tCommon = useTranslations("common");
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const profileLabel = tCommon("account");
  const menuPosition = useFloatingMenuPosition(
    triggerRef,
    menuOpen,
    false,
    MENU_MIN_HEIGHT_PX,
    0,
    "start",
    MARKETING_ACCOUNT_MENU_GAP_PX,
  );

  function closeMenu() {
    setMenuOpen(false);
    onAfterSelect?.();
  }

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const closeOnOutside = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }
      const clickedTrigger = rootRef.current?.contains(event.target) ?? false;
      const clickedMenu = menuRef.current?.contains(event.target) ?? false;
      if (!clickedTrigger && !clickedMenu) {
        setMenuOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    const listenerId = window.setTimeout(() => {
      document.addEventListener("click", closeOnOutside);
    }, 0);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.clearTimeout(listenerId);
      document.removeEventListener("click", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const floatingMenu =
    menuOpen && menuPosition !== null && isMounted
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={displayName}
            className="ommm-marketing-account-menu-panel ommm-marketing-account-menu-panel-floating"
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
              zIndex: FLOATING_MENU_Z_INDEX,
              transform:
                menuPosition.placement === "top" ? "translateY(-100%)" : undefined,
            }}
          >
            <Link
              href={profileHref}
              role="menuitem"
              className="ommm-marketing-account-menu-action ommm-marketing-account-menu-profile"
              aria-label={profileLabel}
              title={profileLabel}
              onClick={closeMenu}
            >
              <ProfileMenuGlyph className="ommm-marketing-account-menu-action-icon" />
              <span className="sr-only">{profileLabel}</span>
            </Link>
            <LogoutButton
              className="ommm-marketing-account-menu-action ommm-marketing-account-menu-logout"
              iconClassName="ommm-marketing-account-menu-action-icon"
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        ref={rootRef}
        className="ommm-marketing-account-menu"
        data-open={menuOpen ? "true" : "false"}
      >
        <button
          ref={triggerRef}
          type="button"
          className={triggerClassName}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-haspopup="menu"
          aria-label={displayName}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MemberProfileAvatar initials={initials} imageSrc={imageSrc} />
        </button>
      </div>
      {floatingMenu}
    </>
  );
}
