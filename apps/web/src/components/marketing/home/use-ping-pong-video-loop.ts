import { useEffect, useRef, type RefObject } from "react";
import { HOME_HERO_LOGO_MARK_VIDEO_LAYOUT } from "@/components/marketing/home/home-hero-banner-tokens";

type PingPongVideoRefs = {
  primary: RefObject<HTMLVideoElement | null>;
  secondary: RefObject<HTMLVideoElement | null>;
};

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

function setLayerVisible(video: HTMLVideoElement, visible: boolean): void {
  video.style.opacity = visible ? "1" : "0";
  video.style.visibility = visible ? "visible" : "hidden";
}

function resetHiddenLayer(video: HTMLVideoElement): void {
  video.pause();
  video.currentTime = 0;
  setLayerVisible(video, false);
}

function scheduleFrame(video: HTMLVideoElement, callback: () => void): number {
  if ("requestVideoFrameCallback" in video) {
    return video.requestVideoFrameCallback(() => {
      callback();
    }) as number;
  }
  return window.requestAnimationFrame(callback);
}

function cancelFrame(video: HTMLVideoElement, frameId: number): void {
  if ("cancelVideoFrameCallback" in video) {
    video.cancelVideoFrameCallback(frameId);
    return;
  }
  window.cancelAnimationFrame(frameId);
}

/**
 * Two decoders ping-pong with an instant cut — the incoming layer is already
 * playing hidden before the swap, so the visible video never stops and restarts.
 */
export function usePingPongVideoLoop(isPlaying: boolean, refs: PingPongVideoRefs): void {
  const activeIndexRef = useRef(0);
  const swappedRef = useRef(false);
  const { loopPrerollSec, loopSwapLeadSec } = HOME_HERO_LOGO_MARK_VIDEO_LAYOUT;

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
    swappedRef.current = false;
    setLayerVisible(primary, true);
    resetHiddenLayer(secondary);

    const startCurrent = (): void => {
      void primary.play().catch(() => {
        /* Autoplay may be blocked until user gesture. */
      });
    };

    const prerollNext = (next: HTMLVideoElement): void => {
      if (!next.paused) {
        return;
      }
      next.currentTime = 0;
      setLayerVisible(next, false);
      void next.play().catch(() => {
        /* Autoplay may be blocked until user gesture. */
      });
    };

    const swapLayers = (): void => {
      const activeIndex = activeIndexRef.current;
      const { current, next, nextIndex } = resolveLayers(activeIndex, primary, secondary);

      resetHiddenLayer(current);
      setLayerVisible(next, true);
      activeIndexRef.current = nextIndex;
      swappedRef.current = true;

      if (next.paused) {
        next.currentTime = 0;
        void next.play().catch(() => {
          /* Autoplay may be blocked until user gesture. */
        });
      }
    };

    const tickLoop = (): void => {
      const activeIndex = activeIndexRef.current;
      const { current, next } = resolveLayers(activeIndex, primary, secondary);

      if (!Number.isFinite(current.duration) || current.duration <= 0) {
        return;
      }

      const remaining = current.duration - current.currentTime;

      if (remaining > loopPrerollSec) {
        swappedRef.current = false;
        return;
      }

      prerollNext(next);

      if (!swappedRef.current && remaining <= loopSwapLeadSec) {
        swapLayers();
      }
    };

    let frameId = 0;
    let frameHost: HTMLVideoElement = primary;

    const onFrame = (): void => {
      tickLoop();
      const activeIndex = activeIndexRef.current;
      frameHost = activeIndex === 0 ? primary : secondary;
      frameId = scheduleFrame(frameHost, onFrame);
    };

    const onEnded = (event: Event): void => {
      const endedVideo = event.currentTarget;
      if (!(endedVideo instanceof HTMLVideoElement)) {
        return;
      }

      const activeIndex = activeIndexRef.current;
      const { current, next } = resolveLayers(activeIndex, primary, secondary);
      if (endedVideo !== current || swappedRef.current) {
        return;
      }

      prerollNext(next);
      swapLayers();
    };

    if (primary.readyState >= HTMLMediaElement.HAVE_METADATA) {
      startCurrent();
      frameId = scheduleFrame(primary, onFrame);
    } else {
      primary.addEventListener(
        "loadedmetadata",
        () => {
          startCurrent();
          frameId = scheduleFrame(primary, onFrame);
        },
        { once: true },
      );
    }

    primary.addEventListener("ended", onEnded);
    secondary.addEventListener("ended", onEnded);

    return () => {
      primary.removeEventListener("ended", onEnded);
      secondary.removeEventListener("ended", onEnded);
      cancelFrame(frameHost, frameId);
      primary.pause();
      secondary.pause();
    };
  }, [isPlaying, loopPrerollSec, loopSwapLeadSec, refs.primary, refs.secondary]);
}
