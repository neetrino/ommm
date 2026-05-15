"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";

const COACH_CAROUSEL_GAP_PX = 20;
const VIEWPORT_INNER_GUTTER_PX = 48;
const CAROUSEL_TRANSFORM_MS = 320;

export type CoachSlideCopy = {
  name: string;
  role: string;
  bio: string;
  experience: string;
  imageAlt: string;
};

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
  cardWidth: number;
};

function useCoachCarouselMetrics(visualSlideIndex: number) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<CarouselLayout>({ viewportWidth: 0, cardWidth: 0 });
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
      let cw = first ? Math.round(first.getBoundingClientRect().width) : 0;
      if (vw > 0 && cw <= 0) {
        cw = Math.min(729, Math.max(280, vw - VIEWPORT_INNER_GUTTER_PX));
      }
      setLayout({ viewportWidth: vw, cardWidth: cw });
    };
    read();
    const rafId = requestAnimationFrame(() => {
      read();
    });
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

  const { viewportWidth: vw, cardWidth: cw } = layout;
  const layoutReady = vw > 0 && cw > 0;
  const edgePad = layoutReady ? Math.max(0, (vw - cw) / 2) : 0;
  const translateX = layoutReady ? -visualSlideIndex * (cw + COACH_CAROUSEL_GAP_PX) : 0;
  const trackTransition =
    reducedMotion || !canAnimateSlides || !layoutReady
      ? undefined
      : `transform ${CAROUSEL_TRANSFORM_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;

  return {
    viewportRef,
    trackRef,
    edgePad,
    translateX,
    trackTransition,
    reducedMotion,
    layoutReady,
  };
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
      className={`relative z-20 flex shrink-0 items-center justify-center rounded-full bg-[rgba(255,255,255,0.28)] text-[#2f3438] shadow-sm transition-[transform,opacity] hover:bg-[rgba(255,255,255,0.4)] hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
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
      <div className="flex items-center gap-2 rounded-full bg-[rgba(45,55,60,0.82)] px-2 py-1.5 text-[13px] font-medium text-[#f4f4f0] shadow-sm backdrop-blur-sm md:text-sm">
        <CoachNavButton direction="prev" label={prevLabel} onPress={onPrev} size="sm" />
        <span className="min-w-[3.5rem] select-none text-center tabular-nums">{counterText}</span>
        <CoachNavButton direction="next" label={nextLabel} onPress={onNext} size="sm" />
      </div>
    </div>
  );
}

type CoachSlideCardProps = {
  slide: CoachSlideCopy;
  isActive: boolean;
  overlayAriaLabel: string;
  onActivate: () => void;
  /** Bookend clones are visual-only; hide from assistive tech. */
  ariaHidden?: boolean;
};

function CoachSlideCard({ slide, isActive, overlayAriaLabel, onActivate, ariaHidden }: CoachSlideCardProps) {
  return (
    <div
      aria-hidden={ariaHidden ? true : undefined}
      className={`relative max-w-[729px] min-w-[280px] w-[min(729px,max(280px,calc(100cqw-48px)))] shrink-0 transition-opacity duration-300 ${
        isActive ? "opacity-100" : "cursor-pointer opacity-[0.5] hover:opacity-[0.72]"
      }`}
    >
      <div className="overflow-hidden rounded-[40px] bg-[#e5f4f9] shadow-sm">
        <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2 md:items-start md:gap-10 md:p-10">
          <div className="order-2 flex flex-col gap-4 md:order-1">
            <p
              className={`${marketingMontserrat.className} text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-tight tracking-[0.72px] text-[#1d1c15]`}
            >
              {slide.name}
            </p>
            <p className={`${marketingMontserrat.className} text-base font-bold text-[#4a4738]`}>{slide.role}</p>
            <p className={`${marketingMontserrat.className} text-base font-normal leading-6 text-[#4a4738]`}>
              {slide.bio}
            </p>
            <p className={`${marketingMontserrat.className} text-base font-bold text-[#4a4738]`}>
              {slide.experience}
            </p>
          </div>
          <div className="relative order-1 mx-auto aspect-[342/597] w-full max-w-[220px] md:order-2 md:max-w-[280px]">
            <Image
              src={HOME_SECTION_ASSETS.coachPortrait}
              alt={slide.imageAlt}
              fill
              sizes="(max-width: 768px) 220px, 280px"
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>
      {!isActive ? (
        <button
          type="button"
          className="absolute inset-0 z-10 cursor-pointer rounded-[40px] border-0 bg-transparent p-0"
          aria-label={overlayAriaLabel}
          tabIndex={ariaHidden ? -1 : undefined}
          onClick={onActivate}
        />
      ) : null}
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

  const { viewportRef, trackRef, edgePad, translateX, trackTransition, reducedMotion, layoutReady } =
    useCoachCarouselMetrics(visualSlideIndex);

  return (
    <div className="relative mt-10 flex min-h-[280px] items-center gap-2 md:gap-4">
      <CoachNavButton direction="prev" label={prevLabel} onPress={goPrev} />

      <div
        ref={viewportRef}
        className="min-w-0 flex-1 overflow-hidden [container-type:inline-size]"
      >
        <div
          ref={trackRef}
          className={`flex flex-nowrap ${layoutReady ? "visible" : "invisible"}`}
          style={{
            gap: COACH_CAROUSEL_GAP_PX,
            paddingLeft: edgePad,
            paddingRight: edgePad,
            transform: `translate3d(${translateX}px,0,0)`,
            transition: trackTransition,
            willChange: reducedMotion || !layoutReady ? undefined : "transform",
          }}
        >
          {displaySlides.map((slide, displayIndex) => {
            const realIndex = useCloneBookends
              ? displayIndexToRealIndex(displaySlides.length, displayIndex)
              : displayIndex;
            const isClone = useCloneBookends && (displayIndex === 0 || displayIndex === displaySlides.length - 1);
            return (
              <CoachSlideCard
                key={
                  isClone
                    ? `coach-clone-${displayIndex}-${slide.name}`
                    : `coach-slide-${realIndex}-${slide.name}`
                }
                slide={slide}
                isActive={active === realIndex}
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

      <CoachNavButton direction="next" label={nextLabel} onPress={goNext} />
    </div>
  );
}
