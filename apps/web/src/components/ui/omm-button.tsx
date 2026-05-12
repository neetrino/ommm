import type { ButtonHTMLAttributes } from "react";

export type OmmButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "subtle" | "danger";
  size?: "md" | "sm";
};

function classForVariant(
  variant: NonNullable<OmmButtonProps["variant"]>,
  size: NonNullable<OmmButtonProps["size"]>,
): string {
  if (size === "sm") {
    const sm: Record<NonNullable<OmmButtonProps["variant"]>, string> = {
      primary: "ommm-btn-compact-primary",
      secondary: "ommm-btn-compact-secondary",
      ghost:
        "inline-flex items-center justify-center rounded-full border border-white/75 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-sage-700 backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45",
      subtle:
        "inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium text-sage-500 transition-colors hover:bg-white/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45",
      danger:
        "inline-flex items-center justify-center rounded-full border border-red-200 bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-800 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45",
    };
    return sm[variant];
  }

  const md: Record<NonNullable<OmmButtonProps["variant"]>, string> = {
    primary: "ommm-cta-primary",
    secondary: "ommm-cta-ghost",
    ghost:
      "inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white/75 px-6 py-2.5 text-sm font-medium text-sage-700 shadow-sm backdrop-blur-md transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45",
    subtle:
      "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-sage-500 transition-colors hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45",
    danger:
      "inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white/90 px-6 py-2.5 text-sm font-medium text-red-800 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45",
  };
  return md[variant];
}

export function OmmButton({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...rest
}: OmmButtonProps) {
  const core = classForVariant(variant, size);
  const merged = [core, className].filter(Boolean).join(" ");
  return <button type={type} className={merged} {...rest} />;
}
