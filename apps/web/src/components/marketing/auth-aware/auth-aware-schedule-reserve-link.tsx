"use client";

import type { CSSProperties, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { useMarketingAudience } from "@/hooks/use-marketing-audience";
import {
  buildLoginHrefWithReturnUrl,
  MARKETING_SCHEDULE_PATH,
} from "@/lib/auth-redirect";

type AuthAwareScheduleReserveLinkProps = {
  ariaLabel: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/** Home / marketing schedule reserve — guests sign in first, then land on `/schedule`. */
export function AuthAwareScheduleReserveLink({
  ariaLabel,
  className,
  style,
  children,
}: AuthAwareScheduleReserveLinkProps) {
  const audience = useMarketingAudience();
  const href =
    audience === "guest"
      ? buildLoginHrefWithReturnUrl(MARKETING_SCHEDULE_PATH)
      : MARKETING_SCHEDULE_PATH;

  return (
    <Link href={href} aria-label={ariaLabel} className={className} style={style}>
      {children}
    </Link>
  );
}
