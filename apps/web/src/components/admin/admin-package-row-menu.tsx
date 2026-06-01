"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";

const MENU_MIN_WIDTH = 160;
const MENU_GAP = 4;

type MenuPosition = {
  top: number;
  left: number;
  placement: "top" | "bottom";
};

type AdminPackageRowMenuProps = {
  packageId: string;
  isActive: boolean;
};

function MoreGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden
    >
      <circle cx="12" cy="5" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="19" r="1.75" />
    </svg>
  );
}

export function AdminPackageRowMenu({ packageId, isActive }: AdminPackageRowMenuProps) {
  const t = useTranslations("adminPages.packages");
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (trigger === null || typeof window === "undefined") {
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 88;
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

  async function updateStatus(nextActive: boolean) {
    if (pending) {
      return;
    }
    setPending(true);
    try {
      await apiFetch(`/memberships/plans/${packageId}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: nextActive }),
      });
      window.location.reload();
    } catch {
      window.alert(t("genericError"));
    } finally {
      setPending(false);
      setOpen(false);
    }
  }

  async function removePackage() {
    if (pending) {
      return;
    }
    const confirmed = window.confirm(t("deleteConfirm"));
    if (!confirmed) {
      return;
    }
    setPending(true);
    try {
      await apiFetch(`/memberships/plans/${packageId}`, { method: "DELETE" });
      window.location.reload();
    } catch (error) {
      window.alert(error instanceof ApiError ? error.message : t("genericError"));
    } finally {
      setPending(false);
      setOpen(false);
    }
  }

  const menu =
    open && menuPosition !== null && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            className="fixed z-[120] min-w-[10rem] rounded-2xl border border-white/70 bg-white/95 py-1 shadow-[0_16px_40px_-24px_rgba(45,40,35,0.35)] backdrop-blur-md"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              transform: menuPosition.placement === "top" ? "translateY(-100%)" : undefined,
            }}
          >
            <button
              type="button"
              role="menuitem"
              className="block w-full px-4 py-2 text-left text-sm text-sage-800 transition-colors hover:bg-sand-50/80"
              disabled={pending}
              onClick={() => {
                void updateStatus(!isActive);
              }}
            >
              {isActive ? t("disableButton") : t("enableButton")}
            </button>
            <button
              type="button"
              role="menuitem"
              className="block w-full px-4 py-2 text-left text-sm text-red-800 transition-colors hover:bg-red-50/80"
              disabled={pending}
              onClick={() => {
                void removePackage();
              }}
            >
              {t("deleteButton")}
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="flex justify-end">
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sage-700 transition-colors hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={t("rowActionsAria")}
        disabled={pending}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreGlyph />
      </button>
      {menu}
    </div>
  );
}
