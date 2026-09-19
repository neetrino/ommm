"use client";

import { m } from "framer-motion";
import { CoachesPageCoachCard } from "@/components/marketing/coaches/coaches-page-coach-card";
import type {
  CoachSlideCopy,
  CoachSlideLane,
} from "@/components/marketing/home/featured-coach-slide-card";
import { mapCoachSlideToPageCardProps } from "@/components/marketing/home/home-featured-coach-slides";
import styles from "@/components/marketing/home/featured-coach-slide-card-mobile.module.css";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type FeaturedCoachSlideCardMobileProps = {
  slide: CoachSlideCopy;
  isActive: boolean;
  lane: CoachSlideLane;
  peekLayout: boolean;
  isScrolling?: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  ariaHidden?: boolean;
  instantCarouselSnap?: boolean;
};

const CARD_MOTION = {
  duration: 0.42,
  ease: [0.22, 1, 0.36, 1] as const,
};

const CARD_MOTION_SCROLLING = {
  duration: 0.18,
  ease: [0.33, 1, 0.36, 1] as const,
};

const SIDE_CARD_SCALE = 0.93;
const FAR_CARD_SCALE = 0.88;

function laneZIndex(lane: CoachSlideLane): number {
  if (lane === "center") {
    return 20;
  }
  if (lane === "side") {
    return 10;
  }
  return 0;
}

function resolveLaneOpacity(
  lane: CoachSlideLane,
  isActive: boolean,
  peekLayout: boolean,
): number {
  if (isActive) {
    return 1;
  }
  if (!peekLayout) {
    return 0.48;
  }
  if (lane === "side") {
    return 0.66;
  }
  if (lane === "far") {
    return 0.38;
  }
  return 0.48;
}

function resolveLaneScale(
  lane: CoachSlideLane,
  isActive: boolean,
  peekLayout: boolean,
  reduceMotion: boolean,
): number {
  if (reduceMotion) {
    return 1;
  }
  if (!peekLayout) {
    return isActive ? 1 : 0.98;
  }
  if (lane === "center") {
    return 1;
  }
  if (lane === "side") {
    return SIDE_CARD_SCALE;
  }
  return FAR_CARD_SCALE;
}

function resolveCardMotion(instantSnap: boolean, isScrolling: boolean) {
  if (instantSnap) {
    return { duration: 0 };
  }
  return isScrolling ? CARD_MOTION_SCROLLING : CARD_MOTION;
}

function HomeMobileCoachPageCard({
  slide,
  expanded,
  onToggleExpand,
}: {
  slide: CoachSlideCopy;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const card = mapCoachSlideToPageCardProps(slide);

  return (
    <CoachesPageCoachCard
      user={card.user}
      cardImageUrl={card.cardImageUrl}
      specialization={card.specialization}
      bio={card.bio}
      experienceYears={card.experienceYears}
      expanded={expanded}
      onToggleExpand={onToggleExpand}
    />
  );
}

/** Home mobile featured coach — same portrait card as `/coaches`. */
export function FeaturedCoachSlideCardMobile({
  slide,
  isActive,
  lane,
  peekLayout,
  isScrolling = false,
  expanded,
  onToggleExpand,
  ariaHidden,
  instantCarouselSnap = false,
}: FeaturedCoachSlideCardMobileProps) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <m.div
      aria-hidden={ariaHidden ? true : undefined}
      className={styles.cardRoot}
      style={{
        zIndex: laneZIndex(lane),
        transformOrigin: "top center",
        pointerEvents: isActive ? "auto" : "none",
      }}
      initial={false}
      animate={{
        opacity: resolveLaneOpacity(lane, isActive, peekLayout),
        scale: resolveLaneScale(lane, isActive, peekLayout, reduceMotion),
        y: "0rem",
      }}
      transition={resolveCardMotion(instantCarouselSnap, isScrolling)}
    >
      <HomeMobileCoachPageCard
        slide={slide}
        expanded={isActive && expanded}
        onToggleExpand={onToggleExpand}
      />
    </m.div>
  );
}
