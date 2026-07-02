"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { HOME_HERO_ASSETS } from "@/components/marketing/home/home-hero-banner-tokens";
import { useHomeHeroSlide } from "@/components/marketing/home/home-hero-slide-context";
import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";
import { lcpImageProps } from "@/lib/image-loading-props";

type HomeHeroMediaBackgroundProps = {
  imageAlt: string;
};

type HomeHeroPhotoSlideProps = {
  imageAlt: string;
};

function HomeHeroPhotoSlide({ imageAlt }: HomeHeroPhotoSlideProps) {
  return (
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
  );
}

/** Sliding hero media — intro video (R2) then static photo background. */
export function HomeHeroMediaBackground({ imageAlt }: HomeHeroMediaBackgroundProps) {
  const {
    activeSlide,
    activeView,
    trackOffset,
    videoUrl,
    videoLeftRef,
    videoRightRef,
    onVideoEnded,
    isVideoActive,
    normalizePhotoToCenter,
  } = useHomeHeroSlide();
  const [skipTransition, setSkipTransition] = useState(false);

  useEffect(() => {
    if (!isVideoActive || activeView.kind !== "video") {
      return;
    }
    const video =
      activeView.entry === "left" ? videoLeftRef.current : videoRightRef.current;
    if (!video) {
      return;
    }
    video.currentTime = 0;
    void video.play().catch(() => {
      /* Autoplay may be blocked until user gesture. */
    });
  }, [activeView, isVideoActive, videoLeftRef, videoRightRef, videoUrl]);

  const handleTrackTransitionEnd = useCallback(
    (event: React.TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || event.propertyName !== "transform") {
        return;
      }
      if (activeView.kind !== "photo" || activeView.entry === "center") {
        return;
      }
      setSkipTransition(true);
      normalizePhotoToCenter();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSkipTransition(false);
        });
      });
    },
    [activeView, normalizePhotoToCenter],
  );

  return (
    <div
      className={styles.homeHeroBackgroundLayer}
      aria-hidden
      data-hero-slide={activeSlide}
    >
      <div
        className={`${styles.homeHeroMediaTrack} ${skipTransition ? styles.homeHeroMediaTrackNoTransition : ""}`}
        style={{ ["--home-hero-track-offset" as string]: trackOffset }}
        onTransitionEnd={handleTrackTransitionEnd}
      >
        <HomeHeroPhotoSlide imageAlt={imageAlt} />
        <div className={styles.homeHeroMediaSlide}>
          <video
            ref={videoLeftRef}
            className={styles.homeHeroVideo}
            src={videoUrl}
            muted
            playsInline
            preload="auto"
            onEnded={onVideoEnded}
          />
        </div>
        <HomeHeroPhotoSlide imageAlt={imageAlt} />
        <div className={styles.homeHeroMediaSlide}>
          <video
            ref={videoRightRef}
            className={styles.homeHeroVideo}
            src={videoUrl}
            muted
            playsInline
            preload="auto"
            onEnded={onVideoEnded}
          />
        </div>
        <HomeHeroPhotoSlide imageAlt={imageAlt} />
      </div>
    </div>
  );
}
