"use client";

import { useTranslations } from "next-intl";
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
import type { CallTaskRow } from "@/components/admin/admin-call-tasks-query";
import { OmmButton } from "@/components/ui/omm-button";
import { useFloatingMenuPosition } from "@/components/ui/use-floating-menu-position";
import { useCallTasksDue } from "@/hooks/use-call-tasks-due";
import { useCallTasksPendingCount } from "@/hooks/use-call-tasks-pending-count";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { Link } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { dispatchCallTasksRefresh } from "@/lib/call-tasks-refresh-event";
import { formatDateForUi } from "@/lib/date-display";
import { getOmmmOverlayPortalRoot, OMMM_FLOATING_MENU_Z_INDEX } from "@/lib/ommm-overlay-portal";
import { displayPhoneOrFallback } from "@/lib/phone";
import styles from "@/components/shell/header-notifications-menu.module.css";

const MENU_MOTION_MS = 320;

type HeaderCallTasksMenuProps = {
  enabled: boolean;
  listHref: string;
  triggerClassName: string;
  iconClassName: string;
  onNavigate?: () => void;
};

export function HeaderCallTasksMenu({
  enabled,
  listHref,
  triggerClassName,
  iconClassName,
  onNavigate,
}: HeaderCallTasksMenuProps) {
  const t = useTranslations("headerCallTasks");
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const mounted = useIsClientMounted();
  const [open, setOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const live = useCallTasksDue(enabled);
  const pendingCount = useCallTasksPendingCount(enabled);
  const items = live.items;
  const loading = live.loading;
  const error = live.error;
  const refetch = live.refetch;
  const menuPosition = useFloatingMenuPosition(
    triggerRef,
    open,
    !enabled,
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

  useCallTaskMenuMotion(open, mounted, menuPosition, panelRef, setPanelVisible);
  useCallTaskMenuDismiss(open, menuId, closeMenu);

  if (!enabled) {
    return null;
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`relative ${triggerClassName}`}
        aria-label={t("triggerAria", { count: pendingCount })}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          if (open) {
            closeMenu();
            return;
          }
          setOpen(true);
          void refetch();
        }}
      >
        <CallTaskPhoneIcon className={iconClassName} />
        {pendingCount > 0 ? (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-bold leading-none text-white"
            aria-hidden
          >
            {pendingCount > 9 ? "9+" : pendingCount}
          </span>
        ) : null}
      </button>
      {open && menuPosition && mounted
        ? createPortal(
            <div
              ref={panelRef}
              id={menuId}
              role="dialog"
              aria-label={t("panelAria")}
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
              <CallTaskMenuPanel
                listHref={listHref}
                items={items}
                loading={loading}
                error={error}
                onNavigate={() => {
                  onNavigate?.();
                  closeMenu();
                }}
              />
            </div>,
            getOmmmOverlayPortalRoot(),
          )
        : null}
    </>
  );
}

const CALL_TASK_PHONE_ICON_SCALE = 0.82;

function CallTaskPhoneIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <g transform={`translate(12 12) scale(${CALL_TASK_PHONE_ICON_SCALE}) translate(-12 -12)`}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c1.2.34 1.99.57 2.81.7A2 2 0 0 1 22 16.92z" />
      </g>
    </svg>
  );
}

function CallTaskMenuPanel({
  listHref,
  items,
  loading,
  error,
  onNavigate,
}: {
  listHref: string;
  items: readonly CallTaskRow[];
  loading: boolean;
  error: boolean;
  onNavigate: () => void;
}) {
  const t = useTranslations("headerCallTasks");
  return (
    <>
      <div className="flex items-start justify-between gap-3 border-b border-white/60 px-4 py-3">
        <p className="text-sm font-semibold text-sage-900">{t("title")}</p>
        <Link
          href={listHref}
          className="shrink-0 text-xs font-medium text-sage-700 underline-offset-2 hover:underline"
          onClick={onNavigate}
        >
          {t("openList")}
        </Link>
      </div>
      <ul className={`max-h-72 list-none overflow-y-auto p-0 ${styles.scrollList}`}>
        {loading ? (
          <li className="px-4 py-6 text-center text-sm text-sage-500">{t("loading")}</li>
        ) : error ? (
          <li className="px-4 py-6 text-center text-sm text-amber-900">{t("loadError")}</li>
        ) : items.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-sage-500">{t("empty")}</li>
        ) : (
          items.map((row) => <CallTaskDueRow key={row.id} row={row} />)
        )}
      </ul>
    </>
  );
}

function CallTaskDueRow({ row }: { row: CallTaskRow }) {
  const t = useTranslations("headerCallTasks");
  const [busy, setBusy] = useState(false);

  async function complete() {
    setBusy(true);
    try {
      await apiFetch(`/call-tasks/${row.id}/complete`, { method: "POST" });
      dispatchCallTasksRefresh();
    } catch (error) {
      if (!(error instanceof ApiError)) {
        return;
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="border-b border-white/50 px-4 py-3 last:border-b-0">
      <p className="text-sm font-medium text-sage-900">{row.contactName}</p>
      <p className="mt-0.5 text-xs text-sage-600">{displayPhoneOrFallback(row.phone)}</p>
      <p className="mt-1 line-clamp-2 text-xs text-sage-700">{row.comment}</p>
      <p className="mt-1 text-xs text-sage-500">
        {row.isOverdue ? t("overdue") : t("dueToday")} · {formatDateForUi(row.dueOnDate)}
      </p>
      <OmmButton type="button" size="sm" variant="primary" className="mt-2" disabled={busy} onClick={() => void complete()}>
        {t("markDone")}
      </OmmButton>
    </li>
  );
}

function useCallTaskMenuMotion(
  open: boolean,
  mounted: boolean,
  menuPosition: { top: number; left: number; width: number; maxHeight: number } | null,
  panelRef: RefObject<HTMLDivElement | null>,
  setPanelVisible: (value: boolean) => void,
) {
  const didAnimateOpenRef = useRef(false);

  useLayoutEffect(() => {
    if (!open) {
      didAnimateOpenRef.current = false;
      return undefined;
    }
    if (!menuPosition || !mounted || didAnimateOpenRef.current) {
      return undefined;
    }
    const panel = panelRef.current;
    if (!panel) {
      return undefined;
    }
    didAnimateOpenRef.current = true;
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

function useCallTaskMenuDismiss(open: boolean, menuId: string, closeMenu: () => void) {
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
