"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { LogoutButton } from "@/components/logout-button";
import { MemberProfileAvatar } from "@/components/shell/member-profile-avatar";
import { Link } from "@/i18n/navigation";

/** Delay before hiding logout so the pointer can reach the button (ms). */
const LOGOUT_HIDE_DELAY_MS = 450;

/** Gap between avatar trigger and logout button (px). */
const LOGOUT_MENU_GAP_PX = 4;

const LOGOUT_MENU_Z_INDEX = 200;

type LogoutMenuPosition = {
  top: number;
  left: number;
};

type MarketingAccountAvatarMenuProps = {
  initials: string;
  imageSrc: string | null;
  displayName: string;
  profileHref: string;
  triggerClassName: string;
  onAfterSelect?: () => void;
};

function useLogoutMenuPosition(
  triggerRef: RefObject<HTMLDivElement | null>,
  visible: boolean,
): LogoutMenuPosition | null {
  const [position, setPosition] = useState<LogoutMenuPosition | null>(null);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (trigger === null) {
        return;
      }
      const rect = trigger.getBoundingClientRect();
      setPosition({
        top: rect.bottom + LOGOUT_MENU_GAP_PX,
        left: rect.left + rect.width / 2,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [triggerRef, visible]);

  return position;
}

/** Logged-in marketing header avatar — click opens dashboard; hover reveals logout below. */
export function MarketingAccountAvatarMenu({
  initials,
  imageSrc,
  displayName,
  profileHref,
  triggerClassName,
  onAfterSelect,
}: MarketingAccountAvatarMenuProps) {
  const menuId = useId();
  const triggerRef = useRef<HTMLDivElement>(null);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const menuPosition = useLogoutMenuPosition(triggerRef, logoutVisible);

  function showLogout() {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setLogoutVisible(true);
  }

  function scheduleHideLogout() {
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = setTimeout(() => {
      setLogoutVisible(false);
      hideTimerRef.current = null;
    }, LOGOUT_HIDE_DELAY_MS);
  }

  useEffect(() => {
    return () => {
      if (hideTimerRef.current !== null) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const floatingLogout =
    logoutVisible && menuPosition !== null && isMounted
      ? createPortal(
          <div
            id={menuId}
            className="ommm-marketing-account-logout-popover"
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              transform: "translateX(-50%)",
              zIndex: LOGOUT_MENU_Z_INDEX,
            }}
            onMouseEnter={showLogout}
            onMouseLeave={scheduleHideLogout}
          >
            <LogoutButton
              showLabel
              className="ommm-marketing-account-logout-btn"
              iconClassName="ommm-marketing-account-logout-btn-icon"
              labelClassName="ommm-marketing-account-logout-btn-label"
            />
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        ref={triggerRef}
        className="ommm-marketing-account-menu"
        onMouseEnter={showLogout}
        onMouseLeave={scheduleHideLogout}
      >
        <Link
          href={profileHref}
          className={triggerClassName}
          aria-label={displayName}
          aria-controls={menuId}
          aria-expanded={logoutVisible}
          onClick={() => onAfterSelect?.()}
        >
          <MemberProfileAvatar initials={initials} imageSrc={imageSrc} />
        </Link>
      </div>
      {floatingLogout}
    </>
  );
}
