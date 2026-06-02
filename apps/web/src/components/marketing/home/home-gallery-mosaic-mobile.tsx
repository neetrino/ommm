"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import styles from "@/components/marketing/home/home-gallery-mosaic-mobile.module.css";
import {
  HOME_GALLERY_MOBILE_SLIDES,
  HOME_GALLERY_SECTION_MOBILE_FIGMA,
  HOME_GALLERY_SECTION_MOBILE_LAYOUT,
  type HomeGalleryMobileSlide,
  type HomeGalleryMobileTileKey,
} from "@/components/marketing/home/home-gallery-section-tokens";
import { belowFoldImageProps } from "@/lib/image-loading-props";

const GALLERY_MOBILE_AUTO_ADVANCE_MS = 6000;

const TILE_CLASS: Record<HomeGalleryMobileTileKey, string> = {
  left: styles.tileLeft,
  rightTop: styles.tileRightTop,
  rightBottom: styles.tileRightBottom,
};

type HomeGalleryMosaicMobileProps = {
  getGoToSlideAria: (index: number) => string;
};

function mosaicStyleVars(): CSSProperties {
  return {
    ["--home-gallery-mobile-mosaic-size" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.mosaicSize,
    ["--home-gallery-mobile-mosaic-gap" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.mosaicGap,
    ["--home-gallery-mobile-tile-radius" as string]: `${HOME_GALLERY_SECTION_MOBILE_LAYOUT.tileRadiusPx}px`,
    ["--home-gallery-mobile-dot-size" as string]: `${HOME_GALLERY_SECTION_MOBILE_FIGMA.dotSizePx}px`,
    ["--home-gallery-mobile-dot-gap" as string]: `${HOME_GALLERY_SECTION_MOBILE_FIGMA.dotGapPx}px`,
    ["--home-gallery-mobile-dot-inactive" as string]: HOME_GALLERY_SECTION_MOBILE_FIGMA.dotInactive,
    ["--home-gallery-mobile-dot-active" as string]: HOME_GALLERY_SECTION_MOBILE_FIGMA.dotActive,
    ["--home-gallery-mobile-dots-offset" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.mosaicToDotsGap,
  };
}

function GalleryMobileMosaicSlide({ slide }: { slide: HomeGalleryMobileSlide }) {
  return (
    <div className={styles.mosaic}>
      {(Object.keys(TILE_CLASS) as HomeGalleryMobileTileKey[]).map((key) => {
        const tile = slide.tiles[key];
        return (
          <div key={key} className={`${styles.tile} ${TILE_CLASS[key]}`}>
            <Image
              src={tile.src}
              alt=""
              fill
              sizes="(max-width: 1023px) 45vw, 0"
              className={styles.tileImage}
              {...belowFoldImageProps()}
            />
          </div>
        );
      })}
    </div>
  );
}

/** Figma mobile gallery mosaic `97:5865` with dots `97:5876` (no side nav). */
export function HomeGalleryMosaicMobile({ getGoToSlideAria }: HomeGalleryMosaicMobileProps) {
  const slideCount = HOME_GALLERY_MOBILE_SLIDES.length;
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
      }, GALLERY_MOBILE_AUTO_ADVANCE_MS);
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
    <div className={styles.root} style={mosaicStyleVars()}>
      <div className={styles.stage}>
        {HOME_GALLERY_MOBILE_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.slide} ${index === active ? styles.slideActive : ""}`}
            aria-hidden={index !== active}
          >
            {mountedSlides.has(index) ? <GalleryMobileMosaicSlide slide={slide} /> : null}
          </div>
        ))}
      </div>

      <div className={styles.dotsWrap}>
        <div className={styles.dots} role="tablist">
          {HOME_GALLERY_MOBILE_SLIDES.map((slide, index) => (
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
