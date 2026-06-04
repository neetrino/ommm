"use client";

import { useId, useState, type ReactNode } from "react";
import { TrashGlyph } from "@/components/ui/admin-action-glyphs";

type AdminAccordionPanelProps = {
  title: string;
  editLabel?: string;
  onEdit?: () => void;
  deleteLabel?: string;
  onDelete?: () => void;
  children?: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  emptyLabel?: string;
  /** Table body layout — Figma expanded category card. */
  contentVariant?: "default" | "table";
};

function ChevronGlyph({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 8"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-2 w-4 text-sage-600 transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M1 1.5l7 5 7-5" />
    </svg>
  );
}

function EditGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function DeleteGlyph() {
  return <TrashGlyph className="h-4 w-4" />;
}

/**
 * Collapsible admin row — Figma package category accordion pattern.
 */
export function AdminAccordionPanel({
  title,
  editLabel,
  onEdit,
  deleteLabel,
  onDelete,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  emptyLabel,
  contentVariant = "default",
}: AdminAccordionPanelProps) {
  const panelId = useId();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [prevDefaultOpen, setPrevDefaultOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  if (!isControlled && prevDefaultOpen !== defaultOpen) {
    setPrevDefaultOpen(defaultOpen);
    setInternalOpen(defaultOpen);
  }

  function setOpen(next: boolean) {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  }

  const hasBody = children !== undefined && children !== null;
  const showEmpty = open && !hasBody && emptyLabel !== undefined;

  return (
    <article
      className="ommm-admin-accordion"
      data-expanded={open ? "true" : "false"}
    >
      <div className="flex min-h-[46px] items-center justify-between gap-4">
        <h3
          className={
            open
              ? "font-serif text-[2rem] font-normal leading-[2.6rem] tracking-[-0.02em] text-[#1b1c1a]"
              : "font-serif text-xl font-normal tracking-[-0.02em] text-[#464646] sm:text-[1.625rem] sm:leading-[2.6rem]"
          }
        >
          {title}
        </h3>
        <div className="flex shrink-0 items-center justify-center gap-5">
          {editLabel && onEdit ? (
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#464646] transition-colors hover:bg-white/60 hover:text-sand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2"
              aria-label={editLabel}
              title={editLabel}
              onClick={onEdit}
            >
              <span className="sr-only">{editLabel}</span>
              <EditGlyph />
            </button>
          ) : null}
          {deleteLabel && onDelete ? (
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-red-700/80 transition-colors hover:bg-red-50/90 hover:text-red-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
              aria-label={deleteLabel}
              title={deleteLabel}
              onClick={onDelete}
            >
              <span className="sr-only">{deleteLabel}</span>
              <DeleteGlyph />
            </button>
          ) : null}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen(!open)}
          >
            <span className="sr-only">{open ? "Collapse" : "Expand"}</span>
            <ChevronGlyph open={open} />
          </button>
        </div>
      </div>
      {open ? (
        <div
          id={panelId}
          className={
            contentVariant === "table"
              ? "mt-8"
              : "mt-5 border-t border-white/50 pt-5"
          }
        >
          {hasBody ? children : null}
          {showEmpty ? (
            <p className="text-sm text-sage-500">{emptyLabel}</p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
