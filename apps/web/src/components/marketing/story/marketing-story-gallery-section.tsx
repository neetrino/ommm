"use client";

import { useTranslations } from "next-intl";
import { HomeGalleryMosaicCarousel } from "@/components/marketing/home/home-gallery-mosaic-carousel";
import { HomeGalleryMosaicMobile } from "@/components/marketing/home/home-gallery-mosaic-mobile";
import {
  HOME_GALLERY_FIGMA,
  HOME_GALLERY_IPAD_AIR_LAYOUT,
  HOME_GALLERY_LAYOUT,
  HOME_GALLERY_SECTION_BACKGROUND,
  HOME_GALLERY_SECTION_MOBILE_FIGMA,
  HOME_GALLERY_SECTION_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-gallery-section-tokens";
import { StoryPageReveal } from "@/components/marketing/story/story-page-reveal";
import styles from "@/components/marketing/story/marketing-story-gallery-section.module.css";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

/** Story page — home gallery carousel with “A Sanctuary for Every Body” copy. */
export function MarketingStoryGallerySection() {
  const t = useTranslations("marketingPublic.home");

  const galleryTitleLines = (
    <>
      <span className={styles.galleryTitleLine}>{t("galleryTitleLine1")}</span>
      <span className={styles.galleryTitleLine}>{t("galleryTitleLine2")}</span>
    </>
  );

  const sectionStyle = {
    ["--story-gallery-bg" as string]: HOME_GALLERY_SECTION_BACKGROUND,
    ["--story-gallery-mobile-px" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.sectionPaddingX,
    ["--story-gallery-mobile-pt" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.sectionPaddingTop,
    ["--story-gallery-mobile-pb" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.sectionPaddingBottom,
    ["--story-gallery-mobile-section-gap" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.sectionGap,
    ["--story-gallery-mobile-heading-color" as string]: HOME_GALLERY_SECTION_MOBILE_FIGMA.headingColor,
    ["--story-gallery-mobile-subtitle-color" as string]: HOME_GALLERY_SECTION_MOBILE_FIGMA.subtitleColor,
    ["--story-gallery-mobile-title-size" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.titleFontSize,
    ["--story-gallery-mobile-title-line-height" as string]: String(
      HOME_GALLERY_SECTION_MOBILE_LAYOUT.titleLineHeight,
    ),
    ["--story-gallery-title-line-gap" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.titleLineGap,
    ["--story-gallery-mobile-subtitle-size" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.subtitleFontSize,
    ["--story-gallery-mobile-subtitle-line-height" as string]: String(
      HOME_GALLERY_SECTION_MOBILE_LAYOUT.subtitleLineHeight,
    ),
    ["--story-gallery-mobile-header-max-width" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.headerMaxWidth,
    ["--story-gallery-mobile-header-subtitle-gap" as string]:
      HOME_GALLERY_SECTION_MOBILE_LAYOUT.headerSubtitleGap,
    ["--story-gallery-desktop-pt" as string]: HOME_GALLERY_LAYOUT.sectionPaddingTop,
    ["--story-gallery-desktop-pb" as string]: HOME_GALLERY_LAYOUT.sectionPaddingBottom,
    ["--story-gallery-desktop-title-size" as string]: HOME_GALLERY_LAYOUT.titleFontSize,
    ["--story-gallery-desktop-title-line-height" as string]: String(HOME_GALLERY_LAYOUT.titleLineHeight),
    ["--story-gallery-desktop-title-line-gap" as string]: HOME_GALLERY_LAYOUT.titleLineGap,
    ["--story-gallery-air-title-size" as string]: HOME_GALLERY_IPAD_AIR_LAYOUT.titleFontSize,
    ["--story-gallery-air-title-line-height" as string]: String(
      HOME_GALLERY_IPAD_AIR_LAYOUT.titleLineHeight,
    ),
    ["--story-gallery-air-subtitle-size" as string]: HOME_GALLERY_IPAD_AIR_LAYOUT.subtitleFontSize,
  };

  return (
    <section
      className={`${marketingMontserrat.variable} ${styles.section} w-full px-4 sm:px-6 md:px-10 tablet:px-20`}
      style={sectionStyle}
    >
      <div
        className={styles.mobileLayer}
        aria-labelledby="story-gallery-heading-mobile"
        aria-describedby="story-gallery-subtitle-mobile"
      >
        <div className={styles.mobileShell}>
          <StoryPageReveal index={0}>
            <header className={styles.mobileHeader}>
              <h2
                id="story-gallery-heading-mobile"
                className={`${styles.mobileTitle} font-serif font-semibold tracking-tight text-balance`}
              >
                {galleryTitleLines}
              </h2>
              <p
                id="story-gallery-subtitle-mobile"
                className={`${styles.mobileSubtitle} ${marketingMontserrat.className} text-pretty font-normal tracking-[0.01em]`}
              >
                {t("gallerySubtitle")}
              </p>
            </header>
          </StoryPageReveal>

          <StoryPageReveal index={1}>
            <div className={styles.mobileMosaic}>
              <HomeGalleryMosaicMobile
                carouselAriaLabel={t("galleryTitle")}
                getGoToSlideAria={(index) => t("galleryGoToSlideAria", { slide: index + 1 })}
              />
            </div>
          </StoryPageReveal>
        </div>
      </div>

      <div className={styles.desktopLayer}>
        <div className="mx-auto flex w-full max-w-[min(82.375rem,calc(100%-2rem))] flex-col items-center">
          <StoryPageReveal index={0}>
            <header
              className="mx-auto flex w-full max-w-[834px] flex-col items-center text-center"
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
          </StoryPageReveal>
        </div>

        <StoryPageReveal index={1}>
          <div
            className={styles.desktopCarouselBleed}
            style={{ marginTop: HOME_GALLERY_LAYOUT.headerToMosaicGapPx }}
          >
            <HomeGalleryMosaicCarousel
              prevLabel={t("galleryPrevAria")}
              nextLabel={t("galleryNextAria")}
              getGoToSlideAria={(index) => t("galleryGoToSlideAria", { slide: index + 1 })}
            />
          </div>
        </StoryPageReveal>
      </div>
    </section>
  );
}
