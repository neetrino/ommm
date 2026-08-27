"use client";

import type { ScrollAnchorSide } from "@/hooks/use-scroll-anchor-in-view";

type ScheduleJumpToTodayButtonProps = {
  label: string;
  ariaLabel: string;
  /** Side where today sits off-screen — arrow points that way. */
  side: ScrollAnchorSide;
  onClick: () => void;
};

function JumpChevron({ direction }: { direction: ScrollAnchorSide }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0"
      aria-hidden
    >
      {direction === "left" ? (
        <path d="m15 18-6-6 6-6" />
      ) : (
        <path d="m9 18 6-6-6-6" />
      )}
    </svg>
  );
}

/** Compact control to jump the schedule scroller back to today when it is off-screen. */
export function ScheduleJumpToTodayButton({
  label,
  ariaLabel,
  side,
  onClick,
}: ScheduleJumpToTodayButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={[
        "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full px-3",
        "border border-sage-800/20 bg-sage-800 text-sm font-semibold text-white",
        "shadow-[0_12px_24px_-16px_rgba(45,40,35,0.55)]",
        "transition-[background-color,transform] hover:bg-sage-900 active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/40",
      ].join(" ")}
    >
      {side === "left" ? <JumpChevron direction="left" /> : null}
      <span>{label}</span>
      {side === "right" ? <JumpChevron direction="right" /> : null}
    </button>
  );
}
