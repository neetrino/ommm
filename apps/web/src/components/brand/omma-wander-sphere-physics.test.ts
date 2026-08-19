import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  integrateBall,
  isBallOffscreen,
  resolveBallPair,
  resolveSurfaceHits,
  shouldForceExit,
  stepWanderWorld,
} from "./omma-wander-sphere-physics";
import { createWanderBall, pickSizeScale, poseFromEdge, wanderBurstSizes } from "./omma-wander-sphere-spawn";
import {
  OMMA_WANDER_RADIUS_RATIO,
  OMMA_WANDER_SIZE_DESKTOP_PX,
  OMMA_WANDER_SIZE_FOOTER_PX,
  OMMA_WANDER_SIZE_LARGE_MIN,
  OMMA_WANDER_SIZE_SMALL_MAX,
} from "./omma-wander-sphere-tokens";
import { isOmmaWanderPathEnabled } from "./omma-wander-sphere-path";
import { isUsableSurfaceRect, sampleSurfaces } from "./omma-wander-sphere-surfaces";

const midRandom = () => 0.5;

describe("omma-wander-sphere-physics", () => {
  it("falls downward under gravity", () => {
    const ball = createWanderBall("fall", { x: 80, y: 20, vx: 0, vy: 0, size: 100 });
    integrateBall(ball, 0.1);
    assert.ok(ball.y > 20);
    assert.ok(ball.vy > 0);
  });

  it("bounces up after landing on a block", () => {
    const size = 100;
    const radius = size * OMMA_WANDER_RADIUS_RATIO;
    const ball = createWanderBall("hit", {
      x: 120,
      y: 100,
      vx: 10,
      vy: 600,
      size,
    });
    const platformTop = ball.y + radius - 6;
    resolveSurfaceHits(
      ball,
      [{ left: 40, top: platformTop, right: 220, bottom: platformTop + 40 }],
      midRandom,
    );
    assert.ok(ball.vy < 0);
    assert.equal(ball.bounceCount, 1);
    assert.ok(ball.squashY < 1);
  });

  it("separates overlapping balls and leaves the viewport", () => {
    const left = createWanderBall("a", { x: 100, y: 80, vx: 40, vy: 0, size: 100 });
    const right = createWanderBall("b", { x: 108, y: 80, vx: -40, vy: 0, size: 100 });
    resolveBallPair(left, right);
    assert.ok(right.x - left.x >= left.radius + right.radius - 0.5);
    const gone = createWanderBall("gone", { x: -400, y: 40, vx: 0, vy: 0, size: 100 });
    assert.equal(isBallOffscreen(gone, { width: 800, height: 600 }), true);
  });

  it("forces an exit after several bounces and steps off a floor", () => {
    const ball = createWanderBall("exit", { x: 200, y: 40, vx: 0, vy: 0, size: 80 });
    ball.bounceCount = 9;
    assert.equal(shouldForceExit(ball), true);
    stepWanderWorld(
      [ball],
      [],
      { width: 400, height: 300 },
      0.2,
      midRandom,
    );
    assert.equal(ball.leaving, true);
  });

  it("hops onward instead of stalling on a block", () => {
    const size = 100;
    const radius = size * OMMA_WANDER_RADIUS_RATIO;
    const ball = createWanderBall("hop", {
      x: 120,
      y: 100,
      vx: 8,
      vy: 40,
      size,
    });
    const platform = { left: 40, top: ball.y + radius - 4, right: 220, bottom: ball.y + radius + 30 };
    resolveSurfaceHits(ball, [platform], midRandom);
    assert.equal(ball.resting, false);
    assert.ok(ball.vy < 0);
    assert.ok(Math.abs(ball.vx) > 8);
  });
});

describe("omma-wander-sphere-spawn-and-path", () => {
  it("spawns from outside the viewport edges", () => {
    const viewport = { width: 1000, height: 800 };
    const left = poseFromEdge("left", viewport, 100, midRandom);
    const right = poseFromEdge("right", viewport, 100, midRandom);
    const upperLeft = poseFromEdge("top-left", viewport, 100, midRandom);
    assert.ok(left.x < 0);
    assert.ok(left.vx > 0);
    assert.ok(right.x > viewport.width);
    assert.ok(right.vx < 0);
    assert.ok(upperLeft.x < 0);
    assert.ok(upperLeft.y > 0);
    assert.ok(pickSizeScale(() => 0) <= OMMA_WANDER_SIZE_SMALL_MAX);
    assert.ok(pickSizeScale(() => 0.9) >= OMMA_WANDER_SIZE_LARGE_MIN);
    const pair = wanderBurstSizes(3, 1200, midRandom);
    assert.equal(pair.length, 3);
    assert.ok(pair.every((size) => size === OMMA_WANDER_SIZE_DESKTOP_PX));
    assert.ok(OMMA_WANDER_SIZE_DESKTOP_PX < OMMA_WANDER_SIZE_FOOTER_PX);
  });

  it("stays off auth and payment routes", () => {
    assert.equal(isOmmaWanderPathEnabled("/"), true);
    assert.equal(isOmmaWanderPathEnabled("/en/admin/dashboard"), true);
    assert.equal(isOmmaWanderPathEnabled("/login"), false);
    assert.equal(isOmmaWanderPathEnabled("/en/register"), false);
    assert.equal(isOmmaWanderPathEnabled("/payment/success"), false);
  });
});

describe("omma-wander-sphere-surfaces", () => {
  it("rejects tiny or full-screen rects and samples a cap", () => {
    const viewport = { width: 1000, height: 800 };
    assert.equal(isUsableSurfaceRect({ left: 0, top: 0, right: 20, bottom: 10 }, viewport), false);
    assert.equal(
      isUsableSurfaceRect({ left: 0, top: 0, right: 1000, bottom: 700 }, viewport),
      false,
    );
    assert.equal(
      isUsableSurfaceRect({ left: 40, top: 160, right: 200, bottom: 220 }, viewport),
      true,
    );
    assert.equal(
      isUsableSurfaceRect({ left: 0, top: 0, right: 900, bottom: 80 }, viewport),
      false,
    );
    assert.equal(
      isUsableSurfaceRect({ left: 24, top: 220, right: 976, bottom: 310 }, viewport),
      false,
    );
    const many = Array.from({ length: 50 }, (_, index) => ({
      left: (index % 10) * 90,
      top: Math.floor(index / 10) * 80,
      right: (index % 10) * 90 + 80,
      bottom: Math.floor(index / 10) * 80 + 40,
    }));
    assert.ok(sampleSurfaces(many, viewport, 12).length <= 12);
  });
});
