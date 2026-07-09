"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { HOME_HERO_CAROUSEL_SLIDE_COUNT } from "@/components/marketing/home/home-hero-banner-tokens";
import { beginHomeHeroLogoMarkPlaybackFromUserGesture } from "@/components/marketing/home/home-hero-logo-mark-video-playback-registry";
import { MARKETING_PHONE_VIEWPORT_MEDIA_QUERY } from "@/hooks/use-is-marketing-phone-viewport";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export { HOME_HERO_CAROUSEL_SLIDE_COUNT };

export const HOME_HERO_VIDEO_SLIDE_INDEX = 0;

export const HOME_HERO_PROMO_BANNER_SLIDE_INDEX = 1;

export const HOME_HERO_LEGACY_PHOTO_SLIDE_INDEX = 2;

export type HomeHeroPromoBannerKey = "promoBanner3";

export type HomeHeroCarouselSlide =
  | { kind: "video" }
  | { kind: "legacy-photo" }
  | { kind: "promo-banner"; assetKey: HomeHeroPromoBannerKey };

/** video | founding memberships promo | legacy meditation hero. */
export const HOME_HERO_CAROUSEL_SLIDES: readonly HomeHeroCarouselSlide[] = [
  { kind: "video" },
  { kind: "promo-banner", assetKey: "promoBanner3" },
  { kind: "legacy-photo" },
] as const;

const SLIDE_WIDTH_PERCENT = 100 / HOME_HERO_CAROUSEL_SLIDE_COUNT;

export function resolveHomeHeroTrackOffset(slideIndex: number): string {
  return `${-slideIndex * SLIDE_WIDTH_PERCENT}%`;
}

type HomeHeroVideoSlotRefs = {
  desktop: RefObject<HTMLVideoElement | null>;
  mobile: RefObject<HTMLVideoElement | null>;
};

type HomeHeroSlideContextValue = {
  activeSlideIndex: number;
  activeSlide: HomeHeroCarouselSlide;
  trackOffset: string;
  isVideoActive: boolean;
  isLegacyPhotoActive: boolean;
  isPromoBannerActive: boolean;
  /** @deprecated Use isLegacyPhotoActive — kept for HomeHeroPhotoContentLayer. */
  isPhotoActive: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  desktopVideoUrl: string | null;
  mobileVideoUrl: string;
  mobileVideoMp4Url: string;
  videoRefs: HomeHeroVideoSlotRefs;
  goPrev: () => void;
  goNext: () => void;
  goToSlide: (index: number) => void;
  onVideoEnded: () => void;
  onVideoError: () => void;
};

const HomeHeroSlideContext = createContext<HomeHeroSlideContextValue | null>(null);

type HomeHeroSlideProviderProps = {
  desktopVideoUrl: string | null;
  mobileVideoUrl: string;
  mobileVideoMp4Url: string;
  children: ReactNode;
};

function isMarketingPhoneViewport(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(MARKETING_PHONE_VIEWPORT_MEDIA_QUERY).matches
  );
}

function resolveVideoElement(
  refs: HomeHeroVideoSlotRefs,
  desktopVideoUrl: string | null,
): HTMLVideoElement | null {
  if (isMarketingPhoneViewport() || desktopVideoUrl === null) {
    return refs.mobile.current;
  }
  return refs.desktop.current;
}

function wrapSlideIndex(index: number): number {
  return (
    ((index % HOME_HERO_CAROUSEL_SLIDE_COUNT) + HOME_HERO_CAROUSEL_SLIDE_COUNT) %
    HOME_HERO_CAROUSEL_SLIDE_COUNT
  );
}

export function HomeHeroSlideProvider({
  desktopVideoUrl,
  mobileVideoUrl,
  mobileVideoMp4Url,
  children,
}: HomeHeroSlideProviderProps) {
  const reducedMotion = usePrefersReducedMotion();
  const videoDesktopRef = useRef<HTMLVideoElement | null>(null);
  const videoMobileRef = useRef<HTMLVideoElement | null>(null);
  const videoRefs = useMemo(
    () => ({ desktop: videoDesktopRef, mobile: videoMobileRef }),
    [],
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState(() =>
    reducedMotion ? HOME_HERO_LEGACY_PHOTO_SLIDE_INDEX : HOME_HERO_VIDEO_SLIDE_INDEX,
  );

  const pauseVideo = useCallback(() => {
    videoDesktopRef.current?.pause();
    videoMobileRef.current?.pause();
  }, []);

  const playVideoFromStart = useCallback(() => {
    const video = resolveVideoElement(videoRefs, desktopVideoUrl);
    if (!video) {
      return;
    }
    video.currentTime = 0;
    void video.play().catch(() => {
      /* Autoplay may be blocked until user gesture. */
    });
  }, [desktopVideoUrl, videoRefs]);

  const goToSlide = useCallback(
    (index: number) => {
      const nextIndex = wrapSlideIndex(index);
      if (nextIndex === HOME_HERO_LEGACY_PHOTO_SLIDE_INDEX) {
        beginHomeHeroLogoMarkPlaybackFromUserGesture();
      }
      setActiveSlideIndex(nextIndex);
      if (nextIndex === HOME_HERO_VIDEO_SLIDE_INDEX) {
        playVideoFromStart();
        return;
      }
      pauseVideo();
    },
    [pauseVideo, playVideoFromStart],
  );

  const goPrev = useCallback(() => {
    goToSlide(activeSlideIndex - 1);
  }, [activeSlideIndex, goToSlide]);

  const goNext = useCallback(() => {
    goToSlide(activeSlideIndex + 1);
  }, [activeSlideIndex, goToSlide]);

  const onVideoEnded = useCallback(() => {
    pauseVideo();
    setActiveSlideIndex(HOME_HERO_PROMO_BANNER_SLIDE_INDEX);
  }, [pauseVideo]);

  const onVideoError = useCallback(() => {
    pauseVideo();
    setActiveSlideIndex(HOME_HERO_PROMO_BANNER_SLIDE_INDEX);
  }, [pauseVideo]);

  const activeSlide = HOME_HERO_CAROUSEL_SLIDES[activeSlideIndex] ?? HOME_HERO_CAROUSEL_SLIDES[0];

  const value = useMemo<HomeHeroSlideContextValue>(
    () => ({
      activeSlideIndex,
      activeSlide,
      trackOffset: resolveHomeHeroTrackOffset(activeSlideIndex),
      isVideoActive: activeSlideIndex === HOME_HERO_VIDEO_SLIDE_INDEX,
      isLegacyPhotoActive: activeSlideIndex === HOME_HERO_LEGACY_PHOTO_SLIDE_INDEX,
      isPromoBannerActive: activeSlideIndex === HOME_HERO_PROMO_BANNER_SLIDE_INDEX,
      isPhotoActive: activeSlideIndex === HOME_HERO_LEGACY_PHOTO_SLIDE_INDEX,
      canGoPrev: true,
      canGoNext: true,
      desktopVideoUrl,
      mobileVideoUrl,
      mobileVideoMp4Url,
      videoRefs,
      goPrev,
      goNext,
      goToSlide,
      onVideoEnded,
      onVideoError,
    }),
    [
      activeSlide,
      activeSlideIndex,
      desktopVideoUrl,
      goNext,
      goPrev,
      goToSlide,
      mobileVideoMp4Url,
      mobileVideoUrl,
      onVideoEnded,
      onVideoError,
      videoRefs,
    ],
  );

  return (
    <HomeHeroSlideContext.Provider value={value}>{children}</HomeHeroSlideContext.Provider>
  );
}

export function useHomeHeroSlide(): HomeHeroSlideContextValue {
  const context = useContext(HomeHeroSlideContext);
  if (!context) {
    throw new Error("useHomeHeroSlide must be used within HomeHeroSlideProvider");
  }
  return context;
}

/** Returns null outside the hero carousel provider (static hero fallback). */
export function useOptionalHomeHeroSlide(): HomeHeroSlideContextValue | null {
  return useContext(HomeHeroSlideContext);
}

export function resolveActiveHomeHeroVideoElement(
  context: Pick<HomeHeroSlideContextValue, "videoRefs" | "desktopVideoUrl">,
): HTMLVideoElement | null {
  return resolveVideoElement(context.videoRefs, context.desktopVideoUrl);
}
