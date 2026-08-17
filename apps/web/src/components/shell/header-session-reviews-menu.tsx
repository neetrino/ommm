"use client";

import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { useTranslations } from "next-intl";
import { useFloatingMenuPosition } from "@/components/ui/use-floating-menu-position";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { useSessionReviewsCoachInbox } from "@/hooks/use-session-reviews-coach-inbox";
import { useSessionReviewsPending } from "@/hooks/use-session-reviews-pending";
import { useSessionReviewsStaffInbox } from "@/hooks/use-session-reviews-staff-inbox";
import { getOmmmOverlayPortalRoot, OMMM_FLOATING_MENU_Z_INDEX } from "@/lib/ommm-overlay-portal";
import type { SessionReviewsAudience } from "@/lib/session-reviews-types";
import { SessionReviewStarIcon } from "@/components/shell/session-review-star-icon";
import {
  CoachReviewMenuPanel,
  MemberReviewMenuPanel,
  StaffReviewMenuPanel,
  markStaffReviewsRead,
} from "@/components/shell/header-session-reviews-panels";
import styles from "@/components/shell/header-notifications-menu.module.css";

const MENU_MOTION_MS = 320;

type HeaderSessionReviewsMenuProps = {
  audience: SessionReviewsAudience;
  viewAllHref: string;
  triggerClassName: string;
  iconClassName: string;
  onNavigate?: () => void;
};

export function HeaderSessionReviewsMenu({
  audience,
  viewAllHref,
  triggerClassName,
  iconClassName,
  onNavigate,
}: HeaderSessionReviewsMenuProps) {
  const t = useTranslations("headerSessionReviews");
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const mounted = useIsClientMounted();
  const [open, setOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const member = useSessionReviewsPending(audience === "member");
  const staff = useSessionReviewsStaffInbox(audience === "staff");
  const coach = useSessionReviewsCoachInbox(audience === "coach");
  const count =
    audience === "member"
      ? member.items.length
      : audience === "staff"
        ? staff.unreadCount
        : coach.items.length;
  const menuPosition = useFloatingMenuPosition(
    triggerRef,
    open,
    false,
    120,
    280,
    "end",
    8,
    false,
    true,
  );

  const closeMenu = useCallback(() => {
    if (!open || closingRef.current) {
      return;
    }
    closingRef.current = true;
    setPanelVisible(false);
    window.setTimeout(() => {
      setOpen(false);
      closingRef.current = false;
    }, MENU_MOTION_MS);
  }, [open]);

  useReviewMenuMotion(open, mounted, menuPosition, panelRef, setPanelVisible);
  useReviewMenuDismiss(open, menuId, closeMenu);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`relative ${triggerClassName}`}
        aria-label={
          audience === "member"
            ? t("triggerAriaMember", { count })
            : audience === "staff"
              ? t("triggerAriaStaff", { count })
              : t("triggerAriaCoach", { count })
        }
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          if (open) {
            closeMenu();
            return;
          }
          setOpen(true);
          if (audience === "member") {
            void member.refetch();
          } else if (audience === "staff") {
            void staff.refetch().then(() => {
              void markStaffReviewsRead();
            });
          } else {
            void coach.refetch();
          }
        }}
      >
        <SessionReviewStarIcon className={iconClassName} />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-bold leading-none text-white">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </button>
      {open && menuPosition && mounted
        ? createPortal(
            <div
              ref={panelRef}
              id={menuId}
              role="dialog"
              aria-label={
                audience === "member"
                  ? t("panelAriaMember")
                  : audience === "staff"
                    ? t("panelAriaStaff")
                    : t("panelAriaCoach")
              }
              className={[
                styles.panel,
                panelVisible ? styles.panelVisible : "",
                "overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-[0_18px_40px_-24px_rgba(45,40,35,0.35)] backdrop-blur-md",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                position: "fixed",
                top: menuPosition.top,
                left: menuPosition.left,
                width: Math.max(menuPosition.width, 280),
                maxHeight: menuPosition.maxHeight,
                zIndex: OMMM_FLOATING_MENU_Z_INDEX,
              }}
            >
              {audience === "member" ? (
                <MemberReviewMenuPanel
                  items={member.items}
                  loading={member.loading}
                  error={member.error}
                  viewAllHref={viewAllHref}
                  onPick={() => {
                    onNavigate?.();
                    closeMenu();
                  }}
                />
              ) : null}
              {audience === "staff" ? (
                <StaffReviewMenuPanel
                  items={staff.items}
                  loading={staff.loading}
                  error={staff.error}
                  viewAllHref={viewAllHref}
                  onNavigate={() => {
                    onNavigate?.();
                    closeMenu();
                  }}
                />
              ) : null}
              {audience === "coach" ? (
                <CoachReviewMenuPanel
                  items={coach.items}
                  loading={coach.loading}
                  error={coach.error}
                  viewAllHref={viewAllHref}
                  onNavigate={() => {
                    onNavigate?.();
                    closeMenu();
                  }}
                />
              ) : null}
            </div>,
            getOmmmOverlayPortalRoot(),
          )
        : null}
    </>
  );
}

function useReviewMenuMotion(
  open: boolean,
  mounted: boolean,
  menuPosition: { top: number; left: number; width: number; maxHeight: number } | null,
  panelRef: RefObject<HTMLDivElement | null>,
  setPanelVisible: (value: boolean) => void,
) {
  useLayoutEffect(() => {
    if (!open || !menuPosition || !mounted) {
      return undefined;
    }
    const panel = panelRef.current;
    if (!panel) {
      return undefined;
    }
    panel.style.transition = "none";
    panel.style.opacity = "0";
    void panel.offsetHeight;
    const frame = requestAnimationFrame(() => {
      panel.style.transition = "";
      panel.style.opacity = "";
      setPanelVisible(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [menuPosition, mounted, open, panelRef, setPanelVisible]);
}

function useReviewMenuDismiss(open: boolean, menuId: string, closeMenu: () => void) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    function handlePointerDown(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      const menu = document.getElementById(menuId);
      if (menu?.contains(target)) {
        return;
      }
      closeMenu();
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeMenu, menuId, open]);
}
