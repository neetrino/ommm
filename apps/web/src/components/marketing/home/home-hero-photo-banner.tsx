import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { HomeMarketingPillLink } from "@/components/marketing/home/home-marketing-pill-link";
import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";
import {
  HOME_HERO_ASSETS,
  HOME_HERO_FIGMA,
  HOME_HERO_LAYOUT,
  HOME_HERO_SUBTITLE_ON_IMAGE,
} from "@/components/marketing/home/home-hero-banner-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { aboveFoldImageProps, lcpImageProps } from "@/lib/image-loading-props";

type HomeHeroPhotoBannerProps = {
  locale: string;
};

/**
 * Figma photo stack — background `155:297`, portal `155:300`, logo `155:104`, title `155:111`, copy `161:302`, CTAs `170:1050`.
 */
export async function HomeHeroPhotoBanner({ locale }: HomeHeroPhotoBannerProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.hero" });

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
      }}
    >
      <div className={`${styles.homeHeroFrame} relative w-full min-w-0`}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
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
          className="pointer-events-none absolute inset-x-0 flex justify-center px-4 sm:px-6"
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
          <div className="relative mb-4 w-[min(7.5rem,22vw)] shrink-0 sm:mb-6">
            <div className="relative aspect-[130/129] w-full overflow-hidden rounded-[5.6875rem] ring-1 ring-white/25">
              <Image
                src={HOME_HERO_ASSETS.logoMark}
                alt={t("logoAlt")}
                fill
                sizes="130px"
                className="object-cover"
                style={{ objectPosition: "44% 36%" }}
                {...aboveFoldImageProps()}
              />
            </div>
          </div>

          <div
            id="home-hero-heading"
            className={`${styles.homeHeroTitle} w-full max-w-[64.375rem] shrink-0 text-center font-serif font-semibold tracking-[-0.08em] text-white`}
            style={{
              lineHeight: HOME_HERO_LAYOUT.titleLineHeight,
            }}
          >
            <h1>
              <span className="block">
                <span>{t("titleLine1")}</span>
                <span style={{ color: HOME_HERO_FIGMA.titleAccentSpace }}> </span>
                <span>{t("brandName")}</span>
              </span>
              <span className="mt-0.5 block sm:mt-1">{t("titleLine2")}</span>
            </h1>
          </div>

          <p
            className={`${marketingMontserrat.className} mt-4 w-full max-w-[27.5rem] shrink-0 text-center text-[clamp(0.9375rem,2.2vw,1.125rem)] font-light leading-6 sm:mt-5`}
            style={{ color: HOME_HERO_SUBTITLE_ON_IMAGE }}
          >
            <span className="block">{t("subLine1")}</span>
            <span className="block">{t("subLine2")}</span>
          </p>

          <div className="mt-6 flex w-full max-w-[35rem] shrink-0 flex-col items-stretch gap-4 sm:mt-8 sm:flex-row sm:items-center sm:justify-center sm:gap-[3.5625rem]">
            <HomeMarketingPillLink href="/schedule" label={t("primaryCta")} variant="goldBooking" />
            <HomeMarketingPillLink
              href="/memberships"
              label={t("secondaryCta")}
              variant="frostMembership"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
