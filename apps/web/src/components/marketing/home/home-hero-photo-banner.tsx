import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { HomeMarketingPillLink } from "@/components/marketing/home/home-marketing-pill-link";
import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";
import {
  HOME_HERO_ASSETS,
  HOME_HERO_FIGMA,
  HOME_HERO_LAYOUT,
} from "@/components/marketing/home/home-hero-banner-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { aboveFoldImageProps, lcpImageProps } from "@/lib/image-loading-props";

type HomeHeroPhotoBannerProps = {
  locale: string;
};

/**
 * Figma hero `196:1404` — logo `196:1408`, title `196:1407`, subheading `196:1409`.
 */
export async function HomeHeroPhotoBanner({ locale }: HomeHeroPhotoBannerProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.hero" });
  const portalCircleWidth = `calc(100svw * ${HOME_HERO_LAYOUT.portalWidthRatio * HOME_HERO_LAYOUT.portalChordAtLogoRatio * HOME_HERO_LAYOUT.logoMarkPortalFillRatio})`;
  const logoWidth = `clamp(8.125rem, ${portalCircleWidth}, 17rem)`;

  return (
    <section
      aria-labelledby="home-hero-heading"
      className={`${marketingMontserrat.variable} relative w-full min-w-0 overflow-x-clip`}
      style={{
        backgroundColor: HOME_HERO_FIGMA.sectionBackground,
        borderBottomLeftRadius: HOME_HERO_FIGMA.sectionBottomRadiusPx,
        borderBottomRightRadius: HOME_HERO_FIGMA.sectionBottomRadiusPx,
        ["--home-hero-min-h" as string]: HOME_HERO_LAYOUT.imageMinHeightMobile,
        ["--home-hero-max-h" as string]: HOME_HERO_LAYOUT.imageMaxHeightMobile,
        ["--home-hero-min-h-lg" as string]: HOME_HERO_LAYOUT.imageMinHeightDesktop,
        ["--home-hero-title-size" as string]: HOME_HERO_LAYOUT.titleFontSize,
        ["--home-hero-title-size-lg" as string]: HOME_HERO_LAYOUT.titleFontSizeDesktop,
        ["--home-hero-title-line-height" as string]: String(HOME_HERO_LAYOUT.titleLineHeight),
        ["--home-hero-title-tracking" as string]: `${HOME_HERO_LAYOUT.titleLetterSpacingEm}em`,
        ["--home-hero-logo-width" as string]: logoWidth,
        ["--home-hero-subtitle-size" as string]: HOME_HERO_LAYOUT.subtitleFontSize,
        ["--home-hero-subtitle-line-height" as string]: String(
          HOME_HERO_LAYOUT.subtitleLineHeight,
        ),
        ["--home-hero-subtitle-color" as string]: HOME_HERO_FIGMA.subtitleColor,
        ["--home-hero-subtitle-max-width" as string]: `${HOME_HERO_LAYOUT.subtitleMaxWidthPx}px`,
      }}
    >
      <div className={`${styles.homeHeroFrame} relative w-full min-w-0`}>
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
          <Image
            src={HOME_HERO_ASSETS.backgroundImage}
            alt={t("heroImageAlt")}
            fill
            sizes="100vw"
            className="pointer-events-none object-cover"
            style={{ objectPosition: HOME_HERO_LAYOUT.backgroundObjectPosition }}
            {...lcpImageProps()}
          />
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 z-[1] flex justify-center px-4 sm:px-6"
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
            <div
              className={`${styles.homeHeroLogoInner} relative h-full w-full overflow-hidden`}
            >
              <Image
                src={HOME_HERO_ASSETS.logoMark}
                alt={t("logoAlt")}
                fill
                sizes="(max-width: 768px) 34vw, 21rem"
                className="object-cover"
                style={{ objectPosition: "44% 36%" }}
                {...aboveFoldImageProps()}
              />
            </div>
          </div>

          <div
            id="home-hero-heading"
            className={`${styles.homeHeroTitle} w-full shrink-0 text-center font-serif font-bold text-white`}
            style={{
              maxWidth: HOME_HERO_LAYOUT.titleMaxWidthPx,
            }}
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

          <div className="mt-6 flex w-full max-w-[35rem] shrink-0 flex-col items-stretch gap-4 sm:mt-8 sm:flex-row sm:items-center sm:justify-center sm:gap-[3.5625rem]">
            <HomeMarketingPillLink href="/schedule" label={t("primaryCta")} variant="goldBooking" />
            <HomeMarketingPillLink
              href="/packages"
              label={t("secondaryCta")}
              variant="frostMembership"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
