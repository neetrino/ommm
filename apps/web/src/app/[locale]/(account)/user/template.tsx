import type { ReactNode } from "react";

/**
 * Member `/user` route template — same as admin: no enter animation.
 * Soft client navigations update `children` in place (shell stays mounted).
 */
export default function UserRouteTemplate({ children }: { children: ReactNode }) {
  return children;
}
