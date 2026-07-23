import type { ReactNode } from "react";
import styles from "@/components/account/user-view-content-enter.module.css";

type UserViewContentEnterProps = {
  /** Changes remount the panel and replay the enter animation. */
  viewKey: string;
  children: ReactNode;
  className?: string;
};

/** Fade/slide enter when user dashboard view mode or tab changes. */
export function UserViewContentEnter({
  viewKey,
  children,
  className,
}: UserViewContentEnterProps) {
  const classNames = className ? `${styles.enter} ${className}` : styles.enter;

  return (
    <div key={viewKey} className={classNames}>
      {children}
    </div>
  );
}
