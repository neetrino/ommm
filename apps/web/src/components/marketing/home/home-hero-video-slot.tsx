"use client";

import type { RefObject } from "react";
import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";

type HomeHeroVideoSlotProps = {
  desktopVideoUrl: string | null;
  mobileVideoUrl: string;
  desktopRef: RefObject<HTMLVideoElement | null>;
  mobileRef: RefObject<HTMLVideoElement | null>;
  autoPlay?: boolean;
  onEnded: () => void;
};

/** Renders desktop + mobile hero videos; CSS picks the visible source by viewport. */
export function HomeHeroVideoSlot({
  desktopVideoUrl,
  mobileVideoUrl,
  desktopRef,
  mobileRef,
  autoPlay = false,
  onEnded,
}: HomeHeroVideoSlotProps) {
  const mobileOnly = desktopVideoUrl === null;
  const sharedVideoProps = {
    muted: true,
    playsInline: true,
    preload: "auto" as const,
    onEnded,
  };

  return (
    <>
      {desktopVideoUrl ? (
        <video
          ref={desktopRef}
          className={`${styles.homeHeroVideo} ${styles.homeHeroVideoDesktop}`}
          src={desktopVideoUrl}
          autoPlay={autoPlay}
          {...sharedVideoProps}
        />
      ) : null}
      <video
        ref={mobileRef}
        className={`${styles.homeHeroVideo} ${styles.homeHeroVideoMobile} ${
          mobileOnly ? styles.homeHeroVideoMobileOnly : ""
        }`}
        src={mobileVideoUrl}
        autoPlay={autoPlay}
        {...sharedVideoProps}
      />
    </>
  );
}
