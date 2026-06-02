import type { CSSProperties } from "react";
import Image from "next/image";
import styles from "@/components/marketing/home/home-package-plan-card.module.css";
import {
  HOME_PLANS_SECTION_FIGMA,
  HOME_PLANS_SECTION_LAYOUT,
  HOME_PLANS_SECTION_ASSETS,
} from "@/components/marketing/home/home-plans-section-tokens";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { belowFoldImageProps } from "@/lib/image-loading-props";
import { Link } from "@/i18n/navigation";

export type HomePackagePlanCardProps = {
  planName: string;
  details: string;
  price: string;
  ctaAria: string;
};

function planCardStyleVars(): CSSProperties {
  return {
    ["--home-plan-card-max-width" as string]: `${HOME_PLANS_SECTION_LAYOUT.cardWidthPx}px`,
    ["--home-plan-card-radius" as string]: `${HOME_PLANS_SECTION_FIGMA.cardRadiusPx}px`,
    ["--home-plan-card-fallback-bg" as string]: HOME_PLANS_SECTION_FIGMA.cardFallbackBg,
    ["--home-plan-glass-fill" as string]: HOME_PLANS_SECTION_FIGMA.cardGlassFill,
    ["--home-plan-glass-tint" as string]: HOME_PLANS_SECTION_FIGMA.cardGlassTint,
    ["--home-plan-glass-border" as string]: HOME_PLANS_SECTION_FIGMA.cardGlassBorder,
    ["--home-plan-glass-highlight" as string]: HOME_PLANS_SECTION_FIGMA.cardGlassHighlight,
    ["--home-plan-glass-blur" as string]: `${HOME_PLANS_SECTION_FIGMA.cardGlassBlurPx}px`,
    ["--home-plan-glass-height" as string]: `${HOME_PLANS_SECTION_LAYOUT.cardGlassHeightPx}px`,
    ["--home-plan-glass-overhang" as string]: `${HOME_PLANS_SECTION_LAYOUT.cardGlassOverhangPx}px`,
    ["--home-plan-category-color" as string]: HOME_PLANS_SECTION_FIGMA.categoryColor,
    ["--home-plan-price-color" as string]: HOME_PLANS_SECTION_FIGMA.priceColor,
    ["--home-plan-row-max-width" as string]: `${HOME_PLANS_SECTION_LAYOUT.contentMaxWidthPx}px`,
    ["--home-plan-cards-gap" as string]: `${HOME_PLANS_SECTION_LAYOUT.cardsGapPx}px`,
  };
}

/** Figma package card **Frame 66** `62:2351` inside Packages `196:1256`. */
export function HomePackagePlanCard({
  planName,
  details,
  price,
  ctaAria,
}: HomePackagePlanCardProps) {
  return (
    <Link
      href="/packages"
      aria-label={ctaAria}
      className={`${marketingMontserrat.variable} ${styles.card} group`}
      style={planCardStyleVars()}
    >
      <div className={styles.cardMedia}>
        <Image
          src={HOME_PLANS_SECTION_ASSETS.cardBackground}
          alt=""
          fill
          sizes="(max-width: 1332px) 33vw, 404px"
          className={styles.image}
          {...belowFoldImageProps()}
        />
        <p className={styles.category}>{planName}</p>
      </div>

      <div className={styles.priceGlass}>
        <span className={styles.priceGlassBlurPlate} aria-hidden>
          <span className={styles.priceGlassBlurFrame}>
            <Image
              src={HOME_PLANS_SECTION_ASSETS.cardBackground}
              alt=""
              fill
              sizes="(max-width: 1332px) 33vw, 404px"
              className={styles.priceGlassBlurImage}
              {...belowFoldImageProps()}
            />
          </span>
        </span>
        <div className={`${marketingMontserrat.className} ${styles.priceGlassContent}`}>
          <div className={styles.priceCopy}>
            <p className={styles.details}>{details}</p>
            <p className={styles.price}>{price}</p>
          </div>
          <span className={styles.ctaFab} aria-hidden>
            <Image
              src={HOME_PLANS_SECTION_ASSETS.cardFab}
              alt=""
              width={HOME_PLANS_SECTION_LAYOUT.ctaIconSizePx}
              height={HOME_PLANS_SECTION_LAYOUT.ctaIconSizePx}
              unoptimized
              className={styles.ctaFabImage}
            />
          </span>
        </div>
      </div>
    </Link>
  );
}

export type HomePackagePlanCardsRowProps = {
  cards: readonly HomePackagePlanCardProps[];
};

/** Three package cards in one fluid row — no horizontal scroll. */
export function HomePackagePlanCardsRow({ cards }: HomePackagePlanCardsRowProps) {
  return (
    <div className={styles.cardsRow} style={planCardStyleVars()}>
      {cards.map((card, index) => (
        <HomePackagePlanCard key={`plan-card-${index}`} {...card} />
      ))}
    </div>
  );
}
