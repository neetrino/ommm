"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import Image from "next/image";
import styles from "@/components/marketing/home/featured-coach-slide-card-mobile.module.css";
import type { CoachSlideCopy, CoachSlideLane } from "@/components/marketing/home/featured-coach-slide-card";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { belowFoldImageProps } from "@/lib/image-loading-props";

type FeaturedCoachSlideCardMobileProps = {
  slide: CoachSlideCopy;
  isActive: boolean;
  lane: CoachSlideLane;
  peekLayout: boolean;
  /** Softer card motion while the user is finger-dragging the carousel. */
  isScrolling?: boolean;
  overlayAriaLabel: string;
  onActivate: () => void;
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
  if (lane === "center") return 20;
  if (lane === "side") return 10;
  return 0;
}

/** Figma mobile coach card `97:6075`. */
export function FeaturedCoachSlideCardMobile({
  slide,
  isActive,
  lane,
  peekLayout,
  isScrolling = false,
  overlayAriaLabel,
  onActivate,
  ariaHidden,
  instantCarouselSnap = false,
}: FeaturedCoachSlideCardMobileProps) {
  const reduceMotion = usePrefersReducedMotion();

  const y = "0rem";

  const opacity = (() => {
    if (isActive) return 1;
    if (!peekLayout) return 0.48;
    if (lane === "side") return 0.66;
    if (lane === "far") return 0.38;
    return 0.48;
  })();

  const scale = (() => {
    if (reduceMotion) return 1;
    if (!peekLayout) return isActive ? 1 : 0.98;
    if (lane === "center") return 1;
    if (lane === "side") return SIDE_CARD_SCALE;
    return FAR_CARD_SCALE;
  })();

  return (
    <motion.article
      aria-hidden={ariaHidden ? true : undefined}
      className={styles.cardRoot}
      style={{ zIndex: laneZIndex(lane), transformOrigin: "top center" }}
      initial={false}
      animate={{ opacity, scale, y }}
      transition={
        instantCarouselSnap
          ? { duration: 0 }
          : isScrolling
            ? CARD_MOTION_SCROLLING
            : CARD_MOTION
      }
    >
      <div className={styles.cardInner}>
        <div className={`${styles.textColumn} ${marketingMontserrat.className}`}>
          <p className={`${styles.role} font-bold`}>{slide.role}</p>
          <p className={`${styles.bio} font-normal`}>{slide.bio}</p>
          <p className={`${styles.experience} font-bold`}>{slide.experience}</p>
        </div>

        <div className={styles.imageColumn}>
          <div className={styles.imageFrame}>
            <div className={styles.imageFlip}>
              <div className={styles.imageCrop}>
                <Image
                  src={HOME_SECTION_ASSETS.coachPortrait}
                  alt={slide.imageAlt}
                  fill
                  sizes="60vw"
                  className={styles.image}
                  {...belowFoldImageProps()}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.nameHeader} ${marketingMontserrat.className}`}>
          <p className={`${styles.name} font-extrabold tracking-[0.045em]`}>{slide.name}</p>
        </div>
      </div>

      {!isActive ? (
        <button
          type="button"
          className={styles.activateOverlay}
          aria-label={overlayAriaLabel}
          tabIndex={ariaHidden ? -1 : undefined}
          onClick={onActivate}
        />
      ) : null}
    </motion.article>
  );
}
