import type { ReactNode } from "react";

/** White details card shell; floating labels assume this solid white background. */
export const DETAILS_CARD_CLASS =
  "rounded-[28px] border border-sage-500/10 bg-white p-4 shadow-[0_12px_32px_-18px_rgba(45,40,35,0.28)] sm:p-5";

const CARD_CLASS = DETAILS_CARD_CLASS;

const FLOATING_LABEL_CLASS =
  "pointer-events-none absolute -top-2 right-3 z-[1] max-w-[calc(100%-1.5rem)] truncate bg-white px-1 text-[11px] font-medium leading-4 text-sage-500";

/** Bordered value box used under a floating label. */
export const DETAILS_FIELD_BOX_CLASS =
  "flex min-h-12 min-w-0 items-center rounded-2xl border border-sage-500/15 bg-white px-3.5 py-2.5";

const FIELD_BOX_CLASS = DETAILS_FIELD_BOX_CLASS;

const ICON_BADGE_CLASS =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-full";

/** Restyles `ommm-input` to match the floating-label field boxes. */
export const DETAILS_INPUT_CLASS = "min-h-12 rounded-2xl border-sage-500/15 bg-white";

export const DETAILS_DIVIDER_CLASS = "border-t border-sage-500/10";

/** Footer row inside a card; add `justify-between` or `justify-end` at the call site. */
export const DETAILS_CARD_FOOTER_CLASS = `flex flex-wrap items-center gap-3 pt-4 ${DETAILS_DIVIDER_CLASS}`;

/** Two-column grid of equal-width action buttons at the bottom of a card. */
export const DETAILS_CARD_ACTIONS_GRID_CLASS = `grid grid-cols-2 gap-2 pt-4 ${DETAILS_DIVIDER_CLASS}`;

export type DetailsIconTone = "mint" | "blue" | "peach" | "sand";

const ICON_TONE_CLASS: Record<DetailsIconTone, string> = {
  mint: "bg-mint-100 text-sage-700",
  blue: "bg-blue-100 text-sage-700",
  peach: "bg-peach-100 text-sand-700",
  sand: "bg-sand-100 text-sand-700",
};

/** White card with an optional icon + title header and a right-side slot (badge, action). */
export function DetailsCard({
  title,
  icon,
  iconTone = "mint",
  aside,
  children,
  className = "",
}: {
  title?: string;
  icon?: ReactNode;
  iconTone?: DetailsIconTone;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${CARD_CLASS} ${className}`.trim()}>
      {title ? (
        <header className="mb-5 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {icon ? (
              <span className={`${ICON_BADGE_CLASS} ${ICON_TONE_CLASS[iconTone]}`}>{icon}</span>
            ) : null}
            <h3 className="truncate text-base font-semibold text-sage-900">{title}</h3>
          </div>
          {aside}
        </header>
      ) : null}
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/** Vertical stack of detail cards inside a sheet body. */
export function DetailsStack({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

/** Related fields side by side; one column on very narrow screens. */
export function DetailsFieldRow({
  children,
  columns = 2,
}: {
  children: ReactNode;
  columns?: 2 | 3;
}) {
  const grid =
    columns === 3
      ? "grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3"
      : "grid-cols-1 min-[400px]:grid-cols-2";
  return <div className={`grid gap-x-3 gap-y-5 ${grid}`}>{children}</div>;
}

/** Wraps any control with a label sitting on its top border. */
export function DetailsFloatingLabel({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative min-w-0 ${className}`.trim()}>
      <span className={FLOATING_LABEL_CLASS}>{label}</span>
      {children}
    </div>
  );
}

/** Read-only value in a bordered box. `wide` spans the full row; `multiline` wraps long text. */
export function DetailsField({
  label,
  children,
  title,
  icon,
  wide = false,
  multiline = false,
  className = "",
}: {
  label: string;
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
  wide?: boolean;
  multiline?: boolean;
  className?: string;
}) {
  const span = wide ? "min-[400px]:col-span-full" : "";
  const text = multiline ? "whitespace-pre-wrap break-words" : "truncate";
  return (
    <DetailsFloatingLabel label={label} className={`${span} ${className}`.trim()}>
      <div className={`${FIELD_BOX_CLASS} gap-2.5`} title={title}>
        {icon ? <span className="shrink-0 text-sage-500">{icon}</span> : null}
        <div className={`min-w-0 flex-1 text-sm font-medium text-sage-900 ${text}`}>{children}</div>
      </div>
    </DetailsFloatingLabel>
  );
}

export function DetailsStat({
  label,
  icon,
  tone,
  children,
}: {
  label: string;
  icon: ReactNode;
  tone: DetailsIconTone;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 px-1 text-center">
      <span className={`${ICON_BADGE_CLASS} ${ICON_TONE_CLASS[tone]}`}>{icon}</span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-sage-500">
        {label}
      </span>
      <div className="min-w-0 max-w-full text-sm font-semibold text-sage-900">{children}</div>
    </div>
  );
}

const STAT_GRID_CLASS: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 gap-y-4 sm:grid-cols-4",
};

/** Row of icon stats separated by thin dividers (2–4 columns). */
export function DetailsStatStrip({
  children,
  columns = 3,
  bordered = true,
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  bordered?: boolean;
}) {
  const border = bordered ? "border-y border-sage-500/10 py-4" : "";
  const divider = columns === 4 ? "sm:divide-x" : "divide-x";
  return (
    <div className={`grid ${STAT_GRID_CLASS[columns]} ${divider} divide-sage-500/10 ${border}`}>
      {children}
    </div>
  );
}

/** Small date line: date on top, time underneath, both tabular. */
export function DetailsDateTime({ date, time }: { date: string; time?: string }) {
  return (
    <span className="flex flex-col items-center leading-tight">
      <span className="tabular-nums">{date}</span>
      {time ? (
        <span className="text-xs font-medium tabular-nums text-sage-500">{time}</span>
      ) : null}
    </span>
  );
}
