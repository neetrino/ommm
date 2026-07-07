import type { ReactNode } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MarketingPublicHomeFooterCopyright } from "@/components/marketing/home/marketing-public-home-footer-copyright";
import { MarketingPublicHomeFooterInstagramRow } from "@/components/marketing/home/marketing-public-home-footer-instagram-row";
import { MarketingPublicHomeFooterPolicies } from "@/components/marketing/home/marketing-public-home-footer-policies";
import styles from "@/components/marketing/home/marketing-public-home-footer.module.css";
import { HomePageReveal } from "@/components/marketing/home/home-page-reveal";
import { MarketingPublicHomeFooterMobile } from "@/components/marketing/home/marketing-public-home-footer-mobile";
import { HomeFooterSphereBounce } from "@/components/marketing/home/home-footer-sphere-bounce";
import {
  HOME_FOOTER_ASSETS,
  HOME_FOOTER_ADDRESS_HREF,
  HOME_FOOTER_PAYMENT_LOGOS,
  type HomeFooterSurfaceVariant,
} from "@/components/marketing/home/home-footer-section-tokens";
import { MarketingPublicHomeFooterSurface } from "@/components/marketing/home/marketing-public-home-footer-surface";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { formatPhoneTelHref } from "@/lib/phone";
import { belowFoldImageProps } from "@/lib/image-loading-props";

type MarketingPublicHomeFooterProps = {
  locale: string;
  surfaceVariant?: HomeFooterSurfaceVariant;
  /** Practices-inner routes — home footer surface on phone only. */
  mobileHomeParity?: boolean;
  showContactSection?: boolean;
};

type FooterContentProps = {
  topBar: ReactNode;
  illustration: ReactNode;
  contact: ReactNode;
  payment: ReactNode;
  legal: ReactNode;
  copyright: ReactNode;
};

function FooterDesktopLayer({
  topBar,
  illustration,
  contact,
  payment,
  legal,
  copyright,
}: FooterContentProps) {
  return (
    <div className={styles.desktopLayer}>
      <div className={styles.topBarSlot}>{topBar}</div>
      <div className={styles.illustrationSlot}>{illustration}</div>
      <div className={styles.contactSlot}>{contact}</div>
      <div className={styles.paymentSlot}>{payment}</div>
      <div className={styles.legalSlot}>{legal}</div>
      <div className={styles.copyrightSlot}>{copyright}</div>
    </div>
  );
}

function FooterPaymentLogos({ className }: { className: string }) {
  return (
    <div className={className}>
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
  );
}

/**
 * Figma **Footer** `605:961` — marketing layout + home page.
 */
export async function MarketingPublicHomeFooter({
  locale,
  surfaceVariant = "home",
  mobileHomeParity = false,
  showContactSection = true,
}: MarketingPublicHomeFooterProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.home" });

  const topBar = (
    <div className={styles.topBar}>
      <p className={styles.wordmark}>{t("footerWordmark")}</p>
    </div>
  );

  const illustration = (
    <HomeFooterSphereBounce className={`${styles.illustrationFrame} ${styles.footerFloatIllustration}`}>
      <Image
        src={HOME_FOOTER_ASSETS.illustration}
        alt={t("footerIllustrationAlt")}
        fill
        sizes="(max-width: 743px) 70vw, 412px"
        className={styles.illustration}
        {...belowFoldImageProps()}
      />
    </HomeFooterSphereBounce>
  );

  const footerPhone = t("footerPhone");
  const footerPhoneHref = formatPhoneTelHref(footerPhone);

  const contact = showContactSection ? (
    <div>
      <p className={styles.sectionTitle}>{t("footerContactTitle")}</p>
      <ul className={styles.contactList}>
        {footerPhoneHref.length > 0 ? (
          <li className={styles.contactRow}>
            <Image src={HOME_FOOTER_ASSETS.phone} alt="" width={24} height={24} unoptimized className={styles.contactIcon} aria-hidden />
            <a href={`tel:${footerPhoneHref}`} className={styles.contactText}>
              {footerPhone}
            </a>
          </li>
        ) : null}
        <li className={styles.contactRow}>
          <Image src={HOME_FOOTER_ASSETS.mail} alt="" width={25} height={24} unoptimized className={styles.contactIcon} aria-hidden />
          <a href={`mailto:${t("footerEmail")}`} className={styles.contactText}>
            {t("footerEmail")}
          </a>
        </li>
        <li className={styles.contactRow}>
          <Image src={HOME_FOOTER_ASSETS.location} alt="" width={24} height={24} unoptimized className={styles.contactIcon} aria-hidden />
          <a href={HOME_FOOTER_ADDRESS_HREF} className={styles.contactText} target="_blank" rel="noopener noreferrer">
            {t("footerAddress")}
          </a>
        </li>
        <MarketingPublicHomeFooterInstagramRow
          rowClassName={styles.contactRow}
          iconClassName={styles.contactIcon}
          textClassName={styles.contactText}
          ariaLabel={t("footerInstagramAria")}
        />
      </ul>
    </div>
  ) : null;

  const payment = showContactSection ? <FooterPaymentLogos className={styles.paymentLogos} /> : null;

  const legal = (
    <MarketingPublicHomeFooterPolicies
      title={t("footerPoliciesTitle")}
      navAria={t("footerLegalNavAria")}
      labels={{
        footerPrivacy: t("footerPrivacy"),
        footerTerms: t("footerTerms"),
        footerRefund: t("footerRefund"),
      }}
      blockClassName={styles.policiesBlock}
      titleClassName={styles.sectionTitle}
      navClassName={styles.policiesNav}
      linkClassName={styles.legalLink}
    />
  );

  const copyright = (
    <MarketingPublicHomeFooterCopyright
      className={styles.copyright}
      prefix={t("footerCopyrightPrefix")}
      companyPart1={t("footerCopyrightCompanyPart1")}
      companyPart2={t("footerCopyrightCompanyPart2")}
      suffix={t("footerCopyrightSuffix")}
    />
  );

  return (
    <MarketingPublicHomeFooterSurface
      surfaceVariant={surfaceVariant}
      mobileHomeParity={mobileHomeParity}
    >
      <footer className={`${marketingMontserrat.variable} ${styles.shell}`}>
        <HomePageReveal index={0} className={styles.inner}>
          <FooterDesktopLayer
            topBar={topBar}
            illustration={illustration}
            contact={contact}
            payment={payment}
            legal={legal}
            copyright={copyright}
          />

          <MarketingPublicHomeFooterMobile
            wordmarkLabel={t("footerWordmark")}
            illustrationAlt={t("footerIllustrationAlt")}
            contactTitle={t("footerContactTitle")}
            phone={footerPhone}
            phoneHref={footerPhoneHref}
            email={t("footerEmail")}
            address={t("footerAddress")}
            addressHref={HOME_FOOTER_ADDRESS_HREF}
            showContactSection={showContactSection}
            socialTitle={t("footerSocialTitle")}
            socialAria={(network) => t("footerSocialAria", { network })}
            legalNavAria={t("footerLegalNavAria")}
            legalLabels={{
              footerPrivacy: t("footerPrivacy"),
              footerTerms: t("footerTerms"),
              footerRefund: t("footerRefund"),
            }}
            copyrightPrefix={t("footerCopyrightPrefix")}
            copyrightCompanyPart1={t("footerCopyrightCompanyPart1")}
            copyrightCompanyPart2={t("footerCopyrightCompanyPart2")}
            copyrightSuffix={t("footerCopyrightSuffix")}
          />
        </HomePageReveal>
      </footer>
    </MarketingPublicHomeFooterSurface>
  );
}
