"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { HOME_HERO_ASSETS } from "@/components/marketing/home/home-hero-banner-tokens";
import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";
import { useOptionalHomeHeroSlide } from "@/components/marketing/home/home-hero-slide-context";
import { useCrossfadeVideoLoop } from "@/components/marketing/home/use-crossfade-video-loop";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { aboveFoldImageProps } from "@/lib/image-loading-props";

type HomeHeroLogoMarkVideoProps = {
  alt: string;
};

type HomeHeroLogoVideoLayerProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  onError: () => void;
};

function HomeHeroLogoVideoLayer({ videoRef, onError }: HomeHeroLogoVideoLayerProps) {
  return (
    <video
      ref={videoRef}
      className={styles.homeHeroLogoVideoLayer}
      src={HOME_HERO_ASSETS.heroLogoMarkVideo}
      muted
      playsInline
      preload="auto"
      aria-hidden
      onError={onError}
    />
  );
}

function HomeHeroLogoMarkFallback({ alt }: HomeHeroLogoMarkVideoProps) {
  return (
    <div className={`${styles.homeHeroLogoMark} tablet:mb-1 tablet:shrink-0`}>
      <div className={styles.homeHeroLogoInner}>
        <div className={styles.homeHeroLogoCrop}>
          <Image
            src={HOME_HERO_ASSETS.logoMark}
            alt={alt}
            fill
            sizes="(max-width: 743px) 61vw, 21rem"
            className={styles.homeHeroLogoImage}
            {...aboveFoldImageProps()}
          />
        </div>
      </div>
    </div>
  );
}

/** Rotating OMMM mark on the legacy meditation hero slide — replaces the static logo image. */
export function HomeHeroLogoMarkVideo({ alt }: HomeHeroLogoMarkVideoProps) {
  const slide = useOptionalHomeHeroSlide();
  const isActive = slide ? slide.isLegacyPhotoActive : true;
  const reducedMotion = usePrefersReducedMotion();
  const primaryRef = useRef<HTMLVideoElement>(null);
  const secondaryRef = useRef<HTMLVideoElement>(null);
  const [useFallback, setUseFallback] = useState(false);
  const isPlaying = isActive && !reducedMotion && !useFallback;

  const handleVideoError = useCallback(() => {
    setUseFallback(true);
  }, []);

  useCrossfadeVideoLoop(isPlaying, { primary: primaryRef, secondary: secondaryRef });

  useEffect(() => {
    if (!reducedMotion || useFallback) {
      return;
    }
    const video = primaryRef.current;
    if (!video) {
      return;
    }
    video.pause();
    video.currentTime = 0;
  }, [isActive, reducedMotion, useFallback]);

  if (useFallback) {
    return <HomeHeroLogoMarkFallback alt={alt} />;
  }

  return (
    <div
      className={`${styles.homeHeroLogoMark} ${styles.homeHeroLogoMarkVideo} tablet:mb-1 tablet:shrink-0`}
      aria-label={alt}
    >
      <div className={styles.homeHeroLogoInner}>
        <div className={styles.homeHeroLogoCrop}>
          <div className={styles.homeHeroLogoVideoStack}>
            <HomeHeroLogoVideoLayer videoRef={primaryRef} onError={handleVideoError} />
            {reducedMotion ? null : (
              <HomeHeroLogoVideoLayer videoRef={secondaryRef} onError={handleVideoError} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
