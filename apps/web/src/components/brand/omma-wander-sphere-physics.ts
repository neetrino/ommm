import {
  OMMA_WANDER_DRAG,
  OMMA_WANDER_EXIT_AFTER_BOUNCES,
  OMMA_WANDER_EXIT_AFTER_MS,
  OMMA_WANDER_EXIT_SPEED_PX_S,
  OMMA_WANDER_GRAVITY_PX_S2,
  OMMA_WANDER_MAX_LIFE_MS,
  OMMA_WANDER_MAX_SPEED_PX_S,
  OMMA_WANDER_MIN_DRIFT_PX_S,
  OMMA_WANDER_RESTITUTION,
  OMMA_WANDER_RESTITUTION_JITTER,
  OMMA_WANDER_SPIN_GAIN,
  OMMA_WANDER_SQUASH_RECOVER,
  OMMA_WANDER_SQUASH_SIDE_GAIN,
  OMMA_WANDER_SQUASH_X_GAIN,
  OMMA_WANDER_SQUASH_Y_GAIN,
  OMMA_WANDER_IMPACT_REF_PX_S,
  OMMA_WANDER_LEAVE_RESTITUTION_SCALE,
  OMMA_WANDER_LEAVE_FLOOR_KICK_PX_S,
  OMMA_WANDER_FLOOR_DEPTH_PX,
  OMMA_WANDER_OFFSCREEN_MARGIN_RATIO,
  OMMA_WANDER_OFFSCREEN_TOP_RATIO,
  OMMA_WANDER_SUBSTEP_MAX_SEC,
  OMMA_WANDER_TANGENT_KEEP,
} from "@/components/brand/omma-wander-sphere-tokens";
import { clamp, randomSign } from "@/components/brand/omma-wander-sphere-math";
import type {
  RandomFn,
  WanderAabb,
  WanderBall,
  WanderViewport,
} from "@/components/brand/omma-wander-sphere-types";

export function isBallOffscreen(ball: WanderBall, viewport: WanderViewport): boolean {
  const margin = ball.radius * OMMA_WANDER_OFFSCREEN_MARGIN_RATIO;
  return (
    ball.x < -margin ||
    ball.x > viewport.width + margin ||
    ball.y > viewport.height + margin ||
    ball.y < -viewport.height * OMMA_WANDER_OFFSCREEN_TOP_RATIO
  );
}

export function shouldForceExit(ball: WanderBall): boolean {
  return (
    !ball.leaving &&
    (ball.bounceCount >= OMMA_WANDER_EXIT_AFTER_BOUNCES ||
      ball.ageMs >= OMMA_WANDER_EXIT_AFTER_MS ||
      ball.ageMs >= OMMA_WANDER_MAX_LIFE_MS)
  );
}

export function markBallLeaving(ball: WanderBall, viewport: WanderViewport, random: RandomFn): void {
  ball.leaving = true;
  const toLeft = ball.x;
  const toRight = viewport.width - ball.x;
  const goLeft = toLeft < toRight ? random() < 0.7 : random() < 0.3;
  const goDown = random() < 0.45;
  ball.exitNx = goDown ? (goLeft ? -0.45 : 0.45) : goLeft ? -1 : 1;
  ball.exitNy = goDown ? 0.89 : 0.28;
  ball.vx += ball.exitNx * OMMA_WANDER_EXIT_SPEED_PX_S;
  ball.vy += ball.exitNy * OMMA_WANDER_EXIT_SPEED_PX_S * 0.35;
}

export function integrateBall(ball: WanderBall, dtSec: number): void {
  ball.vy += OMMA_WANDER_GRAVITY_PX_S2 * dtSec;
  const drag = Math.max(0, 1 - OMMA_WANDER_DRAG * dtSec);
  ball.vx *= drag;
  ball.vy *= drag;
  const speed = Math.hypot(ball.vx, ball.vy);
  if (speed > OMMA_WANDER_MAX_SPEED_PX_S) {
    const scale = OMMA_WANDER_MAX_SPEED_PX_S / speed;
    ball.vx *= scale;
    ball.vy *= scale;
  }
  ball.x += ball.vx * dtSec;
  ball.y += ball.vy * dtSec;
  ball.ageMs += dtSec * 1000;
  recoverSquash(ball, dtSec);
}

function recoverSquash(ball: WanderBall, dtSec: number): void {
  const blend = Math.min(1, OMMA_WANDER_SQUASH_RECOVER * dtSec);
  ball.squashX += (1 - ball.squashX) * blend;
  ball.squashY += (1 - ball.squashY) * blend;
}

export function resolveSurfaceHits(
  ball: WanderBall,
  surfaces: readonly WanderAabb[],
  random: RandomFn,
): void {
  for (const rect of surfaces) {
    resolveCircleAabb(ball, rect, random, false);
  }
}

export function resolveViewportBounds(
  ball: WanderBall,
  viewport: WanderViewport,
  random: RandomFn,
): void {
  const floor: WanderAabb = {
    left: -viewport.width,
    top: viewport.height,
    right: viewport.width * 2,
    bottom: viewport.height + OMMA_WANDER_FLOOR_DEPTH_PX,
  };
  resolveCircleAabb(ball, floor, random, true);

  if (ball.leaving) {
    return;
  }
  bounceIfPastWall(ball, 0, 1, random);
  bounceIfPastWall(ball, viewport.width, -1, random);
}

function bounceIfPastWall(
  ball: WanderBall,
  wallX: number,
  inwardNx: number,
  random: RandomFn,
): void {
  const past = inwardNx > 0 ? ball.x - ball.radius < wallX : ball.x + ball.radius > wallX;
  if (!past) {
    return;
  }
  ball.x = wallX + inwardNx * ball.radius;
  applyBounce(ball, inwardNx, 0, random);
}

function resolveCircleAabb(
  ball: WanderBall,
  rect: WanderAabb,
  random: RandomFn,
  isFloor: boolean,
): void {
  const hit = computeAabbHit(ball, rect);
  if (!hit) {
    return;
  }
  ball.x += hit.nx * hit.overlap;
  ball.y += hit.ny * hit.overlap;
  const approaching = ball.vx * hit.nx + ball.vy * hit.ny;
  if (approaching >= 0) {
    return;
  }
  applyBounce(ball, hit.nx, hit.ny, random);
  if (isFloor && ball.leaving) {
    ball.vx += ball.exitNx * OMMA_WANDER_LEAVE_FLOOR_KICK_PX_S;
  }
}

type AabbHit = { nx: number; ny: number; overlap: number };

function computeAabbHit(ball: WanderBall, rect: WanderAabb): AabbHit | null {
  const inside =
    ball.x > rect.left && ball.x < rect.right && ball.y > rect.top && ball.y < rect.bottom;
  if (inside) {
    return insideAabbHit(ball, rect);
  }
  const px = clamp(ball.x, rect.left, rect.right);
  const py = clamp(ball.y, rect.top, rect.bottom);
  const dx = ball.x - px;
  const dy = ball.y - py;
  const dist = Math.hypot(dx, dy);
  if (dist === 0 || dist >= ball.radius) {
    return dist === 0 ? insideAabbHit(ball, rect) : null;
  }
  return { nx: dx / dist, ny: dy / dist, overlap: ball.radius - dist };
}

function insideAabbHit(ball: WanderBall, rect: WanderAabb): AabbHit {
  const left = ball.x - rect.left;
  const right = rect.right - ball.x;
  const top = ball.y - rect.top;
  const bottom = rect.bottom - ball.y;
  const min = Math.min(left, right, top, bottom);
  if (min === top) {
    return { nx: 0, ny: -1, overlap: ball.radius + top };
  }
  if (min === bottom) {
    return { nx: 0, ny: 1, overlap: ball.radius + bottom };
  }
  if (min === left) {
    return { nx: -1, ny: 0, overlap: ball.radius + left };
  }
  return { nx: 1, ny: 0, overlap: ball.radius + right };
}

function applyBounce(ball: WanderBall, nx: number, ny: number, random: RandomFn): void {
  const vn = ball.vx * nx + ball.vy * ny;
  const liveRestitution =
    OMMA_WANDER_RESTITUTION + (random() * 2 - 1) * OMMA_WANDER_RESTITUTION_JITTER;
  const restitution = ball.leaving
    ? liveRestitution * OMMA_WANDER_LEAVE_RESTITUTION_SCALE
    : liveRestitution;
  const tx = -ny;
  const ty = nx;
  const vt = ball.vx * tx + ball.vy * ty;
  const nextVn = -vn * restitution;
  const nextVt = vt * OMMA_WANDER_TANGENT_KEEP;
  ball.vx = nextVn * nx + nextVt * tx;
  ball.vy = nextVn * ny + nextVt * ty;
  if (Math.abs(ball.vx) < OMMA_WANDER_MIN_DRIFT_PX_S) {
    ball.vx += randomSign(random) * OMMA_WANDER_MIN_DRIFT_PX_S;
  }
  applyImpactSquash(ball, nx, ny, vn);
  ball.spin += nextVt * OMMA_WANDER_SPIN_GAIN;
  ball.bounceCount += 1;
}

function applyImpactSquash(ball: WanderBall, nx: number, ny: number, vn: number): void {
  const impact = clamp(Math.abs(vn) / OMMA_WANDER_IMPACT_REF_PX_S, 0.2, 1);
  const wide = OMMA_WANDER_SQUASH_X_GAIN * impact;
  const flat = OMMA_WANDER_SQUASH_Y_GAIN * impact;
  const side = OMMA_WANDER_SQUASH_SIDE_GAIN * impact;
  ball.squashX = 1 + Math.abs(ny) * wide - Math.abs(nx) * side;
  ball.squashY = 1 + Math.abs(nx) * wide - Math.abs(ny) * flat;
}

export function resolveBallPair(a: WanderBall, b: WanderBall): void {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const minDist = a.radius + b.radius;
  if (dist === 0 || dist >= minDist) {
    return;
  }
  const nx = dx / dist;
  const ny = dy / dist;
  const overlap = (minDist - dist) / 2;
  a.x -= nx * overlap;
  a.y -= ny * overlap;
  b.x += nx * overlap;
  b.y += ny * overlap;
  const rvn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  if (rvn >= 0) {
    return;
  }
  const impulse = -(1 + OMMA_WANDER_RESTITUTION) * rvn * 0.5;
  a.vx -= impulse * nx;
  a.vy -= impulse * ny;
  b.vx += impulse * nx;
  b.vy += impulse * ny;
}

export function stepWanderWorld(
  balls: WanderBall[],
  surfaces: readonly WanderAabb[],
  viewport: WanderViewport,
  dtSec: number,
  random: RandomFn,
): void {
  const steps = Math.max(1, Math.ceil(dtSec / OMMA_WANDER_SUBSTEP_MAX_SEC));
  const stepDt = dtSec / steps;
  for (let step = 0; step < steps; step += 1) {
    for (const ball of balls) {
      if (shouldForceExit(ball)) {
        markBallLeaving(ball, viewport, random);
      }
      integrateBall(ball, stepDt);
      resolveSurfaceHits(ball, surfaces, random);
      resolveViewportBounds(ball, viewport, random);
    }
    for (let i = 0; i < balls.length; i += 1) {
      for (let j = i + 1; j < balls.length; j += 1) {
        const left = balls[i];
        const right = balls[j];
        if (left && right) {
          resolveBallPair(left, right);
        }
      }
    }
  }
}
