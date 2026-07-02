"use client";

import Image from "next/image";
import { useEffect } from "react";
import { HOME_HERO_ASSETS } from "@/components/marketing/home/home-hero-banner-tokens";
import { useHomeHeroSlide } from "@/components/marketing/home/home-hero-slide-context";
import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";
import { lcpImageProps } from "@/lib/image-loading-props";

type HomeHeroMediaBackgroundProps = {
  imageAlt: string;
};

/** Sliding hero media — intro video (R2) then static photo background. */
export function HomeHeroMediaBackground({ imageAlt }: HomeHeroMediaBackgroundProps) {
  const { activeSlide, videoUrl, videoRef, onVideoEnded, isVideoActive } = useHomeHeroSlide();

  useEffect(() => {
    if (!isVideoActive) {
      return;
    }
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.currentTime = 0;
    void video.play().catch(() => {
      /* Autoplay may be blocked until user gesture. */
    });
  }, [isVideoActive, videoRef, videoUrl]);

  return (
    <div
      className={styles.homeHeroBackgroundLayer}
      aria-hidden
      data-hero-slide={activeSlide}
    >
      <div
        className={`${styles.homeHeroMediaTrack} ${activeSlide === "photo" ? styles.homeHeroMediaTrackPhoto : ""}`}
      >
        <div className={styles.homeHeroMediaSlide}>
          <video
            ref={videoRef}
            className={styles.homeHeroVideo}
            src={videoUrl}
            muted
            playsInline
            preload="auto"
            onEnded={onVideoEnded}
          />
        </div>
        <div className={styles.homeHeroMediaSlide}>
          <div className={styles.homeHeroBackgroundCrop}>
            <Image
              src={HOME_HERO_ASSETS.backgroundImage}
              alt={imageAlt}
              fill
              sizes="100vw"
              className={`${styles.homeHeroBackground} pointer-events-none object-cover`}
              {...lcpImageProps()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
