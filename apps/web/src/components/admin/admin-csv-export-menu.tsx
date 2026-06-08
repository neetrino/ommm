"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon } from "@/components/marketing/schedule/schedule-view-icons";
import { DownloadGlyph } from "@/components/ui/admin-action-glyphs";
import { useFloatingMenuPosition } from "@/components/ui/use-floating-menu-position";

const EXPORT_MENU_MIN_WIDTH = 240;

const PILL_GROUP_CLASS =
  "inline-flex shrink-0 rounded-full border border-white/60 bg-white/55 shadow-sm backdrop-blur-md p-0.5";

const TRIGGER_CLASS =
  "inline-flex cursor-pointer items-center gap-0.5 rounded-full px-2 py-1.5 font-medium text-sage-900 transition-[background-color,box-shadow,color,transform] active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper bg-white shadow-sm hover:bg-white hover:shadow-md";

const TRIGGER_ICON_CLASS = "h-3.5 w-3.5 shrink-0";

export type AdminCsvExportMenuItem = {
  href: string;
  label: string;
};

type AdminCsvExportMenuProps = {
  triggerAriaLabel: string;
  items: readonly AdminCsvExportMenuItem[];
};

export function AdminCsvExportMenu({ triggerAriaLabel, items }: AdminCsvExportMenuProps) {
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const menuPosition = useFloatingMenuPosition(
    triggerRef,
    open,
    items.length === 0,
    120,
    EXPORT_MENU_MIN_WIDTH,
    "end",
  );

  useEffect(() => {
    if (!open) {
      return undefined;
    }

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

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

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
            aria-label={triggerAriaLabel}
            className="ommm-dropdown-menu fixed z-[120] overflow-hidden rounded-2xl border border-white/70 bg-white/95 py-1 shadow-[0_16px_40px_-24px_rgba(45,40,35,0.35)] backdrop-blur-md"
            data-placement={menuPosition.placement}
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
              transform: menuPosition.placement === "top" ? "translateY(-100%)" : undefined,
            }}
          >
            {items.map((item) => (
              <a
                key={item.href}
                role="menuitem"
                href={item.href}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-sage-800 transition-colors hover:bg-sand-50/90"
                onClick={() => setOpen(false)}
              >
                <DownloadGlyph className="h-4 w-4 shrink-0" />
                <span className="min-w-0 truncate">{item.label}</span>
              </a>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={PILL_GROUP_CLASS}>
      <button
        ref={triggerRef}
        type="button"
        className={TRIGGER_CLASS}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={triggerAriaLabel}
        title={triggerAriaLabel}
        onClick={() => setOpen((value) => !value)}
      >
        <DownloadGlyph className={TRIGGER_ICON_CLASS} />
        <span
          className={`inline-flex shrink-0 text-sage-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <ChevronDownIcon />
        </span>
      </button>
      {menu}
    </div>
  );
}
