import type { CSSProperties, ReactNode } from "react";
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
  HOME_FOOTER_FIGMA_POSITIONS,
  HOME_FOOTER_INNER_MOBILE_LAYOUT,
  HOME_FOOTER_INNER_TABLET_LAYOUT,
  HOME_FOOTER_LAYOUT,
  HOME_FOOTER_LEGAL_LINKS,
  HOME_FOOTER_MOBILE_LAYOUT,
  HOME_FOOTER_PAYMENT_LOGOS,
  HOME_FOOTER_SHELL_BACKGROUND,
  HOME_FOOTER_SOCIAL_LINKS,
  HOME_FOOTER_TABLET_LAYOUT,
  type HomeFooterSurfaceVariant,
} from "@/components/marketing/home/home-footer-section-tokens";
import type { MarketingNavKey } from "@/components/marketing/marketing-nav-links";
import { MARKETING_FOOTER_MARKER } from "@/components/marketing/marketing-route-utils";
import { MARKETING_CONTENT_MAX_WIDTH_PX } from "@/components/marketing/marketing-content-layout";
import { filterMarketingNavLinks } from "@/lib/home-page-sections";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { belowFoldImageProps } from "@/lib/image-loading-props";
import { getHomeSectionsVisibility } from "@/server/home-sections-visibility";

type MarketingPublicHomeFooterProps = {
  locale: string;
  surfaceVariant?: HomeFooterSurfaceVariant;
  showContactSection?: boolean;
};

function pct(value: number): string {
  return `${value * 100}%`;
}

function footerStyleVars(surfaceVariant: HomeFooterSurfaceVariant): CSSProperties {
  const pos = HOME_FOOTER_FIGMA_POSITIONS;
  const layout = HOME_FOOTER_LAYOUT;
  const isInner = surfaceVariant === "inner";
  const mobileLayout = isInner ? HOME_FOOTER_INNER_MOBILE_LAYOUT : HOME_FOOTER_MOBILE_LAYOUT;
  const tabletLayout = isInner ? HOME_FOOTER_INNER_TABLET_LAYOUT : HOME_FOOTER_TABLET_LAYOUT;
  return {
    ["--home-footer-shell-bg" as string]: HOME_FOOTER_SHELL_BACKGROUND,
    ["--home-footer-surface" as string]: HOME_FOOTER_FIGMA.surface,
    ["--home-footer-wrap-padding-top" as string]: HOME_FOOTER_LAYOUT.sectionPaddingTop,
    ["--home-footer-mobile-overlap" as string]: mobileLayout.galleryOverlap,
    ["--home-footer-mobile-wrap-padding-top" as string]: mobileLayout.wrapPaddingTop,
    ["--home-footer-tablet-overlap" as string]: tabletLayout.galleryOverlap,
    ["--home-footer-tablet-wrap-padding-top" as string]: tabletLayout.wrapPaddingTop,
    ["--home-footer-mobile-radius" as string]: mobileLayout.topRadius,
    ["--home-footer-mobile-px" as string]: mobileLayout.sectionPaddingX,
    ["--home-footer-mobile-py" as string]: mobileLayout.sectionPaddingTop,
    ["--home-footer-mobile-pb" as string]: mobileLayout.sectionPaddingBottom,
    ["--home-footer-mobile-wordmark-size" as string]: mobileLayout.wordmarkFontSize,
    ["--home-footer-mobile-wordmark-line-height" as string]: String(mobileLayout.wordmarkLineHeight),
    ["--home-footer-mobile-body-size" as string]: mobileLayout.bodyFontSize,
    ["--home-footer-mobile-body-line-height" as string]: String(mobileLayout.bodyLineHeight),
    ["--home-footer-mobile-nav-gap" as string]: mobileLayout.navGap,
    ["--home-footer-mobile-wordmark-nav-gap" as string]: mobileLayout.wordmarkToNavGap,
    ["--home-footer-mobile-nav-to-contact-gap" as string]: mobileLayout.navToContactGap,
    ["--home-footer-mobile-contact-block-pt" as string]: mobileLayout.contactBlockPaddingTop,
    ["--home-footer-mobile-contact-icon-gap" as string]: mobileLayout.contactIconGap,
    ["--home-footer-mobile-contact-row-gap" as string]: mobileLayout.contactRowGap,
    ["--home-footer-mobile-contact-title-gap" as string]: mobileLayout.contactTitleToRowsGap,
    ["--home-footer-mobile-social-title-gap" as string]: mobileLayout.socialTitleToIconsGap,
    ["--home-footer-mobile-social-icon-gap" as string]: mobileLayout.socialIconGap,
    ["--home-footer-mobile-social-margin-top" as string]: mobileLayout.socialSectionMarginTop,
    ["--home-footer-mobile-payment-margin-top" as string]: mobileLayout.paymentSectionMarginTop,
    ["--home-footer-mobile-legal-gap" as string]: mobileLayout.legalGap,
    ["--home-footer-mobile-legal-margin-top" as string]: mobileLayout.legalSectionMarginTop,
    ["--home-footer-mobile-copyright-margin-top" as string]: mobileLayout.copyrightMarginTop,
    ["--home-footer-mobile-copyright-size" as string]: mobileLayout.copyrightFontSize,
    ["--home-footer-mobile-copyright-line-height" as string]: String(mobileLayout.copyrightLineHeight),
    ["--home-footer-mobile-copyright-tracking" as string]: mobileLayout.copyrightLetterSpacing,
    ["--home-footer-mobile-illustration-top" as string]: mobileLayout.illustrationTop,
    ["--home-footer-mobile-illustration-right" as string]: mobileLayout.illustrationRight,
    ["--home-footer-mobile-illustration-shift-x" as string]: mobileLayout.illustrationShiftX,
    ["--home-footer-mobile-illustration-width" as string]: mobileLayout.illustrationWidth,
    ["--home-footer-mobile-illustration-height" as string]: mobileLayout.illustrationHeight,
    ["--home-footer-mobile-payment-gap" as string]: mobileLayout.paymentGap,
    ["--home-footer-mobile-payment-mastercard-height" as string]: mobileLayout.paymentMastercardHeight,
    ["--home-footer-mobile-payment-arca-height" as string]: mobileLayout.paymentArcaHeight,
    ["--home-footer-mobile-payment-arca-offset" as string]: mobileLayout.paymentArcaOffset,
    ["--home-footer-mobile-payment-visa-height" as string]: mobileLayout.paymentVisaHeight,
    ["--home-footer-text" as string]: HOME_FOOTER_FIGMA.text,
    ["--home-footer-radius" as string]: `${HOME_FOOTER_FIGMA.topRadiusPx}px`,
    ["--home-footer-max-width" as string]: `${MARKETING_CONTENT_MAX_WIDTH_PX}px`,
    ["--home-footer-min-height" as string]: `clamp(24rem, ${pct(HOME_FOOTER_FIGMA.artboardHeightPx / HOME_FOOTER_FIGMA.artboardWidthPx)}, ${HOME_FOOTER_LAYOUT.minHeightPx}px)`,
    ["--home-footer-top-bar-top" as string]: pct(pos.topBar.top),
    ["--home-footer-illustration-scale" as string]: String(HOME_FOOTER_FIGMA.illustrationDisplayScale),
    ["--home-footer-illustration-bottom" as string]: `${HOME_FOOTER_FIGMA.illustrationBottomInsetPx}px`,
    ["--home-footer-mobile-illustration-bleed" as string]: `${HOME_FOOTER_FIGMA.illustrationBottomBleedRatio * 100}%`,
    ["--home-footer-tablet-illustration-bleed" as string]: `${HOME_FOOTER_FIGMA.illustrationBottomBleedRatio * 100}%`,
    ["--home-footer-illustration-width" as string]: pct(pos.illustration.width),
    ["--home-footer-illustration-height" as string]: pct(pos.illustration.height),
    ["--home-footer-contact-top" as string]: pct(pos.contact.top),
    ["--home-footer-payment-top" as string]: pct(pos.payment.top),
    ["--home-footer-payment-gap" as string]: `${HOME_FOOTER_FIGMA.paymentGapPx}px`,
    ["--home-footer-payment-logo-height" as string]: `${HOME_FOOTER_FIGMA.paymentLogoHeightPx}px`,
    ["--home-footer-payment-arca-height" as string]: `${HOME_FOOTER_FIGMA.paymentArcaDisplayHeightPx}px`,
    ["--home-footer-payment-arca-offset-x" as string]: `${HOME_FOOTER_FIGMA.paymentArcaOffsetXPx}px`,
    ["--home-footer-social-top" as string]: pct(pos.social.top),
    ["--home-footer-legal-top" as string]: pct(pos.legal.top),
    ["--home-footer-nav-link-padding" as string]: `${layout.navLinkPaddingLeftPx}px`,
    ["--home-footer-contact-gap" as string]: `${layout.contactSectionGapPx}px`,
    ["--home-footer-contact-title-gap" as string]: `${layout.contactTitleGapPx}px`,
    ["--home-footer-contact-row-gap" as string]: `${layout.contactRowGapPx}px`,
    ["--home-footer-social-title-gap" as string]: `${layout.socialTitleGapPx}px`,
    ["--home-footer-social-icon-gap" as string]: `${layout.socialIconGapPx}px`,
    ["--home-footer-legal-gap" as string]: `${layout.legalLinkGapPx}px`,
    ["--home-footer-wordmark-size" as string]: `${layout.wordmarkFontSizePx}px`,
    ["--home-footer-wordmark-line-height" as string]: `${layout.wordmarkLineHeightPx}px`,
    ["--home-footer-body-size" as string]: `${layout.bodyFontSizePx}px`,
    ["--home-footer-body-line-height" as string]: `${layout.bodyLineHeightPx}px`,
    ["--home-footer-body-tracking" as string]: `${layout.bodyLetterSpacingPx}px`,
    ["--home-footer-copyright-size" as string]: `${layout.copyrightFontSizePx}px`,
    ["--home-footer-copyright-line-height" as string]: `${layout.copyrightLineHeightPx}px`,
    ["--home-footer-copyright-tracking" as string]: `${layout.copyrightLetterSpacingPx}px`,
    ["--home-footer-contact-social-lift" as string]: `${layout.contactSocialLiftPx}px`,
    ["--home-footer-top-bar-legal-lift" as string]: `${layout.topBarLegalLiftPx}px`,
  };
}

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
    <section
      {...{ [MARKETING_FOOTER_MARKER]: "" }}
      className={`${styles.sectionWrap}${surfaceVariant === "inner" ? ` ${styles.sectionWrapInner}` : ""}`}
      style={footerStyleVars(surfaceVariant)}
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
    </section>
  );
}
