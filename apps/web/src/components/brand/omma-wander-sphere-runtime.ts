import { isBallOffscreen, stepWanderWorld } from "@/components/brand/omma-wander-sphere-physics";
import {
  aimHorizontalVelocity,
  createWanderBall,
  pickSpawnEdges,
  poseFromEdge,
  wanderBurstSizes,
} from "@/components/brand/omma-wander-sphere-spawn";
import { collectWanderSurfaces } from "@/components/brand/omma-wander-sphere-surfaces";
import {
  OMMA_WANDER_DT_CLAMP_SEC,
  OMMA_WANDER_SPHERE_ASSET,
  OMMA_WANDER_STAGGER_MS,
  OMMA_WANDER_SURFACE_REFRESH_MS,
} from "@/components/brand/omma-wander-sphere-tokens";
import type {
  WanderAabb,
  WanderBall,
  WanderEdge,
  WanderViewport,
} from "@/components/brand/omma-wander-sphere-types";

export type WanderRuntimeStyles = {
  ballClass: string;
  imageClass: string;
};

type LiveBall = {
  state: WanderBall;
  el: HTMLDivElement;
};

export class OmmaWanderRuntime {
  private readonly layer: HTMLElement;
  private readonly styles: WanderRuntimeStyles;
  private readonly lives: LiveBall[] = [];
  private surfaces: WanderAabb[] = [];
  private rafId = 0;
  private lastTs = 0;
  private lastSurfaceAt = 0;
  private readonly spawnTimers: number[] = [];
  private running = false;

  constructor(layer: HTMLElement, styles: WanderRuntimeStyles) {
    this.layer = layer;
    this.styles = styles;
  }

  isActive(): boolean {
    return this.lives.length > 0 || this.spawnTimers.length > 0;
  }

  spawnBurst(count: number): void {
    if (this.isActive()) {
      return;
    }
    this.refreshSurfaces();
    const viewport = readViewport();
    const edges = pickSpawnEdges(count, Math.random);
    const sizes = wanderBurstSizes(count, viewport.width);
    edges.forEach((edge, index) => {
      const timerId = window.setTimeout(() => {
        const at = this.spawnTimers.indexOf(timerId);
        if (at >= 0) {
          this.spawnTimers.splice(at, 1);
        }
        const size = sizes[index];
        if (size === undefined) {
          return;
        }
        this.addBall(edge, viewport, size);
      }, index * OMMA_WANDER_STAGGER_MS);
      this.spawnTimers.push(timerId);
    });
  }

  stop(): void {
    for (const timerId of this.spawnTimers) {
      window.clearTimeout(timerId);
    }
    this.spawnTimers.length = 0;
    window.cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.running = false;
    this.lastTs = 0;
    for (const live of this.lives) {
      live.el.remove();
    }
    this.lives.length = 0;
    this.layer.removeAttribute("data-active");
  }

  private addBall(edge: WanderEdge, viewport: WanderViewport, size: number): void {
    const pose = poseFromEdge(edge, viewport, size, Math.random);
    pose.vx = aimHorizontalVelocity(pose.x, pose.vx, this.surfaces, Math.random);
    const state = createWanderBall(`wander-${Date.now()}-${Math.random().toString(16).slice(2)}`, pose);
    const el = createBallElement(this.styles, state.size);
    this.layer.appendChild(el);
    this.lives.push({ state, el });
    applyBallTransform(el, state);
    this.ensureLoop();
  }

  private ensureLoop(): void {
    this.layer.setAttribute("data-active", "");
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTs = 0;
    this.rafId = window.requestAnimationFrame(this.tick);
  }

  private tick = (timestamp: number): void => {
    if (!this.running) {
      return;
    }
    const rawDt = this.lastTs === 0 ? 0.016 : (timestamp - this.lastTs) / 1000;
    this.lastTs = timestamp;
    const dtSec = Math.min(OMMA_WANDER_DT_CLAMP_SEC, Math.max(0.001, rawDt));
    if (timestamp - this.lastSurfaceAt >= OMMA_WANDER_SURFACE_REFRESH_MS) {
      this.refreshSurfaces();
    }
    const viewport = readViewport();
    const balls = this.lives.map((live) => live.state);
    stepWanderWorld(balls, this.surfaces, viewport, dtSec, Math.random);
    this.paintAndCull(viewport);
    if (this.lives.length === 0) {
      this.running = false;
      this.layer.removeAttribute("data-active");
      return;
    }
    this.rafId = window.requestAnimationFrame(this.tick);
  };

  private paintAndCull(viewport: WanderViewport): void {
    for (let index = this.lives.length - 1; index >= 0; index -= 1) {
      const live = this.lives[index];
      if (!live) {
        continue;
      }
      if (isBallOffscreen(live.state, viewport)) {
        live.el.remove();
        this.lives.splice(index, 1);
        continue;
      }
      applyBallTransform(live.el, live.state);
    }
  }

  private refreshSurfaces(): void {
    this.lastSurfaceAt = performance.now();
    this.surfaces = collectWanderSurfaces(document, readViewport());
  }
}

function readViewport(): WanderViewport {
  return { width: window.innerWidth, height: window.innerHeight };
}

function createBallElement(styles: WanderRuntimeStyles, size: number): HTMLDivElement {
  const wrap = document.createElement("div");
  wrap.className = styles.ballClass;
  wrap.style.setProperty("--omma-wander-ball-size", `${size}px`);
  const image = document.createElement("img");
  image.className = styles.imageClass;
  image.src = OMMA_WANDER_SPHERE_ASSET;
  image.alt = "";
  image.draggable = false;
  image.decoding = "async";
  wrap.appendChild(image);
  return wrap;
}

function applyBallTransform(el: HTMLDivElement, ball: WanderBall): void {
  const left = ball.x - ball.size / 2;
  const top = ball.y - ball.size / 2;
  el.style.transform = `translate3d(${left}px, ${top}px, 0) rotate(${ball.spin}deg) scale(${ball.squashX}, ${ball.squashY})`;
}
