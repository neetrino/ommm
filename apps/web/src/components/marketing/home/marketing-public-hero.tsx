import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { HomeMarketingPillLink } from "@/components/marketing/home/home-marketing-pill-link";
import {
  HOME_HERO_ASSETS,
  HOME_HERO_FIGMA,
  HOME_HERO_SUBTITLE_ON_IMAGE,
} from "@/components/marketing/home/home-hero-banner-tokens";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";

const CANVAS_W = HOME_HERO_FIGMA.artboardWidthPx;
const CANVAS_H = HOME_HERO_FIGMA.imageHeightPx;

function pctX(px: number): string {
  return `${(px / CANVAS_W) * 100}%`;
}

function pctY(px: number): string {
  return `${(px / CANVAS_H) * 100}%`;
}

type MarketingPublicHeroProps = {
  locale: string;
};

/**
 * Public marketing home hero — Figma **Hero Section** `155:108` (photo node `155:297` + overlays to first CTA row).
 */
export async function MarketingPublicHero({ locale }: MarketingPublicHeroProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.hero" });
  const tHome = await getTranslations({ locale, namespace: "marketingPublic.home" });

  return (
    <section
      className={`${marketingMontserrat.variable} relative w-full overflow-hidden`}
      style={{
        backgroundColor: HOME_HERO_FIGMA.sectionBackground,
        borderBottomLeftRadius: HOME_HERO_FIGMA.sectionBottomRadiusPx,
        borderBottomRightRadius: HOME_HERO_FIGMA.sectionBottomRadiusPx,
      }}
    >
      <div
        className="relative w-full"
        style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={HOME_HERO_ASSETS.backgroundImage}
            alt={t("heroImageAlt")}
            width={1672}
            height={941}
            priority
            fetchPriority="high"
            sizes="100vw"
            className="pointer-events-none absolute max-w-none object-cover"
            style={{
              width: "114.03%",
              height: "100.01%",
              left: "-7.01%",
              top: "-0.01%",
              objectPosition: "48% 42%",
            }}
          />
        </div>

        <Image
          src={HOME_HERO_ASSETS.decorativeVector}
          alt=""
          width={846}
          height={476}
          unoptimized
          className="pointer-events-none absolute left-[-4%] top-[58%] w-[62%] max-w-[900px] opacity-[0.08] sm:top-[52%]"
        />

        <div
          className="pointer-events-none absolute"
          style={{
            left: pctX(93),
            top: pctY(146),
            width: pctX(1256),
            height: pctY(519),
          }}
        >
          <Image
            src={HOME_HERO_ASSETS.portalEllipse}
            alt=""
            width={1256}
            height={519}
            unoptimized
            className="block h-full w-full"
          />
        </div>

        <div
          className="pointer-events-none absolute left-1/2 w-[min(130px,28vw)] -translate-x-1/2 rounded-[91px] ring-1 ring-white/25"
          style={{ top: pctY(102) }}
        >
          <div className="relative w-full overflow-hidden rounded-[91px]" style={{ aspectRatio: "130 / 129" }}>
            <Image
              src={HOME_HERO_ASSETS.logoMark}
              alt={t("logoAlt")}
              fill
              priority
              sizes="130px"
              className="object-cover"
              style={{ objectPosition: "44% 36%" }}
            />
          </div>
        </div>

        <div
          className="absolute w-[min(1031px,calc(100%-2.5rem))] text-center font-serif font-semibold tracking-[-1.28px] text-white"
          style={{
            left: "50%",
            top: pctY(337),
            transform: "translate(-50%, -50%)",
            fontSize: "clamp(2.75rem, 6.2vw, 8.0625rem)",
            lineHeight: "calc(107 / 129)",
          }}
        >
          <h1>
            <span className="block whitespace-normal sm:whitespace-nowrap">
              <span className="font-semibold">{t("titleLine1")}</span>
              <span className="font-semibold" style={{ color: HOME_HERO_FIGMA.titleAccentSpace }}>
                {" "}
              </span>
              <span className="font-semibold">{t("brandName")}</span>
            </span>
            <span className="mt-1 block font-semibold sm:mt-0">{t("titleLine2")}</span>
          </h1>
        </div>

        <p
          className={`${marketingMontserrat.className} absolute left-1/2 w-[min(640px,calc(100%-2rem))] -translate-x-1/2 text-center text-[clamp(0.95rem,2.4vw,1.125rem)] font-light leading-6`}
          style={{
            top: pctY(476),
            color: HOME_HERO_SUBTITLE_ON_IMAGE,
          }}
        >
          <span className="block">{t("subLine1")}</span>
          <span className="block">{t("subLine2")}</span>
        </p>

        <div
          className="absolute left-1/2 flex w-[min(560px,calc(100%-1.5rem))] -translate-x-1/2 flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center sm:gap-[57px]"
          style={{ top: pctY(511) }}
        >
          <HomeMarketingPillLink href="/schedule" label={t("primaryCta")} variant="goldBooking" />
          <HomeMarketingPillLink href="/memberships" label={t("secondaryCta")} variant="frostMembership" />
        </div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[min(1440px,100%)] px-4 pb-12 pt-2 sm:px-10 md:px-20">
        <div
          className="mx-auto max-w-[833px] rounded-[50px] px-5 py-10 text-center sm:px-10 sm:py-12"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          <h2
            className="font-serif text-[clamp(2rem,5vw,4.375rem)] font-semibold leading-[48px] tracking-tight"
            style={{ color: HOME_PAGE_SURFACE.introHeading }}
          >
            {tHome("introTitle")}
          </h2>
          <p
            className={`${marketingMontserrat.className} mx-auto mt-6 max-w-[52rem] text-base font-normal leading-6 tracking-[0.18px]`}
            style={{ color: HOME_PAGE_SURFACE.introBody }}
          >
            {tHome("introBody")}
          </p>
          <p
            className={`${marketingMontserrat.className} mt-6 text-xs font-semibold uppercase leading-4 tracking-[2.4px]`}
            style={{ color: HOME_PAGE_SURFACE.introEyebrow }}
          >
            {tHome("introEyebrow")}
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-[560px] flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center sm:gap-[57px]">
            <HomeMarketingPillLink href="/schedule" label={t("primaryCta")} variant="goldBooking" />
            <HomeMarketingPillLink href="/memberships" label={t("secondaryCta")} variant="frostMembership" />
          </div>
        </div>
      </div>
    </section>
  );
}
