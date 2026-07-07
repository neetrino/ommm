import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { HomeFooterSphereBounce } from "@/components/marketing/home/home-footer-sphere-bounce";
import {
  HOME_FOOTER_ASSETS,
  HOME_FOOTER_FIGMA,
  HOME_FOOTER_LEGAL_LINKS,
  HOME_FOOTER_MOBILE_SPHERE_BOUNCE,
  HOME_FOOTER_PAYMENT_LOGOS,
  HOME_FOOTER_SOCIAL_LINKS,
} from "@/components/marketing/home/home-footer-section-tokens";
import { MarketingPublicHomeFooterCopyright } from "@/components/marketing/home/marketing-public-home-footer-copyright";
import styles from "@/components/marketing/home/marketing-public-home-footer.module.css";
import { belowFoldImageProps } from "@/lib/image-loading-props";

type FooterLegalKey = (typeof HOME_FOOTER_LEGAL_LINKS)[number]["labelKey"];

export type MarketingPublicHomeFooterMobileProps = {
  wordmarkLabel: string;
  illustrationAlt: string;
  contactTitle: string;
  phone: string;
  phoneHref: string;
  email: string;
  address: string;
  addressHref: string;
  showContactSection?: boolean;
  socialTitle: string;
  socialAria: (network: string) => string;
  legalNavAria: string;
  legalLabels: Record<FooterLegalKey, string>;
  copyrightPrefix: string;
  copyrightCompanyPart1: string;
  copyrightCompanyPart2: string;
  copyrightSuffix: string;
};

/** Figma mobile footer `632:1081`. */
export function MarketingPublicHomeFooterMobile({
  wordmarkLabel,
  illustrationAlt,
  contactTitle,
  phone,
  phoneHref,
  email,
  address,
  addressHref,
  showContactSection = true,
  socialTitle,
  socialAria,
  legalNavAria,
  legalLabels,
  copyrightPrefix,
  copyrightCompanyPart1,
  copyrightCompanyPart2,
  copyrightSuffix,
}: MarketingPublicHomeFooterMobileProps) {
  return (
    <div className={styles.mobileStack}>
      <p className={styles.wordmark}>{wordmarkLabel}</p>

      {showContactSection ? (
        <div className={styles.mobileContactSection}>
          <p className={styles.mobileContactTitle}>{contactTitle}</p>
          <div className={styles.mobileContact}>
            {phoneHref.length > 0 ? (
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
                <a href={`tel:${phoneHref}`} className={styles.mobileContactText}>
                  {phone}
                </a>
              </div>
            ) : null}
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
              <a href={addressHref} className={styles.mobileContactText} target="_blank" rel="noopener noreferrer">
                {address}
              </a>
            </div>
          </div>
        </div>
      ) : null}

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

      {showContactSection ? (
        <div className={styles.mobilePayment}>
          {HOME_FOOTER_PAYMENT_LOGOS.map((logo) => (
            <span key={logo.id} className={styles.paymentLogoItem}>
              <Image
                src={logo.src}
                alt=""
                width={HOME_FOOTER_FIGMA.paymentLogoHeightPx}
                height={HOME_FOOTER_FIGMA.paymentLogoHeightPx}
                unoptimized
                className={styles.paymentLogo}
                aria-hidden
              />
            </span>
          ))}
        </div>
      ) : null}

      <nav className={styles.mobileLegal} aria-label={legalNavAria}>
        {HOME_FOOTER_LEGAL_LINKS.map((item) => (
          <Link key={item.labelKey} href={item.href} className={styles.mobileLegalLink}>
            {legalLabels[item.labelKey]}
          </Link>
        ))}
      </nav>

      <MarketingPublicHomeFooterCopyright
        className={styles.mobileCopyright}
        layout="two-line"
        prefix={copyrightPrefix}
        companyPart1={copyrightCompanyPart1}
        companyPart2={copyrightCompanyPart2}
        suffix={copyrightSuffix}
      />

      <div className={styles.mobileIllustration} aria-hidden>
        <HomeFooterSphereBounce
          className={`${styles.illustrationFrame} ${styles.footerFloatIllustration}`}
          bounceConfig={HOME_FOOTER_MOBILE_SPHERE_BOUNCE}
        >
          <Image
            src={HOME_FOOTER_ASSETS.illustration}
            alt={illustrationAlt}
            fill
            sizes="(max-width: 743px) 70vw, 0"
            className={`${styles.illustration} ${styles.mobileIllustrationImage}`}
            {...belowFoldImageProps()}
          />
        </HomeFooterSphereBounce>
      </div>
    </div>
  );
}
