"use client";

import type { CSSProperties, TransitionEvent } from "react";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "@/components/marketing/home/home-gallery-mosaic-carousel.module.css";
import {
  HOME_GALLERY_CAROUSEL,
  HOME_GALLERY_CAROUSEL_START_INDEX,
  HOME_GALLERY_FIGMA,
  HOME_GALLERY_IPAD_AIR_LAYOUT,
  HOME_GALLERY_LAYOUT,
  HOME_GALLERY_SLIDES,
  type HomeGalleryCarouselSlide,
} from "@/components/marketing/home/home-gallery-section-tokens";
import { MarketingGlassCircleButton } from "@/components/marketing/home/marketing-glass-circle-button";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { belowFoldImageProps } from "@/lib/image-loading-props";

type HomeGalleryMosaicCarouselProps = {
  prevLabel: string;
  nextLabel: string;
  getGoToSlideAria: (index: number) => string;
};

type GallerySlideLane = "center" | "side" | "far";

type GalleryCarouselLayout = {
  viewportWidth: number;
  slideWidthPx: number;
};

const PEEK_CLONE_COUNT = HOME_GALLERY_CAROUSEL.peekCloneCount;

function buildGalleryDisplaySlides(
  slides: readonly HomeGalleryCarouselSlide[],
): HomeGalleryCarouselSlide[] {
  if (slides.length <= 1) {
    return [...slides];
  }
  const slideCount = slides.length;
  const prepend: HomeGalleryCarouselSlide[] = [];
  const append: HomeGalleryCarouselSlide[] = [];
  for (let index = 0; index < PEEK_CLONE_COUNT; index += 1) {
    const prependIdx = (slideCount - PEEK_CLONE_COUNT + index + slideCount) % slideCount;
    const appendSlide = slides[index % slideCount];
    const prependSlide = slides[prependIdx];
    if (prependSlide !== undefined) {
      prepend.push(prependSlide);
    }
    if (appendSlide !== undefined) {
      append.push(appendSlide);
    }
  }
  return [...prepend, ...slides, ...append];
}

function realIndexFromDisplay(slideCount: number, displayIndex: number): number {
  return ((displayIndex - PEEK_CLONE_COUNT) % slideCount + slideCount) % slideCount;
}

function isCloneDisplayIndex(slideCount: number, displayIndex: number): boolean {
  return displayIndex < PEEK_CLONE_COUNT || displayIndex >= PEEK_CLONE_COUNT + slideCount;
}

function resolveGallerySlideLane(
  displayIndex: number,
  visualSlideIndex: number,
): GallerySlideLane {
  const dist = Math.abs(displayIndex - visualSlideIndex);
  if (dist === 0) {
    return "center";
  }
  if (dist === 1) {
    return "side";
  }
  return "far";
}

function carouselStyleVars(): CSSProperties {
  return {
    ["--home-gallery-tile-radius" as string]: `${HOME_GALLERY_FIGMA.tileRadiusPx}px`,
    ["--home-gallery-dot-size" as string]: `${HOME_GALLERY_LAYOUT.dotSizePx}px`,
    ["--home-gallery-dot-gap" as string]: `${HOME_GALLERY_LAYOUT.dotGapPx}px`,
    ["--home-gallery-dot-inactive" as string]: HOME_GALLERY_FIGMA.dotInactive,
    ["--home-gallery-dot-active" as string]: HOME_GALLERY_FIGMA.dotActive,
    ["--home-gallery-dots-offset" as string]: `${HOME_GALLERY_LAYOUT.mosaicToDotsGapPx}px`,
    ["--home-gallery-dot-size-air" as string]: `${HOME_GALLERY_IPAD_AIR_LAYOUT.dotSizePx}px`,
    ["--home-gallery-dot-gap-air" as string]: `${HOME_GALLERY_IPAD_AIR_LAYOUT.dotGapPx}px`,
    ["--home-gallery-dots-offset-air" as string]: `${HOME_GALLERY_IPAD_AIR_LAYOUT.mosaicToDotsGapPx}px`,
    ["--home-gallery-nav-edge-inset" as string]: `${HOME_GALLERY_CAROUSEL.navEdgeInsetPx}px`,
    ["--home-gallery-nav-y-offset" as string]: `${HOME_GALLERY_LAYOUT.navVerticalOffsetPx}px`,
    ["--home-gallery-viewport-height" as string]: `${HOME_GALLERY_CAROUSEL.viewportHeightRatio * 100}dvh`,
    ["--home-gallery-carousel-gap" as string]: `${HOME_GALLERY_CAROUSEL.gapPx}px`,
    ["--home-gallery-carousel-ms" as string]: `${HOME_GALLERY_CAROUSEL.transformMs}ms`,
  };
}

function useGalleryCarouselMetrics(visualSlideIndex: number) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const visualSlideIndexRef = useRef(visualSlideIndex);
  const [layout, setLayout] = useState<GalleryCarouselLayout>({
    viewportWidth: 0,
    slideWidthPx: 0,
  });
  const isClientMounted = useIsClientMounted();

  useLayoutEffect(() => {
    visualSlideIndexRef.current = visualSlideIndex;
  }, [visualSlideIndex]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const read = () => {
      const viewportWidth = viewport.clientWidth;
      const slideWidthPx = viewportWidth * HOME_GALLERY_CAROUSEL.slideWidthRatio;
      setLayout({ viewportWidth, slideWidthPx });
    };
    read();
    const rafId = requestAnimationFrame(read);
    const ro = new ResizeObserver(read);
    ro.observe(viewport);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  const { viewportWidth, slideWidthPx } = layout;
  const layoutReady = isClientMounted && viewportWidth > 0 && slideWidthPx > 0;
  const edgePadPx = layoutReady ? Math.max(0, (viewportWidth - slideWidthPx) / 2) : 0;
  const stepPx = slideWidthPx + HOME_GALLERY_CAROUSEL.gapPx;
  const translatePx = layoutReady ? -visualSlideIndex * stepPx : 0;

  return { viewportRef, edgePadPx, translatePx, layoutReady };
}

type GalleryCarouselSlideProps = {
  slide: HomeGalleryCarouselSlide;
  lane: GallerySlideLane;
  isActive: boolean;
  instantSnap: boolean;
  ariaHidden?: boolean;
};

function GalleryCarouselSlide({
  slide,
  lane,
  isActive,
  instantSnap,
  ariaHidden,
}: GalleryCarouselSlideProps) {
  const laneClass =
    lane === "center" ? styles.slideCenter : lane === "side" ? styles.slideSide : styles.slideFar;

  return (
    <article
      className={`${styles.slideItem} ${laneClass} ${isActive ? styles.slideItemActive : ""} ${
        instantSnap ? styles.slideInstantSnap : ""
      }`}
      aria-hidden={ariaHidden ? true : undefined}
    >
      <div className={styles.slideFrame}>
        <Image
          src={slide.src}
          alt=""
          fill
          sizes="50vw"
          className={styles.slideImage}
          {...belowFoldImageProps()}
        />
        <div className={styles.slideSheen} aria-hidden />
      </div>
    </article>
  );
}

/** Desktop gallery — centered peek carousel with half-visible neighbours. */
export function HomeGalleryMosaicCarousel({
  prevLabel,
  nextLabel,
  getGoToSlideAria,
}: HomeGalleryMosaicCarouselProps) {
  const slides = HOME_GALLERY_SLIDES;
  const slideCount = slides.length;
  const lastIndex = Math.max(0, slideCount - 1);
  const displaySlides = buildGalleryDisplaySlides(slides);
  const useInfiniteTrack = slideCount > 1;
  const trailingBound = PEEK_CLONE_COUNT + slideCount;

  const [trackVisualIndex, setTrackVisualIndex] = useState(() =>
    useInfiniteTrack ? HOME_GALLERY_CAROUSEL_START_INDEX : 0,
  );
  const [instantTransform, setInstantTransform] = useState(false);
  const [canAnimateSlides, setCanAnimateSlides] = useState(false);
  const recenteringRef = useRef(false);

  const reducedMotion = usePrefersReducedMotion();
  const { viewportRef, edgePadPx, translatePx, layoutReady } =
    useGalleryCarouselMetrics(trackVisualIndex);

  const active = useMemo(() => {
    if (!useInfiniteTrack) {
      return 0;
    }
    return realIndexFromDisplay(slideCount, trackVisualIndex);
  }, [slideCount, trackVisualIndex, useInfiniteTrack]);

  const goPrev = useCallback(() => {
    if (!useInfiniteTrack) {
      return;
    }
    setTrackVisualIndex((prev) => prev - 1);
  }, [useInfiniteTrack]);

  const goNext = useCallback(() => {
    if (!useInfiniteTrack) {
      return;
    }
    setTrackVisualIndex((prev) => prev + 1);
  }, [useInfiniteTrack]);

  const selectSlide = useCallback(
    (index: number) => {
      if (!useInfiniteTrack) {
        return;
      }
      setTrackVisualIndex(PEEK_CLONE_COUNT + Math.min(Math.max(0, index), lastIndex));
    },
    [lastIndex, useInfiniteTrack],
  );

  useEffect(() => {
    queueMicrotask(() => {
      setCanAnimateSlides(true);
    });
  }, []);

  useEffect(() => {
    if (!useInfiniteTrack || reducedMotion) {
      return;
    }
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const clearIntervalIfSet = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };

    const armInterval = () => {
      clearIntervalIfSet();
      intervalId = setInterval(() => {
        if (document.visibilityState === "visible") {
          goNext();
        }
      }, HOME_GALLERY_CAROUSEL.autoAdvanceMs);
    };

    armInterval();
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        clearIntervalIfSet();
      } else {
        armInterval();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearIntervalIfSet();
    };
  }, [goNext, reducedMotion, trackVisualIndex, useInfiniteTrack]);

  const trackTransition =
    reducedMotion || !canAnimateSlides || !layoutReady || instantTransform
      ? undefined
      : `transform var(--home-gallery-carousel-ms) cubic-bezier(0.22, 1, 0.36, 1)`;

  const recenterIfNeeded = useCallback(
    (visualIndex: number) => {
      if (!useInfiniteTrack || slideCount <= 1) {
        return false;
      }
      if (visualIndex < PEEK_CLONE_COUNT) {
        setInstantTransform(true);
        setTrackVisualIndex(visualIndex + slideCount);
        return true;
      }
      if (visualIndex >= trailingBound) {
        setInstantTransform(true);
        setTrackVisualIndex(visualIndex - slideCount);
        return true;
      }
      return false;
    },
    [slideCount, trailingBound, useInfiniteTrack],
  );

  useLayoutEffect(() => {
    if (!reducedMotion || !useInfiniteTrack) {
      return;
    }
    recenterIfNeeded(trackVisualIndex);
  }, [recenterIfNeeded, reducedMotion, trackVisualIndex, useInfiniteTrack]);

  const finishRecenter = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setInstantTransform(false);
        recenteringRef.current = false;
      });
    });
  }, []);

  const handleTrackTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.propertyName !== "transform" || event.target !== event.currentTarget) {
        return;
      }
      if (!useInfiniteTrack || slideCount <= 1 || reducedMotion || recenteringRef.current) {
        return;
      }
      const needsRecenter =
        trackVisualIndex < PEEK_CLONE_COUNT || trackVisualIndex >= trailingBound;
      if (!needsRecenter) {
        return;
      }
      recenteringRef.current = true;
      recenterIfNeeded(trackVisualIndex);
      finishRecenter();
    },
    [
      finishRecenter,
      recenterIfNeeded,
      reducedMotion,
      slideCount,
      trackVisualIndex,
      trailingBound,
      useInfiniteTrack,
    ],
  );

  return (
    <div style={carouselStyleVars()}>
      <div className={styles.stage}>
        <div ref={viewportRef} className={styles.viewport}>
          <div
            className={`${styles.track} ${layoutReady ? styles.trackReady : styles.trackHidden}`}
            style={{
              gap: `${HOME_GALLERY_CAROUSEL.gapPx}px`,
              paddingLeft: `${edgePadPx}px`,
              paddingRight: `${edgePadPx}px`,
              transform: `translate3d(${translatePx}px, 0, 0)`,
              transition: trackTransition,
            }}
            onTransitionEnd={handleTrackTransitionEnd}
          >
            {displaySlides.map((slide, displayIndex) => {
              const realIndex = useInfiniteTrack
                ? realIndexFromDisplay(slideCount, displayIndex)
                : displayIndex;
              const isClone = useInfiniteTrack && isCloneDisplayIndex(slideCount, displayIndex);
              const lane = resolveGallerySlideLane(displayIndex, trackVisualIndex);
              return (
                <GalleryCarouselSlide
                  key={`gallery-${displayIndex}-${slide.id}`}
                  slide={slide}
                  lane={lane}
                  isActive={active === realIndex}
                  instantSnap={instantTransform}
                  ariaHidden={isClone}
                />
              );
            })}
          </div>
        </div>

        <div className={styles.navRow}>
          <div className={styles.navButtonPrev}>
            <MarketingGlassCircleButton arrow="prev" label={prevLabel} onPress={goPrev} />
          </div>
          <div className={styles.navButtonNext}>
            <MarketingGlassCircleButton arrow="next" label={nextLabel} onPress={goNext} />
          </div>
        </div>
      </div>

      <div className={styles.dotsWrap}>
        <div className={styles.dots} role="tablist">
          {slides.map((slide, index) => (
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
