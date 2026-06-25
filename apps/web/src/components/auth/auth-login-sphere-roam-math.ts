import { AUTH_LOGIN_SPHERE_ROAM } from "@/components/auth/auth-login-sphere-roam-tokens";

export type RoamBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export type RoamPoint = {
  x: number;
  y: number;
};

export type AuthLoginSphereLayoutSeed = {
  left: number;
  top: number;
};

export type AuthLoginSphereEntry = {
  id: string;
  el: HTMLElement;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  size: number;
};

export function measureBounds(size: number): RoamBounds {
  const pad = AUTH_LOGIN_SPHERE_ROAM.edgePaddingPx;
  return {
    minX: pad,
    minY: pad,
    maxX: Math.max(pad, window.innerWidth - size - pad),
    maxY: Math.max(pad, window.innerHeight - size - pad),
  };
}

export function clampPoint(point: RoamPoint, bounds: RoamBounds): RoamPoint {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, point.x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, point.y)),
  };
}

export function centerOf(entry: AuthLoginSphereEntry): RoamPoint {
  const radius = entry.size / 2;
  return { x: entry.x + radius, y: entry.y + radius };
}

export function applyEntryPosition(entry: AuthLoginSphereEntry): void {
  entry.el.style.left = `${entry.x}px`;
  entry.el.style.top = `${entry.y}px`;
}

/**
 * Pushes a sphere away from the cursor when the pointer enters its flee radius.
 * Returns true when the sphere was displaced this frame.
 */
export function fleeFromPointer(
  entry: AuthLoginSphereEntry,
  pointer: RoamPoint | null,
  bounds: RoamBounds,
  deltaMs: number,
): boolean {
  if (!pointer) {
    return false;
  }

  const center = centerOf(entry);
  const deltaX = center.x - pointer.x;
  const deltaY = center.y - pointer.y;
  const distance = Math.hypot(deltaX, deltaY);
  const fleeRadius = AUTH_LOGIN_SPHERE_ROAM.pointerFleeRadiusPx;

  if (distance >= fleeRadius) {
    return false;
  }

  const proximity = 1 - distance / fleeRadius;
  const fleeStepPx = AUTH_LOGIN_SPHERE_ROAM.pointerFleeSpeedPxPerMs * proximity * deltaMs;
  const directionX = distance === 0 ? Math.random() - 0.5 : deltaX / distance;
  const directionY = distance === 0 ? Math.random() - 0.5 : deltaY / distance;
  const next = clampPoint(
    {
      x: entry.x + directionX * fleeStepPx,
      y: entry.y + directionY * fleeStepPx,
    },
    bounds,
  );

  entry.x = next.x;
  entry.y = next.y;
  return true;
}

/** Picks a random destination anywhere inside the viewport bounds. */
export function pickRandomRoamTarget(bounds: RoamBounds): RoamPoint {
  return {
    x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
    y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
  };
}
