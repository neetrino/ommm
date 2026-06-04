"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import Image from "next/image";
import styles from "@/components/marketing/home/featured-coach-slide-card.module.css";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";
import { belowFoldImageProps } from "@/lib/image-loading-props";

export type CoachSlideCopy = {
  name: string;
  role: string;
  bio: string;
  experience: string;
  imageAlt: string;
};

export type CoachSlideLane = "center" | "side" | "far";

type FeaturedCoachSlideCardProps = {
  slide: CoachSlideCopy;
  isActive: boolean;
  /** Position relative to the visually centered slide (Figma peek row). */
  lane: CoachSlideLane;
  /** When false, cards fill width and vertical choreography is disabled (mobile). */
  peekLayout: boolean;
  overlayAriaLabel: string;
  onActivate: () => void;
  /** Bookend clones are visual-only; hide from assistive tech. */
  ariaHidden?: boolean;
  /**
   * When true, skip opacity/scale/y tween — used during infinite-carousel recenter so
   * lane jumps do not read as a visible pulse after the track snaps.
   */
  instantCarouselSnap?: boolean;
};

const CARD_MOTION = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1] as const,
};

/** Matches `--ommm-coach-side-drop` max; Framer interpolates rem strings reliably. */
const COACH_SIDE_DROP_REM = 2.25;
const SIDE_CARD_SCALE = 0.93;
const FAR_CARD_SCALE = 0.88;

function cardWidthClassName(peekLayout: boolean): string {
  if (peekLayout) {
    return "w-[min(45.5625rem,min(68cqw,calc(100cqw-2rem)))] max-w-[min(45.5625rem,min(68cqw,calc(100cqw-2rem)))]";
  }
  return "w-[min(45.5625rem,calc(100cqw-1.25rem))] max-w-[min(45.5625rem,calc(100cqw-1.25rem))]";
}

function laneZIndex(lane: CoachSlideLane): number {
  if (lane === "center") return 20;
  if (lane === "side") return 10;
  return 0;
}

export function FeaturedCoachSlideCard({
  slide,
  isActive,
  lane,
  peekLayout,
  overlayAriaLabel,
  onActivate,
  ariaHidden,
  instantCarouselSnap = false,
}: FeaturedCoachSlideCardProps) {
  const reduceMotion = usePrefersReducedMotion();

  const showSideDrop = peekLayout && lane === "side" && !reduceMotion;
  const y = showSideDrop ? `${COACH_SIDE_DROP_REM}rem` : "0rem";

  const opacity = (() => {
    if (isActive) return 1;
    if (!peekLayout) return 0.48;
    if (lane === "side") return 0.66;
    if (lane === "far") return 0.38;
    return 0.48;
  })();

  /** Peek mode: keep immediate neighbors at scale 1 so L/R visible strips stay equal (scale skews bounds). */
  const scale = (() => {
    if (reduceMotion) return 1;
    if (!peekLayout) return isActive ? 1 : 0.98;
    if (lane === "center") return 1;
    if (lane === "side") return SIDE_CARD_SCALE;
    return FAR_CARD_SCALE;
  })();

  const isCenterVisual = lane === "center";
  const cardSurface =
    isActive && (!peekLayout || isCenterVisual)
      ? "var(--ommm-coach-card-surface-active)"
      : "var(--ommm-coach-card-surface)";
  const cardShadow =
    isActive && (!peekLayout || isCenterVisual)
      ? "var(--ommm-coach-card-shadow-active)"
      : "var(--ommm-coach-card-shadow)";

  return (
    <motion.article
      aria-hidden={ariaHidden ? true : undefined}
      className={`relative min-w-0 shrink-0 ${cardWidthClassName(peekLayout)}`}
      style={{ zIndex: laneZIndex(lane), transformOrigin: "top center" }}
      initial={false}
      animate={{ opacity, scale, y }}
      transition={instantCarouselSnap ? { duration: 0 } : CARD_MOTION}
    >
      <div
        className={`${styles.cardShell} relative grid min-h-0 w-full grid-cols-1 overflow-hidden md:min-h-[var(--ommm-coach-card-min-height)]`}
        style={{
          borderRadius: "var(--ommm-coach-card-radius)",
          backgroundColor: cardSurface,
          boxShadow: cardShadow,
        }}
      >
        <div
          className={`${styles.textColumn} order-2 flex min-h-0 flex-col justify-center gap-y-[var(--ommm-coach-text-block-gap)] px-[var(--ommm-coach-text-gutter)] py-[clamp(1.5rem,4vw,2rem)] md:order-1 md:py-[clamp(1.5rem,4vw,2.5rem)]`}
        >
          <p
            className={`${marketingMontserrat.className} font-extrabold tracking-[0.045em]`}
            style={{
              color: "var(--ommm-coach-card-text-strong)",
              fontSize: "var(--ommm-coach-name-size)",
              lineHeight: "var(--ommm-coach-name-leading)",
            }}
          >
            {slide.name}
          </p>
          <p
            className={`${marketingMontserrat.className} font-bold`}
            style={{
              color: "var(--ommm-coach-card-text-muted)",
              fontSize: "var(--ommm-coach-body-size)",
              lineHeight: "var(--ommm-coach-body-leading)",
            }}
          >
            {slide.role}
          </p>
          <p
            className={`${marketingMontserrat.className} font-normal`}
            style={{
              color: "var(--ommm-coach-card-text-muted)",
              fontSize: "var(--ommm-coach-body-size)",
              lineHeight: "var(--ommm-coach-body-leading)",
            }}
          >
            {slide.bio}
          </p>
          <p
            className={`${marketingMontserrat.className} font-bold`}
            style={{
              color: "var(--ommm-coach-card-text-muted)",
              fontSize: "var(--ommm-coach-body-size)",
              lineHeight: "var(--ommm-coach-body-leading)",
            }}
          >
            {slide.experience}
          </p>
        </div>

        <div
          className={`${styles.imageColumn} relative order-1 aspect-[342/597] w-full max-md:max-h-[min(28rem,78vh)] md:order-2 md:aspect-auto md:max-h-none md:self-stretch`}
        >
          <div className={styles.imageViewport} aria-hidden>
            <div className={styles.imageFlip}>
              <div className={styles.imageCrop}>
                <div className={styles.imageFrame}>
                  <Image
                    src={HOME_SECTION_ASSETS.coachPortrait}
                    alt={slide.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, min(21.375rem, 46vw)"
                    className={styles.image}
                    {...belowFoldImageProps()}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isActive ? (
        <button
          type="button"
          className="absolute inset-0 z-30 cursor-pointer border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          style={{ borderRadius: "var(--ommm-coach-card-radius)" }}
          aria-label={overlayAriaLabel}
          tabIndex={ariaHidden ? -1 : undefined}
          onClick={onActivate}
        />
      ) : null}
    </motion.article>
  );
}
