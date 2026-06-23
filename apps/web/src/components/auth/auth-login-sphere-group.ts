import { AUTH_LOGIN_SPHERE_ROAM } from "@/components/auth/auth-login-sphere-roam-tokens";
import {
  applyEntryPosition,
  clampPoint,
  measureBounds,
  pickTargetAwayFromNeighbors,
  separatePair,
  type AuthLoginSphereEntry,
  type AuthLoginSphereLayoutSeed,
} from "@/components/auth/auth-login-sphere-roam-math";

export type { AuthLoginSphereLayoutSeed } from "@/components/auth/auth-login-sphere-roam-math";

/** Coordinates slow login-sphere roam and keeps spheres from overlapping. */
export class AuthLoginSphereGroup {
  private readonly spheres = new Map<string, AuthLoginSphereEntry>();
  private rafId = 0;
  private lastTimestamp = 0;
  private running = false;

  addSphere(
    id: string,
    el: HTMLElement,
    layout: AuthLoginSphereLayoutSeed,
    movementDelayMs = 0,
  ): void {
    const rect = el.getBoundingClientRect();
    const size = rect.width || el.offsetWidth;
    const bounds = measureBounds(size);
    const seed = clampPoint(
      {
        x: (layout.left / 100) * window.innerWidth,
        y: (layout.top / 100) * window.innerHeight,
      },
      bounds,
    );

    const entry: AuthLoginSphereEntry = {
      id,
      el,
      x: seed.x,
      y: seed.y,
      targetX: seed.x,
      targetY: seed.y,
      size,
    };

    this.spheres.set(id, entry);
    this.resolveAllOverlaps();
    applyEntryPosition(entry);

    if (movementDelayMs > 0) {
      window.setTimeout(() => {
        if (!this.spheres.has(id)) {
          return;
        }
        this.assignTarget(entry);
      }, movementDelayMs);
      return;
    }

    this.assignTarget(entry);
  }

  removeSphere(id: string): void {
    this.spheres.delete(id);
  }

  start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTimestamp = 0;
    this.rafId = window.requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    window.cancelAnimationFrame(this.rafId);
    this.lastTimestamp = 0;
  }

  freeze(): void {
    this.stop();
    this.resolveAllOverlaps();
    this.applyAllPositions();
  }

  relayoutOnResize(): void {
    for (const entry of this.spheres.values()) {
      entry.size = entry.el.getBoundingClientRect().width || entry.el.offsetWidth;
      const bounds = measureBounds(entry.size);
      const clamped = clampPoint({ x: entry.x, y: entry.y }, bounds);
      entry.x = clamped.x;
      entry.y = clamped.y;
      entry.targetX = clamped.x;
      entry.targetY = clamped.y;
    }
    this.resolveAllOverlaps();
    this.applyAllPositions();
    for (const entry of this.spheres.values()) {
      this.assignTarget(entry);
    }
  }

  private tick = (timestamp: number): void => {
    if (!this.running) {
      return;
    }

    const deltaMs = this.lastTimestamp === 0 ? 16 : timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    for (const entry of this.spheres.values()) {
      this.advanceTowardTarget(entry, deltaMs);
    }

    this.resolveAllOverlaps();
    this.applyAllPositions();

    for (const entry of this.spheres.values()) {
      if (this.hasReachedTarget(entry)) {
        this.assignTarget(entry);
      }
    }

    this.rafId = window.requestAnimationFrame(this.tick);
  };

  private advanceTowardTarget(entry: AuthLoginSphereEntry, deltaMs: number): void {
    const deltaX = entry.targetX - entry.x;
    const deltaY = entry.targetY - entry.y;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance <= AUTH_LOGIN_SPHERE_ROAM.targetArrivePx) {
      return;
    }

    const stepPx = AUTH_LOGIN_SPHERE_ROAM.speedPxPerMs * deltaMs;
    const ratio = Math.min(1, stepPx / distance);
    entry.x += deltaX * ratio;
    entry.y += deltaY * ratio;
  }

  private hasReachedTarget(entry: AuthLoginSphereEntry): boolean {
    return (
      Math.hypot(entry.targetX - entry.x, entry.targetY - entry.y) <=
      AUTH_LOGIN_SPHERE_ROAM.targetArrivePx
    );
  }

  private assignTarget(entry: AuthLoginSphereEntry): void {
    const bounds = measureBounds(entry.size);
    const target = pickTargetAwayFromNeighbors(entry, bounds, this.spheres);
    entry.targetX = target.x;
    entry.targetY = target.y;
  }

  private resolveAllOverlaps(): void {
    const entries = [...this.spheres.values()];

    for (let iteration = 0; iteration < AUTH_LOGIN_SPHERE_ROAM.repulsionIterations; iteration += 1) {
      for (let index = 0; index < entries.length; index += 1) {
        for (let otherIndex = index + 1; otherIndex < entries.length; otherIndex += 1) {
          separatePair(entries[index], entries[otherIndex]);
        }
      }

      for (const entry of entries) {
        const bounds = measureBounds(entry.size);
        const clamped = clampPoint({ x: entry.x, y: entry.y }, bounds);
        entry.x = clamped.x;
        entry.y = clamped.y;
      }
    }
  }

  private applyAllPositions(): void {
    for (const entry of this.spheres.values()) {
      applyEntryPosition(entry);
    }
  }
}

export function createAuthLoginSphereGroup(): AuthLoginSphereGroup {
  return new AuthLoginSphereGroup();
}
