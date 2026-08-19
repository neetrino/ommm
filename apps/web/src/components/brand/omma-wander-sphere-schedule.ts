import {
  OMMA_WANDER_DEMO_FIRST_MS,
  OMMA_WANDER_DEMO_GAP_MS,
  OMMA_WANDER_DUE_SOON_MS,
  OMMA_WANDER_FIRST_DELAY_MS,
  OMMA_WANDER_FIRST_JITTER_MS,
  OMMA_WANDER_GAP_MAX_MS,
  OMMA_WANDER_GAP_MIN_MS,
  OMMA_WANDER_BURST_COUNT_MAX,
  OMMA_WANDER_BURST_COUNT_MIN,
  OMMA_WANDER_QUERY_KEY,
  OMMA_WANDER_SESSION_NEXT_AT_KEY,
} from "@/components/brand/omma-wander-sphere-tokens";
import { clamp, randomBetween } from "@/components/brand/omma-wander-sphere-math";
import type { RandomFn, WanderMode } from "@/components/brand/omma-wander-sphere-types";

export function readWanderMode(search: string): WanderMode {
  const value = new URLSearchParams(search).get(OMMA_WANDER_QUERY_KEY);
  if (value === "now" || value === "burst" || value === "demo") {
    return value;
  }
  return "live";
}

export function pickFirstDelayMs(random: RandomFn = Math.random): number {
  const jitter = (random() * 2 - 1) * OMMA_WANDER_FIRST_JITTER_MS;
  return Math.max(0, Math.round(OMMA_WANDER_FIRST_DELAY_MS + jitter));
}

export function pickGapMs(random: RandomFn = Math.random): number {
  const gap = randomBetween(OMMA_WANDER_GAP_MIN_MS, OMMA_WANDER_GAP_MAX_MS, random);
  return Math.round(clamp(gap, OMMA_WANDER_GAP_MIN_MS, OMMA_WANDER_GAP_MAX_MS));
}

export function pickBurstCount(random: RandomFn = Math.random): 2 | 3 {
  return random() < 0.5 ? OMMA_WANDER_BURST_COUNT_MIN : OMMA_WANDER_BURST_COUNT_MAX;
}

export function delayForMode(
  mode: WanderMode,
  kind: "first" | "gap",
  random: RandomFn = Math.random,
): number {
  if (mode === "demo") {
    return kind === "first" ? OMMA_WANDER_DEMO_FIRST_MS : OMMA_WANDER_DEMO_GAP_MS;
  }
  return kind === "first" ? pickFirstDelayMs(random) : pickGapMs(random);
}

export function burstCountForMode(_mode: WanderMode, random: RandomFn = Math.random): 2 | 3 {
  return pickBurstCount(random);
}

export function msUntilStoredNextAt(storedAt: number | null, now: number): number | null {
  if (storedAt === null || !Number.isFinite(storedAt)) {
    return null;
  }
  if (storedAt <= now) {
    return OMMA_WANDER_DUE_SOON_MS;
  }
  return storedAt - now;
}

export function parseStoredNextAt(raw: string | null): number | null {
  if (raw === null || raw.length === 0) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export type WanderNextAtStore = {
  get: () => string | null;
  set: (value: string) => void;
};

export function sessionNextAtStore(): WanderNextAtStore {
  return {
    get: () => sessionStorage.getItem(OMMA_WANDER_SESSION_NEXT_AT_KEY),
    set: (value) => {
      sessionStorage.setItem(OMMA_WANDER_SESSION_NEXT_AT_KEY, value);
    },
  };
}

export function resolveArmDelayMs(
  mode: WanderMode,
  kind: "first" | "gap",
  random: RandomFn = Math.random,
  now = Date.now(),
  store: WanderNextAtStore = sessionNextAtStore(),
): number {
  if (mode !== "live") {
    return delayForMode(mode, kind, random);
  }
  if (kind === "first") {
    const until = msUntilStoredNextAt(parseStoredNextAt(store.get()), now);
    if (until !== null) {
      return until;
    }
    const first = pickFirstDelayMs(random);
    store.set(String(now + first));
    return first;
  }
  const gap = pickGapMs(random);
  store.set(String(now + gap));
  return gap;
}
