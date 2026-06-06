type GlyphProps = {
  className?: string;
};

const GLYPH_PROPS = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function EyeGlyph({ className }: GlyphProps) {
  return (
    <svg {...GLYPH_PROPS} className={className}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function PencilGlyph({ className }: GlyphProps) {
  return (
    <svg {...GLYPH_PROPS} className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function CopyGlyph({ className }: GlyphProps) {
  return (
    <svg {...GLYPH_PROPS} className={className}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function CancelGlyph({ className }: GlyphProps) {
  return (
    <svg {...GLYPH_PROPS} className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function CheckCircleGlyph({ className }: GlyphProps) {
  return (
    <svg {...GLYPH_PROPS} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2 2 5-5" />
    </svg>
  );
}

export function TrashGlyph({ className }: GlyphProps) {
  return (
    <svg {...GLYPH_PROPS} className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function PlusGlyph({ className }: GlyphProps) {
  return (
    <svg {...GLYPH_PROPS} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ImageGlyph({ className }: GlyphProps) {
  return (
    <svg {...GLYPH_PROPS} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

export function ArrowRightGlyph({ className }: GlyphProps) {
  return (
    <svg {...GLYPH_PROPS} className={className}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function DownloadGlyph({ className }: GlyphProps) {
  return (
    <svg {...GLYPH_PROPS} className={className}>
      <path d="M12 3v10" />
      <path d="m8 11 4 4 4-4" />
      <path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
    </svg>
  );
}

export function MoreVerticalGlyph({ className }: GlyphProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="5" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="12" cy="19" r="1.75" />
    </svg>
  );
}

export function ToggleOffGlyph({ className }: GlyphProps) {
  return (
    <svg {...GLYPH_PROPS} className={className}>
      <path d="M8 8v8M16 8v8" />
      <rect x="3" y="5" width="18" height="14" rx="3" />
    </svg>
  );
}

export function ToggleOnGlyph({ className }: GlyphProps) {
  return (
    <svg {...GLYPH_PROPS} className={className}>
      <path d="M8 12h8" />
      <rect x="3" y="5" width="18" height="14" rx="3" />
    </svg>
  );
}

const TOGGLE_SWITCH_ACTIVE_TRACK = "#7CB868";
const TOGGLE_SWITCH_INACTIVE_TRACK = "#C5C5C5";
const TOGGLE_SWITCH_KNOB_FILL = "#FFFFFF";
const TOGGLE_SWITCH_KNOB_RADIUS = 4.5;
const TOGGLE_SWITCH_KNOB_ACTIVE_X = 18;
const TOGGLE_SWITCH_KNOB_INACTIVE_X = 6;

type ToggleSwitchGlyphProps = GlyphProps & {
  checked?: boolean;
};

/** Pill toggle switch (green ON / gray OFF) for row status actions. */
export function ToggleSwitchGlyph({ className, checked = true }: ToggleSwitchGlyphProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 14"
      fill="none"
      aria-hidden
      className={className}
    >
      <rect
        x="1"
        y="1"
        width="22"
        height="12"
        rx="6"
        fill={checked ? TOGGLE_SWITCH_ACTIVE_TRACK : TOGGLE_SWITCH_INACTIVE_TRACK}
      />
      <circle
        cx={checked ? TOGGLE_SWITCH_KNOB_ACTIVE_X : TOGGLE_SWITCH_KNOB_INACTIVE_X}
        cy="7"
        r={TOGGLE_SWITCH_KNOB_RADIUS}
        fill={TOGGLE_SWITCH_KNOB_FILL}
      />
    </svg>
  );
}

export const ADMIN_ACTION_ICON_CLASS = "h-3.5 w-3.5 shrink-0";
export const ADMIN_TOGGLE_SWITCH_ICON_CLASS = "h-3.5 w-6 shrink-0";
