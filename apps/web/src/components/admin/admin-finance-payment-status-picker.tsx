"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  financePaymentStatusTone,
  financePickerClass,
  type FinancePaymentStatus,
  type FinancePickerAppearance,
} from "@/components/admin/admin-finance-list-display";
import {
  adminPaymentStatusOptions,
  type AdminUpdatablePaymentStatus as SharedAdminUpdatablePaymentStatus,
} from "@/lib/payment-confirmation";

const MENU_GAP = 4;

export type AdminUpdatablePaymentStatus = SharedAdminUpdatablePaymentStatus;

type MenuPosition = {
  top: number;
  left: number;
  placement: "top" | "bottom";
};

type AdminFinancePaymentStatusPickerProps = {
  status: FinancePaymentStatus;
  paymentMethod: string | null;
  busy: boolean;
  appearance?: FinancePickerAppearance;
  onChangeStatus: (nextStatus: AdminUpdatablePaymentStatus) => void;
};

export function AdminFinancePaymentStatusPicker({
  status,
  paymentMethod,
  busy,
  appearance = "compact",
  onChangeStatus,
}: AdminFinancePaymentStatusPickerProps) {
  const t = useTranslations("adminPages.finance");
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const statusOptions = adminPaymentStatusOptions(paymentMethod, status);
  const canEditStatus = statusOptions.length > 0;
  const label = paymentStatusLabel(t, status);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (trigger === null || typeof window === "undefined") {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 160;
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
    if (!open || !canEditStatus) {
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
  }, [canEditStatus, open, updateMenuPosition]);

  if (!canEditStatus) {
    return (
      <span
        className={`${financePickerClass(appearance, false)} ${financePaymentStatusTone(status)}`}
        title={t("paymentActions.cardStatusAuto")}
      >
        {appearance === "card" ? <PickerStatusDot /> : null}
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
            {statusOptions.map((option) => {
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
                  {paymentStatusLabel(t, option)}
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
        className={`${financePickerClass(appearance, true)} ${financePaymentStatusTone(status)} disabled:cursor-not-allowed disabled:opacity-50`}
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
        {appearance === "card" ? <PickerStatusDot /> : null}
        <span className="truncate">{label}</span>
        <ChevronDownGlyph
          className={`${appearance === "card" ? "h-3 w-3" : "h-2.5 w-2.5"} shrink-0 opacity-70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {menu}
    </>
  );
}

function PickerStatusDot() {
  return (
    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-80" aria-hidden />
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

function paymentStatusLabel(
  t: ReturnType<typeof useTranslations<"adminPages.finance">>,
  value: FinancePaymentStatus,
): string {
  if (value === "SUCCEEDED") return t("filters.statusSucceeded");
  if (value === "PENDING") return t("filters.statusPending");
  if (value === "FAILED") return t("filters.statusFailed");
  if (value === "REFUNDED") return t("filters.statusRefunded");
  return value;
}
