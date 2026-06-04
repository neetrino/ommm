import type { ReactNode } from "react";
import { AuthSiteHeader } from "@/components/auth/auth-site-header";
import styles from "./auth-layout.module.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${styles.shell} ommm-bg-auth`}>
      <AuthSiteHeader />
      <div className={styles.main}>
        <div
          className={`${styles.card} ommm-card p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
