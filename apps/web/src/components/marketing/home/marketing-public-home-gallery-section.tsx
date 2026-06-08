"use client";

import { useTranslations } from "next-intl";
import { HomeGalleryMosaicCarousel } from "@/components/marketing/home/home-gallery-mosaic-carousel";
import { HomeGalleryMosaicMobile } from "@/components/marketing/home/home-gallery-mosaic-mobile";
import { HomePageReveal } from "@/components/marketing/home/home-page-reveal";
import {
  HOME_GALLERY_FIGMA,
  HOME_GALLERY_IPAD_AIR_LAYOUT,
  HOME_GALLERY_LAYOUT,
  HOME_GALLERY_MOBILE_BACKGROUND,
  HOME_GALLERY_SECTION_MOBILE_FIGMA,
  HOME_GALLERY_SECTION_MOBILE_LAYOUT,
  HOME_GALLERY_TABLET_LAYOUT,
} from "@/components/marketing/home/home-gallery-section-tokens";
import { HOME_FOOTER_MOBILE_LAYOUT } from "@/components/marketing/home/home-footer-section-tokens";
import { HOME_HERO_MOBILE_MORE_DETAILS_CTA } from "@/components/marketing/home/home-hero-banner-tokens";
import { HomeHeroCtaButton } from "@/components/marketing/home/home-hero-cta-button";
import styles from "@/components/marketing/home/marketing-public-home-gallery-section.module.css";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

/**
 * Figma **Gallery** `196:1162` — desktop unchanged; mobile `97:5853` in inner layer.
 */
export function MarketingPublicHomeGallerySection() {
  const t = useTranslations("marketingPublic.home");

  const galleryTitleLines = (
    <>
      <span className={styles.galleryTitleLine}>{t("galleryTitleLine1")}</span>
      <span className={styles.galleryTitleLine}>{t("galleryTitleLine2")}</span>
    </>
  );

  const sectionStyle = {
    ["--home-gallery-mobile-bg" as string]: HOME_GALLERY_MOBILE_BACKGROUND,
    ["--home-gallery-mobile-top-radius" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.sectionTopRadius,
    ["--home-gallery-mobile-px" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.sectionPaddingX,
    ["--home-gallery-mobile-pt" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.sectionPaddingTop,
    ["--home-gallery-mobile-pb" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.sectionPaddingBottom,
    ["--home-gallery-mobile-section-gap" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.sectionGap,
    ["--home-gallery-mobile-heading-color" as string]: HOME_GALLERY_SECTION_MOBILE_FIGMA.headingColor,
    ["--home-gallery-mobile-subtitle-color" as string]: HOME_GALLERY_SECTION_MOBILE_FIGMA.subtitleColor,
    ["--home-gallery-mobile-title-size" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.titleFontSize,
    ["--home-gallery-mobile-title-line-height" as string]: String(
      HOME_GALLERY_SECTION_MOBILE_LAYOUT.titleLineHeight,
    ),
    ["--home-gallery-title-line-gap" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.titleLineGap,
    ["--home-gallery-mobile-subtitle-size" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.subtitleFontSize,
    ["--home-gallery-mobile-subtitle-line-height" as string]: String(
      HOME_GALLERY_SECTION_MOBILE_LAYOUT.subtitleLineHeight,
    ),
    ["--home-gallery-mobile-header-max-width" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.headerMaxWidth,
    ["--home-gallery-mobile-header-subtitle-gap" as string]:
      HOME_GALLERY_SECTION_MOBILE_LAYOUT.headerSubtitleGap,
    ["--home-gallery-mobile-dots-to-cta-gap" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.dotsToCtaGap,
    ["--home-gallery-footer-underlap" as string]: HOME_FOOTER_MOBILE_LAYOUT.galleryOverlap,
    ["--home-gallery-tablet-footer-underlap" as string]: HOME_GALLERY_TABLET_LAYOUT.footerUnderlap,
    ["--home-gallery-tablet-underlap-bg" as string]: HOME_GALLERY_TABLET_LAYOUT.footerUnderlapBackground,
    ["--home-gallery-desktop-bg" as string]: HOME_GALLERY_FIGMA.sectionBackground,
    ["--home-gallery-desktop-pt" as string]: HOME_GALLERY_LAYOUT.sectionPaddingTop,
    ["--home-gallery-desktop-pb" as string]: HOME_GALLERY_LAYOUT.sectionPaddingBottom,
    ["--home-gallery-desktop-title-size" as string]: HOME_GALLERY_LAYOUT.titleFontSize,
    ["--home-gallery-desktop-title-line-height" as string]: String(HOME_GALLERY_LAYOUT.titleLineHeight),
    ["--home-gallery-desktop-title-line-gap" as string]: HOME_GALLERY_LAYOUT.titleLineGap,
    ["--home-gallery-air-title-size" as string]: HOME_GALLERY_IPAD_AIR_LAYOUT.titleFontSize,
    ["--home-gallery-air-title-line-height" as string]: String(
      HOME_GALLERY_IPAD_AIR_LAYOUT.titleLineHeight,
    ),
    ["--home-gallery-air-subtitle-size" as string]: HOME_GALLERY_IPAD_AIR_LAYOUT.subtitleFontSize,
  };

  return (
    <section
      className={`${marketingMontserrat.variable} ${styles.section} w-full px-4 sm:px-6 md:px-10 tablet:px-20`}
      style={sectionStyle}
    >
      <div
        className={styles.mobileLayer}
        aria-labelledby="home-gallery-heading-mobile"
        aria-describedby="home-gallery-subtitle-mobile"
      >
        <div className={styles.mobileShell}>
          <HomePageReveal index={0}>
            <header className={styles.mobileHeader}>
              <h2
                id="home-gallery-heading-mobile"
                className={`${styles.mobileTitle} font-serif font-semibold tracking-tight text-balance`}
              >
                {galleryTitleLines}
              </h2>
              <p
                id="home-gallery-subtitle-mobile"
                className={`${styles.mobileSubtitle} ${marketingMontserrat.className} text-pretty font-normal tracking-[0.01em]`}
              >
                {t("gallerySubtitle")}
              </p>
            </header>
          </HomePageReveal>

          <HomePageReveal index={1}>
            <div className={styles.mobileMosaic}>
              <HomeGalleryMosaicMobile
                carouselAriaLabel={t("galleryTitle")}
                getGoToSlideAria={(index) => t("galleryGoToSlideAria", { slide: index + 1 })}
              />
            </div>
          </HomePageReveal>

          <HomePageReveal index={2}>
            <div className={styles.mobileCta}>
              <HomeHeroCtaButton
                href="/explore"
                label={t("galleryMoreDetails")}
                variant="booking"
                labelOffsetPx={HOME_HERO_MOBILE_MORE_DETAILS_CTA.labelOffsetPx}
              />
            </div>
          </HomePageReveal>
        </div>
      </div>

      <div className={styles.desktopLayer}>
        <div className="mx-auto flex w-full max-w-[min(82.375rem,calc(100%-2rem))] flex-col items-center">
          <HomePageReveal index={0}>
            <header
              className="flex w-full max-w-[834px] flex-col items-center text-center"
              style={{ gap: HOME_GALLERY_LAYOUT.headerGapPx }}
            >
              <h2
                className={`${styles.desktopTitle} font-serif font-semibold tracking-tight text-balance`}
                style={{ color: HOME_GALLERY_FIGMA.headingColor }}
              >
                {galleryTitleLines}
              </h2>
              <p
                className={`${styles.desktopSubtitle} ${marketingMontserrat.className} font-normal tracking-[0.01em]`}
                style={{
                  color: HOME_GALLERY_FIGMA.subtitleColor,
                  maxWidth: HOME_GALLERY_LAYOUT.subtitleMaxWidth,
                }}
              >
                {t("gallerySubtitle")}
              </p>
            </header>
          </HomePageReveal>

          <HomePageReveal index={1}>
            <div style={{ marginTop: HOME_GALLERY_LAYOUT.headerToMosaicGapPx, width: "100%" }}>
              <HomeGalleryMosaicCarousel
                prevLabel={t("galleryPrevAria")}
                nextLabel={t("galleryNextAria")}
                getGoToSlideAria={(index) => t("galleryGoToSlideAria", { slide: index + 1 })}
              />
            </div>
          </HomePageReveal>

          <HomePageReveal index={2}>
            <div style={{ marginTop: HOME_GALLERY_LAYOUT.dotsToCtaGapPx }}>
              <HomeHeroCtaButton
                href="/explore"
                label={t("galleryMoreDetails")}
                variant="membership"
              />
            </div>
          </HomePageReveal>
        </div>
      </div>
    </section>
  );
}
