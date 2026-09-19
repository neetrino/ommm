"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from "react";
import { FeaturedCoachSlideCardMobile } from "@/components/marketing/home/featured-coach-slide-card-mobile";
import type {
  CoachSlideCopy,
  CoachSlideLane,
} from "@/components/marketing/home/featured-coach-slide-card";
import { HOME_COACHES_SECTION_MOBILE_LAYOUT } from "@/components/marketing/home/home-coaches-section-tokens";
import { COACHES_PAGE_CARD } from "@/components/marketing/coaches/coaches-page-tokens";
import styles from "@/components/marketing/home/marketing-public-home-coaches-mobile-carousel.module.css";

function lockHorizontalTouchPan(element: HTMLElement): () => void {
  let startX = 0;
  let startY = 0;

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    startX = touch.clientX;
    startY = touch.clientY;
  };

  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    const deltaX = Math.abs(touch.clientX - startX);
    const deltaY = Math.abs(touch.clientY - startY);
    if (deltaX > deltaY) {
      event.preventDefault();
    }
  };

  element.addEventListener("touchstart", onTouchStart, { passive: true });
  element.addEventListener("touchmove", onTouchMove, { passive: false });
  return () => {
    element.removeEventListener("touchstart", onTouchStart);
    element.removeEventListener("touchmove", onTouchMove);
  };
}

function resolveCoachSlideLane(displayIndex: number, centeredIndex: number): CoachSlideLane {
  const dist = Math.abs(displayIndex - centeredIndex);
  if (dist === 0) {
    return "center";
  }
  if (dist === 1) {
    return "side";
  }
  return "far";
}

type FeaturedCoachesMobileCarouselStripProps = {
  slides: CoachSlideCopy[];
  active: number;
  onSelectSlide: (index: number) => void;
  goPrev: () => void;
  goNext: () => void;
  getGoToSlideAria: (coachName: string) => string;
  isActiveSlideExpanded: boolean;
  onActiveSlideExpandedChange: (expanded: boolean) => void;
};

type CoachMobileSlidesProps = {
  slides: CoachSlideCopy[];
  active: number;
  centerIndex: number;
  peekLayout: boolean;
  isActiveSlideExpanded: boolean;
  slideRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  onActiveSlideExpandedChange: (expanded: boolean) => void;
};

function CoachMobileSlides({
  slides,
  active,
  centerIndex,
  peekLayout,
  isActiveSlideExpanded,
  slideRefs,
  onActiveSlideExpandedChange,
}: CoachMobileSlidesProps) {
  return (
    <div className={styles.track} style={{ gap: HOME_COACHES_SECTION_MOBILE_LAYOUT.carouselGap }}>
      {slides.map((slide, index) => {
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
              lane={resolveCoachSlideLane(index, centerIndex)}
              peekLayout={peekLayout}
              isScrolling={centerIndex !== active}
              expanded={isCentered && isActiveSlideExpanded}
              onToggleExpand={() => {
                if (isCentered) {
                  onActiveSlideExpandedChange(!isActiveSlideExpanded);
                }
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

function useMobileCoachCarouselScroll(active: number) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [centerIndex, setCenterIndex] = useState(active);
  const [peekLayout, setPeekLayout] = useState(false);

  const scrollSlideIntoView = useCallback((index: number, behavior: ScrollBehavior) => {
    const viewport = viewportRef.current;
    const slide = slideRefs.current[index];
    if (!viewport || !slide) {
      return;
    }

    const targetLeft = slide.offsetLeft - (viewport.clientWidth - slide.offsetWidth) / 2;
    viewport.scrollTo({ left: targetLeft, behavior });
    setCenterIndex(index);
  }, []);

  useLayoutEffect(() => {
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
      return undefined;
    }
    return lockHorizontalTouchPan(viewport);
  }, []);

  return { viewportRef, slideRefs, centerIndex, peekLayout };
}

/** Mobile featured coaches — auto-advance + bottom controls, no swipe. */
export function FeaturedCoachesMobileCarouselStrip({
  slides,
  active,
  isActiveSlideExpanded,
  onActiveSlideExpandedChange,
}: FeaturedCoachesMobileCarouselStripProps) {
  const { viewportRef, slideRefs, centerIndex, peekLayout } = useMobileCoachCarouselScroll(active);

  if (slides.length === 0) {
    return null;
  }

  return (
    <div
      className={styles.stage}
      style={{
        ["--ommm-coach-card-aspect-w" as string]: String(COACHES_PAGE_CARD.designWidthPx),
        ["--ommm-coach-card-aspect-h" as string]: String(COACHES_PAGE_CARD.designHeightPx),
      }}
    >
      <div ref={viewportRef} className={styles.viewport} aria-label="Featured coaches">
        <CoachMobileSlides
          slides={slides}
          active={active}
          centerIndex={centerIndex}
          peekLayout={peekLayout}
          isActiveSlideExpanded={isActiveSlideExpanded}
          slideRefs={slideRefs}
          onActiveSlideExpandedChange={onActiveSlideExpandedChange}
        />
      </div>
    </div>
  );
}
