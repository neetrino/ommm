"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LogoutButton } from "@/components/logout-button";
import { MemberProfileAvatar } from "@/components/shell/member-profile-avatar";
import { Link } from "@/i18n/navigation";
import { WORKSPACE_ROUTE_PREFETCH } from "@/lib/workspace-nav-link";

const HIDE_DELAY_MS = 300;
const MENU_GAP_PX = 4;
const MENU_Z_INDEX = 200;

type MarketingAccountAvatarMenuProps = {
  initials: string;
  imageSrc: string | null;
  displayName: string;
  profileHref: string;
  triggerClassName: string;
  onAfterSelect?: () => void;
};

type MenuPosition = { top: number; left: number };

/** Logged-in header avatar — click opens dashboard; hover reveals logout below. */
export function MarketingAccountAvatarMenu({
  initials,
  imageSrc,
  displayName,
  profileHref,
  triggerClassName,
  onAfterSelect,
}: MarketingAccountAvatarMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  function openMenu() {
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
    hideTimerRef.current = setTimeout(() => setOpen(false), HIDE_DELAY_MS);
  }

  const hoverHandlers = {
    onMouseEnter: openMenu,
    onMouseLeave: closeMenuSoon,
  };

  useEffect(() => () => clearTimeout(hideTimerRef.current), []);

  return (
    <>
      <div ref={rootRef} className="ommm-marketing-account-menu" {...hoverHandlers}>
        <Link
          href={profileHref}
          prefetch={WORKSPACE_ROUTE_PREFETCH}
          className={triggerClassName}
          aria-label={displayName}
          onClick={() => onAfterSelect?.()}
        >
          <MemberProfileAvatar initials={initials} imageSrc={imageSrc} />
        </Link>
      </div>
      {open && position
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
              <LogoutButton showLabel className="ommm-marketing-account-logout-btn" />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
