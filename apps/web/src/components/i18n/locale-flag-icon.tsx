import type { LanguageSwitcherLocaleCode } from "@/lib/language-switcher-locales";

const FLAG_FRAME: Record<"default" | "warm", string> = {
  default:
    "inline-block h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] shadow-sm ring-1 ring-black/10",
  warm:
    "inline-block h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-white/45",
};

type LocaleFlagIconProps = {
  code: LanguageSwitcherLocaleCode;
  className?: string;
  /** Lighter frame for pale / translucent dashboard headers (e.g. wellness). */
  frame?: "default" | "warm";
};

/**
 * Inline SVG flags so locale buttons render consistently (emoji flags often
 * degrade on Windows / custom font stacks).
 */
export function LocaleFlagIcon({
  code,
  className = "",
  frame = "default",
}: LocaleFlagIconProps) {
  const box = `${FLAG_FRAME[frame]} ${className}`.trim();
  if (code === "hy") {
    return (
      <svg
        className={box}
        viewBox="0 0 18 12"
        width={20}
        height={14}
        aria-hidden
        focusable="false"
      >
        <rect fill="#D90012" width="18" height="4" y="0" />
        <rect fill="#0033A0" width="18" height="4" y="4" />
        <rect fill="#F2A800" width="18" height="4" y="8" />
      </svg>
    );
  }
  if (code === "ru") {
    return (
      <svg
        className={box}
        viewBox="0 0 18 12"
        width={20}
        height={14}
        aria-hidden
        focusable="false"
      >
        <rect fill="#FFFFFF" width="18" height="4" y="0" />
        <rect fill="#0039A6" width="18" height="4" y="4" />
        <rect fill="#D52B1E" width="18" height="4" y="8" />
      </svg>
    );
  }
  /* United Kingdom — simplified 1:2 civil ensign proportions for small UI. */
  return (
    <svg
      className={box}
      viewBox="0 0 60 30"
      width={20}
      height={14}
      aria-hidden
      focusable="false"
    >
      <path fill="#012169" d="M0 0h60v30H0z" />
      <path
        stroke="#FFF"
        strokeWidth="6"
        d="M0 0l60 30M60 0L0 30"
      />
      <path
        stroke="#C8102E"
        strokeWidth="4"
        d="M0 0l60 30M60 0L0 30"
      />
      <path
        stroke="#FFF"
        strokeWidth="10"
        d="M30 0v30M0 15h60"
      />
      <path
        stroke="#C8102E"
        strokeWidth="6"
        d="M30 0v30M0 15h60"
      />
    </svg>
  );
}
