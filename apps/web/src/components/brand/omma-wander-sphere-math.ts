import type { RandomFn } from "@/components/brand/omma-wander-sphere-types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function randomBetween(min: number, max: number, random: RandomFn): number {
  return min + (max - min) * random();
}

export function randomSign(random: RandomFn): number {
  return random() < 0.5 ? -1 : 1;
}
