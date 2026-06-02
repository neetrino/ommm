import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  HOME_FOOTER_ASSETS,
  HOME_FOOTER_COPYRIGHT_COMPANY_HREF,
  HOME_FOOTER_LEGAL_LINKS,
  HOME_FOOTER_NAV_LINKS,
  HOME_FOOTER_SOCIAL_LINKS,
} from "@/components/marketing/home/home-footer-section-tokens";
import styles from "@/components/marketing/home/marketing-public-home-footer.module.css";
import { belowFoldImageProps } from "@/lib/image-loading-props";

type FooterNavKey = (typeof HOME_FOOTER_NAV_LINKS)[number]["navKey"];
type FooterLegalKey = (typeof HOME_FOOTER_LEGAL_LINKS)[number]["labelKey"];

export type MarketingPublicHomeFooterMobileProps = {
  wordmarkLabel: string;
  topNavAria: string;
  navLabels: Record<FooterNavKey, string>;
  illustrationAlt: string;
  phone: string;
  email: string;
  address: string;
  socialTitle: string;
  socialAria: (network: string) => string;
  legalNavAria: string;
  legalLabels: Record<FooterLegalKey, string>;
  copyrightPrefix: string;
  copyrightCompany: string;
  copyrightSuffix: string;
};

/** Figma mobile footer `97:5944`. */
export function MarketingPublicHomeFooterMobile({
  wordmarkLabel,
  topNavAria,
  navLabels,
  illustrationAlt,
  phone,
  email,
  address,
  socialTitle,
  socialAria,
  legalNavAria,
  legalLabels,
  copyrightPrefix,
  copyrightCompany,
  copyrightSuffix,
}: MarketingPublicHomeFooterMobileProps) {
  return (
    <div className={styles.mobileStack}>
      <div className={styles.mobileHero}>
        <p className={styles.mobileWordmark}>{wordmarkLabel}</p>
        <nav className={styles.mobileNav} aria-label={topNavAria}>
          {HOME_FOOTER_NAV_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className={styles.mobileNavLink}>
              {navLabels[item.navKey]}
            </Link>
          ))}
        </nav>
        <div className={styles.mobileIllustration} aria-hidden>
          <div className={styles.illustrationFrame}>
            <Image
              src={HOME_FOOTER_ASSETS.illustration}
              alt={illustrationAlt}
              fill
              sizes="(max-width: 1023px) 70vw, 0"
              className={`${styles.illustration} ${styles.mobileIllustrationImage}`}
              {...belowFoldImageProps()}
            />
          </div>
        </div>
      </div>

      <div className={styles.mobileContact}>
        <div className={styles.mobileContactRow}>
          <Image
            src={HOME_FOOTER_ASSETS.phone}
            alt=""
            width={20}
            height={20}
            unoptimized
            className={styles.mobileContactIcon}
            aria-hidden
          />
          <a href={`tel:${phone.replace(/\s/g, "")}`} className={styles.mobileContactText}>
            {phone}
          </a>
        </div>
        <div className={styles.mobileContactRow}>
          <Image
            src={HOME_FOOTER_ASSETS.mail}
            alt=""
            width={20}
            height={20}
            unoptimized
            className={styles.mobileContactIcon}
            aria-hidden
          />
          <a href={`mailto:${email}`} className={styles.mobileContactText}>
            {email}
          </a>
        </div>
        <div className={styles.mobileContactRow}>
          <Image
            src={HOME_FOOTER_ASSETS.location}
            alt=""
            width={20}
            height={20}
            unoptimized
            className={styles.mobileContactIcon}
            aria-hidden
          />
          <span className={styles.mobileContactText}>{address}</span>
        </div>
      </div>

      <div className={styles.mobileSocial}>
        <p className={styles.mobileSocialTitle}>{socialTitle}</p>
        <div className={styles.mobileSocialList}>
          {HOME_FOOTER_SOCIAL_LINKS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={styles.socialLink}
              aria-label={socialAria(item.id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src={item.asset} alt="" width={item.width} height={item.height} unoptimized />
            </a>
          ))}
        </div>
      </div>

      <nav className={styles.mobileLegal} aria-label={legalNavAria}>
        {HOME_FOOTER_LEGAL_LINKS.map((item) => (
          <Link key={item.labelKey} href={item.href} className={styles.mobileLegalLink}>
            {legalLabels[item.labelKey]}
          </Link>
        ))}
      </nav>

      <p className={styles.mobileCopyright}>
        {copyrightPrefix}
        <a
          href={HOME_FOOTER_COPYRIGHT_COMPANY_HREF}
          className={styles.copyrightCompany}
          target="_blank"
          rel="noopener noreferrer"
        >
          {copyrightCompany}
        </a>
        {copyrightSuffix}
      </p>
    </div>
  );
}
