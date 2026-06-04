import type { ReactNode } from "react";

type MarketingPageFrameProps = {
  eyebrow?: string;
  title: string;
  lede?: string;
  /** Stretch section to the footer so the layout gradient continues behind it. */
  extendToFooter?: boolean;
  children: ReactNode;
};

/**
 * Shared chrome for marketing inner pages — content on coaches-style layout gradient.
 */
export function MarketingPageFrame({
  eyebrow,
  title,
  lede,
  extendToFooter = false,
  children,
}: MarketingPageFrameProps) {
  const sectionClassName = [
    "ommm-section relative w-full overflow-hidden",
    extendToFooter ? "flex-1 min-h-[calc(100vh-10rem)]" : "min-h-[calc(100vh-10rem)]",
  ].join(" ");

  return (
    <section className={sectionClassName}>
      <div className="ommm-container relative">
        {eyebrow ? <p className="ommm-eyebrow">{eyebrow}</p> : null}
        <h1 className={eyebrow ? "ommm-h2 mt-4" : "ommm-h2"}>{title}</h1>
        {lede ? <p className="ommm-body mt-4 max-w-2xl">{lede}</p> : null}
        {children}
      </div>
    </section>
  );
}
