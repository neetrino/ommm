"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { startWanderScheduler, preloadWanderSphereImage } from "@/components/brand/omma-wander-sphere-controller";
import { isOmmaWanderPathEnabled } from "@/components/brand/omma-wander-sphere-path";
import { OmmaWanderRuntime } from "@/components/brand/omma-wander-sphere-runtime";
import { readWanderMode } from "@/components/brand/omma-wander-sphere-schedule";
import {
  OMMA_WANDER_SIZE_DESKTOP_PX,
  OMMA_WANDER_SIZE_MOBILE_PX,
} from "@/components/brand/omma-wander-sphere-tokens";
import { usePathname } from "@/i18n/navigation";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import styles from "@/components/brand/omma-wander-sphere.module.css";

type LayerStyle = CSSProperties & {
  "--omma-wander-size": string;
  "--omma-wander-size-mobile": string;
};

const LAYER_STYLE: LayerStyle = {
  "--omma-wander-size": `${OMMA_WANDER_SIZE_DESKTOP_PX}px`,
  "--omma-wander-size-mobile": `${OMMA_WANDER_SIZE_MOBILE_PX}px`,
};

/**
 * Site-wide rubber Omma ball — rare chaotic drops that bounce off live UI.
 */
export function OmmaWanderSphere() {
  const pathname = usePathname() ?? "";
  const reducedMotion = usePrefersReducedMotion();
  const layerRef = useRef<HTMLDivElement>(null);
  const enabled = !reducedMotion && isOmmaWanderPathEnabled(pathname);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer || !enabled) {
      return;
    }

    preloadWanderSphereImage();
    const runtime = new OmmaWanderRuntime(layer, {
      ballClass: styles.ball,
      imageClass: styles.ballImage,
    });
    const stopScheduler = startWanderScheduler(runtime, readWanderMode(window.location.search));

    return () => {
      stopScheduler();
      runtime.stop();
    };
  }, [enabled]);

  if (reducedMotion) {
    return null;
  }

  return (
    <div
      ref={layerRef}
      className={styles.layer}
      style={LAYER_STYLE}
      data-omma-wander=""
      aria-hidden="true"
    />
  );
}
