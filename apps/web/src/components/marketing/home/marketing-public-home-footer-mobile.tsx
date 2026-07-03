import Image from "next/image";
import { HomeFooterSphereBounce } from "@/components/marketing/home/home-footer-sphere-bounce";
import {
  HOME_FOOTER_ASSETS,
  HOME_FOOTER_FIGMA,
  HOME_FOOTER_LEGAL_LINKS,
  HOME_FOOTER_MOBILE_SPHERE_BOUNCE,
  HOME_FOOTER_PAYMENT_LOGOS,
} from "@/components/marketing/home/home-footer-section-tokens";
import { MarketingPublicHomeFooterCopyright } from "@/components/marketing/home/marketing-public-home-footer-copyright";
import { MarketingPublicHomeFooterInstagramRow } from "@/components/marketing/home/marketing-public-home-footer-instagram-row";
import { MarketingPublicHomeFooterPolicies } from "@/components/marketing/home/marketing-public-home-footer-policies";
import styles from "@/components/marketing/home/marketing-public-home-footer.module.css";
import { belowFoldImageProps } from "@/lib/image-loading-props";

type FooterLegalKey = (typeof HOME_FOOTER_LEGAL_LINKS)[number]["labelKey"];

export type MarketingPublicHomeFooterMobileProps = {
  wordmarkLabel: string;
  illustrationAlt: string;
  contactTitle: string;
  email: string;
  address: string;
  addressHref: string;
  showContactSection?: boolean;
  instagramAria: string;
  policiesTitle: string;
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
  email,
  address,
  addressHref,
  showContactSection = true,
  instagramAria,
  policiesTitle,
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
            <MarketingPublicHomeFooterInstagramRow
              as="div"
              rowClassName={styles.mobileContactRow}
              iconClassName={styles.mobileContactIcon}
              textClassName={styles.mobileContactText}
              ariaLabel={instagramAria}
            />
          </div>
        </div>
      ) : null}

      {showContactSection ? (
        <div className={styles.mobilePayment}>
          {HOME_FOOTER_PAYMENT_LOGOS.map((logo) => (
            <span key={logo.id} className={styles.paymentLogoItem}>
              <Image
                src={logo.src}
                alt=""
                width={logo.widthPx}
                height={logo.heightPx}
                unoptimized
                className={styles.paymentLogo}
                aria-hidden
              />
            </span>
          ))}
        </div>
      ) : null}

      <MarketingPublicHomeFooterPolicies
        title={policiesTitle}
        navAria={legalNavAria}
        labels={legalLabels}
        blockClassName={styles.mobilePolicies}
        titleClassName={styles.mobilePoliciesTitle}
        navClassName={styles.mobilePoliciesNav}
        linkClassName={styles.mobilePoliciesLink}
      />

      <MarketingPublicHomeFooterCopyright
        className={styles.mobileCopyright}
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
