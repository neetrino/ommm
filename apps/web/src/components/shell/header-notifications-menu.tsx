"use client";

import { useLocale, useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { OmmButton } from "@/components/ui/omm-button";
import { useFloatingMenuPosition } from "@/components/ui/use-floating-menu-position";
import { useHeaderNotificationsSeen } from "@/hooks/use-header-notifications-seen";
import { useMemberWaitlistData } from "@/hooks/use-member-waitlist-data";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { dispatchNotificationsRefresh } from "@/lib/notifications-refresh-event";
import { formatTimeForUi } from "@/lib/format-time-display";
import { getOmmmOverlayPortalRoot, OMMM_FLOATING_MENU_Z_INDEX } from "@/lib/ommm-overlay-portal";
import type { UserWaitlistRow } from "@/lib/user-booking-types";
import styles from "@/components/shell/header-notifications-menu.module.css";

/** Keep in sync with `.panel` transition in `header-notifications-menu.module.css`. */
const HEADER_NOTIFICATIONS_MENU_MOTION_MS = 320;

type HeaderNotificationsMenuProps = {
  enabled: boolean;
  preferencesHref?: string | null;
  triggerClassName: string;
  iconClassName: string;
  onNavigate?: () => void;
};

type BookSessionResponse = {
  id: string;
};

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

function formatSessionWhen(locale: string, startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const date = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(start);
  const time = formatTimeForUi(start, locale);
  const endTime = formatTimeForUi(end, locale);
  return `${date} · ${time} – ${endTime}`;
}

function WaitlistOfferNotificationRow({
  row,
  locale,
  onBooked,
}: {
  row: UserWaitlistRow;
  locale: string;
  onBooked: () => void;
}) {
  const t = useTranslations("headerNotifications");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const whenLabel = formatSessionWhen(locale, row.session.startsAt, row.session.endsAt);

  async function bookNow() {
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch<BookSessionResponse>(`/bookings/sessions/${row.session.id}`, {
        method: "POST",
      });
      onBooked();
      dispatchNotificationsRefresh();
      router.refresh();
    } catch (error) {
      setMsg(error instanceof ApiError ? error.message : t("bookFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="border-b border-white/50 px-4 py-3 last:border-b-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">
        {t("spotOpenedBadge")}
      </p>
      <p className="mt-1 text-sm font-semibold text-sage-900">{row.session.classType.name}</p>
      <p className="mt-0.5 text-xs text-sage-600">{whenLabel}</p>
      <p className="mt-1 text-xs text-sage-500">{t("spotOpenedBody")}</p>
      <div className="mt-2">
        <OmmButton
          type="button"
          variant="primary"
          size="sm"
          disabled={busy}
          onClick={() => void bookNow()}
        >
          {t("bookNow")}
        </OmmButton>
      </div>
      {msg ? <p className="mt-1 text-xs text-amber-900">{msg}</p> : null}
    </li>
  );
}

/**
 * Header bell with unread badge and waitlist spot-open notifications.
 * Uses GET /waitlist/me OFFERED rows — no dedicated user inbox API exists yet.
 */
export function HeaderNotificationsMenu({
  enabled,
  preferencesHref = null,
  triggerClassName,
  iconClassName,
  onNavigate,
}: HeaderNotificationsMenuProps) {
  const locale = useLocale();
  const t = useTranslations("headerNotifications");
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const mounted = useIsClientMounted();
  const [open, setOpen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const { offeredRows, loading, error, refetch } = useMemberWaitlistData(enabled);
  const { markAllSeen, countUnread } = useHeaderNotificationsSeen();
  const offerIds = offeredRows.map((row) => row.id);
  const unreadCount = countUnread(offerIds);
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
    }, HEADER_NOTIFICATIONS_MENU_MOTION_MS);
  }, [open]);

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
    panel.style.transform = "translate3d(0, -0.5rem, 0) scale(0.96)";
    void panel.offsetHeight;

    const openFrame = requestAnimationFrame(() => {
      panel.style.transition = "";
      panel.style.opacity = "";
      panel.style.transform = "";
      setPanelVisible(true);
    });

    return () => {
      cancelAnimationFrame(openFrame);
    };
  }, [menuPosition, mounted, open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    function handlePointerDown(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (triggerRef.current?.contains(target)) {
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

  if (!enabled) {
    return null;
  }

  const badge =
    unreadCount > 0 ? (
      <span
        className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-bold leading-none text-white"
        aria-hidden
      >
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    ) : null;

  const panel =
    open && menuPosition && mounted
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
            <div className="flex items-start justify-between gap-3 border-b border-white/60 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-sage-900">{t("title")}</p>
                {unreadCount > 0 ? (
                  <p className="mt-0.5 text-xs text-sage-600">
                    {t("unreadCount", { count: unreadCount })}
                  </p>
                ) : null}
              </div>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  className="shrink-0 text-xs font-medium text-sage-700 underline-offset-2 hover:text-sage-900 hover:underline"
                  onClick={() => markAllSeen(offerIds)}
                >
                  {t("markAllRead")}
                </button>
              ) : null}
            </div>
            <ul className="max-h-72 list-none overflow-y-auto p-0">
              {loading ? (
                <li className="px-4 py-6 text-center text-sm text-sage-500">{t("loading")}</li>
              ) : error ? (
                <li className="px-4 py-6 text-center text-sm text-amber-900">{t("loadError")}</li>
              ) : offeredRows.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-sage-500">{t("empty")}</li>
              ) : (
                offeredRows.map((row) => (
                  <WaitlistOfferNotificationRow
                    key={row.id}
                    row={row}
                    locale={locale}
                    onBooked={() => {
                      markAllSeen([row.id]);
                      void refetch();
                      closeMenu();
                      onNavigate?.();
                    }}
                  />
                ))
              )}
            </ul>
            {preferencesHref ? (
              <div className="border-t border-white/60 px-4 py-2.5">
                <Link
                  href={preferencesHref}
                  className="text-xs font-medium text-sage-700 underline-offset-2 hover:underline"
                  onClick={() => {
                    closeMenu();
                    onNavigate?.();
                  }}
                >
                  {t("preferencesLink")}
                </Link>
              </div>
            ) : null}
          </div>,
          getOmmmOverlayPortalRoot(),
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`relative ${triggerClassName}`}
        aria-label={t("triggerAria", { count: unreadCount })}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          if (open) {
            closeMenu();
            return;
          }
          setOpen(true);
        }}
      >
        <NotificationBellIcon className={iconClassName} />
        {badge}
      </button>
      {panel}
    </>
  );
}
