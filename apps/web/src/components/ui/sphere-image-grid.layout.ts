import {
  SPHERE_COLLISION_PADDING_PX,
  SPHERE_FADE_ZONE_END_Z,
  SPHERE_FADE_ZONE_START_Z,
  SPHERE_GOLDEN_RATIO,
  SPHERE_MIN_NODE_SCALE,
  SPHERE_Z_INDEX_BASE,
} from "@/components/ui/sphere-image-grid.constants";
import { radiansToDegrees, rotatePosition, sphericalToCartesian } from "@/components/ui/sphere-image-grid.math";
import type {
  Position3D,
  RotationState,
  SphericalPosition,
  WorldPosition,
} from "@/components/ui/sphere-image-grid.types";

export function generateSpherePositions(
  count: number,
  radius: number,
): SphericalPosition[] {
  const positions: SphericalPosition[] = [];
  const angleIncrement = (2 * Math.PI) / SPHERE_GOLDEN_RATIO;

  for (let index = 0; index < count; index += 1) {
    const t = (index + 0.5) / count;
    const inclination = Math.acos(1 - 2 * t);
    const azimuth = angleIncrement * index;
    positions.push({
      theta: radiansToDegrees(azimuth) % 360,
      phi: radiansToDegrees(inclination),
      radius,
    });
  }

  return positions;
}

function computeFade(z: number): Pick<WorldPosition, "isVisible" | "fadeOpacity"> {
  const isVisible = z > SPHERE_FADE_ZONE_END_Z;
  if (z > SPHERE_FADE_ZONE_START_Z) {
    return { isVisible, fadeOpacity: 1 };
  }
  const span = SPHERE_FADE_ZONE_START_Z - SPHERE_FADE_ZONE_END_Z;
  return { isVisible, fadeOpacity: Math.max(0, (z - SPHERE_FADE_ZONE_END_Z) / span) };
}

function computeNodeScale(world: Position3D, radius: number): number {
  const distanceRatio = Math.min(Math.hypot(world.x, world.y) / radius, 1);
  const centerScale = Math.max(0.3, 1 - distanceRatio * 0.7);
  const depthScale = (world.z + radius) / (2 * radius);
  return centerScale * Math.max(0.5, 0.8 + depthScale * 0.3);
}

function reduceScaleIfOverlap(
  current: WorldPosition,
  other: WorldPosition,
  scale: number,
  baseImageSize: number,
): number {
  const distance = Math.hypot(current.x - other.x, current.y - other.y);
  if (distance <= 0) {
    return scale;
  }
  const minDistance =
    (baseImageSize * scale + baseImageSize * other.scale) / 2 + SPHERE_COLLISION_PADDING_PX;
  if (distance >= minDistance) {
    return scale;
  }
  const reduction = Math.max(0.4, 1 - ((minDistance - distance) / minDistance) * 0.6);
  return Math.min(scale, scale * reduction);
}

export function applyCollisionScales(
  positions: WorldPosition[],
  baseImageSize: number,
): WorldPosition[] {
  return positions.map((current, index) => {
    if (!current.isVisible) {
      return current;
    }
    let scale = current.scale;
    for (let otherIndex = 0; otherIndex < positions.length; otherIndex += 1) {
      if (otherIndex === index) {
        continue;
      }
      const other = positions[otherIndex];
      if (!other.isVisible) {
        continue;
      }
      scale = reduceScaleIfOverlap(current, other, scale, baseImageSize);
    }
    return { ...current, scale: Math.max(SPHERE_MIN_NODE_SCALE, scale) };
  });
}

export function projectSpherePositions(
  positions: SphericalPosition[],
  rotation: RotationState,
  radius: number,
  baseImageSize: number,
): WorldPosition[] {
  const projected = positions.map((position, index) => {
    const world = rotatePosition(
      sphericalToCartesian(position.radius, position.theta, position.phi),
      rotation,
    );
    const fade = computeFade(world.z);
    return {
      ...world,
      ...fade,
      scale: computeNodeScale(world, radius),
      zIndex: Math.round(SPHERE_Z_INDEX_BASE + world.z),
      originalIndex: index,
    };
  });
  return applyCollisionScales(projected, baseImageSize);
}
