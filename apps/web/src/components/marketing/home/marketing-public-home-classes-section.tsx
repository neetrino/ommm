import { getTranslations } from "next-intl/server";
import { HomeClassPracticeCard } from "@/components/marketing/home/home-class-practice-card";
import { HomeHeroCtaButton } from "@/components/marketing/home/home-hero-cta-button";
import { HomePageReveal } from "@/components/marketing/home/home-page-reveal";
import { HOME_PAGE_SCROLL_REVEAL } from "@/components/marketing/home/home-page-scroll-reveal-tokens";
import {
  HOME_CLASS_CARD_GRID_CLASS,
  HOME_CLASS_CARD_GRID_OFFSETS,
  HOME_CLASS_CARD_YOGA_IMAGE_OFFSET_DESKTOP_PX,
  HOME_CLASS_CARD_VISUALS,
  HOME_CLASSES_SECTION_BACKGROUND,
  HOME_CLASSES_SECTION_FIGMA,
  HOME_CLASSES_SECTION_LAYOUT,
  HOME_CLASSES_SECTION_MOBILE_FIGMA,
  HOME_CLASSES_SECTION_MOBILE_LAYOUT,
  HOME_CLASSES_SECTION_IPAD_AIR_LAYOUT,
  HOME_CLASSES_SECTION_TABLET_LAYOUT,
  homeClassCardMobileImageRotationDeg,
} from "@/components/marketing/home/home-classes-section-tokens";
import styles from "@/components/marketing/home/marketing-public-home-classes-section.module.css";
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
 * Figma **Classes Section** `196:1074` (desktop), mobile container `97:5683`.
 */
export async function MarketingPublicHomeClassesSection({
  locale,
}: MarketingPublicHomeClassesSectionProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.home" });
  const cards = t.raw("classCards") as ClassCardCopy[];

  return (
    <section
      aria-labelledby="home-classes-heading"
      aria-describedby="home-classes-subtitle"
      className={`${marketingMontserrat.variable} ${styles.section}`}
      style={{
        ["--home-classes-section-bg" as string]: HOME_CLASSES_SECTION_BACKGROUND,
        ["--home-classes-schedule-overlap" as string]:
          HOME_CLASSES_SECTION_MOBILE_LAYOUT.sectionClassesOverlap,
        ["--home-classes-schedule-overlap-lg" as string]:
          HOME_WEEKLY_SCHEDULE_LAYOUT.sectionClassesOverlap,
        ["--home-classes-section-py" as string]: HOME_CLASSES_SECTION_MOBILE_LAYOUT.sectionPaddingY,
        ["--home-classes-section-py-lg" as string]: HOME_CLASSES_SECTION_LAYOUT.sectionPaddingY,
        ["--home-classes-section-px" as string]: HOME_CLASSES_SECTION_MOBILE_LAYOUT.sectionPaddingX,
        ["--home-classes-section-gap" as string]: HOME_CLASSES_SECTION_MOBILE_LAYOUT.sectionGap,
        ["--home-classes-heading-gap-adjust" as string]:
          `${HOME_CLASSES_SECTION_MOBILE_LAYOUT.sectionToClassesHeadingGapAdjustPx}px`,
        ["--home-classes-heading-gap-adjust-lg" as string]:
          `${HOME_WEEKLY_SCHEDULE_LAYOUT.sectionToClassesHeadingGapAdjustPx}px`,
        ["--home-classes-heading-color" as string]: HOME_CLASSES_SECTION_FIGMA.headingColor,
        ["--home-classes-subtitle-color" as string]: HOME_CLASSES_SECTION_FIGMA.subtitleColor,
        ["--home-classes-title-size" as string]: HOME_CLASSES_SECTION_MOBILE_LAYOUT.titleFontSize,
        ["--home-classes-title-size-lg" as string]: HOME_CLASSES_SECTION_LAYOUT.titleFontSize,
        ["--home-classes-title-line-height" as string]: String(
          HOME_CLASSES_SECTION_MOBILE_LAYOUT.titleLineHeight,
        ),
        ["--home-classes-title-line-height-lg" as string]: String(
          HOME_CLASSES_SECTION_LAYOUT.titleLineHeight,
        ),
        ["--home-classes-subtitle-size" as string]: HOME_CLASSES_SECTION_MOBILE_LAYOUT.subtitleFontSize,
        ["--home-classes-subtitle-max-width" as string]:
          HOME_CLASSES_SECTION_MOBILE_LAYOUT.subtitleMaxWidth,
        ["--home-classes-subtitle-max-width-lg" as string]:
          HOME_CLASSES_SECTION_LAYOUT.subtitleMaxWidth,
        ["--home-classes-header-subtitle-gap" as string]:
          HOME_CLASSES_SECTION_MOBILE_LAYOUT.headerSubtitleGap,
        ["--home-classes-carousel-height" as string]: HOME_CLASSES_SECTION_MOBILE_LAYOUT.carouselHeight,
        ["--home-classes-carousel-gap" as string]: HOME_CLASSES_SECTION_MOBILE_LAYOUT.carouselGap,
        ["--home-classes-carousel-card-width" as string]:
          HOME_CLASSES_SECTION_MOBILE_LAYOUT.carouselCardWidth,
        ["--home-classes-carousel-trailing-pad" as string]: HOME_CLASSES_SECTION_MOBILE_LAYOUT.sectionPaddingX,
        ["--home-classes-grid-gap" as string]: HOME_CLASSES_SECTION_LAYOUT.gridGap,
        ["--home-classes-grid-gap-tablet" as string]: HOME_CLASSES_SECTION_TABLET_LAYOUT.gridGap,
        ["--home-classes-content-max-width-lg" as string]: `${HOME_CLASSES_SECTION_LAYOUT.contentMaxWidthPx}px`,
        ["--home-classes-content-max-width-tablet" as string]: `${HOME_CLASSES_SECTION_TABLET_LAYOUT.contentMaxWidthPx}px`,
        ["--home-classes-content-max-width-air" as string]: `${HOME_CLASSES_SECTION_IPAD_AIR_LAYOUT.contentMaxWidthPx}px`,
        ["--home-class-card-min-h-tablet" as string]: `${HOME_CLASSES_SECTION_TABLET_LAYOUT.cardMinHeightPx}px`,
        ["--home-class-card-min-h-air" as string]: `${HOME_CLASSES_SECTION_IPAD_AIR_LAYOUT.cardMinHeightPx}px`,
        ["--home-class-card-title-size-tablet" as string]: `${HOME_CLASSES_SECTION_TABLET_LAYOUT.cardTitleFontSizePx}px`,
        ["--home-class-card-title-size-air" as string]: `${HOME_CLASSES_SECTION_IPAD_AIR_LAYOUT.cardTitleFontSizePx}px`,
        ["--home-class-card-title-line-height-tablet" as string]: `${HOME_CLASSES_SECTION_TABLET_LAYOUT.cardTitleLineHeightPx}px`,
        ["--home-class-card-title-line-height-air" as string]: `${HOME_CLASSES_SECTION_IPAD_AIR_LAYOUT.cardTitleLineHeightPx}px`,
        ["--home-class-card-body-size-tablet" as string]: `${HOME_CLASSES_SECTION_TABLET_LAYOUT.cardBodyFontSizePx}px`,
        ["--home-class-card-body-size-air" as string]: `${HOME_CLASSES_SECTION_IPAD_AIR_LAYOUT.cardBodyFontSizePx}px`,
        ["--home-class-card-body-line-height-tablet" as string]: `${HOME_CLASSES_SECTION_TABLET_LAYOUT.cardBodyLineHeightPx}px`,
        ["--home-class-card-body-line-height-air" as string]: `${HOME_CLASSES_SECTION_IPAD_AIR_LAYOUT.cardBodyLineHeightPx}px`,
        ["--home-classes-grid-gap-air" as string]: HOME_CLASSES_SECTION_IPAD_AIR_LAYOUT.gridGap,
        ["--home-class-yoga-image-offset-desktop" as string]: `${HOME_CLASS_CARD_YOGA_IMAGE_OFFSET_DESKTOP_PX}px`,
      }}
    >
      <div className={styles.shell}>
        <HomePageReveal index={0}>
          <header className={styles.header}>
            <h2
              id="home-classes-heading"
              className={`${styles.title} font-serif font-semibold tracking-tight text-balance`}
            >
              {t("classesTitle")}
            </h2>
            <p
              id="home-classes-subtitle"
              className={`${styles.subtitle} ${marketingMontserrat.className} text-pretty font-normal tracking-[0.01em]`}
            >
              {t("classesSubtitle")}
            </p>
          </header>
        </HomePageReveal>

        <div
          className={styles.carouselViewport}
          aria-label={t("classesTitle")}
          tabIndex={0}
          style={{
            ["--home-class-card-min-h" as string]: `${HOME_CLASSES_SECTION_MOBILE_LAYOUT.cardMinHeightPx}px`,
            ["--home-class-card-radius" as string]: `${HOME_CLASSES_SECTION_MOBILE_LAYOUT.cardRadiusPx}px`,
            ["--home-class-card-title-size" as string]: `${HOME_CLASSES_SECTION_MOBILE_FIGMA.cardTitleFontSizePx}px`,
            ["--home-class-card-title-line-height" as string]: `${HOME_CLASSES_SECTION_MOBILE_FIGMA.cardTitleLineHeightPx}px`,
            ["--home-class-card-body-size" as string]: `${HOME_CLASSES_SECTION_MOBILE_FIGMA.cardBodyFontSizePx}px`,
            ["--home-class-card-body-line-height" as string]: `${HOME_CLASSES_SECTION_MOBILE_FIGMA.cardBodyLineHeightPx}px`,
          }}
        >
          <div className={styles.carouselTrack}>
            {HOME_CLASS_CARD_VISUALS.map((visual, index) => {
              const copy = cards[index];
              if (copy === undefined) {
                return null;
              }

              const mobileImageRotationDeg = homeClassCardMobileImageRotationDeg(visual.id);
              const carouselSlideStyle: Record<string, string> = {
                ["--home-class-card-image-rotation"]: `${mobileImageRotationDeg}deg`,
              };
              if (visual.id === "yoga") {
                carouselSlideStyle["--home-class-yoga-image-offset-mobile"] =
                  `-${HOME_CLASSES_SECTION_MOBILE_LAYOUT.yogaMobileImageOffsetUpPx}px`;
              }
              if (visual.id === "mat-pilates") {
                carouselSlideStyle["--home-class-mat-pilates-image-offset-mobile"] =
                  `-${HOME_CLASSES_SECTION_MOBILE_LAYOUT.matPilatesMobileImageOffsetUpPx}px`;
              }

              return (
                <div
                  key={visual.id}
                  className={styles.carouselSlide}
                  style={carouselSlideStyle}
                >
                  <HomePageReveal
                    index={index}
                    gridColumns={HOME_PAGE_SCROLL_REVEAL.sectionGridColumns}
                    className="h-full"
                  >
                    <HomeClassPracticeCard
                      visual={visual}
                      titleLines={copy.titleLines}
                      body={copy.body}
                      gridClassName=""
                      imageIndex={index}
                    />
                  </HomePageReveal>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.grid}>
          {HOME_CLASS_CARD_VISUALS.map((visual, index) => {
            const copy = cards[index];
            if (copy === undefined) {
              return null;
            }

            return (
              <HomePageReveal
                key={visual.id}
                index={index}
                gridColumns={HOME_PAGE_SCROLL_REVEAL.classCardsGridColumns}
                className={`${styles.gridCard} ${HOME_CLASS_CARD_GRID_CLASS} ${HOME_CLASS_CARD_GRID_OFFSETS[index] ?? ""}`}
              >
                <HomeClassPracticeCard
                  visual={visual}
                  titleLines={copy.titleLines}
                  body={copy.body}
                  gridClassName=""
                  imageIndex={index}
                  style={{
                    ["--home-class-card-radius" as string]: `${HOME_CLASSES_SECTION_FIGMA.cardRadiusPx}px`,
                  }}
                />
              </HomePageReveal>
            );
          })}
        </div>

        <HomePageReveal index={HOME_CLASS_CARD_VISUALS.length}>
          <div className={styles.cta}>
            <HomeHeroCtaButton
              href="/packages"
              label={t("viewMembership")}
              variant="membership"
            />
          </div>
        </HomePageReveal>
      </div>
    </section>
  );
}
