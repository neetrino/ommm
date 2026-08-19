import {
  burstCountForMode,
  resolveArmDelayMs,
  sessionNextAtStore,
} from "@/components/brand/omma-wander-sphere-schedule";
import type { OmmaWanderRuntime } from "@/components/brand/omma-wander-sphere-runtime";
import { OMMA_WANDER_HIDDEN_RETRY_MS, OMMA_WANDER_SPHERE_ASSET } from "@/components/brand/omma-wander-sphere-tokens";
import type { WanderMode } from "@/components/brand/omma-wander-sphere-types";

export function preloadWanderSphereImage(): void {
  const image = new Image();
  image.src = OMMA_WANDER_SPHERE_ASSET;
}

export function startWanderScheduler(
  runtime: OmmaWanderRuntime,
  mode: WanderMode,
): () => void {
  let cancelled = false;
  let timer = 0;
  const store = sessionNextAtStore();

  const tryFire = (): void => {
    if (cancelled) {
      return;
    }
    if (document.hidden) {
      timer = window.setTimeout(tryFire, OMMA_WANDER_HIDDEN_RETRY_MS);
      return;
    }
    runtime.spawnBurst(burstCountForMode(mode));
    arm("gap");
  };

  const arm = (kind: "first" | "gap"): void => {
    timer = window.setTimeout(tryFire, resolveArmDelayMs(mode, kind, Math.random, Date.now(), store));
  };

  if (mode === "now" || mode === "burst") {
    tryFire();
  } else {
    arm("first");
  }

  return () => {
    cancelled = true;
    window.clearTimeout(timer);
  };
}
