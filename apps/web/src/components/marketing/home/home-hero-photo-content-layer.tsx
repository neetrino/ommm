"use client";

import type { ReactNode } from "react";
import { useHomeHeroSlide } from "@/components/marketing/home/home-hero-slide-context";
import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";

type HomeHeroPhotoContentLayerProps = {
  children: ReactNode;
};

/** Fades hero copy/CTAs in on the legacy photo slide; hidden during video and promo banners. */
export function HomeHeroPhotoContentLayer({ children }: HomeHeroPhotoContentLayerProps) {
  const { isPhotoActive, isPromoBannerActive } = useHomeHeroSlide();

  if (isPromoBannerActive) {
    return null;
  }

  return (
    <div
      className={`${styles.homeHeroPhotoContentLayer} ${isPhotoActive ? styles.homeHeroPhotoContentVisible : ""}`}
      aria-hidden={!isPhotoActive}
    >
      {children}
    </div>
  );
}
