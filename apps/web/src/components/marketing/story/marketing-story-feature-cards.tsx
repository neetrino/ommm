import { getTranslations } from "next-intl/server";
import styles from "@/components/marketing/story/marketing-story-feature-cards.module.css";
import { StoryPageReveal } from "@/components/marketing/story/story-page-reveal";
import { STORY_PAGE_LAYOUT, STORY_PAGE_SURFACE } from "@/components/marketing/story/story-page-tokens";
import { Link } from "@/i18n/navigation";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type MarketingStoryFeatureCardsProps = {
  locale: string;
  revealClassName?: string;
};

type FeatureCardConfig = {
  titleKey: "featurePauseTitle" | "featureCalmTitle";
  bodyKey: "featurePauseBody" | "featureCalmBody";
  badgeKey: "featurePauseBadge" | "featureCalmBadge";
};

const FEATURE_CARDS: FeatureCardConfig[] = [
  {
    titleKey: "featurePauseTitle",
    bodyKey: "featurePauseBody",
    badgeKey: "featurePauseBadge",
  },
  {
    titleKey: "featureCalmTitle",
    bodyKey: "featureCalmBody",
    badgeKey: "featureCalmBadge",
  },
];

const FEATURE_GRID_STYLE = {
  ["--story-feature-overlap" as string]: STORY_PAGE_LAYOUT.featureCardsHeroOverlap,
  ["--story-feature-card-radius" as string]: STORY_PAGE_LAYOUT.featureCardRadius,
  ["--story-feature-card-bg" as string]: STORY_PAGE_SURFACE.cardBackground,
  ["--story-feature-card-shadow" as string]: STORY_PAGE_LAYOUT.storyCardShadow,
  ["--story-feature-heading-color" as string]: STORY_PAGE_SURFACE.heading,
  ["--story-feature-body-color" as string]: STORY_PAGE_SURFACE.body,
  ["--story-feature-badge-border" as string]: STORY_PAGE_SURFACE.badgeBorder,
  ["--story-feature-cta-bg" as string]: STORY_PAGE_LAYOUT.featureCardCtaBackground,
  ["--story-feature-cta-hover" as string]: STORY_PAGE_LAYOUT.featureCardCtaHover,
} as const;

/** Two intro cards — badge, copy, and CTA. */
export async function MarketingStoryFeatureCards({
  locale,
  revealClassName,
}: MarketingStoryFeatureCardsProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.story" });

  return (
    <div
      className={`${marketingMontserrat.variable} ${styles.grid} ${revealClassName ?? ""}`}
      style={FEATURE_GRID_STYLE}
    >
      {FEATURE_CARDS.map((card, index) => (
        <StoryPageReveal
          key={card.titleKey}
          index={index}
          gridColumns={STORY_PAGE_LAYOUT.featureCardsGridColumns}
        >
          <article className={styles.card}>
            <div className={styles.copy}>
              <span className={styles.badge}>{t(card.badgeKey)}</span>
              <h2 className={styles.title}>{t(card.titleKey)}</h2>
              <p className={styles.body}>{t(card.bodyKey)}</p>
              <Link href="/explore" className={styles.cta}>
                <span>{t("featureCardCta")}</span>
                <span className={styles.ctaArrow} aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </article>
        </StoryPageReveal>
      ))}
    </div>
  );
}
