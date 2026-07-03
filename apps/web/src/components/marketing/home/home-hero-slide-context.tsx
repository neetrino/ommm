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
import { MARKETING_PHONE_VIEWPORT_MEDIA_QUERY } from "@/hooks/use-is-marketing-phone-viewport";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export type HomeHeroVideoEntry = "left" | "right";
export type HomeHeroPhotoEntry = "left" | "center" | "right";

export type HomeHeroView =
  | { kind: "video"; entry: HomeHeroVideoEntry }
  | { kind: "photo"; entry: HomeHeroPhotoEntry };

export type HomeHeroSlide = HomeHeroView["kind"];

type HomeHeroVideoSlotRefs = {
  desktop: RefObject<HTMLVideoElement | null>;
  mobile: RefObject<HTMLVideoElement | null>;
};

/** Five-slide track: photo-left | video-left | photo-center | video-right | photo-right. */
export const HOME_HERO_MEDIA_TRACK_OFFSETS = {
  photoLeft: "0%",
  videoLeft: "-20%",
  photoCenter: "-40%",
  videoRight: "-60%",
  photoRight: "-80%",
} as const;

type HomeHeroSlideContextValue = {
  activeView: HomeHeroView;
  activeSlide: HomeHeroSlide;
  trackOffset: string;
  isVideoActive: boolean;
  isPhotoActive: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  desktopVideoUrl: string | null;
  mobileVideoUrl: string;
  mobileVideoMp4Url: string;
  videoLeftRefs: HomeHeroVideoSlotRefs;
  videoRightRefs: HomeHeroVideoSlotRefs;
  goToVideoFromLeft: () => void;
  goToVideoFromRight: () => void;
  goToPhotoFromLeft: () => void;
  goToPhotoFromRight: () => void;
  normalizePhotoToCenter: () => void;
  goPrev: () => void;
  goNext: () => void;
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
  entry: HomeHeroVideoEntry,
  leftRefs: HomeHeroVideoSlotRefs,
  rightRefs: HomeHeroVideoSlotRefs,
  desktopVideoUrl: string | null,
): HTMLVideoElement | null {
  const slot = entry === "left" ? leftRefs : rightRefs;
  if (isMarketingPhoneViewport() || desktopVideoUrl === null) {
    return slot.mobile.current;
  }
  return slot.desktop.current;
}

function resolveTrackOffset(view: HomeHeroView): string {
  if (view.kind === "photo") {
    switch (view.entry) {
      case "left":
        return HOME_HERO_MEDIA_TRACK_OFFSETS.photoLeft;
      case "right":
        return HOME_HERO_MEDIA_TRACK_OFFSETS.photoRight;
      default:
        return HOME_HERO_MEDIA_TRACK_OFFSETS.photoCenter;
    }
  }
  return view.entry === "left"
    ? HOME_HERO_MEDIA_TRACK_OFFSETS.videoLeft
    : HOME_HERO_MEDIA_TRACK_OFFSETS.videoRight;
}

export function HomeHeroSlideProvider({
  desktopVideoUrl,
  mobileVideoUrl,
  mobileVideoMp4Url,
  children,
}: HomeHeroSlideProviderProps) {
  const reducedMotion = usePrefersReducedMotion();
  const videoLeftDesktopRef = useRef<HTMLVideoElement | null>(null);
  const videoLeftMobileRef = useRef<HTMLVideoElement | null>(null);
  const videoRightDesktopRef = useRef<HTMLVideoElement | null>(null);
  const videoRightMobileRef = useRef<HTMLVideoElement | null>(null);
  const videoLeftRefs = useMemo(
    () => ({ desktop: videoLeftDesktopRef, mobile: videoLeftMobileRef }),
    [],
  );
  const videoRightRefs = useMemo(
    () => ({ desktop: videoRightDesktopRef, mobile: videoRightMobileRef }),
    [],
  );
  const [activeView, setActiveView] = useState<HomeHeroView>(
    reducedMotion ? { kind: "photo", entry: "center" } : { kind: "video", entry: "left" },
  );

  const pauseAllVideos = useCallback(() => {
    videoLeftDesktopRef.current?.pause();
    videoLeftMobileRef.current?.pause();
    videoRightDesktopRef.current?.pause();
    videoRightMobileRef.current?.pause();
  }, []);

  const playVideoFromStart = useCallback(
    (entry: HomeHeroVideoEntry) => {
      const video = resolveVideoElement(
        entry,
        videoLeftRefs,
        videoRightRefs,
        desktopVideoUrl,
      );
      if (!video) {
        return;
      }
      video.currentTime = 0;
      void video.play().catch(() => {
        /* Autoplay may be blocked until user gesture. */
      });
    },
    [desktopVideoUrl, videoLeftRefs, videoRightRefs],
  );

  const goToVideoFromLeft = useCallback(() => {
    setActiveView({ kind: "video", entry: "left" });
    playVideoFromStart("left");
  }, [playVideoFromStart]);

  const goToVideoFromRight = useCallback(() => {
    setActiveView({ kind: "video", entry: "right" });
    playVideoFromStart("right");
  }, [playVideoFromStart]);

  const goToPhotoFromLeft = useCallback(() => {
    pauseAllVideos();
    if (activeView.kind === "video" && activeView.entry === "right") {
      setActiveView({ kind: "photo", entry: "center" });
      return;
    }
    setActiveView({ kind: "photo", entry: "left" });
  }, [activeView, pauseAllVideos]);

  const goToPhotoFromRight = useCallback(() => {
    pauseAllVideos();
    if (activeView.kind === "video" && activeView.entry === "left") {
      setActiveView({ kind: "photo", entry: "center" });
      return;
    }
    setActiveView({ kind: "photo", entry: "right" });
  }, [activeView, pauseAllVideos]);

  const normalizePhotoToCenter = useCallback(() => {
    setActiveView((current) => {
      if (current.kind !== "photo" || current.entry === "center") {
        return current;
      }
      return { kind: "photo", entry: "center" };
    });
  }, []);

  const goPrev = useCallback(() => {
    if (activeView.kind === "photo") {
      goToVideoFromLeft();
      return;
    }
    goToPhotoFromLeft();
  }, [activeView.kind, goToPhotoFromLeft, goToVideoFromLeft]);

  const goNext = useCallback(() => {
    if (activeView.kind === "photo") {
      goToVideoFromRight();
      return;
    }
    goToPhotoFromRight();
  }, [activeView.kind, goToPhotoFromRight, goToVideoFromRight]);

  const onVideoEnded = useCallback(() => {
    pauseAllVideos();
    setActiveView({ kind: "photo", entry: "center" });
  }, [pauseAllVideos]);

  const onVideoError = useCallback(() => {
    pauseAllVideos();
    setActiveView({ kind: "photo", entry: "center" });
  }, [pauseAllVideos]);

  const value = useMemo<HomeHeroSlideContextValue>(
    () => ({
      activeView,
      activeSlide: activeView.kind,
      trackOffset: resolveTrackOffset(activeView),
      isVideoActive: activeView.kind === "video",
      isPhotoActive: activeView.kind === "photo",
      canGoPrev: true,
      canGoNext: true,
      desktopVideoUrl,
      mobileVideoUrl,
      mobileVideoMp4Url,
      videoLeftRefs,
      videoRightRefs,
      goToVideoFromLeft,
      goToVideoFromRight,
      goToPhotoFromLeft,
      goToPhotoFromRight,
      normalizePhotoToCenter,
      goPrev,
      goNext,
      onVideoEnded,
      onVideoError,
    }),
    [
      activeView,
      desktopVideoUrl,
      goNext,
      goPrev,
      goToPhotoFromLeft,
      goToPhotoFromRight,
      goToVideoFromLeft,
      goToVideoFromRight,
      mobileVideoMp4Url,
      mobileVideoUrl,
      normalizePhotoToCenter,
      onVideoEnded,
      onVideoError,
      videoLeftRefs,
      videoRightRefs,
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

export function resolveActiveHomeHeroVideoElement(
  entry: HomeHeroVideoEntry,
  context: Pick<
    HomeHeroSlideContextValue,
    "videoLeftRefs" | "videoRightRefs" | "desktopVideoUrl"
  >,
): HTMLVideoElement | null {
  return resolveVideoElement(
    entry,
    context.videoLeftRefs,
    context.videoRightRefs,
    context.desktopVideoUrl,
  );
}
