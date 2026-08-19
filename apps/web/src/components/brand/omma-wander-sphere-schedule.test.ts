import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  burstCountForMode,
  delayForMode,
  msUntilStoredNextAt,
  parseStoredNextAt,
  pickBurstCount,
  pickFirstDelayMs,
  pickGapMs,
  readWanderMode,
  resolveArmDelayMs,
} from "./omma-wander-sphere-schedule";
import {
  OMMA_WANDER_DEMO_FIRST_MS,
  OMMA_WANDER_DUE_SOON_MS,
  OMMA_WANDER_FIRST_DELAY_MS,
  OMMA_WANDER_FIRST_JITTER_MS,
  OMMA_WANDER_GAP_MAX_MS,
  OMMA_WANDER_GAP_MIN_MS,
} from "./omma-wander-sphere-tokens";

describe("omma-wander-sphere-schedule", () => {
  it("reads query modes and defaults to live", () => {
    assert.equal(readWanderMode("?ommaWander=now"), "now");
    assert.equal(readWanderMode("?ommaWander=burst"), "burst");
    assert.equal(readWanderMode("?ommaWander=demo"), "demo");
    assert.equal(readWanderMode(""), "live");
    assert.equal(readWanderMode("?foo=1"), "live");
  });

  it("keeps the first wait around two minutes", () => {
    const delay = pickFirstDelayMs(() => 0.5);
    assert.equal(delay, OMMA_WANDER_FIRST_DELAY_MS);
    const low = pickFirstDelayMs(() => 0);
    const high = pickFirstDelayMs(() => 1);
    assert.ok(low >= OMMA_WANDER_FIRST_DELAY_MS - OMMA_WANDER_FIRST_JITTER_MS);
    assert.ok(high <= OMMA_WANDER_FIRST_DELAY_MS + OMMA_WANDER_FIRST_JITTER_MS);
  });

  it("never waits more than 30 minutes between bursts", () => {
    assert.equal(pickGapMs(() => 0), OMMA_WANDER_GAP_MIN_MS);
    assert.equal(pickGapMs(() => 1), OMMA_WANDER_GAP_MAX_MS);
    assert.ok(OMMA_WANDER_GAP_MAX_MS === 30 * 60 * 1000);
  });

  it("spawns one ball or a swarm of four", () => {
    assert.equal(pickBurstCount(() => 0.99), 1);
    assert.equal(pickBurstCount(() => 0), 4);
    assert.equal(burstCountForMode("now"), 1);
    assert.equal(burstCountForMode("burst"), 4);
  });

  it("uses short demo delays and due-soon when the stored time is past", () => {
    assert.equal(delayForMode("demo", "first"), OMMA_WANDER_DEMO_FIRST_MS);
    assert.equal(parseStoredNextAt("nope"), null);
    assert.equal(msUntilStoredNextAt(null, 1000), null);
    assert.equal(msUntilStoredNextAt(500, 1000), OMMA_WANDER_DUE_SOON_MS);
    assert.equal(msUntilStoredNextAt(2500, 1000), 1500);
  });

  it("persists the first live wait in the session store", () => {
    let stored: string | null = null;
    const store = {
      get: () => stored,
      set: (value: string) => {
        stored = value;
      },
    };
    const first = resolveArmDelayMs("live", "first", () => 0.5, 10_000, store);
    assert.equal(first, OMMA_WANDER_FIRST_DELAY_MS);
    assert.equal(stored, String(10_000 + OMMA_WANDER_FIRST_DELAY_MS));
    const again = resolveArmDelayMs("live", "first", () => 0.5, 10_000, store);
    assert.equal(again, OMMA_WANDER_FIRST_DELAY_MS);
  });
});
