import { useEffect, useRef, type RefObject } from "react";
import { HOME_HERO_LOGO_MARK_VIDEO_LAYOUT } from "@/components/marketing/home/home-hero-banner-tokens";

type CrossfadeVideoRefs = {
  primary: RefObject<HTMLVideoElement | null>;
  secondary: RefObject<HTMLVideoElement | null>;
};

function setLayerOpacity(video: HTMLVideoElement, opacity: number): void {
  video.style.opacity = String(opacity);
}

function prepareHiddenLayer(video: HTMLVideoElement): void {
  video.pause();
  video.currentTime = 0;
  setLayerOpacity(video, 0);
}

function resolveLayers(
  activeIndex: number,
  primary: HTMLVideoElement,
  secondary: HTMLVideoElement,
): { current: HTMLVideoElement; next: HTMLVideoElement; nextIndex: number } {
  if (activeIndex === 0) {
    return { current: primary, next: secondary, nextIndex: 1 };
  }
  return { current: secondary, next: primary, nextIndex: 0 };
}

/** Crossfades two layers so the logo spins forever without a visible end. */
export function useCrossfadeVideoLoop(isPlaying: boolean, refs: CrossfadeVideoRefs): void {
  const activeIndexRef = useRef(0);
  const { loopCrossfadeSec } = HOME_HERO_LOGO_MARK_VIDEO_LAYOUT;

  useEffect(() => {
    const primary = refs.primary.current;
    const secondary = refs.secondary.current;
    if (!primary || !secondary) {
      return;
    }

    if (!isPlaying) {
      primary.pause();
      secondary.pause();
      return;
    }

    activeIndexRef.current = 0;
    setLayerOpacity(primary, 1);
    prepareHiddenLayer(secondary);

    const startCurrent = () => {
      void primary.play().catch(() => {
        /* Autoplay may be blocked until user gesture. */
      });
    };

    if (primary.readyState >= HTMLMediaElement.HAVE_METADATA) {
      startCurrent();
    } else {
      primary.addEventListener("loadedmetadata", startCurrent, { once: true });
    }

    const swapToNext = (): void => {
      const activeIndex = activeIndexRef.current;
      const { current, next, nextIndex } = resolveLayers(activeIndex, primary, secondary);

      prepareHiddenLayer(current);
      setLayerOpacity(next, 1);
      activeIndexRef.current = nextIndex;

      if (next.paused) {
        next.currentTime = 0;
        void next.play().catch(() => {
          /* Autoplay may be blocked until user gesture. */
        });
      }
    };

    const tickCrossfade = (): void => {
      const activeIndex = activeIndexRef.current;
      const { current, next } = resolveLayers(activeIndex, primary, secondary);

      if (!Number.isFinite(current.duration) || current.duration <= 0) {
        return;
      }

      const remaining = current.duration - current.currentTime;

      if (remaining > loopCrossfadeSec) {
        return;
      }

      if (next.paused) {
        next.currentTime = 0;
        void next.play().catch(() => {
          /* Autoplay may be blocked until user gesture. */
        });
      }

      const blend = remaining <= 0 ? 1 : 1 - remaining / loopCrossfadeSec;
      setLayerOpacity(current, 1 - blend);
      setLayerOpacity(next, blend);

      if (blend >= 1) {
        swapToNext();
      }
    };

    const onTimeUpdate = (): void => {
      tickCrossfade();
    };

    const onEnded = (event: Event): void => {
      const endedVideo = event.currentTarget;
      if (!(endedVideo instanceof HTMLVideoElement)) {
        return;
      }

      const activeIndex = activeIndexRef.current;
      const { current } = resolveLayers(activeIndex, primary, secondary);
      if (endedVideo !== current) {
        return;
      }

      swapToNext();
    };

    primary.addEventListener("timeupdate", onTimeUpdate);
    secondary.addEventListener("timeupdate", onTimeUpdate);
    primary.addEventListener("ended", onEnded);
    secondary.addEventListener("ended", onEnded);

    return () => {
      primary.removeEventListener("loadedmetadata", startCurrent);
      primary.removeEventListener("timeupdate", onTimeUpdate);
      secondary.removeEventListener("timeupdate", onTimeUpdate);
      primary.removeEventListener("ended", onEnded);
      secondary.removeEventListener("ended", onEnded);
      primary.pause();
      secondary.pause();
    };
  }, [isPlaying, loopCrossfadeSec, refs.primary, refs.secondary]);
}
