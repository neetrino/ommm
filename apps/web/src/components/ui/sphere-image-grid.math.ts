import type { Position3D, RotationState } from "@/components/ui/sphere-image-grid.types";

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

export function normalizeAngle(angle: number): number {
  let next = angle;
  while (next > 180) next -= 360;
  while (next < -180) next += 360;
  return next;
}

export function clampRotationSpeed(speed: number, maxSpeed: number): number {
  return Math.max(-maxSpeed, Math.min(maxSpeed, speed));
}

export function sphericalToCartesian(
  radius: number,
  thetaDeg: number,
  phiDeg: number,
): Position3D {
  const theta = degreesToRadians(thetaDeg);
  const phi = degreesToRadians(phiDeg);
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

export function rotatePosition(point: Position3D, rotation: RotationState): Position3D {
  const rotY = degreesToRadians(rotation.y);
  const rotX = degreesToRadians(rotation.x);
  const x1 = point.x * Math.cos(rotY) + point.z * Math.sin(rotY);
  const z1 = -point.x * Math.sin(rotY) + point.z * Math.cos(rotY);
  const y2 = point.y * Math.cos(rotX) - z1 * Math.sin(rotX);
  const z2 = point.y * Math.sin(rotX) + z1 * Math.cos(rotX);
  return { x: x1, y: y2, z: z2 };
}
