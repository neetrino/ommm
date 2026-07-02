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

export type HomeHeroSlide = "video" | "photo";

type HomeHeroSlideContextValue = {
  activeSlide: HomeHeroSlide;
  isVideoActive: boolean;
  isPhotoActive: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  videoUrl: string;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  goToVideo: () => void;
  goToPhoto: () => void;
  goPrev: () => void;
  goNext: () => void;
  onVideoEnded: () => void;
};

const HomeHeroSlideContext = createContext<HomeHeroSlideContextValue | null>(null);

type HomeHeroSlideProviderProps = {
  videoUrl: string;
  children: ReactNode;
};

export function HomeHeroSlideProvider({ videoUrl, children }: HomeHeroSlideProviderProps) {
  const reducedMotion = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activeSlide, setActiveSlide] = useState<HomeHeroSlide>(
    reducedMotion ? "photo" : "video",
  );

  const playVideoFromStart = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.currentTime = 0;
    void video.play().catch(() => {
      /* Autoplay may be blocked until user gesture. */
    });
  }, []);

  const goToVideo = useCallback(() => {
    setActiveSlide("video");
    playVideoFromStart();
  }, [playVideoFromStart]);

  const goToPhoto = useCallback(() => {
    setActiveSlide("photo");
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
  }, []);

  const goPrev = useCallback(() => {
    if (activeSlide === "photo") {
      goToVideo();
    }
  }, [activeSlide, goToVideo]);

  const goNext = useCallback(() => {
    if (activeSlide === "video") {
      goToPhoto();
    }
  }, [activeSlide, goToPhoto]);

  const onVideoEnded = useCallback(() => {
    goToPhoto();
  }, [goToPhoto]);

  const value = useMemo<HomeHeroSlideContextValue>(
    () => ({
      activeSlide,
      isVideoActive: activeSlide === "video",
      isPhotoActive: activeSlide === "photo",
      canGoPrev: activeSlide === "photo",
      canGoNext: activeSlide === "video",
      videoUrl,
      videoRef,
      goToVideo,
      goToPhoto,
      goPrev,
      goNext,
      onVideoEnded,
    }),
    [
      activeSlide,
      goNext,
      goPrev,
      goToPhoto,
      goToVideo,
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
