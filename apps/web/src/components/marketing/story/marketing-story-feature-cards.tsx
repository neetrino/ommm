import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MarketingPageSectionReveal } from "@/components/marketing/marketing-page-section-reveal";
import styles from "@/components/marketing/story/marketing-story-feature-cards.module.css";
import { STORY_PAGE_ASSETS } from "@/components/marketing/story/story-page-assets";
import { STORY_PAGE_LAYOUT, STORY_PAGE_SURFACE } from "@/components/marketing/story/story-page-tokens";
import { belowFoldImageProps } from "@/lib/image-loading-props";

type MarketingStoryFeatureCardsProps = {
  locale: string;
  revealClassName?: string;
};

type FeatureCardConfig = {
  titleKey: "featurePauseTitle" | "featureCalmTitle";
  bodyKey: "featurePauseBody" | "featureCalmBody";
  imageSrc: string;
  imageFirst: boolean;
};

const FEATURE_CARDS: FeatureCardConfig[] = [
  {
    titleKey: "featurePauseTitle",
    bodyKey: "featurePauseBody",
    imageSrc: STORY_PAGE_ASSETS.featureStones,
    imageFirst: true,
  },
  {
    titleKey: "featureCalmTitle",
    bodyKey: "featureCalmBody",
    imageSrc: STORY_PAGE_ASSETS.featureFabric,
    imageFirst: false,
  },
];

/** Two intro cards — pause and calm. */
export async function MarketingStoryFeatureCards({
  locale,
  revealClassName,
}: MarketingStoryFeatureCardsProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.story" });

  return (
    <MarketingPageSectionReveal index={1} className={revealClassName}>
      <div
        className={styles.grid}
        style={{
          ["--story-card-radius" as string]: STORY_PAGE_LAYOUT.cardRadius,
          ["--story-card-bg" as string]: STORY_PAGE_SURFACE.cardBackground,
          ["--story-card-padding" as string]: STORY_PAGE_LAYOUT.cardPadding,
          ["--story-feature-overlap" as string]: STORY_PAGE_LAYOUT.featureCardsHeroOverlap,
        }}
      >
        {FEATURE_CARDS.map((card) => (
          <article key={card.titleKey} className={styles.card}>
            {card.imageFirst ? (
              <div className={styles.media}>
                <Image
                  src={card.imageSrc}
                  alt=""
                  fill
                  sizes="(max-width: 899px) 100vw, 24rem"
                  className={styles.image}
                  {...belowFoldImageProps()}
                />
              </div>
            ) : null}
            <div className={styles.copy}>
              <h2 className={styles.title}>{t(card.titleKey)}</h2>
              <p className={styles.body}>{t(card.bodyKey)}</p>
            </div>
            {!card.imageFirst ? (
              <div className={styles.media}>
                <Image
                  src={card.imageSrc}
                  alt=""
                  fill
                  sizes="(max-width: 899px) 100vw, 24rem"
                  className={styles.image}
                  {...belowFoldImageProps()}
                />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </MarketingPageSectionReveal>
  );
}
