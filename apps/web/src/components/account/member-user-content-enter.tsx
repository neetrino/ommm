import type { ReactNode } from "react";
import styles from "@/components/account/member-user-content-enter.module.css";

type MemberUserContentEnterProps = {
  children: ReactNode;
  /** Route pathname — remounts the panel so enter animation replays on navigation. */
  routeKey?: string;
};

/** Smooth above-fold entrance for member `/user` route content (CSS — no LazyMotion dependency). */
export function MemberUserContentEnter({ children, routeKey }: MemberUserContentEnterProps) {
  return (
    <div key={routeKey} className={styles.enter}>
      {children}
    </div>
  );
}
