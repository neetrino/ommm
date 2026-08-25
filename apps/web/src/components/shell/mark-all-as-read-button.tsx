"use client";

import type { ButtonHTMLAttributes } from "react";

type MarkAllAsReadButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

/** Shared “mark all as read” control — double-check icon + label. */
export function MarkAllAsReadButton({
  label,
  className = "",
  type = "button",
  ...rest
}: MarkAllAsReadButtonProps) {
  const merged = [
    "inline-flex items-center gap-1.5 text-xs font-medium text-sage-700 underline-offset-2 hover:text-sage-900 hover:underline disabled:pointer-events-none disabled:opacity-45",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={merged} {...rest}>
      <MarkAllAsReadIcon className="h-3.5 w-3.5 shrink-0" />
      <span>{label}</span>
    </button>
  );
}

/** Double-check — “all read” (Lucide CheckCheck geometry). */
export function MarkAllAsReadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6 7 17l-5-5" />
      <path d="m22 10-7.5 7.5L13 16" />
    </svg>
  );
}
