"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  FeaturedCoachSlideCard,
  type CoachSlideCopy,
  type CoachSlideLane,
} from "@/components/marketing/home/featured-coach-slide-card";

export type { CoachSlideCopy, CoachSlideLane } from "@/components/marketing/home/featured-coach-slide-card";

const GAP_REM = 1.25;
const CAROUSEL_TRANSFORM_MS = 420;

/** Viewport width (px) at which peek + vertical choreography match desktop Figma. */
const PEEK_LAYOUT_MIN_VIEWPORT_PX = 640;

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
      const first = track.firstElementChild as HTMLElement | null;
      const vw = viewport.clientWidth;
      const rootRemPx = readRootRemPx();
      const cwPx = first ? first.getBoundingClientRect().width : 0;
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
      : `transform ${CAROUSEL_TRANSFORM_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;

  const peekLayout =
    layoutReady && vw >= PEEK_LAYOUT_MIN_VIEWPORT_PX;

  return {
    viewportRef,
    trackRef,
    edgePadRem,
    translateRem,
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
  size?: "md" | "sm";
};

function CoachNavButton({ direction, label, onPress, size = "md" }: CoachNavButtonProps) {
  const isSm = size === "sm";
  return (
    <button
      type="button"
      className={`relative z-20 flex shrink-0 items-center justify-center rounded-full text-[var(--ommm-coach-nav-fg)] shadow-sm transition-[background-color,transform,opacity] [background-color:var(--ommm-coach-nav-bg)] hover:[background-color:var(--ommm-coach-nav-bg-hover)] hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
        isSm ? "h-8 w-8" : "h-11 w-11 md:h-16 md:w-16"
      }`}
      aria-label={label}
      onClick={onPress}
    >
      <CarouselChevron
        className={isSm ? "h-3.5 w-3.5" : "h-3 w-3 md:h-4 md:w-4"}
        flipped={direction === "next"}
      />
    </button>
  );
}

type CoachesPaginationProps = {
  counterText: string;
  groupAriaLabel: string;
  prevLabel: string;
  nextLabel: string;
  onPrev: () => void;
  onNext: () => void;
};

export function CoachesPagination({
  counterText,
  groupAriaLabel,
  prevLabel,
  nextLabel,
  onPrev,
  onNext,
}: CoachesPaginationProps) {
  return (
    <div className="mt-6 flex justify-center" role="group" aria-label={groupAriaLabel}>
      <div
        className="flex items-center gap-2 rounded-full px-2 py-1.5 text-[0.8125rem] font-medium shadow-sm backdrop-blur-sm md:text-sm"
        style={{
          backgroundColor: "var(--ommm-coach-pagination-bg)",
          color: "var(--ommm-coach-pagination-fg)",
        }}
      >
        <CoachNavButton direction="prev" label={prevLabel} onPress={onPrev} size="sm" />
        <span className="min-w-[3.5rem] select-none text-center tabular-nums">{counterText}</span>
        <CoachNavButton direction="next" label={nextLabel} onPress={onNext} size="sm" />
      </div>
    </div>
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
  const visualSlideIndex = useCloneBookends ? active + 1 : active;

  const {
    viewportRef,
    trackRef,
    edgePadRem,
    translateRem,
    trackTransition,
    reducedMotion,
    layoutReady,
    peekLayout,
  } = useCoachCarouselMetrics(visualSlideIndex);

  return (
    <div className="relative mt-10 flex min-h-[17.5rem] items-start gap-2 md:gap-4">
      <div className="relative z-40 flex shrink-0 self-center">
        <CoachNavButton direction="prev" label={prevLabel} onPress={goPrev} />
      </div>

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
            transition: trackTransition,
            willChange: reducedMotion || !layoutReady ? undefined : "transform",
          }}
        >
          {displaySlides.map((slide, displayIndex) => {
            const realIndex = useCloneBookends
              ? displayIndexToRealIndex(displaySlides.length, displayIndex)
              : displayIndex;
            const isClone = useCloneBookends && (displayIndex === 0 || displayIndex === displaySlides.length - 1);
            const lane = resolveCoachSlideLane(peekLayout, displayIndex, visualSlideIndex);
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

      <div className="relative z-40 flex shrink-0 self-center">
        <CoachNavButton direction="next" label={nextLabel} onPress={goNext} />
      </div>

    </div>
  );
}
