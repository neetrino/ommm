"use client";

import type { ReactNode } from "react";
import { useHomeHeroSlide } from "@/components/marketing/home/home-hero-slide-context";
import styles from "@/components/marketing/home/home-hero-promo-content-layer.module.css";

type HomeHeroPromoContentLayerProps = {
  children: ReactNode;
};

/** Founding-membership copy over Figma `783:800` photo — slide 3 only. */
export function HomeHeroPromoContentLayer({ children }: HomeHeroPromoContentLayerProps) {
  const { isPromoBannerActive } = useHomeHeroSlide();

  if (!isPromoBannerActive) {
    return null;
  }

  return (
    <div className={styles.promoContentLayer}>
      <div className={styles.promoContentInner}>{children}</div>
    </div>
  );
}
