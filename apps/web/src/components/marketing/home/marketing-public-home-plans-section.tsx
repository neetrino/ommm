import { getTranslations } from "next-intl/server";
import { HomeHeroCtaButton } from "@/components/marketing/home/home-hero-cta-button";
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
 * Figma **Packages** — desktop `196:1251`, mobile container `97:5888`.
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

  return (
    <>
      <section
        aria-labelledby="home-plans-heading-mobile"
        aria-describedby="home-plans-subtitle-mobile"
        className={`${marketingMontserrat.variable} ${styles.mobileSection}`}
        style={mobileStyle}
      >
        <div className={styles.mobileShell}>
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

          {plansStatusMessage !== null ? (
            <p
              className={`${marketingMontserrat.className} text-center text-base text-[#4a4738]`}
              role="status"
            >
              {plansStatusMessage}
            </p>
          ) : (
            <HomePlansMobileCarousel
              {...interactiveCardsProps}
              carouselAriaLabel={t("plansSectionTitle")}
            />
          )}

          <div className={styles.mobileCta}>
            <HomeHeroCtaButton
              href="/packages"
              label={t("plansMoreDetails")}
              variant="booking"
              labelOffsetPx={HOME_HERO_MOBILE_MORE_DETAILS_CTA.labelOffsetPx}
            />
          </div>
        </div>
      </section>

      <section
        aria-labelledby="home-plans-heading"
        className={`${marketingMontserrat.variable} ${styles.desktopSection} w-full min-w-0 px-0 py-16`}
        style={{ backgroundColor: HOME_PAGE_SURFACE.coachesGradientTo }}
      >
        <div
          className="relative isolate w-full min-w-0 overflow-hidden rounded-[50px] border border-white/55 ring-1 ring-white/35 backdrop-blur-[6px]"
          style={{
            backgroundColor: HOME_PLANS_SECTION_FIGMA.panelFill,
            backgroundImage: HOME_PAGE_SURFACE.plansCardFill,
            boxShadow: HOME_PAGE_SURFACE.plansCardShadow,
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: HOME_PAGE_SURFACE.plansCardGlossOverlay }}
          />
          <div
            className="relative z-10 flex flex-col items-center"
            style={{
              paddingInline: HOME_PLANS_SECTION_LAYOUT.sectionPaddingX,
              paddingTop: HOME_PLANS_SECTION_LAYOUT.sectionPaddingTop,
              paddingBottom: HOME_PLANS_SECTION_LAYOUT.sectionPaddingBottom,
              gap: HOME_PLANS_SECTION_LAYOUT.sectionGapPx,
            }}
          >
            <header
              className="flex w-full max-w-[834px] flex-col items-center text-center"
              style={{ gap: HOME_PLANS_SECTION_LAYOUT.headerGapPx }}
            >
              <h2
                id="home-plans-heading"
                className="font-serif font-semibold tracking-tight text-balance"
                style={{
                  color: HOME_PLANS_SECTION_FIGMA.headingColor,
                  fontSize: HOME_PLANS_SECTION_LAYOUT.titleFontSize,
                  lineHeight: HOME_PLANS_SECTION_LAYOUT.titleLineHeight,
                }}
              >
                {t("plansSectionTitle")}
              </h2>
              <p
                className={`${marketingMontserrat.className} text-base font-normal leading-[25.6px] tracking-[0.01em]`}
                style={{
                  color: HOME_PLANS_SECTION_FIGMA.subtitleColor,
                  maxWidth: HOME_PLANS_SECTION_LAYOUT.subtitleMaxWidth,
                }}
              >
                {t("plansSectionSubtitle")}
              </p>
            </header>

            {plansStatusMessage !== null ? (
              <p
                className={`${marketingMontserrat.className} max-w-xl text-center text-base text-[#4a4738]`}
                role="status"
              >
                {plansStatusMessage}
              </p>
            ) : (
              <HomePlansDesktopCards {...interactiveCardsProps} />
            )}

            <HomeHeroCtaButton
              href="/packages"
              label={t("plansMoreDetails")}
              variant="membership"
            />
          </div>
        </div>
      </section>

      {plansStatusMessage === null ? (
        <HomePlansSubscribeModalHost locale={locale} audience={audience} categories={categories} />
      ) : null}
    </>
  );
}
