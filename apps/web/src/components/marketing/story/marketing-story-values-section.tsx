import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { MarketingPageSectionReveal } from "@/components/marketing/marketing-page-section-reveal";
import styles from "@/components/marketing/story/marketing-story-values-section.module.css";
import { STORY_PAGE_ASSETS } from "@/components/marketing/story/story-page-assets";
import { STORY_PAGE_LAYOUT, STORY_PAGE_SURFACE } from "@/components/marketing/story/story-page-tokens";
import { belowFoldImageProps } from "@/lib/image-loading-props";

type MarketingStoryValuesSectionProps = {
  locale: string;
};

type ValueCardConfig = {
  titleKey: "valuePeaceTitle" | "valueStrengthTitle" | "valueCommunityTitle";
  bodyKey: "valuePeaceBody" | "valueStrengthBody" | "valueCommunityBody";
  imageSrc: string;
  imageClassName?: string;
};

const VALUE_CARDS: ValueCardConfig[] = [
  {
    titleKey: "valuePeaceTitle",
    bodyKey: "valuePeaceBody",
    imageSrc: STORY_PAGE_ASSETS.valuesPeacefulMind,
    imageClassName: styles.imagePeace,
  },
  {
    titleKey: "valueStrengthTitle",
    bodyKey: "valueStrengthBody",
    imageSrc: STORY_PAGE_ASSETS.valuesStrength,
    imageClassName: styles.imageStrength,
  },
  {
    titleKey: "valueCommunityTitle",
    bodyKey: "valueCommunityBody",
    imageSrc: STORY_PAGE_ASSETS.valuesCommunity,
    imageClassName: styles.imageCommunity,
  },
];

/** Three-column values grid. */
export async function MarketingStoryValuesSection({ locale }: MarketingStoryValuesSectionProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.story" });

  return (
    <MarketingPageSectionReveal index={2}>
      <section className={styles.section} aria-labelledby="story-values-heading">
        <div className={styles.header}>
          <h2 id="story-values-heading" className={styles.eyebrow}>
            {t("valuesHeading")}
          </h2>
          <div
            className={styles.line}
            style={{ ["--story-values-line" as string]: STORY_PAGE_SURFACE.valuesLine }}
          />
        </div>
        <ul
          className={styles.grid}
          style={{
            ["--story-card-radius" as string]: STORY_PAGE_LAYOUT.cardRadius,
            ["--story-card-bg" as string]: STORY_PAGE_SURFACE.cardBackground,
            ["--story-values-gap" as string]: STORY_PAGE_LAYOUT.valuesGridGap,
          }}
        >
          {VALUE_CARDS.map((card) => (
            <li key={card.titleKey}>
              <article className={styles.card}>
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
                <div className={styles.copy}>
                  <h3 className={styles.title}>{t(card.titleKey)}</h3>
                  <p className={styles.body}>{t(card.bodyKey)}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </MarketingPageSectionReveal>
  );
}
