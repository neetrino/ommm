"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  ADMIN_ACTION_ICON_CLASS,
  CancelGlyph,
  CheckCircleGlyph,
  MoreVerticalGlyph,
} from "@/components/ui/admin-action-glyphs";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";

const MENU_MIN_WIDTH = 176;
const MENU_GAP = 4;

type BookingRecordType = "BOOKING" | "WAITLIST";
type BookingStatus = "BOOKED" | "COMPLETED" | "CANCELLED" | "MISSED" | "WAITLISTED";

type MenuPosition = {
  top: number;
  left: number;
  placement: "top" | "bottom";
};

export type AdminBookingRowActionsProps = {
  recordType: BookingRecordType;
  status: BookingStatus;
  busy: boolean;
  onMarkAttended: () => void;
  onCancel: () => void;
  onMove: () => void;
  onDelete: () => void;
};

type OverflowMenuItem = {
  key: string;
  label: string;
  tone?: "danger";
  onSelect: () => void;
};

function BookingOverflowMenu({
  items,
  busy,
}: {
  items: readonly OverflowMenuItem[];
  busy: boolean;
}) {
  const t = useTranslations("adminPages.bookings");
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (trigger === null || typeof window === "undefined") {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 120;
    const availableBelow = window.innerHeight - rect.bottom - MENU_GAP;
    const availableAbove = rect.top - MENU_GAP;
    const openAbove = availableBelow < menuHeight && availableAbove > availableBelow;

    setMenuPosition({
      top: openAbove ? rect.top - MENU_GAP : rect.bottom + MENU_GAP,
      left: Math.max(8, rect.right - MENU_MIN_WIDTH),
      placement: openAbove ? "top" : "bottom",
    });
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    updateMenuPosition();
    const rafId = window.requestAnimationFrame(updateMenuPosition);

    function onPointerDown(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, updateMenuPosition]);

  if (items.length === 0) {
    return null;
  }

  const menu =
    open && menuPosition !== null && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            className="fixed z-[120] min-w-[11rem] rounded-2xl border border-white/70 bg-white/95 py-1 shadow-[0_16px_40px_-24px_rgba(45,40,35,0.35)] backdrop-blur-md"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              transform: menuPosition.placement === "top" ? "translateY(-100%)" : undefined,
            }}
          >
            {items.map((item) => (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                className={`block w-full px-4 py-2 text-left text-sm transition-colors ${
                  item.tone === "danger"
                    ? "text-red-800 hover:bg-red-50/80"
                    : "text-sage-800 hover:bg-sand-50/80"
                }`}
                disabled={busy}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-white/80 text-sage-700 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-not-allowed disabled:opacity-50"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t("rowActionsAria")}
        title={t("rowActionsAria")}
        disabled={busy}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreVerticalGlyph className="h-3.5 w-3.5" />
      </button>
      {menu}
    </>
  );
}

export function AdminBookingRowActions({
  recordType,
  status,
  busy,
  onMarkAttended,
  onCancel,
  onMove,
  onDelete,
}: AdminBookingRowActionsProps) {
  const t = useTranslations("adminPages.bookings");
  const isBooking = recordType === "BOOKING";
  const canMarkAttended = isBooking && status === "BOOKED";
  const canCancel = isBooking && status === "BOOKED";

  const overflowItems: OverflowMenuItem[] = isBooking
    ? [
        { key: "move", label: t("actionMove"), onSelect: onMove },
        { key: "delete", label: t("actionDelete"), tone: "danger", onSelect: onDelete },
      ]
    : [];

  const hasPrimaryActions = canMarkAttended || canCancel;

  if (!hasPrimaryActions && overflowItems.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {hasPrimaryActions ? (
        <div className="flex items-center gap-1" role="group" aria-label={t("colActions")}>
          {canMarkAttended ? (
            <AdminRowIconButton
              ariaLabel={t("actionMarkAttended")}
              title={t("actionMarkAttended")}
              onClick={onMarkAttended}
              disabled={busy}
            >
              <CheckCircleGlyph className={ADMIN_ACTION_ICON_CLASS} />
            </AdminRowIconButton>
          ) : null}
          {canCancel ? (
            <AdminRowIconButton
              ariaLabel={t("actionCancel")}
              title={t("actionCancel")}
              variant="danger"
              onClick={onCancel}
              disabled={busy}
            >
              <CancelGlyph className={ADMIN_ACTION_ICON_CLASS} />
            </AdminRowIconButton>
          ) : null}
        </div>
      ) : null}
      <BookingOverflowMenu items={overflowItems} busy={busy} />
    </div>
  );
}
