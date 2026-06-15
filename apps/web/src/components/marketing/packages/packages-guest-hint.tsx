import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import styles from "@/components/marketing/packages/packages-guest-hint.module.css";

export type PackagesGuestHintProps = {
  loginLabel: string;
  registerLabel: string;
  connector: string;
  suffix: string;
  ariaLabel?: string;
  variant?: "banner" | "footer";
  className?: string;
};

function PackagesGuestHintLinks({
  loginLabel,
  registerLabel,
  connector,
  suffix,
}: Pick<PackagesGuestHintProps, "loginLabel" | "registerLabel" | "connector" | "suffix">) {
  return (
    <>
      <Link href="/login" className={styles.link}>
        {loginLabel}
      </Link>
      {connector}
      <Link href="/register" className={styles.link}>
        {registerLabel}
      </Link>
      {suffix}
    </>
  );
}

function PackagesGuestHintIcon() {
  return (
    <svg
      className={styles.bannerIcon}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PackagesGuestHint({
  loginLabel,
  registerLabel,
  connector,
  suffix,
  ariaLabel,
  variant = "banner",
  className,
}: PackagesGuestHintProps): ReactNode {
  const links = (
    <PackagesGuestHintLinks
      loginLabel={loginLabel}
      registerLabel={registerLabel}
      connector={connector}
      suffix={suffix}
    />
  );

  if (variant === "footer") {
    return <p className={`${styles.footer} ${className ?? ""}`.trim()}>{links}</p>;
  }

  return (
    <aside
      className={`${styles.banner} ${className ?? ""}`.trim()}
      aria-label={ariaLabel}
    >
      <PackagesGuestHintIcon />
      <p className={styles.bannerText}>{links}</p>
    </aside>
  );
}
