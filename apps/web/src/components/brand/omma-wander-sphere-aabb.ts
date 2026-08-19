import { clamp } from "@/components/brand/omma-wander-sphere-math";
import type { WanderAabb, WanderBall } from "@/components/brand/omma-wander-sphere-types";

export type WanderAabbHit = {
  nx: number;
  ny: number;
  overlap: number;
};

export function computeAabbHit(ball: WanderBall, rect: WanderAabb): WanderAabbHit | null {
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

function insideAabbHit(ball: WanderBall, rect: WanderAabb): WanderAabbHit {
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
