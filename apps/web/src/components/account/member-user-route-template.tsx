"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import { MemberUserContentEnter } from "@/components/account/member-user-content-enter";

type MemberUserRouteTemplateProps = {
  children: ReactNode;
};

/** Re-mounts route enter animation on every `/user/*` navigation. */
export function MemberUserRouteTemplate({ children }: MemberUserRouteTemplateProps) {
  const pathname = usePathname();

  return <MemberUserContentEnter routeKey={pathname}>{children}</MemberUserContentEnter>;
}
