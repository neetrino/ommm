import { AUTH_LOGIN_SPHERE_ROAM } from "@/components/auth/auth-login-sphere-roam-tokens";
import {
  applyEntryPosition,
  clampPoint,
  fleeFromPointer,
  measureBounds,
  pickRandomRoamTarget,
  type AuthLoginSphereEntry,
  type AuthLoginSphereLayoutSeed,
  type RoamPoint,
} from "@/components/auth/auth-login-sphere-roam-math";

export type { AuthLoginSphereLayoutSeed } from "@/components/auth/auth-login-sphere-roam-math";

/** Coordinates slow login-sphere roam across the full viewport. */
export class AuthLoginSphereGroup {
  private readonly spheres = new Map<string, AuthLoginSphereEntry>();
  private rafId = 0;
  private lastTimestamp = 0;
  private running = false;
  private pointer: RoamPoint | null = null;

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

  setPointer(point: RoamPoint): void {
    this.pointer = point;
  }

  clearPointer(): void {
    this.pointer = null;
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
      const bounds = measureBounds(entry.size);
      const fled = fleeFromPointer(entry, this.pointer, bounds, deltaMs);
      if (fled) {
        entry.targetX = entry.x;
        entry.targetY = entry.y;
      }
    }

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
    const target = pickRandomRoamTarget(bounds);
    entry.targetX = target.x;
    entry.targetY = target.y;
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
