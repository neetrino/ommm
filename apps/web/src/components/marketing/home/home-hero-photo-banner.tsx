import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { HomeHeroJunctionNavDeferred } from "@/components/marketing/home/home-deferred-sections";
import { HomeHeroCtaButton } from "@/components/marketing/home/home-hero-cta-button";
import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";
import {
  HOME_HERO_ASSETS,
  HOME_HERO_FIGMA,
  HOME_HERO_CTA_LAYOUT,
  HOME_HERO_LAYOUT,
  HOME_HERO_MOBILE_CTA_LAYOUT,
  HOME_HERO_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-hero-banner-tokens";
import { marketingFullBleedHeroHeaderOverlapClass } from "@/components/marketing/marketing-site-header-layout";
import { HOME_WEEKLY_SCHEDULE_LAYOUT } from "@/components/marketing/home/home-weekly-schedule-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { aboveFoldImageProps, lcpImageProps } from "@/lib/image-loading-props";

type HomeHeroPhotoBannerProps = {
  locale: string;
};

/**
 * Figma hero `196:1404` (desktop) + mobile container `97:5656`.
 */
export async function HomeHeroPhotoBanner({ locale }: HomeHeroPhotoBannerProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.hero" });
  const portalCircleWidth = `calc(100svw * ${HOME_HERO_LAYOUT.portalWidthRatio * HOME_HERO_LAYOUT.portalChordAtLogoRatio * HOME_HERO_LAYOUT.logoMarkPortalFillRatio})`;
  const logoWidthDesktop = `clamp(8.125rem, ${portalCircleWidth}, 17rem)`;

  return (
    <section
      aria-labelledby="home-hero-heading"
      className={`${marketingMontserrat.variable} ${styles.homeHeroSection} ${marketingFullBleedHeroHeaderOverlapClass()} relative w-full min-w-0 overflow-x-clip`}
      style={{
        backgroundColor: HOME_HERO_FIGMA.sectionBackground,
        ["--home-hero-min-h" as string]: HOME_HERO_MOBILE_LAYOUT.imageMinHeight,
        ["--home-hero-max-h" as string]: HOME_HERO_MOBILE_LAYOUT.imageMaxHeight,
        ["--home-hero-min-h-lg" as string]: HOME_HERO_LAYOUT.imageMinHeightDesktop,
        ["--home-hero-bg-width" as string]: `${HOME_HERO_MOBILE_LAYOUT.backgroundImageWidthPercent}%`,
        ["--home-hero-bg-height" as string]: `${HOME_HERO_MOBILE_LAYOUT.backgroundImageHeightPercent}%`,
        ["--home-hero-bg-left" as string]: `${HOME_HERO_MOBILE_LAYOUT.backgroundImageLeftPercent}%`,
        ["--home-hero-bg-top" as string]: `${HOME_HERO_MOBILE_LAYOUT.backgroundImageTopPercent}%`,
        ["--home-hero-bg-position-lg" as string]: HOME_HERO_LAYOUT.backgroundObjectPosition,
        ["--home-hero-content-px" as string]: HOME_HERO_MOBILE_LAYOUT.contentPaddingX,
        ["--home-hero-title-size" as string]: HOME_HERO_MOBILE_LAYOUT.titleFontSize,
        ["--home-hero-title-size-lg" as string]: HOME_HERO_LAYOUT.titleFontSizeDesktop,
        ["--home-hero-title-line-height" as string]: String(HOME_HERO_MOBILE_LAYOUT.titleLineHeight),
        ["--home-hero-title-line-height-lg" as string]: String(HOME_HERO_LAYOUT.titleLineHeight),
        ["--home-hero-title-tracking" as string]: `${HOME_HERO_MOBILE_LAYOUT.titleLetterSpacingEm}em`,
        ["--home-hero-title-tracking-lg" as string]: `${HOME_HERO_LAYOUT.titleLetterSpacingEm}em`,
        ["--home-hero-title-max-width" as string]: HOME_HERO_MOBILE_LAYOUT.titleMaxWidth,
        ["--home-hero-title-max-width-lg" as string]: `${HOME_HERO_LAYOUT.titleMaxWidthPx}px`,
        ["--home-hero-title-margin-top" as string]: HOME_HERO_MOBILE_LAYOUT.titleMarginTop,
        ["--home-hero-title-margin-top-lg" as string]: "-2.5rem",
        ["--home-hero-logo-width" as string]: HOME_HERO_MOBILE_LAYOUT.logoWidth,
        ["--home-hero-logo-width-lg" as string]: logoWidthDesktop,
        ["--home-hero-logo-top" as string]: HOME_HERO_MOBILE_LAYOUT.logoTop,
        ["--home-hero-logo-image-height" as string]: `${HOME_HERO_MOBILE_LAYOUT.logoImageHeightPercent}%`,
        ["--home-hero-logo-image-top" as string]: `${HOME_HERO_MOBILE_LAYOUT.logoImageTopPercent}%`,
        ["--home-hero-logo-frame-height-ratio" as string]: String(
          HOME_HERO_MOBILE_LAYOUT.logoFrameHeightRatio,
        ),
        ["--home-hero-logo-margin-top-lg" as string]: "-1.5rem",
        ["--home-hero-subtitle-size" as string]: HOME_HERO_MOBILE_LAYOUT.subtitleFontSize,
        ["--home-hero-subtitle-size-lg" as string]: HOME_HERO_LAYOUT.subtitleFontSize,
        ["--home-hero-subtitle-line-height" as string]: String(
          HOME_HERO_MOBILE_LAYOUT.subtitleLineHeight,
        ),
        ["--home-hero-subtitle-line-height-lg" as string]: String(
          HOME_HERO_LAYOUT.subtitleLineHeight,
        ),
        ["--home-hero-subtitle-color" as string]: HOME_HERO_FIGMA.subtitleColor,
        ["--home-hero-subtitle-max-width" as string]: HOME_HERO_MOBILE_LAYOUT.subtitleMaxWidth,
        ["--home-hero-subtitle-max-width-lg" as string]: `${HOME_HERO_LAYOUT.subtitleMaxWidthPx}px`,
        ["--home-hero-subtitle-margin-top" as string]: HOME_HERO_MOBILE_LAYOUT.subtitleMarginTop,
        ["--home-hero-cta-gap" as string]: HOME_HERO_MOBILE_CTA_LAYOUT.buttonGap,
        ["--home-hero-cta-gap-lg" as string]: HOME_HERO_CTA_LAYOUT.buttonGap,
        ["--home-hero-cta-margin-top" as string]: HOME_HERO_MOBILE_CTA_LAYOUT.buttonsMarginTop,
        ["--home-hero-cta-margin-top-lg" as string]: HOME_HERO_CTA_LAYOUT.buttonsMarginTop,
      }}
    >
      <div
        className={`${styles.homeHeroFrame} relative w-full min-w-0`}
        style={{ paddingBottom: HOME_WEEKLY_SCHEDULE_LAYOUT.sectionHeroOverlap }}
      >
        <div className={styles.homeHeroBackgroundLayer} aria-hidden>
          <div className={styles.homeHeroBackgroundCrop}>
            <Image
              src={HOME_HERO_ASSETS.backgroundImage}
              alt={t("heroImageAlt")}
              fill
              sizes="100vw"
              className={`${styles.homeHeroBackground} pointer-events-none object-cover`}
              {...lcpImageProps()}
            />
          </div>
        </div>

        <div
          className={`${styles.homeHeroPortal} pointer-events-none absolute inset-x-0 z-[1] flex justify-center px-4 sm:px-6`}
          style={{ top: HOME_HERO_LAYOUT.portalTop }}
          aria-hidden
        >
          <Image
            src={HOME_HERO_ASSETS.portalEllipse}
            alt=""
            width={1256}
            height={519}
            unoptimized
            className="h-auto w-[87.2%] max-w-full"
            {...aboveFoldImageProps()}
          />
        </div>

        <div
          className={`${styles.homeHeroContent} relative z-10 mx-auto flex w-full min-w-0 max-w-[90rem] flex-col items-center px-4 pb-10 sm:px-6 sm:pb-12 md:pb-14`}
        >
          <div className={`${styles.homeHeroLogoMark} relative mb-1 shrink-0 sm:mb-2`}>
            <div className={styles.homeHeroLogoInner}>
              <div className={styles.homeHeroLogoCrop}>
                <Image
                  src={HOME_HERO_ASSETS.logoMark}
                  alt={t("logoAlt")}
                  fill
                  sizes="(max-width: 1023px) 61vw, 21rem"
                  className={styles.homeHeroLogoImage}
                  {...aboveFoldImageProps()}
                />
              </div>
            </div>
          </div>

          <div className={styles.homeHeroTextStack}>
            <div
              id="home-hero-heading"
              className={`${styles.homeHeroTitle} w-full shrink-0 text-center font-serif font-bold text-white`}
            >
              <h1>
                <span className={`${styles.homeHeroTitleLine} mb-0`}>
                  <span>{t("titleLine1")}</span>
                  <span style={{ color: HOME_HERO_FIGMA.titleAccentSpace }}> </span>
                  <span>{t("brandName")}</span>
                </span>
                <span className={`${styles.homeHeroTitleLine} mt-0`}>{t("titleLine2")}</span>
              </h1>
            </div>

            <p className={`${styles.homeHeroSubtitle} ${marketingMontserrat.className}`}>
              <span className={styles.homeHeroSubtitleLine}>{t("subLine1")}</span>
              <span className={styles.homeHeroSubtitleLine}>{t("subLine2")}</span>
            </p>
          </div>

          <div className={styles.homeHeroCtas}>
            <HomeHeroCtaButton href="/schedule" label={t("primaryCta")} variant="booking" />
            <HomeHeroCtaButton href="/packages" label={t("secondaryCta")} variant="membership" />
          </div>
        </div>
        <HomeHeroJunctionNavDeferred />
      </div>
    </section>
  );
}
