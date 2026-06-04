import type { LanguageSwitcherLocaleCode } from "@/lib/language-switcher-locales";

/** 20×14px — matches language switcher row height. */
const FLAG_SIZE_CLASS = "h-3.5 w-5 shrink-0";

const FLAG_SURFACE: Record<"default" | "warm", string> = {
  default: `${FLAG_SIZE_CLASS} overflow-hidden rounded-[2px] ring-1 ring-inset ring-black/10`,
  warm: `${FLAG_SIZE_CLASS} overflow-hidden rounded-[2px] ring-1 ring-inset ring-white/45`,
};

const FLAG_SVG_CLASS = "block h-full w-full";

type LocaleFlagIconProps = {
  code: LanguageSwitcherLocaleCode;
  className?: string;
  /** Lighter frame for pale / translucent dashboard headers (e.g. wellness). */
  frame?: "default" | "warm";
};

/**
 * Inline SVG flags so locale buttons render consistently (emoji flags often
 * degrade on Windows / custom font stacks). Glyph fills the box edge-to-edge.
 */
export function LocaleFlagIcon({
  code,
  className = "",
  frame = "default",
}: LocaleFlagIconProps) {
  const surface = `${FLAG_SURFACE[frame]} ${className}`.trim();

  if (code === "hy") {
    return (
      <span className={surface} aria-hidden>
        <svg
          className={FLAG_SVG_CLASS}
          viewBox="0 0 18 12"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
        >
          <rect fill="#D90012" width="18" height="4" y="0" />
          <rect fill="#0033A0" width="18" height="4" y="4" />
          <rect fill="#F2A800" width="18" height="4" y="8" />
        </svg>
      </span>
    );
  }
  if (code === "ru") {
    return (
      <span className={surface} aria-hidden>
        <svg
          className={FLAG_SVG_CLASS}
          viewBox="0 0 18 12"
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
        >
          <rect fill="#FFFFFF" width="18" height="4" y="0" />
          <rect fill="#0039A6" width="18" height="4" y="4" />
          <rect fill="#D52B1E" width="18" height="4" y="8" />
        </svg>
      </span>
    );
  }
  return (
    <span className={surface} aria-hidden>
      <svg
        className={FLAG_SVG_CLASS}
        viewBox="0 0 60 30"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <path fill="#012169" d="M0 0h60v30H0z" />
        <path stroke="#FFF" strokeWidth="6" d="M0 0l60 30M60 0L0 30" />
        <path stroke="#C8102E" strokeWidth="4" d="M0 0l60 30M60 0L0 30" />
        <path stroke="#FFF" strokeWidth="10" d="M30 0v30M0 15h60" />
        <path stroke="#C8102E" strokeWidth="6" d="M30 0v30M0 15h60" />
      </svg>
    </span>
  );
}
