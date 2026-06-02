import { getTranslations } from "next-intl/server";
import { HomeHeroCtaButton } from "@/components/marketing/home/home-hero-cta-button";
import { HomePackagePlanCardsRow } from "@/components/marketing/home/home-package-plan-card";
import {
  HOME_PLANS_SECTION_FIGMA,
  HOME_PLANS_SECTION_LAYOUT,
} from "@/components/marketing/home/home-plans-section-tokens";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type PlanCardCopy = {
  planName: string;
  details: string;
  price: string;
  ctaAria: string;
};

type MarketingPublicHomePlansSectionProps = {
  locale: string;
};

/**
 * Figma **Packages** `196:1251` — frosted panel, heading `196:1252`, cards `196:1256`, CTA `196:1260`.
 */
export async function MarketingPublicHomePlansSection({
  locale,
}: MarketingPublicHomePlansSectionProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.home" });
  const cards = t.raw("planCards") as PlanCardCopy[];

  return (
    <section
      className={`${marketingMontserrat.variable} w-full min-w-0 px-0 py-16`}
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

          <HomePackagePlanCardsRow cards={cards} />

          <HomeHeroCtaButton
            href="/packages"
            label={t("plansMoreDetails")}
            variant="plansDetails"
          />
        </div>
      </div>
    </section>
  );
}
