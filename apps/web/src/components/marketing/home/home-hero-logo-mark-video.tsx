"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { HOME_HERO_ASSETS } from "@/components/marketing/home/home-hero-banner-tokens";
import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";
import { useOptionalHomeHeroSlide } from "@/components/marketing/home/home-hero-slide-context";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { aboveFoldImageProps } from "@/lib/image-loading-props";

type HomeHeroLogoMarkVideoProps = {
  alt: string;
};

function configureSafariSafePlayback(video: HTMLVideoElement): void {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [useFallback, setUseFallback] = useState(false);
  const shouldPlay = isActive && !reducedMotion && !useFallback;

  const handleVideoError = useCallback(() => {
    setUseFallback(true);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    configureSafariSafePlayback(video);

    if (!shouldPlay) {
      video.pause();
      return;
    }

    const playFromStart = (): void => {
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
  }, [shouldPlay]);

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
            <video
              ref={videoRef}
              className={styles.homeHeroLogoVideoLayer}
              src={HOME_HERO_ASSETS.heroLogoMarkVideo}
              muted
              loop
              autoPlay
              playsInline
              preload="auto"
              aria-hidden
              onError={handleVideoError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
