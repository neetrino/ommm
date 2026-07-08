"use client";

import Image from "next/image";
import { useEffect } from "react";
import { HOME_HERO_ASSETS } from "@/components/marketing/home/home-hero-banner-tokens";
import {
  HOME_HERO_CAROUSEL_SLIDES,
  resolveActiveHomeHeroVideoElement,
  type HomeHeroPromoBannerKey,
  useHomeHeroSlide,
} from "@/components/marketing/home/home-hero-slide-context";
import { HomeHeroVideoSlot } from "@/components/marketing/home/home-hero-video-slot";
import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";
import { aboveFoldImageProps, lcpImageProps } from "@/lib/image-loading-props";

type HomeHeroMediaBackgroundProps = {
  heroImageAlt: string;
  promoBannerAlt: string;
};

type HomeHeroLegacyPhotoSlideProps = {
  imageAlt: string;
};

function HomeHeroLegacyPhotoSlide({ imageAlt }: HomeHeroLegacyPhotoSlideProps) {
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

type HomeHeroPromoBannerSlideProps = {
  assetKey: HomeHeroPromoBannerKey;
  imageAlt: string;
};

function resolvePromoBannerSources(assetKey: HomeHeroPromoBannerKey): {
  desktop: string;
  mobile: string;
} {
  if (assetKey === "promoBanner3") {
    return {
      desktop: HOME_HERO_ASSETS.promoBanner3,
      mobile: HOME_HERO_ASSETS.promoBanner3Mobile,
    };
  }
  return {
    desktop: HOME_HERO_ASSETS.promoBanner3,
    mobile: HOME_HERO_ASSETS.promoBanner3Mobile,
  };
}

function HomeHeroPromoBannerSlide({ assetKey, imageAlt }: HomeHeroPromoBannerSlideProps) {
  const sources = resolvePromoBannerSources(assetKey);

  return (
    <div className={styles.homeHeroMediaSlide}>
      <div className={styles.homeHeroPromoBackgroundCrop}>
        <Image
          key={sources.mobile}
          src={sources.mobile}
          alt={imageAlt}
          fill
          unoptimized
          sizes="100vw"
          className={`${styles.homeHeroPromoBackground} ${styles.homeHeroPromoBackgroundMobile} pointer-events-none`}
          {...aboveFoldImageProps()}
        />
        <Image
          src={sources.desktop}
          alt=""
          fill
          unoptimized
          sizes="100vw"
          className={`${styles.homeHeroPromoBackground} ${styles.homeHeroPromoBackgroundDesktop} pointer-events-none`}
          aria-hidden
          {...aboveFoldImageProps()}
        />
      </div>
    </div>
  );
}

/** Hero carousel — intro video, promo banner, then legacy meditation hero. */
export function HomeHeroMediaBackground({
  heroImageAlt,
  promoBannerAlt,
}: HomeHeroMediaBackgroundProps) {
  const slide = useHomeHeroSlide();
  const {
    activeSlide,
    activeSlideIndex,
    trackOffset,
    desktopVideoUrl,
    mobileVideoUrl,
    mobileVideoMp4Url,
    videoRefs,
    onVideoEnded,
    onVideoError,
    isVideoActive,
  } = slide;

  useEffect(() => {
    if (!isVideoActive) {
      return;
    }
    const video = resolveActiveHomeHeroVideoElement(slide);
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
  }, [activeSlideIndex, desktopVideoUrl, isVideoActive, mobileVideoMp4Url, mobileVideoUrl, slide]);

  return (
    <div
      className={styles.homeHeroBackgroundLayer}
      aria-hidden
      data-hero-slide={activeSlide.kind}
      data-hero-slide-index={activeSlideIndex}
    >
      <div
        className={styles.homeHeroMediaTrack}
        style={{ ["--home-hero-track-offset" as string]: trackOffset }}
      >
        {HOME_HERO_CAROUSEL_SLIDES.map((carouselSlide, index) => {
          if (carouselSlide.kind === "video") {
            return (
              <div key={`hero-slide-${index}`} className={styles.homeHeroMediaSlide}>
                <HomeHeroVideoSlot
                  desktopVideoUrl={desktopVideoUrl}
                  mobileVideoUrl={mobileVideoUrl}
                  mobileVideoMp4Url={mobileVideoMp4Url}
                  desktopRef={videoRefs.desktop}
                  mobileRef={videoRefs.mobile}
                  autoPlay={activeSlideIndex === index}
                  onEnded={onVideoEnded}
                  onError={onVideoError}
                />
              </div>
            );
          }
          if (carouselSlide.kind === "legacy-photo") {
            return (
              <HomeHeroLegacyPhotoSlide key={`hero-slide-${index}`} imageAlt={heroImageAlt} />
            );
          }
          return (
            <HomeHeroPromoBannerSlide
              key={`hero-slide-${index}`}
              assetKey={carouselSlide.assetKey}
              imageAlt={promoBannerAlt}
            />
          );
        })}
      </div>
    </div>
  );
}
