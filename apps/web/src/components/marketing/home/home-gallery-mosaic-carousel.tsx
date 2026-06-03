"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import styles from "@/components/marketing/home/home-gallery-mosaic-carousel.module.css";
import {
  HOME_GALLERY_FIGMA,
  HOME_GALLERY_IPAD_AIR_LAYOUT,
  HOME_GALLERY_LAYOUT,
  HOME_GALLERY_SLIDES,
  HOME_GALLERY_TABLET_NAV_LAYOUT,
  type HomeGallerySlide,
  type HomeGalleryTileKey,
} from "@/components/marketing/home/home-gallery-section-tokens";
import { belowFoldImageProps } from "@/lib/image-loading-props";

const GALLERY_AUTO_ADVANCE_MS = 6000;

const TILE_CLASS: Record<HomeGalleryTileKey, string> = {
  leftTop: styles.tileLeftTop,
  leftBottom: styles.tileLeftBottom,
  center: styles.tileCenter,
  side: styles.tileSide,
};

const CONTAIN_TILE_KEYS: ReadonlySet<HomeGalleryTileKey> = new Set(["leftTop", "leftBottom", "side"]);

function galleryTileImageClass(key: HomeGalleryTileKey): string {
  return CONTAIN_TILE_KEYS.has(key) ? styles.tileImageContain : styles.tileImageCover;
}

type HomeGalleryMosaicCarouselProps = {
  prevLabel: string;
  nextLabel: string;
  getGoToSlideAria: (index: number) => string;
};

type GalleryNavArrowProps = {
  direction: "prev" | "next";
};

function GalleryNavArrow({ direction }: GalleryNavArrowProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 26 19"
      className={`${styles.navArrow} ${direction === "prev" ? styles.navArrowPrev : ""}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.25 7.95495C0.559644 7.95495 0 8.5146 0 9.20495C0 9.89531 0.559644 10.455 1.25 10.455V9.20495V7.95495ZM25.3017 10.0888C25.7898 9.60068 25.7898 8.80922 25.3017 8.32107L17.3467 0.366117C16.8586 -0.122039 16.0671 -0.122039 15.5789 0.366117C15.0908 0.854272 15.0908 1.64573 15.5789 2.13388L22.65 9.20495L15.5789 16.276C15.0908 16.7642 15.0908 17.5556 15.5789 18.0438C16.0671 18.5319 16.8586 18.5319 17.3467 18.0438L25.3017 10.0888ZM1.25 9.20495V10.455H24.4178V9.20495V7.95495H1.25V9.20495Z"
        fill="black"
      />
    </svg>
  );
}

function mosaicStyleVars(): CSSProperties {
  return {
    ["--home-gallery-mosaic-max-width" as string]: `${HOME_GALLERY_LAYOUT.contentMaxWidthPx}px`,
    ["--home-gallery-mosaic-gap" as string]: `${HOME_GALLERY_LAYOUT.mosaicGapPx}px`,
    ["--home-gallery-tile-radius" as string]: `${HOME_GALLERY_FIGMA.tileRadiusPx}px`,
    ["--home-gallery-nav-size" as string]: `${HOME_GALLERY_LAYOUT.navButtonSizePx}px`,
    ["--home-gallery-dot-size" as string]: `${HOME_GALLERY_LAYOUT.dotSizePx}px`,
    ["--home-gallery-dot-gap" as string]: `${HOME_GALLERY_LAYOUT.dotGapPx}px`,
    ["--home-gallery-dot-inactive" as string]: HOME_GALLERY_FIGMA.dotInactive,
    ["--home-gallery-dot-active" as string]: HOME_GALLERY_FIGMA.dotActive,
    ["--home-gallery-dots-offset" as string]: `${HOME_GALLERY_LAYOUT.mosaicToDotsGapPx}px`,
    ["--home-gallery-nav-size-air" as string]: `${HOME_GALLERY_IPAD_AIR_LAYOUT.navButtonSizePx}px`,
    ["--home-gallery-dot-size-air" as string]: `${HOME_GALLERY_IPAD_AIR_LAYOUT.dotSizePx}px`,
    ["--home-gallery-dot-gap-air" as string]: `${HOME_GALLERY_IPAD_AIR_LAYOUT.dotGapPx}px`,
    ["--home-gallery-dots-offset-air" as string]: `${HOME_GALLERY_IPAD_AIR_LAYOUT.mosaicToDotsGapPx}px`,
    ["--home-gallery-nav-edge-inset-tablet" as string]: `${HOME_GALLERY_TABLET_NAV_LAYOUT.buttonEdgeInsetPx}px`,
    ["--home-gallery-nav-prev-x-tablet" as string]: `-${HOME_GALLERY_TABLET_NAV_LAYOUT.buttonOutwardTranslatePercent}%`,
    ["--home-gallery-nav-next-x-tablet" as string]: `${HOME_GALLERY_TABLET_NAV_LAYOUT.buttonOutwardTranslatePercent}%`,
  };
}

function GalleryMosaicSlide({ slide }: { slide: HomeGallerySlide }) {
  return (
    <div className={styles.mosaic}>
      {(Object.keys(TILE_CLASS) as HomeGalleryTileKey[]).map((key) => {
        const tile = slide.tiles[key];
        return (
          <div key={key} className={`${styles.tile} ${TILE_CLASS[key]}`}>
            <Image
              src={tile.src}
              alt=""
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className={galleryTileImageClass(key)}
              {...belowFoldImageProps()}
            />
          </div>
        );
      })}
    </div>
  );
}

/** Figma Gallery mosaic `196:1163` with prev/next `196:1168` and dots `196:1175`. */
export function HomeGalleryMosaicCarousel({
  prevLabel,
  nextLabel,
  getGoToSlideAria,
}: HomeGalleryMosaicCarouselProps) {
  const slideCount = HOME_GALLERY_SLIDES.length;
  const lastIndex = Math.max(0, slideCount - 1);
  const [active, setActive] = useState(0);
  const [mountedSlides, setMountedSlides] = useState<ReadonlySet<number>>(() => new Set([0]));

  useEffect(() => {
    setMountedSlides((prev) => {
      if (prev.has(active)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(active);
      return next;
    });
  }, [active]);

  const goPrev = useCallback(() => {
    setActive((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const goNext = useCallback(() => {
    setActive((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (slideCount <= 1) {
      return;
    }
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const clearIntervalIfSet = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const armInterval = () => {
      clearIntervalIfSet();
      if (motionMq.matches) {
        return;
      }
      intervalId = setInterval(() => {
        if (document.visibilityState === "visible") {
          goNext();
        }
      }, GALLERY_AUTO_ADVANCE_MS);
    };

    armInterval();
    motionMq.addEventListener("change", armInterval);
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        clearIntervalIfSet();
      } else {
        armInterval();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      motionMq.removeEventListener("change", armInterval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearIntervalIfSet();
    };
  }, [active, goNext, slideCount]);

  return (
    <div style={mosaicStyleVars()}>
      <div className={styles.stage}>
        <div className={styles.viewport}>
          {HOME_GALLERY_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className={`${styles.slide} ${index === active ? styles.slideActive : ""}`}
              aria-hidden={index !== active}
            >
              {mountedSlides.has(index) ? <GalleryMosaicSlide slide={slide} /> : null}
            </div>
          ))}
        </div>
        <div className={styles.navRow}>
          <button
            type="button"
            className={styles.navButtonPrev}
            aria-label={prevLabel}
            onClick={goPrev}
          >
            <GalleryNavArrow direction="prev" />
          </button>
          <button
            type="button"
            className={styles.navButtonNext}
            aria-label={nextLabel}
            onClick={goNext}
          >
            <GalleryNavArrow direction="next" />
          </button>
        </div>
      </div>

      <div className={styles.dotsWrap}>
        <div className={styles.dots} role="tablist">
          {HOME_GALLERY_SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={getGoToSlideAria(index)}
              className={`${styles.dot} ${index === active ? styles.dotActive : ""}`}
              onClick={() => {
                setActive(Math.min(Math.max(0, index), lastIndex));
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
