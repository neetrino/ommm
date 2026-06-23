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

function minCenterDistance(size: number): number {
  return size + AUTH_LOGIN_SPHERE_ROAM.separationGapPx;
}

export function centerOf(entry: AuthLoginSphereEntry): RoamPoint {
  const radius = entry.size / 2;
  return { x: entry.x + radius, y: entry.y + radius };
}

export function applyEntryPosition(entry: AuthLoginSphereEntry): void {
  entry.el.style.left = `${entry.x}px`;
  entry.el.style.top = `${entry.y}px`;
}

function distanceBetween(a: RoamPoint, b: RoamPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function separatePair(a: AuthLoginSphereEntry, b: AuthLoginSphereEntry): void {
  const centerA = centerOf(a);
  const centerB = centerOf(b);
  const deltaX = centerB.x - centerA.x;
  const deltaY = centerB.y - centerA.y;
  const distance = Math.hypot(deltaX, deltaY);
  const required = minCenterDistance(Math.max(a.size, b.size));

  if (distance >= required || distance === 0) {
    return;
  }

  const overlap = required - distance;
  const pushX = (deltaX / distance) * overlap * 0.5;
  const pushY = (deltaY / distance) * overlap * 0.5;
  a.x -= pushX;
  a.y -= pushY;
  b.x += pushX;
  b.y += pushY;
}

function pickRandomPoint(bounds: RoamBounds): RoamPoint {
  return {
    x: bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
    y: bounds.minY + Math.random() * (bounds.maxY - bounds.minY),
  };
}

function pickTargetFromAngle(origin: RoamPoint, bounds: RoamBounds): RoamPoint {
  const angleRad = Math.random() * Math.PI * 2;
  const maxReachPx = Math.max(
    0,
    Math.min(
      bounds.maxX - origin.x,
      origin.x - bounds.minX,
      bounds.maxY - origin.y,
      origin.y - bounds.minY,
    ),
  );
  const travelPx = Math.max(120, maxReachPx * (0.45 + Math.random() * 0.55));
  return clampPoint(
    {
      x: origin.x + Math.cos(angleRad) * travelPx,
      y: origin.y + Math.sin(angleRad) * travelPx,
    },
    bounds,
  );
}

function isTargetClear(
  target: RoamPoint,
  selfId: string,
  size: number,
  spheres: Map<string, AuthLoginSphereEntry>,
): boolean {
  const required = minCenterDistance(size);
  const targetCenter = { x: target.x + size / 2, y: target.y + size / 2 };

  for (const [id, other] of spheres) {
    if (id === selfId) {
      continue;
    }
    if (distanceBetween(targetCenter, centerOf(other)) < required) {
      return false;
    }
  }

  return true;
}

export function pickTargetAwayFromNeighbors(
  entry: AuthLoginSphereEntry,
  bounds: RoamBounds,
  spheres: Map<string, AuthLoginSphereEntry>,
): RoamPoint {
  const origin = { x: entry.x, y: entry.y };

  for (let attempt = 0; attempt < AUTH_LOGIN_SPHERE_ROAM.targetPickAttempts; attempt += 1) {
    const candidate =
      Math.random() > 0.35 ? pickTargetFromAngle(origin, bounds) : pickRandomPoint(bounds);
    if (isTargetClear(candidate, entry.id, entry.size, spheres)) {
      return candidate;
    }
  }

  return pickFallbackTarget(entry, bounds, spheres);
}

function pickFallbackTarget(
  entry: AuthLoginSphereEntry,
  bounds: RoamBounds,
  spheres: Map<string, AuthLoginSphereEntry>,
): RoamPoint {
  const selfCenter = centerOf(entry);
  let farthest = pickRandomPoint(bounds);
  let farthestDistance = -1;

  for (let attempt = 0; attempt < AUTH_LOGIN_SPHERE_ROAM.targetPickAttempts; attempt += 1) {
    const candidate = pickRandomPoint(bounds);
    const candidateCenter = {
      x: candidate.x + entry.size / 2,
      y: candidate.y + entry.size / 2,
    };

    let nearestNeighbor = Number.POSITIVE_INFINITY;
    for (const [id, other] of spheres) {
      if (id === entry.id) {
        continue;
      }
      nearestNeighbor = Math.min(nearestNeighbor, distanceBetween(candidateCenter, centerOf(other)));
    }

    if (nearestNeighbor > farthestDistance) {
      farthestDistance = nearestNeighbor;
      farthest = candidate;
    }
  }

  const requiredDistance = minCenterDistance(entry.size);
  if (farthestDistance >= requiredDistance) {
    return farthest;
  }

  const nearest = [...spheres.values()]
    .filter((other) => other.id !== entry.id)
    .sort(
      (left, right) =>
        distanceBetween(selfCenter, centerOf(left)) - distanceBetween(selfCenter, centerOf(right)),
    )[0];

  if (!nearest) {
    return farthest;
  }

  const nearestCenter = centerOf(nearest);
  const awayX = selfCenter.x - nearestCenter.x;
  const awayY = selfCenter.y - nearestCenter.y;
  const awayLength = Math.hypot(awayX, awayY) || 1;
  const pushPx = requiredDistance * 0.75;

  return clampPoint(
    {
      x: entry.x + (awayX / awayLength) * pushPx,
      y: entry.y + (awayY / awayLength) * pushPx,
    },
    bounds,
  );
}
