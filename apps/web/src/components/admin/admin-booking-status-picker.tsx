"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  ADMIN_BOOKING_STATUS_PICKER_CLASS,
  ADMIN_BOOKING_STATUS_STATIC_CLASS,
  bookingStatusTone,
  type AdminBookingStatusBadgePaymentMethod,
} from "@/components/admin/admin-booking-list-badges";

const MENU_GAP = 4;

export type AdminBookingStatus =
  | "BOOKED"
  | "COMPLETED"
  | "CANCELLED"
  | "MISSED"
  | "WAITLISTED";

const BOOKING_STATUS_OPTIONS: readonly AdminBookingStatus[] = [
  "BOOKED",
  "COMPLETED",
  "CANCELLED",
  "MISSED",
];

type MenuPosition = {
  top: number;
  left: number;
  placement: "top" | "bottom";
};

type AdminBookingStatusPickerProps = {
  recordType: "BOOKING" | "WAITLIST";
  status: AdminBookingStatus;
  bookingPaymentMethod?: AdminBookingStatusBadgePaymentMethod | null;
  busy: boolean;
  onChangeStatus: (next: AdminBookingStatus) => void;
};

export function AdminBookingStatusPicker({
  recordType,
  status,
  bookingPaymentMethod = null,
  busy,
  onChangeStatus,
}: AdminBookingStatusPickerProps) {
  const t = useTranslations("adminPages.bookings");
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const isInteractive = recordType === "BOOKING";

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (trigger === null || typeof window === "undefined") {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 140;
    const availableBelow = window.innerHeight - rect.bottom - MENU_GAP;
    const availableAbove = rect.top - MENU_GAP;
    const openAbove = availableBelow < menuHeight && availableAbove > availableBelow;

    setMenuPosition({
      top: openAbove ? rect.top - MENU_GAP : rect.bottom + MENU_GAP,
      left: Math.max(8, rect.left),
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

  const label = statusLabel(t, status);
  const statusTone = bookingStatusTone(status, bookingPaymentMethod);

  if (!isInteractive) {
    return (
      <span
        className={`${ADMIN_BOOKING_STATUS_STATIC_CLASS} ${statusTone} pointer-events-none`}
      >
        {label}
      </span>
    );
  }

  const menu =
    open && menuPosition !== null && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            className="fixed z-[120] min-w-[9.5rem] rounded-2xl border border-white/70 bg-white/95 py-1 shadow-[0_16px_40px_-24px_rgba(45,40,35,0.35)] backdrop-blur-md"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              transform: menuPosition.placement === "top" ? "translateY(-100%)" : undefined,
            }}
          >
            {BOOKING_STATUS_OPTIONS.map((option) => {
              const isCurrent = option === status;
              return (
                <button
                  key={option}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isCurrent}
                  className={`block w-full px-3 py-1.5 text-left text-xs transition-colors ${
                    isCurrent
                      ? "cursor-default bg-sand-50/90 font-semibold text-sage-900"
                      : "text-sage-800 hover:bg-sand-50/80"
                  }`}
                  disabled={busy || isCurrent}
                  onClick={() => {
                    setOpen(false);
                    onChangeStatus(option);
                  }}
                >
                  {statusLabel(t, option)}
                </button>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`${ADMIN_BOOKING_STATUS_PICKER_CLASS} ${statusTone} disabled:cursor-not-allowed disabled:opacity-50`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t("changeStatusAria", { status: label })}
        title={t("changeStatusAria", { status: label })}
        disabled={busy}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        <span className="truncate">{label}</span>
        <ChevronDownGlyph
          className={`h-2.5 w-2.5 shrink-0 opacity-70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {menu}
    </>
  );
}

function ChevronDownGlyph({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6H6z" />
    </svg>
  );
}

function statusLabel(
  t: ReturnType<typeof useTranslations<"adminPages.bookings">>,
  value: AdminBookingStatus,
): string {
  if (value === "BOOKED") return t("statusBooked");
  if (value === "COMPLETED") return t("statusCompleted");
  if (value === "CANCELLED") return t("statusCancelled");
  if (value === "WAITLISTED") return t("statusWaitlisted");
  return t("statusMissed");
}
