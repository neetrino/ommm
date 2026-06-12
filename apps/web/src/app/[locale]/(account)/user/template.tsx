import type { ReactNode } from "react";
import { MemberUserRouteTemplate } from "@/components/account/member-user-route-template";

export default function UserRouteTemplate({ children }: { children: ReactNode }) {
  return <MemberUserRouteTemplate>{children}</MemberUserRouteTemplate>;
}
