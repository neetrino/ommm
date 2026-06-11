import Image from "next/image";
import { getTranslations } from "next-intl/server";
import styles from "@/components/marketing/explore/marketing-explore-coming-soon.module.css";
import { EXPLORE_PAGE_ASSETS } from "@/components/marketing/explore/explore-page-assets";
import { EXPLORE_PAGE_LAYOUT } from "@/components/marketing/explore/explore-page-tokens";
import { lcpImageProps } from "@/lib/image-loading-props";

type MarketingExploreComingSoonProps = {
  locale: string;
};

/** Full-bleed coming soon — fluted glass background, Figma `422:1810` title with `301:399` logos. */
export async function MarketingExploreComingSoon({
  locale,
}: MarketingExploreComingSoonProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.explore" });
  const headingLine1 = t("comingSoonHeadingLine1");
  const headingLine2Start = t("comingSoonHeadingLine2Start");
  const headingLine2End = t("comingSoonHeadingLine2End");
  const showSplitSoonLine = headingLine2Start.length > 0 || headingLine2End.length > 0;

  return (
    <div
      className={styles.root}
      style={{
        ["--explore-title-color" as string]: EXPLORE_PAGE_LAYOUT.titleColor,
        ["--explore-artboard-width-px" as string]: String(EXPLORE_PAGE_LAYOUT.artboardWidthPx),
        ["--explore-title-font-size-px" as string]: String(EXPLORE_PAGE_LAYOUT.titleFontSizePx),
        ["--explore-title-font-weight" as string]: String(EXPLORE_PAGE_LAYOUT.titleFontWeight),
        ["--explore-title-line-gap" as string]: `${EXPLORE_PAGE_LAYOUT.titleLineGapEm}em`,
        ["--explore-inline-logo-width-ratio" as string]: String(
          EXPLORE_PAGE_LAYOUT.inlineLogoWidthRatio,
        ),
        ["--explore-inline-logo-height-ratio" as string]: String(
          EXPLORE_PAGE_LAYOUT.inlineLogoHeightRatio,
        ),
        ["--explore-inline-logo-radius-ratio" as string]: String(
          EXPLORE_PAGE_LAYOUT.inlineLogoBorderRadiusRatio,
        ),
        ["--explore-inline-logo-gap" as string]: `${EXPLORE_PAGE_LAYOUT.inlineLogoGapPx}px`,
        ["--explore-page-content-inset-min" as string]: `${EXPLORE_PAGE_LAYOUT.contentInsetMinPx}px`,
        ["--explore-page-content-inset-vw" as string]: `${EXPLORE_PAGE_LAYOUT.contentInsetVw}vw`,
        ["--explore-page-content-inset-max" as string]: `${EXPLORE_PAGE_LAYOUT.contentInsetMaxPx}px`,
        ["--explore-title-nudge-x" as string]: `${EXPLORE_PAGE_LAYOUT.titleNudgeXPx}px`,
        ["--explore-title-nudge-y" as string]: `${EXPLORE_PAGE_LAYOUT.titleNudgeYPx}px`,
        ["--explore-page-enter-bg-duration" as string]: `${EXPLORE_PAGE_LAYOUT.backgroundDurationMs}ms`,
        ["--explore-page-enter-title-duration" as string]: `${EXPLORE_PAGE_LAYOUT.titleDurationMs}ms`,
        ["--explore-page-enter-title-delay" as string]: `${EXPLORE_PAGE_LAYOUT.titleDelayMs}ms`,
        ["--explore-page-enter-title-offset" as string]: `${EXPLORE_PAGE_LAYOUT.titleOffsetPx}px`,
        ["--explore-page-title-float-amplitude" as string]: `${EXPLORE_PAGE_LAYOUT.amplitudePx}px`,
        ["--explore-page-title-float-duration" as string]: `${EXPLORE_PAGE_LAYOUT.durationMs}ms`,
        ["--explore-page-title-float-start-delay" as string]: `${EXPLORE_PAGE_LAYOUT.startDelayAfterEnterMs}ms`,
        ["--explore-inline-logo-enter-delay" as string]: `${EXPLORE_PAGE_LAYOUT.titleDelayMs + EXPLORE_PAGE_LAYOUT.titleDurationMs + EXPLORE_PAGE_LAYOUT.enterDelayAfterTitleMs}ms`,
        ["--explore-inline-logo-enter-duration" as string]: `${EXPLORE_PAGE_LAYOUT.enterDurationMs}ms`,
        ["--explore-inline-logo-enter-stagger" as string]: `${EXPLORE_PAGE_LAYOUT.enterStaggerMs}ms`,
        ["--explore-inline-logo-enter-rise" as string]: `${EXPLORE_PAGE_LAYOUT.enterRisePx}px`,
        ["--explore-inline-logo-float-duration" as string]: `${EXPLORE_PAGE_LAYOUT.floatDurationMs}ms`,
        ["--explore-inline-logo-float-amplitude" as string]: `${EXPLORE_PAGE_LAYOUT.floatAmplitudePx}px`,
        ["--explore-inline-logo-float-glow-rgb" as string]: EXPLORE_PAGE_LAYOUT.floatGlowRgb,
        ["--explore-page-enter-reduced-duration" as string]: `${EXPLORE_PAGE_LAYOUT.reducedMotionDurationMs}ms`,
      }}
    >
      <Image
        src={EXPLORE_PAGE_ASSETS.comingSoonBackground}
        alt={t("comingSoonAlt")}
        fill
        priority
        sizes="100vw"
        className={styles.image}
        {...lcpImageProps()}
      />

      <div className={styles.overlay}>
        <h1 className={styles.title} aria-label={t("comingSoonTitle")}>
          <span className={styles.titleFloat}>
            <span className={styles.titleLine1}>{headingLine1}</span>
            {showSplitSoonLine ? (
              <span className={styles.titleLine2}>
                <span>{headingLine2Start}</span>
                <span className={styles.inlineLogoPair} aria-hidden>
                  <span className={`${styles.inlineLogo} ${styles.inlineLogoLead}`}>
                    <Image
                      src={EXPLORE_PAGE_ASSETS.inlineLogoO}
                      alt=""
                      fill
                      sizes="4rem"
                      className={styles.inlineLogoImage}
                    />
                  </span>
                  <span className={`${styles.inlineLogo} ${styles.inlineLogoTrail}`}>
                    <Image
                      src={EXPLORE_PAGE_ASSETS.inlineLogoO}
                      alt=""
                      fill
                      sizes="4rem"
                      className={styles.inlineLogoImage}
                    />
                  </span>
                </span>
                <span>{headingLine2End}</span>
              </span>
            ) : null}
          </span>
        </h1>
      </div>
    </div>
  );
}
