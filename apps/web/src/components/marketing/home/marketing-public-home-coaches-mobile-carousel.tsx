"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { FeaturedCoachSlideCardMobile } from "@/components/marketing/home/featured-coach-slide-card-mobile";
import type { CoachSlideCopy, CoachSlideLane } from "@/components/marketing/home/featured-coach-slide-card";
import { HOME_COACHES_SECTION_MOBILE_LAYOUT } from "@/components/marketing/home/home-coaches-section-tokens";
import styles from "@/components/marketing/home/marketing-public-home-coaches-mobile-carousel.module.css";

const SCROLL_SYNC_DEBOUNCE_MS = 120;
const PROGRAMMATIC_SCROLL_COOLDOWN_MS = 480;

function resolveCoachSlideLane(displayIndex: number, centeredIndex: number): CoachSlideLane {
  const dist = Math.abs(displayIndex - centeredIndex);
  if (dist === 0) return "center";
  if (dist === 1) return "side";
  return "far";
}

function readNearestSlideIndex(viewport: HTMLDivElement, slideEls: readonly (HTMLDivElement | null)[]): number {
  const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
  let nearest = 0;
  let minDist = Number.POSITIVE_INFINITY;

  slideEls.forEach((el, index) => {
    if (el === null) {
      return;
    }
    const slideCenter = el.offsetLeft + el.offsetWidth / 2;
    const dist = Math.abs(slideCenter - viewportCenter);
    if (dist < minDist) {
      minDist = dist;
      nearest = index;
    }
  });

  return nearest;
}

type FeaturedCoachesMobileCarouselStripProps = {
  slides: CoachSlideCopy[];
  active: number;
  onSelectSlide: (index: number) => void;
  goPrev: () => void;
  goNext: () => void;
  getGoToSlideAria: (coachName: string) => string;
};

/** Figma mobile carousel `108:6737` — native touch scroll + scroll-snap. */
export function FeaturedCoachesMobileCarouselStrip({
  slides,
  active,
  onSelectSlide,
  getGoToSlideAria,
}: FeaturedCoachesMobileCarouselStripProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const programmaticScrollRef = useRef(false);
  const programmaticScrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activeFromScrollRef = useRef(false);
  const scrollSyncTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scrollRafRef = useRef<number | undefined>(undefined);
  const [centerIndex, setCenterIndex] = useState(active);
  const [peekLayout, setPeekLayout] = useState(false);

  const updateCenterIndexFromScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    setCenterIndex(readNearestSlideIndex(viewport, slideRefs.current));
  }, []);

  const scrollSlideIntoView = useCallback((index: number, behavior: ScrollBehavior) => {
    const viewport = viewportRef.current;
    const slide = slideRefs.current[index];
    if (!viewport || !slide) {
      return;
    }

    const targetLeft = slide.offsetLeft - (viewport.clientWidth - slide.offsetWidth) / 2;
    programmaticScrollRef.current = true;
    if (programmaticScrollTimerRef.current !== undefined) {
      clearTimeout(programmaticScrollTimerRef.current);
    }
    programmaticScrollTimerRef.current = setTimeout(() => {
      programmaticScrollRef.current = false;
      programmaticScrollTimerRef.current = undefined;
    }, PROGRAMMATIC_SCROLL_COOLDOWN_MS);
    viewport.scrollTo({ left: targetLeft, behavior });
    setCenterIndex(index);
  }, []);

  const syncActiveFromScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    if (programmaticScrollRef.current) {
      return;
    }

    const nearest = readNearestSlideIndex(viewport, slideRefs.current);
    setCenterIndex(nearest);
    if (nearest !== active) {
      activeFromScrollRef.current = true;
      onSelectSlide(nearest);
    }
  }, [active, onSelectSlide]);

  useLayoutEffect(() => {
    if (activeFromScrollRef.current) {
      activeFromScrollRef.current = false;
      return;
    }
    scrollSlideIntoView(active, "smooth");
  }, [active, scrollSlideIntoView]);

  useEffect(() => {
    queueMicrotask(() => {
      setPeekLayout(true);
      scrollSlideIntoView(0, "auto");
    });
  }, [scrollSlideIntoView]);

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
          updateCenterIndexFromScroll();
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

    return () => {
      viewport.removeEventListener("scroll", onScroll);
      viewport.removeEventListener("scrollend", onScrollEnd);
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
  }, [syncActiveFromScroll, updateCenterIndexFromScroll]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className={styles.stage}>
      <div
        ref={viewportRef}
        className={styles.viewport}
        aria-label="Featured coaches"
        tabIndex={0}
      >
        <div
          className={styles.track}
          style={{ gap: HOME_COACHES_SECTION_MOBILE_LAYOUT.carouselGap }}
        >
          {slides.map((slide, index) => {
            const lane = resolveCoachSlideLane(index, centerIndex);
            const isCentered = centerIndex === index;
            return (
              <div
                key={`coach-mobile-slide-${index}-${slide.name}`}
                ref={(el) => {
                  slideRefs.current[index] = el;
                }}
                className={styles.slide}
              >
                <FeaturedCoachSlideCardMobile
                  slide={slide}
                  isActive={isCentered}
                  lane={lane}
                  peekLayout={peekLayout}
                  isScrolling={centerIndex !== active}
                  overlayAriaLabel={getGoToSlideAria(slide.name)}
                  onActivate={() => {
                    onSelectSlide(index);
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
