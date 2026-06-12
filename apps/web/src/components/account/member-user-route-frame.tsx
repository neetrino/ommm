import type { ReactNode } from "react";
import { MemberContentFrame } from "@/components/layout/member-content-frame";

type MemberUserRouteFrameProps = {
  children: ReactNode;
};

/** Member page content width shell — route enter animation lives in `user/template.tsx`. */
export function MemberUserRouteFrame({ children }: MemberUserRouteFrameProps) {
  return <MemberContentFrame>{children}</MemberContentFrame>;
}
