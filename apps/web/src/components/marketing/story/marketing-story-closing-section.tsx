import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MarketingPageSectionReveal } from "@/components/marketing/marketing-page-section-reveal";
import styles from "@/components/marketing/story/marketing-story-closing-section.module.css";
import { STORY_PAGE_ASSETS } from "@/components/marketing/story/story-page-assets";
import { STORY_PAGE_LAYOUT, STORY_PAGE_SURFACE } from "@/components/marketing/story/story-page-tokens";
import { belowFoldImageProps } from "@/lib/image-loading-props";

type MarketingStoryClosingSectionProps = {
  locale: string;
};

/** Closing card — name meaning and welcome line. */
export async function MarketingStoryClosingSection({ locale }: MarketingStoryClosingSectionProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.story" });

  return (
    <MarketingPageSectionReveal index={3}>
      <article
        className={styles.card}
        style={{
          ["--story-card-radius" as string]: STORY_PAGE_LAYOUT.cardRadius,
          ["--story-card-bg" as string]: STORY_PAGE_SURFACE.cardBackgroundAlt,
          ["--story-accent" as string]: STORY_PAGE_SURFACE.accent,
        }}
        aria-labelledby="story-closing-heading"
      >
        <div className={styles.portraitWrap}>
          <Image
            src={STORY_PAGE_ASSETS.closingPortrait}
            alt=""
            fill
            sizes="(max-width: 899px) 100vw, 18rem"
            className={styles.portrait}
            {...belowFoldImageProps()}
          />
        </div>
        <div className={styles.copy}>
          <h2 id="story-closing-heading" className={styles.title}>
            {t("closingTitle")}
          </h2>
          <p className={styles.body}>{t("closingBody")}</p>
          <p className={styles.callout}>{t("closingCallout")}</p>
          <p className={styles.signoff}>{t("closingSignoff")}</p>
        </div>
        <div className={styles.decorWrap} aria-hidden="true">
          <Image
            src={STORY_PAGE_ASSETS.closingDecor}
            alt=""
            width={96}
            height={240}
            className={styles.decor}
            {...belowFoldImageProps()}
          />
        </div>
      </article>
    </MarketingPageSectionReveal>
  );
}
