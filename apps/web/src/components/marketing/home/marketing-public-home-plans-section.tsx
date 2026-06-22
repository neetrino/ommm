import { getTranslations } from "next-intl/server";
import { HomeHeroCtaButton } from "@/components/marketing/home/home-hero-cta-button";
import { HomePageReveal } from "@/components/marketing/home/home-page-reveal";
import {
  HomePlansDesktopCards,
  HomePlansMobileCarousel,
  HomePlansSubscribeModalHost,
} from "@/components/marketing/home/home-plans-interactive-cards";
import { HOME_HERO_MOBILE_MORE_DETAILS_CTA } from "@/components/marketing/home/home-hero-banner-tokens";
import {
  HOME_PLANS_SECTION_FIGMA,
  HOME_PLANS_SECTION_LAYOUT,
  HOME_PLANS_SECTION_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-plans-section-tokens";
import styles from "@/components/marketing/home/marketing-public-home-plans-section.module.css";
import { buildHomeCategoryCardsFromPlans } from "@/components/marketing/home/home-public-plan-card-copy";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { groupVisiblePublicPackageCategories } from "@/lib/public-package-categories";
import { resolveMarketingAudience } from "@/lib/marketing-audience";
import {
  normalizePublicPackagePlan,
  type PublicPackagePlan,
} from "@/lib/public-package-plan";
import { serverApiJsonPublic } from "@/lib/server-api";
import { getOptionalLayoutAuthUser } from "@/server/require-role-layout";

type MarketingPublicHomePlansSectionProps = {
  locale: string;
};

/**
 * Figma **Packages** — desktop cream band `605:932`, mobile container `97:5888`.
 */
export async function MarketingPublicHomePlansSection({
  locale,
}: MarketingPublicHomePlansSectionProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.home" });
  const [plansRes, authUser] = await Promise.all([
    serverApiJsonPublic<PublicPackagePlan[]>("/packages/plans"),
    getOptionalLayoutAuthUser(),
  ]);
  const audience = resolveMarketingAudience(authUser);
  const activePlans = plansRes.ok
    ? plansRes.data
        .filter((plan) => plan.isActive)
        .map(normalizePublicPackagePlan)
        .sort((left, right) => left.displayOrder - right.displayOrder)
    : [];
  const categories = groupVisiblePublicPackageCategories(activePlans);
  const cards = buildHomeCategoryCardsFromPlans(activePlans, locale, {
    sessionsUnlimited: t("planCardSessionsUnlimited"),
    sessionsCount: (count) => t("planCardSessionsCount", { count }),
    guestCount: (count) => t("planCardGuestCount", { count }),
    ctaAria: (planName) => t("planCardCtaAria", { planName }),
    categoryPackages: (count) => t("planCardCategoryPackages", { count }),
    priceFromPrefix: t("planCardPriceFromPrefix"),
  });

  const plansCtaHref = audience === "member" ? "/packages" : "/package";

  const interactiveCardsProps = {
    audience,
    categories,
    cards,
  };

  const mobileStyle = {
    ["--home-plans-section-bg" as string]: HOME_PLANS_SECTION_MOBILE_LAYOUT.sectionBackground,
    ["--home-plans-coaches-overlap" as string]: HOME_PLANS_SECTION_MOBILE_LAYOUT.coachesSectionOverlap,
    ["--home-plans-section-px" as string]: HOME_PLANS_SECTION_MOBILE_LAYOUT.sectionPaddingX,
    ["--home-plans-section-py" as string]: HOME_PLANS_SECTION_MOBILE_LAYOUT.sectionPaddingY,
    ["--home-plans-section-gap" as string]: HOME_PLANS_SECTION_MOBILE_LAYOUT.sectionGap,
    ["--home-plans-heading-color" as string]: HOME_PLANS_SECTION_FIGMA.headingColor,
    ["--home-plans-subtitle-color" as string]: HOME_PLANS_SECTION_FIGMA.subtitleColor,
    ["--home-plans-title-size" as string]: HOME_PLANS_SECTION_MOBILE_LAYOUT.titleFontSize,
    ["--home-plans-title-line-height" as string]: String(HOME_PLANS_SECTION_MOBILE_LAYOUT.titleLineHeight),
    ["--home-plans-subtitle-size" as string]: HOME_PLANS_SECTION_MOBILE_LAYOUT.subtitleFontSize,
    ["--home-plans-subtitle-line-height" as string]: String(
      HOME_PLANS_SECTION_MOBILE_LAYOUT.subtitleLineHeight,
    ),
    ["--home-plans-header-max-width" as string]: HOME_PLANS_SECTION_MOBILE_LAYOUT.headerMaxWidth,
    ["--home-plans-header-subtitle-gap" as string]: HOME_PLANS_SECTION_MOBILE_LAYOUT.headerSubtitleGap,
    ["--home-plans-carousel-height" as string]: HOME_PLANS_SECTION_MOBILE_LAYOUT.carouselHeight,
    ["--home-plans-carousel-gap" as string]: HOME_PLANS_SECTION_MOBILE_LAYOUT.carouselGap,
    ["--home-plans-carousel-card-width" as string]: HOME_PLANS_SECTION_MOBILE_LAYOUT.carouselCardWidth,
    ["--home-plans-carousel-trailing-pad" as string]: HOME_PLANS_SECTION_MOBILE_LAYOUT.sectionPaddingX,
  };

  const plansStatusMessage = !plansRes.ok
    ? t("plansLoadFailed", { status: plansRes.status })
    : cards.length === 0
      ? t("plansEmpty")
      : null;

  const desktopStyle = {
    ["--home-plans-desktop-bg" as string]: HOME_PLANS_SECTION_FIGMA.sectionBackground,
    ["--home-plans-panel-fill" as string]: HOME_PLANS_SECTION_FIGMA.panelFill,
    ["--home-plans-panel-radius" as string]: `${HOME_PLANS_SECTION_FIGMA.panelRadiusPx}px`,
    ["--home-plans-panel-bg-image" as string]: HOME_PAGE_SURFACE.plansCardFill,
    ["--home-plans-panel-shadow" as string]: HOME_PAGE_SURFACE.plansCardShadow,
    ["--home-plans-panel-gloss" as string]: HOME_PAGE_SURFACE.plansCardGlossOverlay,
    ["--home-plans-panel-px" as string]: HOME_PLANS_SECTION_LAYOUT.sectionPaddingX,
    ["--home-plans-panel-pt" as string]: HOME_PLANS_SECTION_LAYOUT.sectionPaddingTop,
    ["--home-plans-panel-pb" as string]: HOME_PLANS_SECTION_LAYOUT.sectionPaddingBottom,
    ["--home-plans-panel-gap" as string]: `${HOME_PLANS_SECTION_LAYOUT.sectionGapPx}px`,
    ["--home-plans-panel-header-gap" as string]: `${HOME_PLANS_SECTION_LAYOUT.headerGapPx}px`,
    ["--home-plans-heading-color" as string]: HOME_PLANS_SECTION_FIGMA.headingColor,
    ["--home-plans-subtitle-color" as string]: HOME_PLANS_SECTION_FIGMA.subtitleColor,
    ["--home-plans-desktop-title-size" as string]: HOME_PLANS_SECTION_LAYOUT.titleFontSize,
    ["--home-plans-desktop-title-line-height" as string]: String(
      HOME_PLANS_SECTION_LAYOUT.titleLineHeight,
    ),
    ["--home-plans-desktop-subtitle-max-width" as string]: HOME_PLANS_SECTION_LAYOUT.subtitleMaxWidth,
  };

  return (
    <>
      <section
        aria-labelledby="home-plans-heading-mobile"
        aria-describedby="home-plans-subtitle-mobile"
        className={`${marketingMontserrat.variable} ${styles.mobileSection}`}
        style={mobileStyle}
      >
        <div className={styles.mobileShell}>
          <HomePageReveal index={0}>
            <header className={styles.mobileHeader}>
              <h2
                id="home-plans-heading-mobile"
                className={`${styles.mobileTitle} font-serif font-semibold tracking-tight text-balance`}
              >
                {t("plansSectionTitle")}
              </h2>
              <p
                id="home-plans-subtitle-mobile"
                className={`${styles.mobileSubtitle} ${marketingMontserrat.className} text-pretty font-normal tracking-[0.01em]`}
              >
                {t("plansSectionSubtitle")}
              </p>
            </header>
          </HomePageReveal>

          {plansStatusMessage !== null ? (
            <HomePageReveal index={1}>
              <p
                className={`${marketingMontserrat.className} text-center text-base text-[#4a4738]`}
                role="status"
              >
                {plansStatusMessage}
              </p>
            </HomePageReveal>
          ) : (
            <HomePlansMobileCarousel
              {...interactiveCardsProps}
              carouselAriaLabel={t("plansSectionTitle")}
            />
          )}

          <HomePageReveal index={2}>
            <div className={styles.mobileCta}>
              <HomeHeroCtaButton
                href={plansCtaHref}
                label={t("plansMoreDetails")}
                variant="booking"
                labelOffsetPx={HOME_HERO_MOBILE_MORE_DETAILS_CTA.labelOffsetPx}
              />
            </div>
          </HomePageReveal>
        </div>
      </section>

      <section
        aria-labelledby="home-plans-heading"
        className={`${marketingMontserrat.variable} ${styles.desktopSection}`}
        style={desktopStyle}
      >
        <div className={styles.desktopPanel}>
          <div aria-hidden className={styles.desktopPanelGloss} />
          <div className={styles.desktopPanelContent}>
            <HomePageReveal index={0}>
              <header className={styles.desktopHeader}>
                <h2
                  id="home-plans-heading"
                  className={`${styles.desktopTitle} font-serif font-semibold tracking-tight text-balance`}
                >
                  {t("plansSectionTitle")}
                </h2>
                <p
                  className={`${styles.desktopSubtitle} ${marketingMontserrat.className} text-pretty font-normal tracking-[0.01em]`}
                >
                  {t("plansSectionSubtitle")}
                </p>
              </header>
            </HomePageReveal>

            {plansStatusMessage !== null ? (
              <HomePageReveal index={1}>
                <p
                  className={`${marketingMontserrat.className} max-w-xl text-center text-base text-[#4a4738]`}
                  role="status"
                >
                  {plansStatusMessage}
                </p>
              </HomePageReveal>
            ) : (
              <HomePlansDesktopCards {...interactiveCardsProps} />
            )}

            <HomePageReveal index={3}>
              <div className={styles.desktopCta}>
                <HomeHeroCtaButton
                  href={plansCtaHref}
                  label={t("plansMoreDetails")}
                  variant="membership"
                />
              </div>
            </HomePageReveal>
          </div>
        </div>
      </section>

      {plansStatusMessage === null ? (
        <HomePlansSubscribeModalHost locale={locale} audience={audience} categories={categories} />
      ) : null}
    </>
  );
}
