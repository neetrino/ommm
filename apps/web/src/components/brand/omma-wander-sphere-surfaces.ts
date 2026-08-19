import {
  OMMA_WANDER_MAX_SURFACES,
  OMMA_WANDER_MAX_SURFACE_VIEWPORT_AREA,
  OMMA_WANDER_MIN_SURFACE_HEIGHT_PX,
  OMMA_WANDER_MIN_SURFACE_WIDTH_PX,
  OMMA_WANDER_SURFACE_VIEWPORT_PAD_PX,
} from "@/components/brand/omma-wander-sphere-tokens";
import type { WanderAabb, WanderViewport } from "@/components/brand/omma-wander-sphere-types";

export const OMMA_WANDER_SURFACE_SELECTOR = [
  "button",
  "a[href]",
  "[role='button']",
  "[role='link']",
  "[role='tab']",
  "h1",
  "h2",
  "h3",
  "img",
  "video",
  "input",
  "textarea",
  "select",
  "[data-slot='card']",
  "article",
  "nav",
  "header",
  ".ommm-card",
  ".ommm-cta-primary",
].join(",");

export function isUsableSurfaceRect(rect: WanderAabb, viewport: WanderViewport): boolean {
  const width = rect.right - rect.left;
  const height = rect.bottom - rect.top;
  if (width < OMMA_WANDER_MIN_SURFACE_WIDTH_PX || height < OMMA_WANDER_MIN_SURFACE_HEIGHT_PX) {
    return false;
  }
  const area = width * height;
  const viewportArea = viewport.width * viewport.height;
  if (viewportArea > 0 && area / viewportArea > OMMA_WANDER_MAX_SURFACE_VIEWPORT_AREA) {
    return false;
  }
  if (width > viewport.width * 0.92 && height > viewport.height * 0.55) {
    return false;
  }
  const pad = OMMA_WANDER_SURFACE_VIEWPORT_PAD_PX;
  return !(
    rect.right < -pad ||
    rect.left > viewport.width + pad ||
    rect.bottom < -pad ||
    rect.top > viewport.height + pad
  );
}

export function sampleSurfaces(
  rects: readonly WanderAabb[],
  viewport: WanderViewport,
  max = OMMA_WANDER_MAX_SURFACES,
): WanderAabb[] {
  const usable = rects.filter((rect) => isUsableSurfaceRect(rect, viewport));
  if (usable.length <= max) {
    return usable;
  }
  const cellWidth = viewport.width / 4;
  const cellHeight = viewport.height / 3;
  const picked: WanderAabb[] = [];
  const remaining = [...usable];

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const cell = takeLargestInCell(remaining, row, col, cellWidth, cellHeight);
      if (cell && picked.length < max) {
        picked.push(cell);
      }
    }
  }

  remaining.sort((a, b) => aabbArea(b) - aabbArea(a));
  for (const rect of remaining) {
    if (picked.length >= max) {
      break;
    }
    picked.push(rect);
  }
  return picked;
}

function aabbArea(rect: WanderAabb): number {
  return Math.max(0, rect.right - rect.left) * Math.max(0, rect.bottom - rect.top);
}

function takeLargestInCell(
  pool: WanderAabb[],
  row: number,
  col: number,
  cellWidth: number,
  cellHeight: number,
): WanderAabb | null {
  const minX = col * cellWidth;
  const maxX = minX + cellWidth;
  const minY = row * cellHeight;
  const maxY = minY + cellHeight;
  let bestIndex = -1;
  let bestArea = -1;

  for (let index = 0; index < pool.length; index += 1) {
    const rect = pool[index];
    if (!rect) {
      continue;
    }
    const cx = (rect.left + rect.right) / 2;
    const cy = (rect.top + rect.bottom) / 2;
    if (cx < minX || cx >= maxX || cy < minY || cy >= maxY) {
      continue;
    }
    const area = aabbArea(rect);
    if (area > bestArea) {
      bestArea = area;
      bestIndex = index;
    }
  }

  if (bestIndex < 0) {
    return null;
  }
  return pool.splice(bestIndex, 1)[0] ?? null;
}

export function collectWanderSurfaces(
  root: ParentNode,
  viewport: WanderViewport,
): WanderAabb[] {
  const nodes = root.querySelectorAll(OMMA_WANDER_SURFACE_SELECTOR);
  const rects: WanderAabb[] = [];
  for (const node of nodes) {
    if (!(node instanceof HTMLElement) || node.closest("[data-omma-wander]")) {
      continue;
    }
    if (!isPaintedElement(node)) {
      continue;
    }
    const box = node.getBoundingClientRect();
    rects.push({ left: box.left, top: box.top, right: box.right, bottom: box.bottom });
    if (rects.length >= 80) {
      break;
    }
  }
  return sampleSurfaces(rects, viewport);
}

function isPaintedElement(node: HTMLElement): boolean {
  const style = window.getComputedStyle(node);
  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
}
