"use client";

import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { useMarketingSectionsVisibility } from "@/components/marketing/marketing-sections-visibility-context";
import { isMarketingHrefEnabled } from "@/lib/home-page-sections";

type MarketingSectionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  disabledClassName?: string;
};

/**
 * Marketing nav/CTA link — inert when the target section is disabled in admin settings.
 */
export function MarketingSectionLink({
  href,
  children,
  className,
  style,
  disabledClassName,
  onClick,
  ...rest
}: MarketingSectionLinkProps) {
  const visibility = useMarketingSectionsVisibility();
  const enabled = isMarketingHrefEnabled(href, visibility);

  if (!enabled) {
    return (
      <span
        className={disabledClassName ?? className}
        style={style}
        aria-disabled="true"
        data-section-disabled="true"
      >
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className} style={style} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}
