"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import { MemberUserContentEnter } from "@/components/account/member-user-content-enter";
import { memberUserContentRouteKey } from "@/lib/member-user-content-route-key";

type MemberUserRouteTemplateProps = {
  children: ReactNode;
};

/** Re-mounts route enter animation on `/user/*` client navigations (not the first paint). */
export function MemberUserRouteTemplate({ children }: MemberUserRouteTemplateProps) {
  const pathname = usePathname();
  const routeKey = memberUserContentRouteKey(pathname);
  const [prevRouteKey, setPrevRouteKey] = useState(routeKey);
  const [animate, setAnimate] = useState(false);

  if (routeKey !== prevRouteKey) {
    setPrevRouteKey(routeKey);
    setAnimate(true);
  }

  return (
    <MemberUserContentEnter routeKey={routeKey} animate={animate}>
      {children}
    </MemberUserContentEnter>
  );
}
