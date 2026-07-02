import type { ReactNode } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MarketingPublicHomeFooterCopyright } from "@/components/marketing/home/marketing-public-home-footer-copyright";
import styles from "@/components/marketing/home/marketing-public-home-footer.module.css";
import { HomePageReveal } from "@/components/marketing/home/home-page-reveal";
import { MarketingPublicHomeFooterMobile } from "@/components/marketing/home/marketing-public-home-footer-mobile";
import { HomeFooterSphereBounce } from "@/components/marketing/home/home-footer-sphere-bounce";
import {
  HOME_FOOTER_ASSETS,
  HOME_FOOTER_ADDRESS_HREF,
  HOME_FOOTER_FIGMA,
  HOME_FOOTER_LEGAL_LINKS,
  HOME_FOOTER_PAYMENT_LOGOS,
  HOME_FOOTER_SOCIAL_LINKS,
  type HomeFooterSurfaceVariant,
} from "@/components/marketing/home/home-footer-section-tokens";
import { MarketingPublicHomeFooterSurface } from "@/components/marketing/home/marketing-public-home-footer-surface";
import type { MarketingNavKey } from "@/components/marketing/marketing-nav-links";
import { filterMarketingNavLinks } from "@/lib/home-page-sections";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { belowFoldImageProps } from "@/lib/image-loading-props";
import { getHomeSectionsVisibility } from "@/server/home-sections-visibility";

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
  social: ReactNode;
  legal: ReactNode;
  copyright: ReactNode;
};

function FooterDesktopLayer({
  topBar,
  illustration,
  contact,
  payment,
  social,
  legal,
  copyright,
}: FooterContentProps) {
  return (
    <div className={styles.desktopLayer}>
      <div className={styles.topBarSlot}>{topBar}</div>
      <div className={styles.illustrationSlot}>{illustration}</div>
      <div className={styles.contactSlot}>{contact}</div>
      <div className={styles.paymentSlot}>{payment}</div>
      <div className={styles.socialSlot}>{social}</div>
      <div className={styles.legalSlot}>{legal}</div>
      <div className={styles.copyrightSlot}>{copyright}</div>
    </div>
  );
}

function FooterPaymentLogos({ className }: { className: string }) {
  const logoHeightPx = HOME_FOOTER_FIGMA.paymentLogoHeightPx;

  return (
    <div className={className}>
      {HOME_FOOTER_PAYMENT_LOGOS.map((logo) => (
        <span key={logo.id} className={styles.paymentLogoItem}>
          <Image
            src={logo.src}
            alt=""
            width={logoHeightPx}
            height={logoHeightPx}
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
  const navT = await getTranslations({ locale, namespace: "nav" });
  const visibility = await getHomeSectionsVisibility();
  const footerNavLinks = filterMarketingNavLinks(visibility).filter((link) => link.key !== "home");

  const topBar = (
    <nav className={styles.topBar} aria-label={t("footerTopNavAria")}>
      <p className={styles.wordmark}>{t("footerWordmark")}</p>
      <div className={styles.topNav}>
        {footerNavLinks.map(({ href, key }) => (
          <Link key={key} href={href} className={styles.topNavLink}>
            {navT(key as MarketingNavKey)}
          </Link>
        ))}
      </div>
    </nav>
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

  const contact = showContactSection ? (
    <div>
      <p className={styles.sectionTitle}>{t("footerContactTitle")}</p>
      <ul className={styles.contactList}>
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
      </ul>
    </div>
  ) : null;

  const payment = showContactSection ? <FooterPaymentLogos className={styles.paymentLogos} /> : null;

  const social = (
    <div className={styles.socialBlock}>
      <p className={styles.sectionTitle}>{t("footerSocialTitle")}</p>
      <div className={styles.socialList}>
        {HOME_FOOTER_SOCIAL_LINKS.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={styles.socialLink}
            aria-label={t("footerSocialAria", { network: item.id })}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src={item.asset} alt="" width={item.width} height={item.height} unoptimized />
          </a>
        ))}
      </div>
    </div>
  );

  const legal = (
    <nav className={styles.legalNav} aria-label={t("footerLegalNavAria")}>
      {HOME_FOOTER_LEGAL_LINKS.map((item) => (
        <Link key={item.labelKey} href={item.href} className={styles.legalLink}>
          {t(item.labelKey)}
        </Link>
      ))}
    </nav>
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
            social={social}
            legal={legal}
            copyright={copyright}
          />

          <MarketingPublicHomeFooterMobile
            wordmarkLabel={t("footerWordmark")}
            illustrationAlt={t("footerIllustrationAlt")}
            navAria={t("footerTopNavAria")}
            navLinks={footerNavLinks.map(({ href, key }) => ({
              href,
              key,
              label: navT(key as MarketingNavKey),
            }))}
            contactTitle={t("footerContactTitle")}
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
