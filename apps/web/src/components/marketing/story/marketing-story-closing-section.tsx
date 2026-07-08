import { getTranslations } from "next-intl/server";
import { StoryPageReveal } from "@/components/marketing/story/story-page-reveal";
import styles from "@/components/marketing/story/marketing-story-closing-section.module.css";
import { STORY_PAGE_ASSETS } from "@/components/marketing/story/story-page-assets";
import { STORY_PAGE_LAYOUT, STORY_PAGE_SURFACE } from "@/components/marketing/story/story-page-tokens";
import { Link } from "@/i18n/navigation";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";

type MarketingStoryClosingSectionProps = {
  locale: string;
};

/** Closing card — name meaning and welcome line. */
export async function MarketingStoryClosingSection({ locale }: MarketingStoryClosingSectionProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.story" });

  return (
    <StoryPageReveal index={0}>
      <article
        className={`${marketingMontserrat.variable} ${styles.card}`}
        style={{
          ["--story-card-radius" as string]: STORY_PAGE_LAYOUT.closingCardRadius,
          ["--story-card-bg" as string]: STORY_PAGE_SURFACE.closingBannerBackground,
          ["--story-card-shadow" as string]: STORY_PAGE_LAYOUT.storyCardShadow,
          ["--story-accent" as string]: STORY_PAGE_SURFACE.accent,
          ["--story-heading-color" as string]: STORY_PAGE_SURFACE.heading,
          ["--story-body-color" as string]: STORY_PAGE_SURFACE.body,
          ["--story-body-muted" as string]: STORY_PAGE_SURFACE.bodyMuted,
          ["--story-cta-bg" as string]: STORY_PAGE_LAYOUT.closingBannerCtaBackground,
          ["--story-cta-hover" as string]: STORY_PAGE_LAYOUT.closingBannerCtaHover,
        }}
        aria-labelledby="story-closing-heading"
      >
        <div className={styles.portraitWrap}>
          <img
            src={STORY_PAGE_ASSETS.closingPortrait}
            alt=""
            className={styles.portrait}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className={styles.copy}>
          <h2 id="story-closing-heading" className={styles.title}>
            {t("closingTitle")}
          </h2>
          <p className={styles.body}>{t("closingBody")}</p>
          <div className={styles.footerRow}>
            <div className={styles.footerCopy}>
              <p className={styles.callout}>{t("closingCallout")}</p>
              <p className={styles.signoff}>{t("closingSignoff")}</p>
            </div>
            <Link href="/package" className={styles.cta}>
              <span>{t("closingCta")}</span>
              <span className={styles.ctaArrow} aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </article>
    </StoryPageReveal>
  );
}
