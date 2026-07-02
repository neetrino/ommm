import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { StoryPageReveal } from "@/components/marketing/story/story-page-reveal";
import styles from "@/components/marketing/story/marketing-story-founders-voice-banner.module.css";
import { STORY_PAGE_ASSETS } from "@/components/marketing/story/story-page-assets";
import { STORY_PAGE_LAYOUT, STORY_PAGE_SURFACE } from "@/components/marketing/story/story-page-tokens";
import { belowFoldImageProps } from "@/lib/image-loading-props";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type MarketingStoryFoundersVoiceBannerProps = {
  locale: string;
};

const FOUNDER_BANNER_STYLE = {
  ["--story-founder-banner-radius" as string]: STORY_PAGE_LAYOUT.founderBannerRadius,
  ["--story-founder-banner-margin-top" as string]: STORY_PAGE_LAYOUT.founderBannerMarginTop,
  ["--story-founder-banner-margin-top-mobile" as string]: STORY_PAGE_LAYOUT.founderBannerMarginTopMobile,
  ["--story-founder-banner-bg" as string]: STORY_PAGE_SURFACE.founderBannerBackground,
  ["--story-founder-banner-portrait-radius" as string]: STORY_PAGE_LAYOUT.founderBannerPortraitRadius,
  ["--story-founder-banner-eyebrow" as string]: STORY_PAGE_SURFACE.founderBannerEyebrow,
  ["--story-founder-banner-heading" as string]: STORY_PAGE_SURFACE.heading,
  ["--story-founder-banner-accent" as string]: STORY_PAGE_SURFACE.accent,
} as const;

/** Founder's Voice quote card — portrait + founder message. */
export async function MarketingStoryFoundersVoiceBanner({
  locale,
}: MarketingStoryFoundersVoiceBannerProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.story" });

  return (
    <StoryPageReveal index={0}>
      <article
        className={`${marketingMontserrat.variable} ${styles.card}`}
        style={FOUNDER_BANNER_STYLE}
        aria-labelledby="story-founder-voice-heading"
      >
        <div className={styles.portraitWrap}>
          <Image
            src={STORY_PAGE_ASSETS.founderPortrait}
            alt={t("founderVoicePortraitAlt")}
            fill
            unoptimized
            sizes="(max-width: 767px) 100vw, (max-width: 1440px) 42vw, 36rem"
            className={styles.portrait}
            {...belowFoldImageProps()}
          />
        </div>
        <div className={styles.copy}>
          <div className={styles.eyebrowWrap}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            <p id="story-founder-voice-heading" className={styles.eyebrow}>
              {t("founderVoiceEyebrow")}
            </p>
          </div>
          <blockquote className={styles.quote}>
            <p className={styles.quoteLead}>{t("founderVoiceQuoteLead")}</p>
            <p className={styles.quoteEmphasis}>{t("founderVoiceQuoteEmphasis")}</p>
          </blockquote>
        </div>
      </article>
    </StoryPageReveal>
  );
}
