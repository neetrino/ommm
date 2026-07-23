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
        "inline-flex cursor-pointer items-center justify-center rounded-full border border-white/75 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-sage-700 shadow-sm backdrop-blur-sm transition-[background-color,box-shadow,transform,color,border-color] hover:border-white hover:bg-white hover:text-sage-900 hover:shadow-md active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
      subtle:
        "inline-flex cursor-pointer items-center justify-center rounded-full px-2 py-1 text-xs font-medium text-sage-500 transition-[background-color,transform,color] hover:bg-white/45 hover:text-sage-700 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
      danger:
        "inline-flex cursor-pointer items-center justify-center rounded-full border border-red-200 bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-800 shadow-sm transition-[background-color,box-shadow,transform,color,border-color] hover:border-red-300 hover:bg-red-50 hover:text-red-900 hover:shadow-md active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
    };
    return sm[variant];
  }

  const md: Record<NonNullable<OmmButtonProps["variant"]>, string> = {
    primary: "ommm-cta-primary",
    secondary: "ommm-cta-ghost",
    ghost:
      "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/70 bg-white/75 px-6 py-2.5 text-sm font-medium text-sage-700 shadow-sm backdrop-blur-md transition-[background-color,box-shadow,transform,color,border-color] hover:border-white hover:bg-white hover:text-sage-900 hover:shadow-md active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
    subtle:
      "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-sage-500 transition-[background-color,transform,color] hover:bg-white/40 hover:text-sage-700 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
    danger:
      "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-red-200 bg-white/90 px-6 py-2.5 text-sm font-medium text-red-800 shadow-sm transition-[background-color,box-shadow,transform,color,border-color] hover:border-red-300 hover:bg-red-50 hover:text-red-900 hover:shadow-md active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
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
