"use client";

import type { CSSProperties, TransitionEvent } from "react";
import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "@/components/marketing/home/home-gallery-mosaic-carousel.module.css";
import {
  HOME_GALLERY_CAROUSEL,
  HOME_GALLERY_FIGMA,
  HOME_GALLERY_IPAD_AIR_LAYOUT,
  HOME_GALLERY_LAYOUT,
  HOME_GALLERY_SLIDES,
  type HomeGalleryCarouselSlide,
} from "@/components/marketing/home/home-gallery-section-tokens";
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

type GalleryNavArrowProps = {
  direction: "prev" | "next";
};

function buildGalleryDisplaySlides(
  slides: readonly HomeGalleryCarouselSlide[],
): HomeGalleryCarouselSlide[] {
  if (slides.length <= 1) {
    return [...slides];
  }
  const last = slides[slides.length - 1];
  const first = slides[0];
  if (last === undefined || first === undefined) {
    return [...slides];
  }
  return [last, ...slides, first];
}

function displayIndexToRealIndex(displayLength: number, displayIndex: number): number {
  const sourceCount = displayLength - 2;
  if (displayIndex === 0) {
    return sourceCount - 1;
  }
  if (displayIndex === displayLength - 1) {
    return 0;
  }
  return displayIndex - 1;
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

function carouselStyleVars(): CSSProperties {
  return {
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
    ["--home-gallery-nav-edge-inset" as string]: `${HOME_GALLERY_CAROUSEL.navEdgeInsetPx}px`,
    ["--home-gallery-nav-y-offset" as string]: `${HOME_GALLERY_LAYOUT.navVerticalOffsetPx}px`,
    ["--home-gallery-slide-aspect" as string]: HOME_GALLERY_CAROUSEL.slideAspectRatio,
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

  return { viewportRef, edgePadPx, translatePx, slideWidthPx, layoutReady };
}

type GalleryCarouselSlideProps = {
  slide: HomeGalleryCarouselSlide;
  lane: GallerySlideLane;
  isActive: boolean;
  ariaHidden?: boolean;
};

function GalleryCarouselSlide({ slide, lane, isActive, ariaHidden }: GalleryCarouselSlideProps) {
  const laneClass =
    lane === "center" ? styles.slideCenter : lane === "side" ? styles.slideSide : styles.slideFar;

  return (
    <article
      className={`${styles.slideItem} ${laneClass} ${isActive ? styles.slideItemActive : ""}`}
      aria-hidden={ariaHidden ? true : undefined}
    >
      <div className={styles.slideFrame}>
        <Image
          src={slide.src}
          alt=""
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
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
  const useCloneBookends = slideCount > 1;
  const displayLength = displaySlides.length;

  const [active, setActive] = useState(0);
  const [trackVisualIndex, setTrackVisualIndex] = useState(() => (useCloneBookends ? 1 : 0));
  const [instantTransform, setInstantTransform] = useState(false);
  const [canAnimateSlides, setCanAnimateSlides] = useState(false);
  const prevActiveRef = useRef(active);
  const recenteringRef = useRef(false);

  const reducedMotion = usePrefersReducedMotion();
  const { viewportRef, edgePadPx, translatePx, layoutReady } =
    useGalleryCarouselMetrics(trackVisualIndex);

  const goPrev = useCallback(() => {
    setActive((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const goNext = useCallback(() => {
    setActive((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    queueMicrotask(() => {
      setCanAnimateSlides(true);
    });
  }, []);

  useLayoutEffect(() => {
    queueMicrotask(() => {
      if (slideCount <= 1) {
        setTrackVisualIndex(active);
        prevActiveRef.current = active;
        return;
      }
      if (reducedMotion) {
        setTrackVisualIndex(active + 1);
        prevActiveRef.current = active;
        return;
      }
      if (prevActiveRef.current === active) {
        return;
      }
      const prev = prevActiveRef.current;
      if (prev === lastIndex && active === 0) {
        setTrackVisualIndex(displayLength - 1);
      } else if (prev === 0 && active === lastIndex) {
        setTrackVisualIndex(0);
      } else {
        setTrackVisualIndex(active + 1);
      }
      prevActiveRef.current = active;
    });
  }, [active, displayLength, lastIndex, reducedMotion, slideCount]);

  useEffect(() => {
    if (slideCount <= 1 || reducedMotion) {
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
  }, [active, goNext, reducedMotion, slideCount]);

  const trackTransition =
    reducedMotion || !canAnimateSlides || !layoutReady || instantTransform
      ? undefined
      : `transform var(--home-gallery-carousel-ms) cubic-bezier(0.22, 1, 0.36, 1)`;

  const handleTrackTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.propertyName !== "transform" || event.target !== event.currentTarget) {
        return;
      }
      if (!useCloneBookends || slideCount <= 1 || reducedMotion) {
        return;
      }
      if (recenteringRef.current) {
        return;
      }
      const atTrailingClone = trackVisualIndex === displayLength - 1;
      const atLeadingClone = trackVisualIndex === 0;
      if (!atTrailingClone && !atLeadingClone) {
        return;
      }
      recenteringRef.current = true;
      setInstantTransform(true);
      setTrackVisualIndex(atTrailingClone ? 1 : displayLength - 2);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setInstantTransform(false);
          recenteringRef.current = false;
        });
      });
    },
    [displayLength, reducedMotion, slideCount, trackVisualIndex, useCloneBookends],
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
              const realIndex = useCloneBookends
                ? displayIndexToRealIndex(displaySlides.length, displayIndex)
                : displayIndex;
              const isClone =
                useCloneBookends &&
                (displayIndex === 0 || displayIndex === displaySlides.length - 1);
              const lane = resolveGallerySlideLane(displayIndex, trackVisualIndex);
              return (
                <GalleryCarouselSlide
                  key={
                    isClone
                      ? `gallery-clone-${displayIndex}-${slide.id}`
                      : `gallery-slide-${realIndex}-${slide.id}`
                  }
                  slide={slide}
                  lane={lane}
                  isActive={active === realIndex}
                  ariaHidden={isClone}
                />
              );
            })}
          </div>
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
          {slides.map((slide, index) => (
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
