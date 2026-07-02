"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export type HomeHeroVideoEntry = "left" | "right";
export type HomeHeroPhotoEntry = "left" | "center" | "right";

export type HomeHeroView =
  | { kind: "video"; entry: HomeHeroVideoEntry }
  | { kind: "photo"; entry: HomeHeroPhotoEntry };

export type HomeHeroSlide = HomeHeroView["kind"];

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
  videoUrl: string;
  videoLeftRef: React.RefObject<HTMLVideoElement | null>;
  videoRightRef: React.RefObject<HTMLVideoElement | null>;
  goToVideoFromLeft: () => void;
  goToVideoFromRight: () => void;
  goToPhotoFromLeft: () => void;
  goToPhotoFromRight: () => void;
  normalizePhotoToCenter: () => void;
  goPrev: () => void;
  goNext: () => void;
  onVideoEnded: () => void;
};

const HomeHeroSlideContext = createContext<HomeHeroSlideContextValue | null>(null);

type HomeHeroSlideProviderProps = {
  videoUrl: string;
  children: ReactNode;
};

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

export function HomeHeroSlideProvider({ videoUrl, children }: HomeHeroSlideProviderProps) {
  const reducedMotion = usePrefersReducedMotion();
  const videoLeftRef = useRef<HTMLVideoElement | null>(null);
  const videoRightRef = useRef<HTMLVideoElement | null>(null);
  const [activeView, setActiveView] = useState<HomeHeroView>(
    reducedMotion ? { kind: "photo", entry: "center" } : { kind: "video", entry: "left" },
  );

  const pauseAllVideos = useCallback(() => {
    videoLeftRef.current?.pause();
    videoRightRef.current?.pause();
  }, []);

  const playVideoFromStart = useCallback((entry: HomeHeroVideoEntry) => {
    const video = entry === "left" ? videoLeftRef.current : videoRightRef.current;
    if (!video) {
      return;
    }
    video.currentTime = 0;
    void video.play().catch(() => {
      /* Autoplay may be blocked until user gesture. */
    });
  }, []);

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

  const value = useMemo<HomeHeroSlideContextValue>(
    () => ({
      activeView,
      activeSlide: activeView.kind,
      trackOffset: resolveTrackOffset(activeView),
      isVideoActive: activeView.kind === "video",
      isPhotoActive: activeView.kind === "photo",
      canGoPrev: true,
      canGoNext: true,
      videoUrl,
      videoLeftRef,
      videoRightRef,
      goToVideoFromLeft,
      goToVideoFromRight,
      goToPhotoFromLeft,
      goToPhotoFromRight,
      normalizePhotoToCenter,
      goPrev,
      goNext,
      onVideoEnded,
    }),
    [
      activeView,
      goNext,
      goPrev,
      goToPhotoFromLeft,
      goToPhotoFromRight,
      goToVideoFromLeft,
      goToVideoFromRight,
      normalizePhotoToCenter,
      onVideoEnded,
      videoUrl,
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
