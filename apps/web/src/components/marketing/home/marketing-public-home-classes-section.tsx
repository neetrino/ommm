import { getTranslations } from "next-intl/server";
import { HomeClassPracticeCard } from "@/components/marketing/home/home-class-practice-card";
import { HomeHeroCtaButton } from "@/components/marketing/home/home-hero-cta-button";
import {
  HOME_CLASS_CARD_GRID_CLASS,
  HOME_CLASS_CARD_GRID_OFFSETS,
  HOME_CLASS_CARD_VISUALS,
  HOME_CLASSES_SECTION_BACKGROUND,
  HOME_CLASSES_SECTION_FIGMA,
  HOME_CLASSES_SECTION_LAYOUT,
} from "@/components/marketing/home/home-classes-section-tokens";
import { HOME_WEEKLY_SCHEDULE_LAYOUT } from "@/components/marketing/home/home-weekly-schedule-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type ClassCardCopy = {
  titleLines: string[];
  body: string;
};

type MarketingPublicHomeClassesSectionProps = {
  locale: string;
};

/**
 * Figma **Classes Section** `196:1074` — five practice cards + membership CTA `196:1113`.
 */
export async function MarketingPublicHomeClassesSection({
  locale,
}: MarketingPublicHomeClassesSectionProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.home" });
  const cards = t.raw("classCards") as ClassCardCopy[];

  return (
    <section
      className={`${marketingMontserrat.variable} relative z-[1] w-full px-4 sm:px-6 md:px-10 lg:px-20`}
      style={{
        background: HOME_CLASSES_SECTION_BACKGROUND,
        marginTop: `calc(-1 * ${HOME_WEEKLY_SCHEDULE_LAYOUT.sectionClassesOverlap})`,
        paddingTop: `calc(${HOME_CLASSES_SECTION_LAYOUT.sectionPaddingY} + ${HOME_WEEKLY_SCHEDULE_LAYOUT.sectionClassesOverlap} + ${HOME_WEEKLY_SCHEDULE_LAYOUT.sectionToClassesHeadingGapAdjustPx}px)`,
        paddingBottom: HOME_CLASSES_SECTION_LAYOUT.sectionPaddingY,
      }}
    >
      <div
        className="mx-auto flex flex-col gap-8 md:gap-10"
        style={{ maxWidth: HOME_CLASSES_SECTION_LAYOUT.contentMaxWidthPx }}
      >
        <header className="flex flex-col gap-4 text-center md:gap-7">
          <h2
            className="font-serif font-semibold tracking-tight text-balance"
            style={{
              color: HOME_CLASSES_SECTION_FIGMA.headingColor,
              fontSize: HOME_CLASSES_SECTION_LAYOUT.titleFontSize,
              lineHeight: HOME_CLASSES_SECTION_LAYOUT.titleLineHeight,
            }}
          >
            {t("classesTitle")}
          </h2>
          <p
            className={`${marketingMontserrat.className} mx-auto text-base font-normal leading-[25.6px] tracking-[0.01em]`}
            style={{
              color: HOME_CLASSES_SECTION_FIGMA.subtitleColor,
              maxWidth: HOME_CLASSES_SECTION_LAYOUT.subtitleMaxWidth,
            }}
          >
            {t("classesSubtitle")}
          </p>
        </header>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12"
          style={{ gap: HOME_CLASSES_SECTION_LAYOUT.gridGap }}
        >
          {HOME_CLASS_CARD_VISUALS.map((visual, index) => {
            const copy = cards[index];
            if (copy === undefined) {
              return null;
            }

            return (
              <HomeClassPracticeCard
                key={visual.id}
                visual={visual}
                titleLines={copy.titleLines}
                body={copy.body}
                gridClassName={`${HOME_CLASS_CARD_GRID_CLASS} ${HOME_CLASS_CARD_GRID_OFFSETS[index] ?? ""}`}
              />
            );
          })}
        </div>

        <div className="flex justify-center pt-2 md:pt-4">
          <HomeHeroCtaButton
            href="/packages"
            label={t("viewMembership")}
            variant="membership"
          />
        </div>
      </div>
    </section>
  );
}
