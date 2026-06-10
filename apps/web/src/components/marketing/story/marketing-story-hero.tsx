import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MarketingPageSectionReveal } from "@/components/marketing/marketing-page-section-reveal";
import styles from "@/components/marketing/story/marketing-story-hero.module.css";
import { STORY_PAGE_ASSETS } from "@/components/marketing/story/story-page-assets";
import { STORY_PAGE_LAYOUT } from "@/components/marketing/story/story-page-tokens";
import { aboveFoldImageProps, lcpImageProps } from "@/lib/image-loading-props";

type MarketingStoryHeroProps = {
  locale: string;
};

/** Story hero — title, lede, arched portrait, and botanical accent. */
export async function MarketingStoryHero({ locale }: MarketingStoryHeroProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.story" });

  const heroMobileLayoutStyle = {
    ["--story-hero-visual-max-width" as string]: STORY_PAGE_LAYOUT.heroVisualMaxWidth,
    ["--story-hero-visual-nudge-y" as string]: "clamp(1rem, 3vw, 2rem)",
    ["--story-hero-padding-bottom" as string]: "clamp(2rem, 5vw, 4rem)",
  };

  const heroVisualStyle = {
    ["--story-hero-visual-offset-left" as string]: `${STORY_PAGE_LAYOUT.heroVisualOffsetLeftPx}px`,
    ["--story-hero-visual-max-width" as string]: STORY_PAGE_LAYOUT.heroVisualMaxWidth,
    ["--story-hero-visual-aspect-ratio" as string]: STORY_PAGE_LAYOUT.heroVisualAspectRatio,
  };

  const heroBranchStyle = {
    ["--story-hero-branch-offset-x" as string]: `${STORY_PAGE_LAYOUT.heroBranchOffsetRightPx}px`,
    ["--story-hero-branch-offset-y" as string]: `${STORY_PAGE_LAYOUT.heroBranchOffsetUpPx}px`,
  };

  return (
    <MarketingPageSectionReveal index={0}>
      <header
        className={styles.hero}
        aria-labelledby="story-hero-heading"
        style={heroMobileLayoutStyle}
      >
        <div className={styles.copy}>
          <h1 id="story-hero-heading" className={styles.title}>
            {t("title")}
          </h1>
          <p className={styles.lead}>{t("lede")}</p>
        </div>
        <div className={styles.visual} style={heroVisualStyle}>
          <div className={styles.archFrame}>
            <div
              className={styles.portraitClip}
              style={{
                ["--story-hero-arch-radius-top" as string]: STORY_PAGE_LAYOUT.heroArchRadiusTop,
                ["--story-hero-arch-radius-bottom" as string]: STORY_PAGE_LAYOUT.heroArchRadiusBottom,
              }}
            >
              <Image
                src={STORY_PAGE_ASSETS.heroPortrait}
                alt=""
                fill
                sizes="(max-width: 743px) 88vw, 32rem"
                className={styles.portrait}
                {...lcpImageProps()}
              />
            </div>
          </div>
          <div className={styles.branchWrap} style={heroBranchStyle}>
            <Image
              src={STORY_PAGE_ASSETS.heroBranch}
              alt=""
              fill
              sizes="(max-width: 743px) 65vw, 25rem"
              className={styles.branch}
              {...aboveFoldImageProps()}
            />
          </div>
        </div>
      </header>
    </MarketingPageSectionReveal>
  );
}
