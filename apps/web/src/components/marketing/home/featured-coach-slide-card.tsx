"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { marketingMontserrat } from "@/lib/fonts/marketing-montserrat";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";

export type CoachSlideCopy = {
  name: string;
  role: string;
  bio: string;
  experience: string;
  imageAlt: string;
};

type FeaturedCoachSlideCardProps = {
  slide: CoachSlideCopy;
  isActive: boolean;
  overlayAriaLabel: string;
  onActivate: () => void;
  /** Bookend clones are visual-only; hide from assistive tech. */
  ariaHidden?: boolean;
};

const CARD_MOTION = {
  duration: 0.34,
  ease: [0.22, 1, 0.36, 1] as const,
};

export function FeaturedCoachSlideCard({
  slide,
  isActive,
  overlayAriaLabel,
  onActivate,
  ariaHidden,
}: FeaturedCoachSlideCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      aria-hidden={ariaHidden ? true : undefined}
      className="relative max-w-[min(45.5625rem,calc(100cqw-3rem))] min-w-[17.5rem] w-[min(45.5625rem,calc(100cqw-3rem))] shrink-0"
      initial={false}
      animate={{
        opacity: isActive ? 1 : 0.52,
        scale: reduceMotion ? 1 : isActive ? 1 : 0.985,
      }}
      transition={CARD_MOTION}
    >
      <div
        className="relative grid min-h-0 w-full grid-cols-1 overflow-hidden shadow-[var(--ommm-coach-card-shadow)] md:min-h-[var(--ommm-coach-card-min-height)] md:grid-cols-[minmax(0,1fr)_min(21.375rem,46%)]"
        style={{
          borderRadius: "var(--ommm-coach-card-radius)",
          backgroundColor: "var(--ommm-coach-card-surface)",
        }}
      >
        <div className="order-2 flex min-h-0 flex-col justify-center gap-y-[var(--ommm-coach-text-block-gap)] px-[var(--ommm-coach-text-gutter)] py-[clamp(1.5rem,4vw,2rem)] md:order-1 md:py-[clamp(1.5rem,4vw,2.5rem)]">
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

        <div className="relative order-1 aspect-[342/597] w-full max-md:max-h-[min(28rem,78vh)] overflow-hidden md:order-2 md:aspect-auto md:max-h-none md:self-stretch md:overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="pointer-events-none absolute left-0 max-w-none overflow-hidden"
              style={{ width: "120.17%", height: "103.34%", top: "-3.28%" }}
              aria-hidden
            >
              <div className="relative h-full w-full">
                <Image
                  src={HOME_SECTION_ASSETS.coachPortrait}
                  alt={slide.imageAlt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, min(21.375rem, 46vw)"
                  className="object-cover"
                  style={{ objectPosition: "42% 18%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isActive ? (
        <button
          type="button"
          className="absolute inset-0 z-10 cursor-pointer border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          style={{ borderRadius: "var(--ommm-coach-card-radius)" }}
          aria-label={overlayAriaLabel}
          tabIndex={ariaHidden ? -1 : undefined}
          onClick={onActivate}
        />
      ) : null}
    </motion.article>
  );
}
