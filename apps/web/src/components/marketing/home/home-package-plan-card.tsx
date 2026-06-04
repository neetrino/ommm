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
  priceAmount: string;
  priceFromPrefix?: string;
  ctaAria: string;
};

type HomePackagePlanCardPriceCopyProps = Pick<
  HomePackagePlanCardProps,
  "details" | "priceAmount" | "priceFromPrefix"
>;

export function HomePackagePlanCardPriceCopy({
  details,
  priceAmount,
  priceFromPrefix,
}: HomePackagePlanCardPriceCopyProps) {
  return (
    <div className={styles.priceCopy}>
      <p className={styles.details}>{details}</p>
      {priceFromPrefix !== undefined ? (
        <>
          <p className={styles.priceFromPrefix}>{priceFromPrefix}</p>
          <p className={styles.price}>{priceAmount}</p>
        </>
      ) : (
        <p className={styles.price}>{priceAmount}</p>
      )}
    </div>
  );
}

function planCardStyleVars(): CSSProperties {
  return {
    ["--home-plan-card-max-width" as string]: `${HOME_PLANS_SECTION_LAYOUT.cardWidthPx}px`,
    ["--home-plan-card-aspect-ratio" as string]: `${HOME_PLANS_SECTION_LAYOUT.cardWidthPx} / ${HOME_PLANS_SECTION_LAYOUT.cardHeightPx}`,
    ["--home-plan-card-radius" as string]: `${HOME_PLANS_SECTION_FIGMA.cardRadiusPx}px`,
    ["--home-plan-card-fallback-bg" as string]: HOME_PLANS_SECTION_FIGMA.cardFallbackBg,
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
  priceAmount,
  priceFromPrefix,
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
        <div className={styles.imageCrop}>
          <div className={styles.imageFrame}>
            <Image
              src={HOME_PLANS_SECTION_ASSETS.cardBackground}
              alt=""
              fill
              sizes="(max-width: 1332px) 33vw, 404px"
              className={styles.image}
              {...belowFoldImageProps()}
            />
          </div>
        </div>
        <p className={styles.category}>{planName}</p>
      </div>

      <div className={styles.priceGlass}>
        <span aria-hidden className={styles.priceGlassBase} />
        <span aria-hidden className={styles.priceGlassRadial} />
        <span aria-hidden className={styles.priceGlassLinear} />
        <span aria-hidden className={styles.priceGlassSweep} />
        <div className={`${marketingMontserrat.className} ${styles.priceGlassContent}`}>
          <HomePackagePlanCardPriceCopy
            details={details}
            priceAmount={priceAmount}
            priceFromPrefix={priceFromPrefix}
          />
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
