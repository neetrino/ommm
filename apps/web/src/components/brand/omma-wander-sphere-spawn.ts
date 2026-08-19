import {
  OMMA_WANDER_AIM_PULL,
  OMMA_WANDER_AIM_STEER_PX_S,
  OMMA_WANDER_CORNER_VX_SCALE,
  OMMA_WANDER_MOBILE_MAX_WIDTH_PX,
  OMMA_WANDER_RADIUS_RATIO,
  OMMA_WANDER_SIDE_SPAWN_BOTTOM_RATIO,
  OMMA_WANDER_SIDE_SPAWN_TOP_RATIO,
  OMMA_WANDER_HEADER_CLEAR_PX,
  OMMA_WANDER_SIZE_DESKTOP_PX,
  OMMA_WANDER_SIZE_LARGE_MAX,
  OMMA_WANDER_SIZE_LARGE_MIN,
  OMMA_WANDER_SIZE_MEDIUM_CHANCE,
  OMMA_WANDER_SIZE_MEDIUM_MAX,
  OMMA_WANDER_SIZE_MEDIUM_MIN,
  OMMA_WANDER_SIZE_MOBILE_PX,
  OMMA_WANDER_SIZE_SMALL_CHANCE,
  OMMA_WANDER_SIZE_SMALL_MAX,
  OMMA_WANDER_SIZE_SMALL_MIN,
  OMMA_WANDER_SPAWN_INSET_RATIO,
  OMMA_WANDER_SPAWN_VX_MAX,
  OMMA_WANDER_SPAWN_VX_MIN,
  OMMA_WANDER_SPAWN_VY_MAX,
  OMMA_WANDER_SPAWN_VY_MIN,
  OMMA_WANDER_TOP_VX_SPREAD,
} from "@/components/brand/omma-wander-sphere-tokens";
import { clamp, randomBetween } from "@/components/brand/omma-wander-sphere-math";
import type {
  RandomFn,
  WanderAabb,
  WanderBall,
  WanderEdge,
  WanderSpawnPose,
  WanderViewport,
} from "@/components/brand/omma-wander-sphere-types";

const SPAWN_EDGES: readonly WanderEdge[] = ["left", "right", "top-left", "top-right"];

export function pickSizeScale(random: RandomFn): number {
  const roll = random();
  if (roll < OMMA_WANDER_SIZE_SMALL_CHANCE) {
    return randomBetween(OMMA_WANDER_SIZE_SMALL_MIN, OMMA_WANDER_SIZE_SMALL_MAX, random);
  }
  if (roll < OMMA_WANDER_SIZE_SMALL_CHANCE + OMMA_WANDER_SIZE_MEDIUM_CHANCE) {
    return randomBetween(OMMA_WANDER_SIZE_MEDIUM_MIN, OMMA_WANDER_SIZE_MEDIUM_MAX, random);
  }
  return randomBetween(OMMA_WANDER_SIZE_LARGE_MIN, OMMA_WANDER_SIZE_LARGE_MAX, random);
}

export function wanderVisualSize(viewportWidth: number): number {
  return viewportWidth <= OMMA_WANDER_MOBILE_MAX_WIDTH_PX
    ? OMMA_WANDER_SIZE_MOBILE_PX
    : OMMA_WANDER_SIZE_DESKTOP_PX;
}

export function wanderBallSize(viewportWidth: number, random: RandomFn): number {
  return Math.round(wanderVisualSize(viewportWidth) * pickSizeScale(random));
}

export function wanderBurstSizes(count: number, viewportWidth: number): number[] {
  const size = wanderVisualSize(viewportWidth);
  return Array.from({ length: Math.max(1, count) }, () => size);
}

export function pickSpawnEdges(count: number, random: RandomFn): WanderEdge[] {
  const pool = [...SPAWN_EDGES];
  const picked: WanderEdge[] = [];
  const take = Math.min(count, pool.length);
  for (let index = 0; index < take; index += 1) {
    const choice = Math.floor(random() * pool.length);
    picked.push(pool.splice(choice, 1)[0] ?? "top");
  }
  return picked;
}

export function poseFromEdge(
  edge: WanderEdge,
  viewport: WanderViewport,
  size: number,
  random: RandomFn,
): WanderSpawnPose {
  const radius = size * OMMA_WANDER_RADIUS_RATIO;
  const inset = viewport.width * OMMA_WANDER_SPAWN_INSET_RATIO;
  const sideY = randomBetween(
    viewport.height * OMMA_WANDER_SIDE_SPAWN_TOP_RATIO,
    viewport.height * OMMA_WANDER_SIDE_SPAWN_BOTTOM_RATIO,
    random,
  );
  const inward = randomBetween(OMMA_WANDER_SPAWN_VX_MIN, OMMA_WANDER_SPAWN_VX_MAX, random);
  const down = randomBetween(OMMA_WANDER_SPAWN_VY_MIN, OMMA_WANDER_SPAWN_VY_MAX, random);
  const topX = randomBetween(inset, viewport.width - inset, random);
  const topVx = (random() * 2 - 1) * OMMA_WANDER_TOP_VX_SPREAD;

  return spawnPoseForEdge(edge, { radius, topX, sideY, inward, down, topVx, viewport });
}

type SpawnNumbers = {
  radius: number;
  topX: number;
  sideY: number;
  inward: number;
  down: number;
  topVx: number;
  viewport: WanderViewport;
};

function spawnPoseForEdge(edge: WanderEdge, n: SpawnNumbers): WanderSpawnPose {
  const size = n.radius / OMMA_WANDER_RADIUS_RATIO;
  if (edge === "left") {
    return { x: -n.radius, y: n.sideY, vx: n.inward, vy: n.down, size };
  }
  if (edge === "right") {
    return { x: n.viewport.width + n.radius, y: n.sideY, vx: -n.inward, vy: n.down, size };
  }
  const upperY = Math.max(OMMA_WANDER_HEADER_CLEAR_PX, n.sideY * 0.55);
  if (edge === "top-left") {
    return {
      x: -n.radius,
      y: upperY,
      vx: n.inward * OMMA_WANDER_CORNER_VX_SCALE,
      vy: n.down,
      size,
    };
  }
  if (edge === "top-right") {
    return {
      x: n.viewport.width + n.radius,
      y: upperY,
      vx: -n.inward * OMMA_WANDER_CORNER_VX_SCALE,
      vy: n.down,
      size,
    };
  }
  return { x: n.topX, y: -n.radius, vx: n.topVx, vy: n.down, size };
}

export function aimHorizontalVelocity(
  x: number,
  vx: number,
  surfaces: readonly WanderAabb[],
  random: RandomFn,
): number {
  if (surfaces.length === 0) {
    return vx;
  }
  const target = surfaces[Math.floor(random() * surfaces.length)];
  if (!target) {
    return vx;
  }
  const centerX = (target.left + target.right) / 2;
  return vx + clamp((centerX - x) * OMMA_WANDER_AIM_PULL, -OMMA_WANDER_AIM_STEER_PX_S, OMMA_WANDER_AIM_STEER_PX_S);
}

export function createWanderBall(id: string, pose: WanderSpawnPose): WanderBall {
  return {
    id,
    x: pose.x,
    y: pose.y,
    vx: pose.vx,
    vy: pose.vy,
    radius: pose.size * OMMA_WANDER_RADIUS_RATIO,
    size: pose.size,
    spin: 0,
    squashX: 1,
    squashY: 1,
    bounceCount: 0,
    ageMs: 0,
    restMs: 0,
    resting: false,
    leaving: false,
    exitNx: 0,
    exitNy: 1,
  };
}
