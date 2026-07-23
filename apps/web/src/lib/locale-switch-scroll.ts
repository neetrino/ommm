const LOCALE_SWITCH_SCROLL_KEY = "ommm:locale-switch-scroll";

type ScrollSnapshot = {
  x: number;
  y: number;
};

function readSnapshot(): ScrollSnapshot | null {
  if (typeof sessionStorage === "undefined") {
    return null;
  }
  const raw = sessionStorage.getItem(LOCALE_SWITCH_SCROLL_KEY);
  if (raw === null) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as ScrollSnapshot;
    if (
      typeof parsed.x === "number" &&
      typeof parsed.y === "number" &&
      Number.isFinite(parsed.x) &&
      Number.isFinite(parsed.y)
    ) {
      return parsed;
    }
  } catch {
    sessionStorage.removeItem(LOCALE_SWITCH_SCROLL_KEY);
  }
  return null;
}

/** True while a locale switch snapshot is waiting to be restored (avoids layout flash). */
export function isLocaleSwitchScrollPending(): boolean {
  return readSnapshot() !== null;
}

/** Call immediately before a locale-only client navigation. */
export function captureLocaleSwitchScroll(): void {
  if (typeof window === "undefined") {
    return;
  }
  const snapshot: ScrollSnapshot = {
    x: window.scrollX,
    y: window.scrollY,
  };
  sessionStorage.setItem(LOCALE_SWITCH_SCROLL_KEY, JSON.stringify(snapshot));
}

function applyScroll(snapshot: ScrollSnapshot): void {
  window.scrollTo(snapshot.x, snapshot.y);
}

/** Re-apply scroll after locale navigation — RSC may reset position asynchronously. */
export function restoreLocaleSwitchScroll(): void {
  const snapshot = readSnapshot();
  if (snapshot === null) {
    return;
  }

  applyScroll(snapshot);
  requestAnimationFrame(() => {
    applyScroll(snapshot);
  });
  window.setTimeout(() => {
    applyScroll(snapshot);
  }, 0);
  window.setTimeout(() => {
    applyScroll(snapshot);
    sessionStorage.removeItem(LOCALE_SWITCH_SCROLL_KEY);
  }, 200);
}
