import type { ReactNode } from "react";

export type MarketingHomeScrollRevealProps = {
  children: ReactNode;
  className?: string;
};

/** Layout wrapper for marketing home sections — no scroll-driven entrance animation. */
export function MarketingHomeScrollReveal({
  children,
  className = "",
}: MarketingHomeScrollRevealProps) {
  return (
    <div className={`min-h-0 w-full ${className}`.trim()}>{children}</div>
  );
}
