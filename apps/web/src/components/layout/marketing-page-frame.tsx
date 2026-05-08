import type { ReactNode } from "react";

type MarketingPageFrameProps = {
  eyebrow?: string;
  title: string;
  lede?: string;
  children: ReactNode;
};

function WellnessBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-60"
      aria-hidden
    >
      <div className="absolute -left-20 top-8 h-64 w-64 rounded-full bg-cream-50/45 blur-3xl" />
      <div className="absolute right-[-5rem] top-1/3 h-72 w-72 rounded-full bg-blue-100/55 blur-3xl" />
      <div className="absolute bottom-[-4rem] left-1/3 h-64 w-64 rounded-full bg-peach-100/40 blur-3xl" />
    </div>
  );
}

/**
 * Shared chrome for marketing inner pages — matches home wellness atmosphere.
 */
export function MarketingPageFrame({
  eyebrow,
  title,
  lede,
  children,
}: MarketingPageFrameProps) {
  return (
    <section className="ommm-section relative overflow-hidden">
      <WellnessBackdrop />
      <div className="ommm-container relative">
        {eyebrow ? <p className="ommm-eyebrow">{eyebrow}</p> : null}
        <h1 className={eyebrow ? "ommm-h2 mt-4" : "ommm-h2"}>{title}</h1>
        {lede ? <p className="ommm-body mt-4 max-w-2xl">{lede}</p> : null}
        {children}
      </div>
    </section>
  );
}
