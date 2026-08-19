export type RandomFn = () => number;

export type WanderMode = "live" | "now" | "burst" | "demo";

export type WanderEdge = "top" | "left" | "right" | "top-left" | "top-right";

export type WanderAabb = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type WanderViewport = {
  width: number;
  height: number;
};

export type WanderBall = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  size: number;
  spin: number;
  squashX: number;
  squashY: number;
  bounceCount: number;
  ageMs: number;
  leaving: boolean;
  exitNx: number;
  exitNy: number;
};

export type WanderSpawnPose = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
};
