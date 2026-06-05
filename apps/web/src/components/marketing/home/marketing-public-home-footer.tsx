import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import styles from "@/components/marketing/home/marketing-public-home-footer.module.css";
import { MarketingPublicHomeFooterMobile } from "@/components/marketing/home/marketing-public-home-footer-mobile";
import {
  HOME_FOOTER_ASSETS,
  HOME_FOOTER_COPYRIGHT_COMPANY_HREF,
  HOME_FOOTER_FIGMA,
  HOME_FOOTER_FIGMA_POSITIONS,
  HOME_FOOTER_INNER_MOBILE_LAYOUT,
  HOME_FOOTER_INNER_TABLET_LAYOUT,
  HOME_FOOTER_LAYOUT,
  HOME_FOOTER_LEGAL_LINKS,
  HOME_FOOTER_MOBILE_LAYOUT,
  HOME_FOOTER_TABLET_LAYOUT,
  HOME_FOOTER_NAV_LINKS,
  HOME_FOOTER_SOCIAL_LINKS,
  type HomeFooterSurfaceVariant,
} from "@/components/marketing/home/home-footer-section-tokens";
import { MARKETING_CONTENT_MAX_WIDTH_PX } from "@/components/marketing/marketing-content-layout";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { belowFoldImageProps } from "@/lib/image-loading-props";

type MarketingPublicHomeFooterProps = {
  locale: string;
  /** Home page uses gallery underlap; inner routes blend layout gradient behind footer. */
  surfaceVariant?: HomeFooterSurfaceVariant;
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
    // --home-footer-wrap-bg: inherited from MarketingLayoutShell on home + inner routes.
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
    ["--home-footer-mobile-contact-icon-gap" as string]: mobileLayout.contactIconGap,
    ["--home-footer-mobile-contact-row-gap" as string]: mobileLayout.contactRowGap,
    ["--home-footer-mobile-contact-margin-top" as string]: mobileLayout.contactSectionMarginTop,
    ["--home-footer-mobile-social-title-gap" as string]: mobileLayout.socialTitleToIconsGap,
    ["--home-footer-mobile-social-icon-gap" as string]: mobileLayout.socialIconGap,
    ["--home-footer-mobile-social-margin-top" as string]: mobileLayout.socialSectionMarginTop,
    ["--home-footer-mobile-legal-gap" as string]: mobileLayout.legalGap,
    ["--home-footer-mobile-legal-margin-top" as string]: mobileLayout.legalSectionMarginTop,
    ["--home-footer-mobile-copyright-margin-top" as string]: mobileLayout.copyrightMarginTop,
    ["--home-footer-mobile-copyright-size" as string]: mobileLayout.copyrightFontSize,
    ["--home-footer-mobile-copyright-line-height" as string]: String(mobileLayout.copyrightLineHeight),
    ["--home-footer-mobile-copyright-tracking" as string]: mobileLayout.copyrightLetterSpacing,
    ["--home-footer-mobile-illustration-top" as string]: mobileLayout.illustrationTop,
    ["--home-footer-mobile-illustration-left" as string]: mobileLayout.illustrationLeft,
    ["--home-footer-mobile-illustration-width" as string]: mobileLayout.illustrationWidth,
    ["--home-footer-mobile-illustration-height" as string]: mobileLayout.illustrationHeight,
    ["--home-footer-mobile-hero-min-height" as string]: mobileLayout.heroMinHeight,
    ["--home-footer-text" as string]: HOME_FOOTER_FIGMA.text,
    ["--home-footer-wordmark-color" as string]: HOME_PAGE_SURFACE.footerWordmark,
    ["--home-footer-radius" as string]: `${HOME_FOOTER_FIGMA.topRadiusPx}px`,
    ["--home-footer-max-width" as string]: isInner
      ? `${MARKETING_CONTENT_MAX_WIDTH_PX}px`
      : `${HOME_FOOTER_LAYOUT.maxWidthPx}px`,
    ["--home-footer-min-height" as string]: `clamp(36rem, ${pct(HOME_FOOTER_FIGMA.artboardHeightPx / HOME_FOOTER_FIGMA.artboardWidthPx)}, ${HOME_FOOTER_LAYOUT.minHeightPx}px)`,
    ["--home-footer-wordmark-left" as string]: pct(pos.wordmark.left),
    ["--home-footer-wordmark-top" as string]: pct(pos.wordmark.top),
    ["--home-footer-nav-left" as string]: pct(pos.nav.left),
    ["--home-footer-nav-top" as string]: pct(pos.nav.top),
    ["--home-footer-illustration-left" as string]: pct(pos.illustration.left),
    ["--home-footer-illustration-top" as string]: pct(pos.illustration.top),
    ["--home-footer-illustration-width" as string]: pct(pos.illustration.width),
    ["--home-footer-illustration-height" as string]: pct(pos.illustration.height),
    ["--home-footer-contact-left" as string]: pct(pos.contact.left),
    ["--home-footer-contact-top" as string]: pct(pos.contact.top),
    ["--home-footer-social-left" as string]: pct(pos.social.left),
    ["--home-footer-social-top" as string]: pct(pos.social.top),
    ["--home-footer-legal-left" as string]: pct(pos.legal.left),
    ["--home-footer-legal-top" as string]: pct(pos.legal.top),
    ["--home-footer-copyright-left" as string]: pct(pos.copyright.left),
    ["--home-footer-copyright-top" as string]: pct(pos.copyright.top),
    ["--home-footer-copyright-width" as string]: pct(pos.copyright.width),
    ["--home-footer-nav-link-padding" as string]: `${layout.navLinkPaddingLeftPx}px`,
    ["--home-footer-contact-gap" as string]: `${layout.contactSectionGapPx}px`,
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
  };
}

type FooterContentProps = {
  wordmark: ReactNode;
  topNav: ReactNode;
  illustration: ReactNode;
  contact: ReactNode;
  social: ReactNode;
  legal: ReactNode;
  copyright: ReactNode;
};

type FooterDesktopLayerProps = FooterContentProps & {
  topNavAria: string;
};

function FooterDesktopLayer({
  wordmark,
  topNav,
  illustration,
  contact,
  social,
  legal,
  copyright,
  topNavAria,
}: FooterDesktopLayerProps) {
  return (
    <div className={styles.desktopLayer}>
      <div className={styles.wordmarkSlot}>{wordmark}</div>
      <nav className={styles.navSlot} aria-label={topNavAria}>
        {topNav}
      </nav>
      <div className={styles.illustrationSlot}>{illustration}</div>
      <div className={styles.contactSlot}>{contact}</div>
      <div className={styles.socialSlot}>{social}</div>
      <div className={styles.legalSlot}>{legal}</div>
      <div className={styles.copyrightSlot}>{copyright}</div>
    </div>
  );
}

/**
 * Figma **Footer** `196:1191` — marketing layout + home page.
 */
export async function MarketingPublicHomeFooter({
  locale,
  surfaceVariant = "home",
}: MarketingPublicHomeFooterProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.home" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const topNav = (
    <div className={styles.topNav}>
      {HOME_FOOTER_NAV_LINKS.map((item) => (
        <Link key={item.href} href={item.href} className={styles.topNavLink}>
          {tNav(item.navKey)}
        </Link>
      ))}
    </div>
  );

  const wordmark = <p className={styles.wordmark}>{t("footerWordmark")}</p>;

  const illustration = (
    <div className={`${styles.illustrationFrame}`}>
      <Image
        src={HOME_FOOTER_ASSETS.illustration}
        alt={t("footerIllustrationAlt")}
        fill
        sizes="(max-width: 743px) 100vw, 596px"
        className={styles.illustration}
        {...belowFoldImageProps()}
      />
    </div>
  );

  const contact = (
    <div>
      <p className={styles.sectionTitle}>{t("footerContactTitle")}</p>
      <ul className={styles.contactList}>
        <li className={styles.contactRow}>
          <Image src={HOME_FOOTER_ASSETS.phone} alt="" width={24} height={24} unoptimized className={styles.contactIcon} aria-hidden />
          <a href={`tel:${t("footerPhone").replace(/\s/g, "")}`} className={styles.contactText}>
            {t("footerPhone")}
          </a>
        </li>
        <li className={styles.contactRow}>
          <Image src={HOME_FOOTER_ASSETS.mail} alt="" width={25} height={24} unoptimized className={styles.contactIcon} aria-hidden />
          <a href={`mailto:${t("footerEmail")}`} className={styles.contactText}>
            {t("footerEmail")}
          </a>
        </li>
        <li className={styles.contactRow}>
          <Image src={HOME_FOOTER_ASSETS.location} alt="" width={24} height={24} unoptimized className={styles.contactIcon} aria-hidden />
          <span className={styles.contactText}>{t("footerAddress")}</span>
        </li>
      </ul>
    </div>
  );

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
    <p className={styles.copyright}>
      {t("footerCopyrightPrefix")}
      <a
        href={HOME_FOOTER_COPYRIGHT_COMPANY_HREF}
        className={styles.copyrightCompany}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("footerCopyrightCompany")}
      </a>
      {t("footerCopyrightSuffix")}
    </p>
  );

  return (
    <section
      className={`${styles.sectionWrap}${surfaceVariant === "inner" ? ` ${styles.sectionWrapInner}` : ""}`}
      style={footerStyleVars(surfaceVariant)}
    >
      <footer className={`${marketingMontserrat.variable} ${styles.shell}`}>
        <div className={styles.inner}>
        <FooterDesktopLayer
          topNavAria={t("footerTopNavAria")}
          wordmark={wordmark}
          topNav={topNav}
          illustration={illustration}
          contact={contact}
          social={social}
          legal={legal}
          copyright={copyright}
        />

        <MarketingPublicHomeFooterMobile
          wordmarkLabel={t("footerWordmark")}
          topNavAria={t("footerTopNavAria")}
          navLabels={{
            story: tNav("story"),
            schedule: tNav("schedule"),
            coaches: tNav("coaches"),
            memberships: tNav("memberships"),
            explore: tNav("explore"),
            contact: tNav("contact"),
          }}
          illustrationAlt={t("footerIllustrationAlt")}
          phone={t("footerPhone")}
          email={t("footerEmail")}
          address={t("footerAddress")}
          socialTitle={t("footerSocialTitle")}
          socialAria={(network) => t("footerSocialAria", { network })}
          legalNavAria={t("footerLegalNavAria")}
          legalLabels={{
            footerPrivacy: t("footerPrivacy"),
            footerTerms: t("footerTerms"),
            footerRefund: t("footerRefund"),
          }}
          copyrightPrefix={t("footerCopyrightPrefix")}
          copyrightCompany={t("footerCopyrightCompany")}
          copyrightSuffix={t("footerCopyrightSuffix")}
        />
        </div>
      </footer>
    </section>
  );
}
