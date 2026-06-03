import Image from "next/image";
import styles from "@/components/auth/auth-site-header.module.css";
import { Link } from "@/i18n/navigation";
import { aboveFoldImageProps } from "@/lib/image-loading-props";

/** Auth login / sign-in header logo — mobile 9rem, desktop (md+) 11rem. */
const AUTH_HEADER_LOGO_PX = 176;

export function AuthSiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className="inline-flex items-center justify-center">
          <Image
            src="/marketing/home/brand-mark.png"
            alt="Ommm"
            width={AUTH_HEADER_LOGO_PX}
            height={AUTH_HEADER_LOGO_PX}
            className={styles.logo}
            {...aboveFoldImageProps()}
          />
        </Link>
      </div>
    </header>
  );
}
