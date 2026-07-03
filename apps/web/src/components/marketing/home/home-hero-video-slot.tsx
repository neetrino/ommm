"use client";

import type { RefObject } from "react";
import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";

type HomeHeroVideoSlotProps = {
  desktopVideoUrl: string | null;
  mobileVideoUrl: string;
  mobileVideoMp4Url: string;
  desktopRef: RefObject<HTMLVideoElement | null>;
  mobileRef: RefObject<HTMLVideoElement | null>;
  autoPlay?: boolean;
  onEnded: () => void;
  onError: () => void;
};

type HomeHeroVideoSourcesProps = {
  webmUrl: string;
  mp4Url?: string;
};

/** MP4 first — Safari/iOS; WebM second — Chrome/Firefox. */
function HomeHeroVideoSources({ webmUrl, mp4Url }: HomeHeroVideoSourcesProps) {
  return (
    <>
      {mp4Url ? <source src={mp4Url} type="video/mp4" /> : null}
      <source src={webmUrl} type="video/webm" />
    </>
  );
}

/** Renders desktop + mobile hero videos; CSS picks the visible source by viewport. */
export function HomeHeroVideoSlot({
  desktopVideoUrl,
  mobileVideoUrl,
  mobileVideoMp4Url,
  desktopRef,
  mobileRef,
  autoPlay = false,
  onEnded,
  onError,
}: HomeHeroVideoSlotProps) {
  const mobileOnly = desktopVideoUrl === null;
  const sharedVideoProps = {
    muted: true,
    playsInline: true,
    preload: "auto" as const,
    onEnded,
    onError,
  };

  return (
    <>
      {desktopVideoUrl ? (
        <video
          ref={desktopRef}
          className={`${styles.homeHeroVideo} ${styles.homeHeroVideoDesktop}`}
          autoPlay={autoPlay}
          {...sharedVideoProps}
        >
          <HomeHeroVideoSources webmUrl={desktopVideoUrl} />
        </video>
      ) : null}
      <video
        ref={mobileRef}
        className={`${styles.homeHeroVideo} ${styles.homeHeroVideoMobile} ${
          mobileOnly ? styles.homeHeroVideoMobileOnly : ""
        }`}
        autoPlay={autoPlay}
        {...sharedVideoProps}
      >
        <HomeHeroVideoSources webmUrl={mobileVideoUrl} mp4Url={mobileVideoMp4Url} />
      </video>
    </>
  );
}
