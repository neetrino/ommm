"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { HOME_HERO_ASSETS } from "@/components/marketing/home/home-hero-banner-tokens";
import {
  resolveActiveHomeHeroVideoElement,
  useHomeHeroSlide,
} from "@/components/marketing/home/home-hero-slide-context";
import { HomeHeroVideoSlot } from "@/components/marketing/home/home-hero-video-slot";
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
  const slide = useHomeHeroSlide();
  const {
    activeSlide,
    activeView,
    trackOffset,
    desktopVideoUrl,
    mobileVideoUrl,
    videoLeftRefs,
    videoRightRefs,
    onVideoEnded,
    isVideoActive,
    normalizePhotoToCenter,
  } = slide;
  const [skipTransition, setSkipTransition] = useState(false);

  useEffect(() => {
    if (!isVideoActive || activeView.kind !== "video") {
      return;
    }
    const video = resolveActiveHomeHeroVideoElement(activeView.entry, slide);
    if (!video) {
      return;
    }
    const playFromStart = () => {
      video.currentTime = 0;
      void video.play().catch(() => {
        /* Autoplay may be blocked until user gesture. */
      });
    };
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      playFromStart();
      return;
    }
    video.addEventListener("loadeddata", playFromStart, { once: true });
    video.load();
    return () => {
      video.removeEventListener("loadeddata", playFromStart);
    };
  }, [activeView, desktopVideoUrl, isVideoActive, mobileVideoUrl, slide]);

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
          <HomeHeroVideoSlot
            desktopVideoUrl={desktopVideoUrl}
            mobileVideoUrl={mobileVideoUrl}
            desktopRef={videoLeftRefs.desktop}
            mobileRef={videoLeftRefs.mobile}
            autoPlay
            onEnded={onVideoEnded}
          />
        </div>
        <HomeHeroPhotoSlide imageAlt={imageAlt} />
        <div className={styles.homeHeroMediaSlide}>
          <HomeHeroVideoSlot
            desktopVideoUrl={desktopVideoUrl}
            mobileVideoUrl={mobileVideoUrl}
            desktopRef={videoRightRefs.desktop}
            mobileRef={videoRightRefs.mobile}
            onEnded={onVideoEnded}
          />
        </div>
        <HomeHeroPhotoSlide imageAlt={imageAlt} />
      </div>
    </div>
  );
}
