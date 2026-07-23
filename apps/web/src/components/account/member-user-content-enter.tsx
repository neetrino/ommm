import type { ReactNode } from "react";
import styles from "@/components/account/member-user-content-enter.module.css";

type MemberUserContentEnterProps = {
  children: ReactNode;
  /** Route pathname — remounts the panel so enter animation replays on navigation. */
  routeKey?: string;
  /** When false, mount without fade/slide (avoids double paint on first load). */
  animate?: boolean;
};

/** Smooth above-fold entrance for member `/user` route content (CSS — no LazyMotion dependency). */
export function MemberUserContentEnter({
  children,
  routeKey,
  animate = true,
}: MemberUserContentEnterProps) {
  const className = animate ? styles.enter : styles.enterStatic;

  return (
    <div key={routeKey} className={className}>
      {children}
    </div>
  );
}
