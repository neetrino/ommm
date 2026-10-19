import type { ReactNode } from "react";

const CARD_CLASS =
  "rounded-[28px] border border-sage-500/10 bg-white p-4 shadow-[0_12px_32px_-18px_rgba(45,40,35,0.28)] sm:p-5";

const FLOATING_LABEL_CLASS =
  "pointer-events-none absolute -top-2 right-3 z-[1] max-w-[calc(100%-1.5rem)] truncate bg-white px-1 text-[11px] font-medium leading-4 text-sage-500";

const FIELD_BOX_CLASS =
  "flex min-h-12 min-w-0 items-center rounded-2xl border border-sage-500/15 bg-white px-3.5 py-2.5";

const ICON_BADGE_CLASS =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-full";

/** Restyles `ommm-input` to match the floating-label field boxes. */
export const PAYMENT_DETAILS_INPUT_CLASS = "min-h-12 rounded-2xl border-sage-500/15 bg-white";

export const PAYMENT_DETAILS_DIVIDER_CLASS = "border-t border-sage-500/10";

export type PaymentDetailsIconTone = "mint" | "blue" | "peach";

const ICON_TONE_CLASS: Record<PaymentDetailsIconTone, string> = {
  mint: "bg-mint-100 text-sage-700",
  blue: "bg-blue-100 text-sage-700",
  peach: "bg-peach-100 text-sand-700",
};

export function PaymentDetailsCard({
  title,
  icon,
  aside,
  children,
}: {
  title?: string;
  icon?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={CARD_CLASS}>
      {title ? (
        <header className="mb-5 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {icon ? <span className={`${ICON_BADGE_CLASS} ${ICON_TONE_CLASS.mint}`}>{icon}</span> : null}
            <h3 className="truncate text-base font-semibold text-sage-900">{title}</h3>
          </div>
          {aside}
        </header>
      ) : null}
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/** Two related fields side by side; collapses to one column when only one child is passed. */
export function PaymentDetailsFieldRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-3 gap-y-5 min-[400px]:grid-cols-2">{children}</div>;
}

/** Wraps any control with a label sitting on its top border. */
export function PaymentDetailsFloatingLabel({
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

export function PaymentDetailsField({
  label,
  children,
  title,
  className,
}: {
  label: string;
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <PaymentDetailsFloatingLabel label={label} className={className}>
      <div className={FIELD_BOX_CLASS} title={title}>
        <div className="min-w-0 flex-1 truncate text-sm font-medium text-sage-900">{children}</div>
      </div>
    </PaymentDetailsFloatingLabel>
  );
}

export function PaymentDetailsStat({
  label,
  icon,
  tone,
  children,
}: {
  label: string;
  icon: ReactNode;
  tone: PaymentDetailsIconTone;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 px-1 text-center">
      <span className={`${ICON_BADGE_CLASS} ${ICON_TONE_CLASS[tone]}`}>{icon}</span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-sage-500">
        {label}
      </span>
      <div className="min-w-0 text-sm font-semibold text-sage-900">{children}</div>
    </div>
  );
}

export function PaymentDetailsStatStrip({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-3 divide-x divide-sage-500/10 border-y border-sage-500/10 py-4">
      {children}
    </div>
  );
}

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function WalletGlyph() {
  return (
    <Glyph>
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
      <path d="M4 7.5V17a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5Z" />
      <path d="M16 13.5h.01" />
    </Glyph>
  );
}

export function CalendarGlyph() {
  return (
    <Glyph>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </Glyph>
  );
}

export function CheckCircleGlyph() {
  return (
    <Glyph>
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </Glyph>
  );
}

export function LinkGlyph() {
  return (
    <Glyph>
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
    </Glyph>
  );
}
