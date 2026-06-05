"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type AdminSmallActionButtonTone = "neutral" | "success" | "warning" | "danger";

type AdminSmallActionButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  children: ReactNode;
  tone?: AdminSmallActionButtonTone;
  className?: string;
};

const BASE_CLASSES =
  "inline-flex cursor-pointer items-center justify-center rounded-md border bg-white/80 px-2 py-1 text-xs font-medium transition-[background-color,border-color,box-shadow,color,transform] hover:shadow-sm active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

const TONE_CLASSES: Record<AdminSmallActionButtonTone, string> = {
  neutral:
    "border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-slate-400/50",
  success:
    "border-emerald-300 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-900 focus-visible:ring-emerald-400/50",
  warning:
    "border-amber-300 text-amber-800 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900 focus-visible:ring-amber-400/50",
  danger:
    "border-red-300 text-red-700 hover:border-red-400 hover:bg-red-50 hover:text-red-900 focus-visible:ring-red-400/50",
};

export function AdminSmallActionButton({
  children,
  tone = "neutral",
  className = "",
  type = "button",
  ...rest
}: AdminSmallActionButtonProps) {
  const mergedClassName = [BASE_CLASSES, TONE_CLASSES[tone], className].filter(Boolean).join(" ");

  return (
    <button type={type} className={mergedClassName} {...rest}>
      {children}
    </button>
  );
}
