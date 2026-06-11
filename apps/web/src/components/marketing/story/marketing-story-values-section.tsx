import Image from "next/image";
import { getTranslations } from "next-intl/server";
import styles from "@/components/marketing/story/marketing-story-values-section.module.css";
import { StoryPageReveal } from "@/components/marketing/story/story-page-reveal";
import { STORY_PAGE_ASSETS } from "@/components/marketing/story/story-page-assets";
import { STORY_PAGE_LAYOUT, STORY_PAGE_SURFACE } from "@/components/marketing/story/story-page-tokens";
import { belowFoldImageProps } from "@/lib/image-loading-props";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type MarketingStoryValuesSectionProps = {
  locale: string;
};

type ValueCardConfig = {
  titleKey: "valuePeaceTitle" | "valueStrengthTitle" | "valueCommunityTitle";
  bodyKey: "valuePeaceBody" | "valueStrengthBody" | "valueCommunityBody";
  imageSrc: string;
  imageClassName?: string;
  surface: string;
};

const VALUE_CARDS: ValueCardConfig[] = [
  {
    titleKey: "valuePeaceTitle",
    bodyKey: "valuePeaceBody",
    imageSrc: STORY_PAGE_ASSETS.valuesPeacefulMind,
    imageClassName: styles.imagePeace,
    surface: STORY_PAGE_SURFACE.valuePeaceSurface,
  },
  {
    titleKey: "valueStrengthTitle",
    bodyKey: "valueStrengthBody",
    imageSrc: STORY_PAGE_ASSETS.valuesStrength,
    imageClassName: styles.imageStrength,
    surface: STORY_PAGE_SURFACE.valueStrengthSurface,
  },
  {
    titleKey: "valueCommunityTitle",
    bodyKey: "valueCommunityBody",
    imageSrc: STORY_PAGE_ASSETS.valuesCommunity,
    imageClassName: styles.imageCommunity,
    surface: STORY_PAGE_SURFACE.valueCommunitySurface,
  },
];

const VALUES_SECTION_STYLE = {
  ["--story-values-gap" as string]: STORY_PAGE_LAYOUT.valuesGridGap,
  ["--story-values-card-radius" as string]: STORY_PAGE_LAYOUT.valuesCardRadius,
  ["--story-values-card-min-height" as string]: STORY_PAGE_LAYOUT.valuesCardMinHeight,
  ["--story-values-image-min-height" as string]: STORY_PAGE_LAYOUT.valuesCardImageMinHeight,
  ["--story-values-heading-color" as string]: STORY_PAGE_LAYOUT.valuesHeadingColor,
  ["--story-values-subtitle-color" as string]: STORY_PAGE_LAYOUT.valuesSubtitleColor,
  ["--story-values-card-shadow" as string]: STORY_PAGE_LAYOUT.storyCardShadow,
  ["--story-values-card-heading-color" as string]: STORY_PAGE_SURFACE.heading,
  ["--story-values-card-body-color" as string]: STORY_PAGE_SURFACE.body,
  ["--story-values-badge-border" as string]: STORY_PAGE_SURFACE.badgeBorder,
  ["--story-values-section-margin-top" as string]: STORY_PAGE_LAYOUT.valuesSectionMarginTop,
  ["--story-values-section-margin-top-mobile" as string]:
    STORY_PAGE_LAYOUT.valuesSectionMarginTopMobile,
  ["--story-values-card-min-height-tablet" as string]:
    STORY_PAGE_LAYOUT.valuesCardMinHeightTablet,
  ["--story-values-image-min-height-tablet" as string]:
    STORY_PAGE_LAYOUT.valuesCardImageMinHeightTablet,
} as const;

/** Three-column values grid — text top, image bottom (reference card layout). */
export async function MarketingStoryValuesSection({ locale }: MarketingStoryValuesSectionProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.story" });

  return (
    <section
      className={`${marketingMontserrat.variable} ${styles.section}`}
      aria-labelledby="story-values-heading"
      style={VALUES_SECTION_STYLE}
    >
      <StoryPageReveal index={0}>
        <header className={styles.header}>
          <h2 id="story-values-heading" className={styles.sectionTitle}>
            {t("valuesHeading")}
          </h2>
          <p className={styles.sectionSubtitle}>{t("valuesSubtitle")}</p>
        </header>
      </StoryPageReveal>
      <ul className={styles.grid}>
        {VALUE_CARDS.map((card, index) => (
          <li key={card.titleKey}>
            <StoryPageReveal
              index={index}
              gridColumns={STORY_PAGE_LAYOUT.valuesGridColumns}
            >
              <article
                className={styles.card}
                style={{ ["--story-value-surface" as string]: card.surface }}
              >
                <div className={styles.copy}>
                  <div className={styles.copyTop}>
                    <span className={styles.indexBadge}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className={styles.decorMark} aria-hidden="true">
                      ✳
                    </span>
                  </div>
                  <h3 className={styles.title}>{t(card.titleKey)}</h3>
                  <p className={styles.body}>{t(card.bodyKey)}</p>
                </div>
                <div className={styles.media}>
                  <Image
                    src={card.imageSrc}
                    alt=""
                    fill
                    sizes="(max-width: 743px) 100vw, 20rem"
                    className={`${styles.image} ${card.imageClassName ?? ""}`}
                    {...belowFoldImageProps()}
                  />
                </div>
              </article>
            </StoryPageReveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
