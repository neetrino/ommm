"use client";

import { useId, useState, type ReactNode } from "react";

type AdminAccordionPanelProps = {
  title: string;
  editLabel?: string;
  onEdit?: () => void;
  children?: ReactNode;
  defaultOpen?: boolean;
  emptyLabel?: string;
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

/**
 * Collapsible admin row — Figma package category accordion pattern.
 */
export function AdminAccordionPanel({
  title,
  editLabel,
  onEdit,
  children,
  defaultOpen = false,
  emptyLabel,
}: AdminAccordionPanelProps) {
  const panelId = useId();
  const [open, setOpen] = useState(defaultOpen);
  const hasBody = children !== undefined && children !== null;
  const showEmpty = open && !hasBody && emptyLabel !== undefined;

  return (
    <article className="ommm-admin-accordion">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-serif text-xl font-normal tracking-tight text-sage-800 sm:text-[1.625rem]">
          {title}
        </h3>
        <div className="flex shrink-0 items-center gap-5 sm:gap-7">
          {editLabel && onEdit ? (
            <button
              type="button"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-sage-800 transition-colors hover:text-sand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2"
              onClick={onEdit}
            >
              {editLabel}
              <EditGlyph />
            </button>
          ) : null}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Collapse" : "Expand"}</span>
            <ChevronGlyph open={open} />
          </button>
        </div>
      </div>
      {open ? (
        <div id={panelId} className="mt-5 border-t border-white/50 pt-5">
          {hasBody ? children : null}
          {showEmpty ? (
            <p className="text-sm text-sage-500">{emptyLabel}</p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
