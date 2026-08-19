import {
  SPHERE_AUTO_ROTATE_SPEED,
  SPHERE_DRAG_SENSITIVITY,
  SPHERE_MAX_ROTATION_SPEED,
  SPHERE_MOMENTUM_DECAY,
  SPHERE_VELOCITY_STOP,
} from "@/components/ui/sphere-image-grid.constants";
import { clampRotationSpeed, normalizeAngle } from "@/components/ui/sphere-image-grid.math";
import type { RotationState, VelocityState } from "@/components/ui/sphere-image-grid.types";

export function decayVelocity(velocity: VelocityState): VelocityState {
  const next = {
    x: velocity.x * SPHERE_MOMENTUM_DECAY,
    y: velocity.y * SPHERE_MOMENTUM_DECAY,
  };
  if (Math.abs(next.x) < SPHERE_VELOCITY_STOP) next.x = 0;
  if (Math.abs(next.y) < SPHERE_VELOCITY_STOP) next.y = 0;
  return next;
}

export function nextIdleRotation(
  current: RotationState,
  velocity: VelocityState,
  autoRotate: boolean,
): RotationState {
  return {
    x: normalizeAngle(current.x + clampRotationSpeed(velocity.x, SPHERE_MAX_ROTATION_SPEED)),
    y: normalizeAngle(
      current.y +
        clampRotationSpeed(velocity.y, SPHERE_MAX_ROTATION_SPEED) +
        (autoRotate ? SPHERE_AUTO_ROTATE_SPEED : 0),
    ),
    z: current.z,
  };
}

export function shouldKeepAnimating(
  isDragging: boolean,
  autoRotate: boolean,
  velocity: VelocityState,
): boolean {
  return (
    isDragging ||
    autoRotate ||
    Math.abs(velocity.x) >= SPHERE_VELOCITY_STOP ||
    Math.abs(velocity.y) >= SPHERE_VELOCITY_STOP
  );
}

export function rotationFromPointerDelta(
  current: RotationState,
  deltaX: number,
  deltaY: number,
): { rotation: RotationState; velocity: VelocityState } {
  const velocity = {
    x: clampRotationSpeed(-deltaY * SPHERE_DRAG_SENSITIVITY, SPHERE_MAX_ROTATION_SPEED),
    y: clampRotationSpeed(deltaX * SPHERE_DRAG_SENSITIVITY, SPHERE_MAX_ROTATION_SPEED),
  };
  return {
    velocity,
    rotation: {
      x: normalizeAngle(current.x + velocity.x),
      y: normalizeAngle(current.y + velocity.y),
      z: current.z,
    },
  };
}
