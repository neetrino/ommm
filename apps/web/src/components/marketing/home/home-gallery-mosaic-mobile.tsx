"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "@/components/marketing/home/home-gallery-mosaic-mobile.module.css";
import {
  HOME_GALLERY_MOBILE_SLIDES,
  HOME_GALLERY_SECTION_MOBILE_FIGMA,
  HOME_GALLERY_SECTION_MOBILE_LAYOUT,
  type HomeGalleryMobileSlide,
  type HomeGalleryMobileTileKey,
} from "@/components/marketing/home/home-gallery-section-tokens";
import { belowFoldImageProps } from "@/lib/image-loading-props";

const SCROLL_SYNC_DEBOUNCE_MS = 120;
const PROGRAMMATIC_SCROLL_COOLDOWN_MS = 480;

const TILE_CLASS: Record<HomeGalleryMobileTileKey, string> = {
  left: styles.tileLeft,
  rightTop: styles.tileRightTop,
  rightBottom: styles.tileRightBottom,
};

type HomeGalleryMosaicMobileProps = {
  carouselAriaLabel: string;
  getGoToSlideAria: (index: number) => string;
};

function readNearestSlideIndex(
  viewport: HTMLDivElement,
  slideEls: readonly (HTMLDivElement | null)[],
): number {
  const viewportRect = viewport.getBoundingClientRect();
  const viewportCenter = viewportRect.left + viewportRect.width / 2;
  let nearest = 0;
  let minDist = Number.POSITIVE_INFINITY;

  slideEls.forEach((el, index) => {
    if (el === null) {
      return;
    }
    const slideRect = el.getBoundingClientRect();
    const slideCenter = slideRect.left + slideRect.width / 2;
    const dist = Math.abs(slideCenter - viewportCenter);
    if (dist < minDist) {
      minDist = dist;
      nearest = index;
    }
  });

  return nearest;
}

function mosaicStyleVars(): CSSProperties {
  return {
    ["--home-gallery-mobile-mosaic-size" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.mosaicSize,
    ["--home-gallery-mobile-mosaic-gap" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.mosaicGap,
    ["--home-gallery-mobile-carousel-gap" as string]: HOME_GALLERY_SECTION_MOBILE_LAYOUT.carouselGap,
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
              className={styles.tileImageCover}
              {...belowFoldImageProps()}
            />
          </div>
        );
      })}
    </div>
  );
}

/** Figma mobile gallery mosaic `97:5865` — touch scroll + dots `97:5876`. */
export function HomeGalleryMosaicMobile({
  carouselAriaLabel,
  getGoToSlideAria,
}: HomeGalleryMosaicMobileProps) {
  const slideCount = HOME_GALLERY_MOBILE_SLIDES.length;
  const lastIndex = Math.max(0, slideCount - 1);
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const programmaticScrollRef = useRef(false);
  const programmaticScrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activeFromScrollRef = useRef(false);
  const scrollSyncTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollRafRef = useRef<number | undefined>(undefined);
  const [active, setActive] = useState(0);

  const scrollSlideIntoView = useCallback((index: number, behavior: ScrollBehavior) => {
    const viewport = viewportRef.current;
    const slide = slideRefs.current[index];
    if (!viewport || !slide) {
      return;
    }

    const viewportRect = viewport.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();
    const delta =
      slideRect.left + slideRect.width / 2 - (viewportRect.left + viewportRect.width / 2);
    const targetLeft = viewport.scrollLeft + delta;

    programmaticScrollRef.current = true;
    if (programmaticScrollTimerRef.current !== undefined) {
      clearTimeout(programmaticScrollTimerRef.current);
    }
    programmaticScrollTimerRef.current = setTimeout(() => {
      programmaticScrollRef.current = false;
      programmaticScrollTimerRef.current = undefined;
    }, PROGRAMMATIC_SCROLL_COOLDOWN_MS);
    viewport.scrollTo({ left: targetLeft, behavior });
  }, []);

  const selectSlide = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const clamped = Math.min(Math.max(0, index), lastIndex);
      scrollSlideIntoView(clamped, behavior);
      activeFromScrollRef.current = true;
      setActive(clamped);
    },
    [lastIndex, scrollSlideIntoView],
  );

  const updateActiveFromScrollPosition = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || programmaticScrollRef.current) {
      return;
    }

    const nearest = readNearestSlideIndex(viewport, slideRefs.current);
    setActive((prev) => {
      if (prev === nearest) {
        return prev;
      }
      activeFromScrollRef.current = true;
      return nearest;
    });
  }, []);

  const syncActiveFromScroll = useCallback(() => {
    updateActiveFromScrollPosition();
  }, [updateActiveFromScrollPosition]);

  useLayoutEffect(() => {
    if (activeFromScrollRef.current) {
      activeFromScrollRef.current = false;
      return;
    }
    scrollSlideIntoView(active, "smooth");
  }, [active, scrollSlideIntoView]);

  useEffect(() => {
    queueMicrotask(() => {
      selectSlide(0, "auto");
    });
  }, [selectSlide]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const onScroll = () => {
      if (scrollRafRef.current !== undefined) {
        cancelAnimationFrame(scrollRafRef.current);
      }
      scrollRafRef.current = requestAnimationFrame(() => {
        scrollRafRef.current = undefined;
        if (!programmaticScrollRef.current) {
          updateActiveFromScrollPosition();
        }
      });

      if (scrollSyncTimerRef.current !== undefined) {
        clearTimeout(scrollSyncTimerRef.current);
      }
      scrollSyncTimerRef.current = setTimeout(() => {
        syncActiveFromScroll();
      }, SCROLL_SYNC_DEBOUNCE_MS);
    };

    const onScrollEnd = () => {
      if (scrollSyncTimerRef.current !== undefined) {
        clearTimeout(scrollSyncTimerRef.current);
        scrollSyncTimerRef.current = undefined;
      }
      if (scrollRafRef.current !== undefined) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = undefined;
      }
      syncActiveFromScroll();
    };

    viewport.addEventListener("scroll", onScroll, { passive: true });
    viewport.addEventListener("scrollend", onScrollEnd);
    viewport.addEventListener("touchend", onScrollEnd, { passive: true });

    return () => {
      viewport.removeEventListener("scroll", onScroll);
      viewport.removeEventListener("scrollend", onScrollEnd);
      viewport.removeEventListener("touchend", onScrollEnd);
      if (scrollSyncTimerRef.current !== undefined) {
        clearTimeout(scrollSyncTimerRef.current);
      }
      if (scrollRafRef.current !== undefined) {
        cancelAnimationFrame(scrollRafRef.current);
      }
      if (programmaticScrollTimerRef.current !== undefined) {
        clearTimeout(programmaticScrollTimerRef.current);
      }
    };
  }, [syncActiveFromScroll, updateActiveFromScrollPosition]);

  if (slideCount === 0) {
    return null;
  }

  return (
    <div className={styles.root} style={mosaicStyleVars()}>
      <div ref={viewportRef} className={styles.viewport} aria-label={carouselAriaLabel} tabIndex={0}>
        <div className={styles.track}>
          {HOME_GALLERY_MOBILE_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              ref={(el) => {
                slideRefs.current[index] = el;
              }}
              className={styles.slide}
              aria-hidden={index !== active}
            >
              <GalleryMobileMosaicSlide slide={slide} />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.dotsWrap}>
        <div className={styles.dots} role="tablist" aria-label={carouselAriaLabel}>
          {HOME_GALLERY_MOBILE_SLIDES.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={getGoToSlideAria(index)}
              className={`${styles.dot} ${index === active ? styles.dotActive : ""}`}
              onClick={() => {
                selectSlide(index);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
