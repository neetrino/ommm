"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type TransitionEvent,
} from "react";
import {
  FeaturedCoachSlideCard,
  type CoachSlideCopy,
  type CoachSlideLane,
} from "@/components/marketing/home/featured-coach-slide-card";

export type { CoachSlideCopy, CoachSlideLane } from "@/components/marketing/home/featured-coach-slide-card";

const GAP_REM = 2.25;
const CAROUSEL_TRANSFORM_MS = 520;

/** Viewport width (px) at which peek + vertical choreography match desktop Figma. */
export const PEEK_LAYOUT_MIN_VIEWPORT_PX = 640;

/** Leading + trailing clones so the first/last real slides always have a neighbour peek. */
function buildCoachDisplaySlides(slides: CoachSlideCopy[]): CoachSlideCopy[] {
  if (slides.length <= 1) {
    return slides;
  }
  const last = slides[slides.length - 1];
  const first = slides[0];
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

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      setReduced(mq.matches);
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
    };
  }, []);

  return reduced;
}

type CarouselLayout = {
  viewportWidth: number;
  cardWidthRem: number;
  rootRemPx: number;
};

function readRootRemPx(): number {
  const raw = getComputedStyle(document.documentElement).fontSize;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 16;
}

function useCoachCarouselMetrics(visualSlideIndex: number) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  /** Latest centered slide index for layout reads (avoids stale ResizeObserver closure). */
  const visualSlideIndexRef = useRef(visualSlideIndex);

  useLayoutEffect(() => {
    visualSlideIndexRef.current = visualSlideIndex;
  }, [visualSlideIndex]);

  const [layout, setLayout] = useState<CarouselLayout>({
    viewportWidth: 0,
    cardWidthRem: 0,
    rootRemPx: 16,
  });
  const [canAnimateSlides, setCanAnimateSlides] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) {
      return;
    }
    const read = () => {
      const vw = viewport.clientWidth;
      const rootRemPx = readRootRemPx();
      const kids = track.children;
      const idx = visualSlideIndexRef.current;
      const centerEl =
        idx >= 0 && idx < kids.length ? (kids[idx] as HTMLElement) : null;
      const probe =
        centerEl ?? (track.firstElementChild as HTMLElement | null);
      /** Layout width ignores Framer `scale` — keeps L/R peek mathematically symmetric. */
      const cwPx = probe?.offsetWidth ?? 0;
      let cardWidthRem = cwPx > 0 ? Math.round((cwPx / rootRemPx) * 1000) / 1000 : 0;
      if (vw > 0 && cardWidthRem <= 0) {
        const fallbackRem = Math.min(45.5625, Math.max(17.5, vw / rootRemPx - 3));
        cardWidthRem = Math.round(fallbackRem * 1000) / 1000;
      }
      setLayout({ viewportWidth: vw, cardWidthRem, rootRemPx });
    };
    read();
    const rafId = requestAnimationFrame(read);
    const ro = new ResizeObserver(read);
    ro.observe(viewport);
    ro.observe(track);
    const first = track.firstElementChild as HTMLElement | null;
    if (first) {
      ro.observe(first);
    }
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setCanAnimateSlides(true);
    });
  }, []);

  const { viewportWidth: vw, cardWidthRem, rootRemPx } = layout;
  const layoutReady = vw > 0 && cardWidthRem > 0;
  const cwPx = cardWidthRem * rootRemPx;
  const edgePadRem = layoutReady ? Math.max(0, (vw - cwPx) / 2 / rootRemPx) : 0;
  const translateRem =
    layoutReady && Number.isFinite(visualSlideIndex)
      ? -visualSlideIndex * (cardWidthRem + GAP_REM)
      : 0;
  const trackTransition =
    reducedMotion || !canAnimateSlides || !layoutReady
      ? undefined
      : `transform ${CAROUSEL_TRANSFORM_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;

  const peekLayout =
    layoutReady && vw >= PEEK_LAYOUT_MIN_VIEWPORT_PX;

  return {
    viewportRef,
    trackRef,
    edgePadRem,
    translateRem,
    cardWidthRem,
    trackTransition,
    reducedMotion,
    layoutReady,
    peekLayout,
  };
}

function resolveCoachSlideLane(
  peekLayout: boolean,
  displayIndex: number,
  visualSlideIndex: number,
): CoachSlideLane {
  const dist = Math.abs(displayIndex - visualSlideIndex);
  if (dist === 0) return "center";
  if (peekLayout && dist === 1) return "side";
  return "far";
}

function CarouselChevron({ className, flipped }: { className?: string; flipped?: boolean }) {
  return (
    <svg
      className={`${className ?? ""} ${flipped ? "scale-x-[-1]" : ""}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M15 6L9 12L15 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type CoachNavButtonProps = {
  direction: "prev" | "next";
  label: string;
  onPress: () => void;
};

function CoachNavButton({ direction, label, onPress }: CoachNavButtonProps) {
  return (
    <button
      type="button"
      className="pointer-events-auto relative z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--ommm-coach-nav-fg)] shadow-sm transition-[background-color,transform,opacity] [background-color:var(--ommm-coach-nav-bg)] hover:[background-color:var(--ommm-coach-nav-bg-hover)] hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent md:h-16 md:w-16"
      aria-label={label}
      onClick={onPress}
    >
      <CarouselChevron className="h-3 w-3 md:h-4 md:w-4" flipped={direction === "next"} />
    </button>
  );
}

type FeaturedCoachesCarouselStripProps = {
  slides: CoachSlideCopy[];
  active: number;
  onSelectSlide: (index: number) => void;
  goPrev: () => void;
  goNext: () => void;
  prevLabel: string;
  nextLabel: string;
  getGoToSlideAria: (coachName: string) => string;
};

export function FeaturedCoachesCarouselStrip({
  slides,
  active,
  onSelectSlide,
  goPrev,
  goNext,
  prevLabel,
  nextLabel,
  getGoToSlideAria,
}: FeaturedCoachesCarouselStripProps) {
  const displaySlides = buildCoachDisplaySlides(slides);
  const useCloneBookends = slides.length > 1;
  const lastSlideIndex = Math.max(0, slides.length - 1);
  const displayLength = displaySlides.length;

  const [trackVisualIndex, setTrackVisualIndex] = useState(() =>
    useCloneBookends ? active + 1 : active,
  );
  const [instantTransform, setInstantTransform] = useState(false);
  const prevActiveRef = useRef(active);
  const recenteringRef = useRef(false);

  const {
    viewportRef,
    trackRef,
    edgePadRem,
    translateRem,
    cardWidthRem,
    trackTransition,
    reducedMotion,
    layoutReady,
    peekLayout,
  } = useCoachCarouselMetrics(trackVisualIndex);

  const baseTrackTransition = instantTransform ? undefined : trackTransition;
  const canLockTrackNavigation = Boolean(baseTrackTransition) && layoutReady && !reducedMotion;
  const navLockRef = useRef(false);
  const queuedDirectionRef = useRef<"prev" | "next" | null>(null);

  const flushQueuedNavigation = useCallback(() => {
    const queued = queuedDirectionRef.current;
    if (!queued) {
      navLockRef.current = false;
      return;
    }
    queuedDirectionRef.current = null;
    if (queued === "prev") {
      goPrev();
      return;
    }
    goNext();
  }, [goNext, goPrev]);

  const requestNavigation = useCallback(
    (direction: "prev" | "next") => {
      if (!canLockTrackNavigation || slides.length <= 1) {
        if (direction === "prev") {
          goPrev();
          return;
        }
        goNext();
        return;
      }

      if (navLockRef.current || recenteringRef.current || instantTransform) {
        queuedDirectionRef.current = direction;
        return;
      }

      navLockRef.current = true;
      if (direction === "prev") {
        goPrev();
        return;
      }
      goNext();
    },
    [canLockTrackNavigation, goNext, goPrev, instantTransform, slides.length],
  );

  const handlePrevPress = useCallback(() => {
    requestNavigation("prev");
  }, [requestNavigation]);

  const handleNextPress = useCallback(() => {
    requestNavigation("next");
  }, [requestNavigation]);

  useEffect(() => {
    if (canLockTrackNavigation) {
      return;
    }
    navLockRef.current = false;
    queuedDirectionRef.current = null;
  }, [canLockTrackNavigation]);

  useLayoutEffect(() => {
    queueMicrotask(() => {
      if (slides.length <= 1) {
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
      if (prev === lastSlideIndex && active === 0) {
        setTrackVisualIndex(displayLength - 1);
      } else if (prev === 0 && active === lastSlideIndex) {
        setTrackVisualIndex(0);
      } else {
        setTrackVisualIndex(active + 1);
      }
      prevActiveRef.current = active;
    });
  }, [active, displayLength, lastSlideIndex, reducedMotion, slides.length]);

  const handleTrackTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.propertyName !== "transform" || event.target !== event.currentTarget) {
        return;
      }
      if (!useCloneBookends || slides.length <= 1 || reducedMotion) {
        flushQueuedNavigation();
        return;
      }
      if (recenteringRef.current) {
        return;
      }
      const atTrailingClone = trackVisualIndex === displayLength - 1;
      const atLeadingClone = trackVisualIndex === 0;
      if (!atTrailingClone && !atLeadingClone) {
        flushQueuedNavigation();
        return;
      }
      let didSnap = false;
      if (atTrailingClone) {
        recenteringRef.current = true;
        setInstantTransform(true);
        setTrackVisualIndex(1);
        didSnap = true;
      } else if (atLeadingClone) {
        recenteringRef.current = true;
        setInstantTransform(true);
        setTrackVisualIndex(displayLength - 2);
        didSnap = true;
      }
      if (!didSnap) {
        flushQueuedNavigation();
        return;
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setInstantTransform(false);
          recenteringRef.current = false;
          flushQueuedNavigation();
        });
      });
    },
    [displayLength, flushQueuedNavigation, reducedMotion, slides.length, trackVisualIndex, useCloneBookends],
  );

  return (
    <div className="relative mt-10 min-h-[17.5rem]">
      <div
        ref={viewportRef}
        className={`min-w-0 flex-1 [container-type:inline-size] ${
          peekLayout
            ? "overflow-x-clip overflow-y-visible pb-[var(--ommm-coach-side-drop)]"
            : "overflow-x-hidden overflow-y-hidden"
        }`}
      >
        <div
          ref={trackRef}
          className={`flex flex-nowrap items-start ${layoutReady ? "visible" : "invisible"}`}
          style={{
            gap: `${GAP_REM}rem`,
            paddingLeft: `${edgePadRem}rem`,
            paddingRight: `${edgePadRem}rem`,
            transform: `translate3d(${translateRem}rem,0,0)`,
            transition: baseTrackTransition,
            willChange: reducedMotion || !layoutReady || instantTransform ? undefined : "transform",
          }}
          onTransitionEnd={handleTrackTransitionEnd}
        >
          {displaySlides.map((slide, displayIndex) => {
            const realIndex = useCloneBookends
              ? displayIndexToRealIndex(displaySlides.length, displayIndex)
              : displayIndex;
            const isClone = useCloneBookends && (displayIndex === 0 || displayIndex === displaySlides.length - 1);
            const lane = resolveCoachSlideLane(peekLayout, displayIndex, trackVisualIndex);
            return (
              <FeaturedCoachSlideCard
                key={
                  isClone
                    ? `coach-clone-${displayIndex}-${slide.name}`
                    : `coach-slide-${realIndex}-${slide.name}`
                }
                slide={slide}
                isActive={active === realIndex}
                lane={lane}
                peekLayout={peekLayout}
                instantCarouselSnap={instantTransform}
                ariaHidden={isClone}
                overlayAriaLabel={getGoToSlideAria(slide.name)}
                onActivate={() => {
                  onSelectSlide(realIndex);
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-40 -translate-y-1/2">
        <div
          className="absolute -translate-x-1/2"
          style={{
            left: layoutReady ? `calc(50% - ${cardWidthRem / 2}rem)` : "1.125rem",
          }}
        >
          <CoachNavButton direction="prev" label={prevLabel} onPress={handlePrevPress} />
        </div>
        <div
          className="absolute -translate-x-1/2"
          style={{
            left: layoutReady ? `calc(50% + ${cardWidthRem / 2}rem)` : "calc(100% - 1.125rem)",
          }}
        >
          <CoachNavButton direction="next" label={nextLabel} onPress={handleNextPress} />
        </div>
      </div>
    </div>
  );
}
