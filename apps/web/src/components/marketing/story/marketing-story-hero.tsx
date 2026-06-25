import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { StoryPageReveal } from "@/components/marketing/story/story-page-reveal";
import styles from "@/components/marketing/story/marketing-story-hero.module.css";
import { STORY_PAGE_ASSETS } from "@/components/marketing/story/story-page-assets";
import { STORY_PAGE_LAYOUT } from "@/components/marketing/story/story-page-tokens";
import { MARKETING_INNER_PAGE_CONTAINER_CLASS } from "@/components/marketing/marketing-content-layout";
import { lcpImageProps } from "@/lib/image-loading-props";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type MarketingStoryHeroProps = {
  locale: string;
};

type HeroFeatureBlockConfig = {
  titleKey: "featurePauseTitle" | "featureCalmTitle";
  bodyKey: "featurePauseBody" | "featureCalmBody";
};

const HERO_FEATURE_BLOCKS: HeroFeatureBlockConfig[] = [
  { titleKey: "featurePauseTitle", bodyKey: "featurePauseBody" },
  { titleKey: "featureCalmTitle", bodyKey: "featureCalmBody" },
];

const HERO_LAYOUT_STYLE = {
  ["--story-hero-background-height" as string]: STORY_PAGE_LAYOUT.heroBackgroundHeight,
  ["--story-hero-background-width-bleed" as string]: STORY_PAGE_LAYOUT.heroBackgroundWidthBleed,
  ["--story-hero-background-top-offset" as string]: STORY_PAGE_LAYOUT.heroBackgroundTopOffset,
  ["--story-hero-background-bottom-radius" as string]: STORY_PAGE_LAYOUT.heroBackgroundBottomRadius,
  ["--story-hero-min-height" as string]: STORY_PAGE_LAYOUT.heroMinHeight,
  ["--story-hero-content-padding-top" as string]: STORY_PAGE_LAYOUT.heroContentPaddingTop,
  ["--story-hero-content-padding-top-mobile" as string]:
    STORY_PAGE_LAYOUT.heroContentPaddingTopMobile,
  ["--story-hero-title-size" as string]: STORY_PAGE_LAYOUT.heroTitleSize,
  ["--story-hero-title-size-mobile" as string]: STORY_PAGE_LAYOUT.heroTitleSizeMobile,
  ["--story-hero-lede-size" as string]: STORY_PAGE_LAYOUT.heroLedeSize,
  ["--story-hero-lede-max-width" as string]: STORY_PAGE_LAYOUT.heroLedeMaxWidth,
  ["--story-hero-feature-title-size" as string]: STORY_PAGE_LAYOUT.heroFeatureTitleSize,
  ["--story-hero-feature-body-size" as string]: STORY_PAGE_LAYOUT.heroFeatureBodySize,
  ["--story-hero-feature-max-width" as string]: STORY_PAGE_LAYOUT.heroFeatureMaxWidth,
  ["--story-hero-feature-gap" as string]: STORY_PAGE_LAYOUT.heroFeatureGap,
  ["--story-hero-feature-margin-top" as string]: STORY_PAGE_LAYOUT.heroFeatureMarginTop,
  ["--story-hero-feature-margin-top-mobile" as string]:
    STORY_PAGE_LAYOUT.heroFeatureMarginTopMobile,
  ["--story-hero-lede-feature-gap-mobile" as string]: STORY_PAGE_LAYOUT.heroLedeFeatureGapMobile,
} as const;

/** Story hero — full-bleed background, title + lede, and intro feature copy. */
export async function MarketingStoryHero({ locale }: MarketingStoryHeroProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.story" });

  return (
    <StoryPageReveal index={0}>
      <header
        className={`${marketingMontserrat.variable} ${styles.hero}`}
        aria-labelledby="story-hero-heading"
        style={HERO_LAYOUT_STYLE}
      >
        <div className={styles.background} aria-hidden>
          <Image
            src={STORY_PAGE_ASSETS.heroBackground}
            alt=""
            fill
            sizes="100vw"
            className={styles.backgroundImage}
            {...lcpImageProps()}
          />
        </div>

        <div className={`${MARKETING_INNER_PAGE_CONTAINER_CLASS} ${styles.content}`}>
          <div className={styles.titleRow}>
            <div className={styles.titleCluster}>
              <h1 id="story-hero-heading" className={styles.titleHeading}>
                <span className={styles.titlePrefix}>{t("titlePrefix")}</span>
                <span className={styles.titleBrand}>{t("titleBrand")}</span>
              </h1>
              <p className={styles.lede}>{t("lede")}</p>
            </div>
          </div>

          <div className={styles.featureBlocks}>
            {HERO_FEATURE_BLOCKS.map((block) => (
              <div key={block.titleKey} className={styles.featureBlock}>
                <h2 className={styles.featureTitle}>{t(block.titleKey)}</h2>
                <p className={styles.featureBody}>{t(block.bodyKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </header>
    </StoryPageReveal>
  );
}
