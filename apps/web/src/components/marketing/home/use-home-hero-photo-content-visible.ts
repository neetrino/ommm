"use client";

import { useEffect, useState, type RefObject } from "react";
import styles from "@/components/marketing/home/home-hero-photo-banner.module.css";

/** Matches `.homeHeroPhotoContentLayer` opacity transition in CSS. */
const HOME_HERO_PHOTO_CONTENT_FADE_MS = 480;

function isLayerFullyVisible(layer: Element): boolean {
  const opacity = Number.parseFloat(getComputedStyle(layer).opacity);
  return opacity >= 0.99;
}

/**
 * Chrome may skip decoding/scrubbing while the hero copy layer is still opacity:0.
 * Wait until the legacy-photo fade-in completes before starting logo video playback.
 */
export function useHomeHeroPhotoContentVisible(
  isLegacyPhotoActive: boolean,
  rootRef: RefObject<HTMLElement | null>,
): boolean {
  const [visible, setVisible] = useState(isLegacyPhotoActive);

  useEffect(() => {
    if (!isLegacyPhotoActive) {
      setVisible(false);
      return;
    }

    let cancelled = false;
    const markVisible = (): void => {
      if (!cancelled) {
        setVisible(true);
      }
    };

    const layer =
      rootRef.current?.closest(`.${styles.homeHeroPhotoContentLayer}`) ?? null;

    if (!layer) {
      markVisible();
      return () => {
        cancelled = true;
      };
    }

    const onTransitionEnd = (event: TransitionEvent): void => {
      if (event.propertyName === "opacity" && event.target === layer) {
        markVisible();
      }
    };

    layer.addEventListener("transitionend", onTransitionEnd);

    const rafId = requestAnimationFrame(() => {
      if (!cancelled && isLayerFullyVisible(layer)) {
        markVisible();
      }
    });

    const timeoutId = window.setTimeout(
      markVisible,
      HOME_HERO_PHOTO_CONTENT_FADE_MS + 50,
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
      layer.removeEventListener("transitionend", onTransitionEnd);
    };
  }, [isLegacyPhotoActive, rootRef]);

  return visible;
}
