import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { HomeHeroCarouselFrame } from "@/components/marketing/home/home-hero-carousel-frame";
import { HomeHeroJunctionNavDeferred } from "@/components/marketing/home/home-deferred-sections";
import { HomeHeroSectionShell } from "@/components/marketing/home/home-hero-section-shell";
import { HomeHeroLogoMarkVideo } from "@/components/marketing/home/home-hero-logo-mark-video";
import { HomeHeroCtaButton } from "@/components/marketing/home/home-hero-cta-button";
import { HomeHeroMediaBackground } from "@/components/marketing/home/home-hero-media-background";
import { HomeHeroPhotoContentLayer } from "@/components/marketing/home/home-hero-photo-content-layer";
import { HomeHeroPromoBannerOverlay } from "@/components/marketing/home/home-hero-promo-banner-overlay";
import { HomePageReveal } from "@/components/marketing/home/home-page-reveal";
import { HomeHeroSlideProvider } from "@/components/marketing/home/home-hero-slide-context";
import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";
import {
  HOME_HERO_ASSETS,
  HOME_HERO_CAROUSEL_SLIDE_COUNT,
  HOME_HERO_FIGMA,
  HOME_HERO_CTA_LAYOUT,
  HOME_HERO_IPAD_AIR_LAYOUT,
  HOME_HERO_LAYOUT,
  HOME_HERO_LOGO_MARK_VIDEO_LAYOUT,
  HOME_HERO_MOBILE_CTA_LAYOUT,
  HOME_HERO_MOBILE_LAYOUT,
  HOME_HERO_PROMO_BANNER_LAYOUT,
  HOME_HERO_PROMO_BANNER_MOBILE_LAYOUT,
  HOME_HERO_PROMO_BANNER_TEXT_NAV_INSET,
  resolveHomeHeroIntroVideoUrl,
  resolveHomeHeroIntroMobileVideoUrl,
  resolveHomeHeroIntroMobileVideoMp4Url,
  resolveHomeHeroLogoMarkVideoUrl,
  hasHomeHeroIntroVideo,
} from "@/components/marketing/home/home-hero-banner-tokens";
import { HOME_HERO_SCHEDULE_SPACER_LAYOUT } from "@/components/marketing/home/home-hero-schedule-spacer-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { aboveFoldImageProps, lcpImageProps } from "@/lib/image-loading-props";

type HomeHeroPhotoBannerProps = {
  locale: string;
  /** Reserves hero overlap for the empty spacer panel above Weekly Schedule. */
  showScheduleSpacer?: boolean;
};

/**
 * Figma hero `196:1404` (desktop) + mobile container `97:5656`.
 */
export async function HomeHeroPhotoBanner({
  locale,
  showScheduleSpacer = false,
}: HomeHeroPhotoBannerProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.hero" });
  const r2PublicUrl = process.env.R2_PUBLIC_URL;
  const heroIntroVideoUrl = resolveHomeHeroIntroVideoUrl(r2PublicUrl);
  const heroIntroMobileVideoUrl = resolveHomeHeroIntroMobileVideoUrl(r2PublicUrl);
  const heroIntroMobileVideoMp4Url = resolveHomeHeroIntroMobileVideoMp4Url(r2PublicUrl);
  const heroLogoMarkVideoUrl = resolveHomeHeroLogoMarkVideoUrl(r2PublicUrl);
  const hasHeroIntroVideo = hasHomeHeroIntroVideo(r2PublicUrl);
  const portalCircleWidth = `calc(100svw * ${HOME_HERO_LAYOUT.portalWidthRatio * HOME_HERO_LAYOUT.portalChordAtLogoRatio * HOME_HERO_LAYOUT.logoMarkPortalFillRatio})`;
  const logoWidthDesktop = `clamp(8.125rem, ${portalCircleWidth}, 17rem)`;

  const promoOverlay = (
    <HomeHeroPromoBannerOverlay
      foundingLine1={t("promoBannerFoundingLine1")}
      foundingLine2={t("promoBannerFoundingLine2")}
      areOpen={t("promoBannerAreOpen")}
      limitedLine1={t("promoBannerLimitedLine1")}
      limitedLine2Prefix={t("promoBannerLimitedLine2Prefix")}
      limitedLine2Emphasis={t("promoBannerLimitedLine2Emphasis")}
      mobileCtaHref="/packages"
      mobileCtaAriaLabel={t("promoBannerMobileCtaAria")}
      desktopCtaHref="/packages"
      desktopCtaAriaLabel={t("promoBannerDesktopCtaAria")}
    />
  );

  const heroBackground = hasHeroIntroVideo ? (
    <HomeHeroMediaBackground
      heroImageAlt={t("heroImageAlt")}
      promoBannerAlt={t("promoBanner3Alt")}
      promoOverlay={promoOverlay}
    />
  ) : (
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
  );

  const heroContent = (
    <>
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

      <HomePageReveal
        index={0}
        entrance="aboveFold"
        className={`${styles.homeHeroContent} z-10 mx-auto min-w-0 max-w-[90rem]`}
      >
        <HomeHeroLogoMarkVideo alt={t("logoAlt")} videoUrl={heroLogoMarkVideoUrl} />

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

          <p className={`${styles.homeHeroSubtitle} font-serif font-light`}>
            <span className={styles.homeHeroSubtitleLine}>{t("subLine1")}</span>
            <span className={styles.homeHeroSubtitleLine}>{t("subLine2")}</span>
          </p>
        </div>

        <div className={styles.homeHeroCtas}>
          <HomeHeroCtaButton
            href="/packages"
            label={t("secondaryCta")}
            variant="membership"
            sizeContext="hero"
          />
        </div>
      </HomePageReveal>
    </>
  );

  const heroInner = (
    <>
      {heroBackground}

      {hasHeroIntroVideo ? (
        <>
          <HomeHeroCarouselFrame>
            <HomeHeroPhotoContentLayer>{heroContent}</HomeHeroPhotoContentLayer>
          </HomeHeroCarouselFrame>
        </>
      ) : (
        <div className={`${styles.homeHeroFrame} relative w-full min-w-0`}>{heroContent}</div>
      )}
      {hasHeroIntroVideo ? <HomeHeroJunctionNavDeferred /> : null}
    </>
  );

  const heroSectionStyle = {
    ["--home-hero-section-bg" as string]: HOME_HERO_FIGMA.sectionBackground,
    ["--home-hero-slide-count" as string]: String(HOME_HERO_CAROUSEL_SLIDE_COUNT),
    ["--home-hero-promo-aspect-ratio" as string]: HOME_HERO_PROMO_BANNER_LAYOUT.aspectRatio,
    ["--home-hero-promo-aspect-ratio-mobile" as string]:
      HOME_HERO_PROMO_BANNER_MOBILE_LAYOUT.aspectRatio,
    ["--home-hero-promo-object-position" as string]: HOME_HERO_PROMO_BANNER_LAYOUT.objectPosition,
    ["--home-hero-promo-object-position-mobile" as string]:
      HOME_HERO_PROMO_BANNER_MOBILE_LAYOUT.objectPosition,
    ["--home-hero-promo-section-bg" as string]: HOME_HERO_PROMO_BANNER_LAYOUT.sectionBackground,
    ["--home-hero-promo-section-bg-mobile" as string]:
      HOME_HERO_PROMO_BANNER_MOBILE_LAYOUT.sectionBackground,
    ["--home-hero-promo-text-inset-left" as string]: HOME_HERO_PROMO_BANNER_TEXT_NAV_INSET,
    ["--home-hero-min-h" as string]: HOME_HERO_MOBILE_LAYOUT.imageMinHeight,
        ["--home-hero-max-h" as string]: HOME_HERO_MOBILE_LAYOUT.imageMaxHeight,
        ["--home-hero-min-h-lg" as string]: HOME_HERO_LAYOUT.imageMinHeightDesktop,
        ["--home-hero-bg-width" as string]: `${HOME_HERO_MOBILE_LAYOUT.backgroundImageWidthPercent}%`,
        ["--home-hero-bg-height" as string]: `${HOME_HERO_MOBILE_LAYOUT.backgroundImageHeightPercent}%`,
        ["--home-hero-bg-left" as string]: `${HOME_HERO_MOBILE_LAYOUT.backgroundImageLeftPercent}%`,
        ["--home-hero-bg-top" as string]: `${HOME_HERO_MOBILE_LAYOUT.backgroundImageTopPercent}%`,
        ["--home-hero-bg-position-lg" as string]: HOME_HERO_LAYOUT.backgroundObjectPosition,
        ["--home-hero-bg-position-mobile" as string]:
          HOME_HERO_MOBILE_LAYOUT.backgroundObjectPosition,
        ["--home-hero-content-px" as string]: HOME_HERO_MOBILE_LAYOUT.contentPaddingX,
        ["--home-hero-title-size" as string]: HOME_HERO_MOBILE_LAYOUT.titleFontSize,
        ["--home-hero-title-size-lg" as string]: HOME_HERO_LAYOUT.titleFontSizeDesktop,
        ["--home-hero-title-size-air" as string]: `${HOME_HERO_IPAD_AIR_LAYOUT.titleFontSizePx}px`,
        ["--home-hero-title-line-height" as string]: String(HOME_HERO_MOBILE_LAYOUT.titleLineHeight),
        ["--home-hero-title-line-height-lg" as string]: String(HOME_HERO_LAYOUT.titleLineHeight),
        ["--home-hero-title-line-height-air" as string]: String(
          HOME_HERO_IPAD_AIR_LAYOUT.titleLineHeightPx / HOME_HERO_IPAD_AIR_LAYOUT.titleFontSizePx,
        ),
        ["--home-hero-title-tracking" as string]: `${HOME_HERO_MOBILE_LAYOUT.titleLetterSpacingEm}em`,
        ["--home-hero-title-tracking-lg" as string]: `${HOME_HERO_LAYOUT.titleLetterSpacingEm}em`,
        ["--home-hero-title-max-width" as string]: HOME_HERO_MOBILE_LAYOUT.titleMaxWidth,
        ["--home-hero-title-max-width-lg" as string]: `${HOME_HERO_LAYOUT.titleMaxWidthPx}px`,
        ["--home-hero-title-max-width-air" as string]: `${HOME_HERO_IPAD_AIR_LAYOUT.titleMaxWidthPx}px`,
        ["--home-hero-title-margin-top" as string]: HOME_HERO_MOBILE_LAYOUT.titleMarginTop,
        ["--home-hero-title-margin-top-lg" as string]: "-2.5rem",
        ["--home-hero-title-margin-top-air" as string]: `${HOME_HERO_IPAD_AIR_LAYOUT.titleMarginTopPx}px`,
        ["--home-hero-logo-width" as string]: HOME_HERO_MOBILE_LAYOUT.logoWidth,
        ["--home-hero-logo-width-lg" as string]: logoWidthDesktop,
        ["--home-hero-logo-width-air" as string]: `clamp(7.5rem, ${portalCircleWidth}, ${HOME_HERO_IPAD_AIR_LAYOUT.logoMaxWidthPx}px)`,
        ["--home-hero-logo-top" as string]: HOME_HERO_MOBILE_LAYOUT.logoTop,
        ["--home-hero-logo-image-height" as string]: `${HOME_HERO_MOBILE_LAYOUT.logoImageHeightPercent}%`,
        ["--home-hero-logo-image-top" as string]: `${HOME_HERO_MOBILE_LAYOUT.logoImageTopPercent}%`,
        ["--home-hero-logo-frame-height-ratio" as string]: String(
          HOME_HERO_MOBILE_LAYOUT.logoFrameHeightRatio,
        ),
        ["--home-hero-logo-video-inner-ratio" as string]: String(
          HOME_HERO_LOGO_MARK_VIDEO_LAYOUT.mobileInnerSizeRatio,
        ),
        ["--home-hero-logo-video-inner-ratio-lg" as string]: String(
          HOME_HERO_LOGO_MARK_VIDEO_LAYOUT.desktopInnerSizeRatio,
        ),
        ["--home-hero-logo-video-edge-crop-scale" as string]: String(
          HOME_HERO_LOGO_MARK_VIDEO_LAYOUT.edgeCropScale,
        ),
        ["--home-hero-logo-video-offset-y-lg" as string]: `${HOME_HERO_LOGO_MARK_VIDEO_LAYOUT.offsetYDesktopPx}px`,
        ["--home-hero-logo-video-offset-y-ipad" as string]: `${HOME_HERO_LOGO_MARK_VIDEO_LAYOUT.offsetYIpadPx}px`,
        ["--home-hero-logo-video-offset-y-mobile" as string]:
          HOME_HERO_LOGO_MARK_VIDEO_LAYOUT.offsetYMobile,
        ["--home-hero-logo-video-width-mobile" as string]:
          HOME_HERO_LOGO_MARK_VIDEO_LAYOUT.mobileWidth,
        ["--home-hero-logo-margin-top-lg" as string]: "-1.5rem",
        ["--home-hero-logo-margin-top-air" as string]: `${HOME_HERO_IPAD_AIR_LAYOUT.logoMarginTopPx}px`,
        ["--home-hero-subtitle-size" as string]: HOME_HERO_MOBILE_LAYOUT.subtitleFontSize,
        ["--home-hero-subtitle-size-lg" as string]: HOME_HERO_LAYOUT.subtitleFontSize,
        ["--home-hero-subtitle-size-air" as string]: `${HOME_HERO_IPAD_AIR_LAYOUT.subtitleFontSizePx}px`,
        ["--home-hero-subtitle-line-height" as string]: String(
          HOME_HERO_MOBILE_LAYOUT.subtitleLineHeight,
        ),
        ["--home-hero-subtitle-line-height-lg" as string]: String(
          HOME_HERO_LAYOUT.subtitleLineHeight,
        ),
        ["--home-hero-subtitle-line-height-air" as string]: String(
          HOME_HERO_IPAD_AIR_LAYOUT.subtitleLineHeightPx /
            HOME_HERO_IPAD_AIR_LAYOUT.subtitleFontSizePx,
        ),
        ["--home-hero-subtitle-color" as string]: HOME_HERO_FIGMA.subtitleColor,
        ["--home-hero-subtitle-max-width" as string]: HOME_HERO_MOBILE_LAYOUT.subtitleMaxWidth,
        ["--home-hero-subtitle-max-width-lg" as string]: `${HOME_HERO_LAYOUT.subtitleMaxWidthPx}px`,
        ["--home-hero-subtitle-margin-top" as string]: HOME_HERO_MOBILE_LAYOUT.subtitleMarginTop,
        ["--home-hero-text-stack-offset-top" as string]: HOME_HERO_MOBILE_LAYOUT.textStackOffsetTop,
        ["--home-hero-content-down-offset" as string]: HOME_HERO_MOBILE_LAYOUT.contentDownOffset,
        ["--home-hero-cta-gap" as string]: HOME_HERO_MOBILE_CTA_LAYOUT.buttonGap,
        ["--home-hero-cta-gap-lg" as string]: HOME_HERO_CTA_LAYOUT.buttonGap,
        ["--home-hero-cta-bottom" as string]: HOME_HERO_MOBILE_CTA_LAYOUT.buttonsBottomOffset,
        ["--home-hero-cta-down-offset" as string]: HOME_HERO_MOBILE_CTA_LAYOUT.buttonsDownOffset,
        ["--home-hero-cta-margin-top-lg" as string]: HOME_HERO_CTA_LAYOUT.buttonsMarginTop,
        ["--home-schedule-hero-overlap" as string]: showScheduleSpacer
          ? HOME_HERO_SCHEDULE_SPACER_LAYOUT.sectionHeroOverlap
          : "0px",
        ["--home-schedule-hero-overlap-lg" as string]: showScheduleSpacer
          ? HOME_HERO_SCHEDULE_SPACER_LAYOUT.sectionHeroOverlapLg
          : "0px",
  } as const;

  if (hasHeroIntroVideo && heroIntroMobileVideoUrl) {
    return (
      <HomeHeroSlideProvider
        desktopVideoUrl={heroIntroVideoUrl}
        mobileVideoUrl={heroIntroMobileVideoUrl}
        mobileVideoMp4Url={heroIntroMobileVideoMp4Url ?? ""}
      >
        <HomeHeroSectionShell
          promoBannerAriaLabel={t("promoBanner3Alt")}
          style={heroSectionStyle}
        >
          {heroInner}
        </HomeHeroSectionShell>
      </HomeHeroSlideProvider>
    );
  }

  return (
    <section
      aria-labelledby="home-hero-heading"
      className={`${marketingMontserrat.variable} ${styles.homeHeroSection} relative w-full min-w-0`}
      style={heroSectionStyle}
    >
      {heroInner}
    </section>
  );
}
