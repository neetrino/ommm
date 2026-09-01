"use client";

import type { ReactNode } from "react";

type AdminPackageActionDisclosureProps = {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary?: ReactNode;
  children: ReactNode;
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
      className={`h-2 w-4 shrink-0 text-sage-600 transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M1 1.5l7 5 7-5" />
    </svg>
  );
}

export function AdminPackageActionDisclosure({
  title,
  open,
  onOpenChange,
  summary,
  children,
}: AdminPackageActionDisclosureProps) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/60">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-sage-500">
          {title}
        </span>
        <ChevronGlyph open={open} />
      </button>
      {summary !== undefined && !open ? (
        <div className="px-4 pb-3 text-sm text-sage-700">{summary}</div>
      ) : null}
      {open ? (
        <div className="space-y-3 border-t border-white/70 px-4 pb-4 pt-3">{children}</div>
      ) : null}
    </div>
  );
}
