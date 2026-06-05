function readMountedIds(storageKey: string): ReadonlySet<string> {
  if (typeof sessionStorage === "undefined") {
    return new Set();
  }
  const raw = sessionStorage.getItem(storageKey);
  if (raw === null) {
    return new Set();
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    sessionStorage.removeItem(storageKey);
    return new Set();
  }
}

function storageKeyForScope(scope: string): string {
  return `ommm:${scope}-lazy-sections-mounted`;
}

/** Whether a lazily mounted section was already revealed in this tab session. */
export function isLazySectionMounted(scope: string, id: string): boolean {
  return readMountedIds(storageKeyForScope(scope)).has(id);
}

/** Persist a lazily mounted section id for back/forward navigation within the tab. */
export function markLazySectionMounted(scope: string, id: string): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  const storageKey = storageKeyForScope(scope);
  const ids = new Set(readMountedIds(storageKey));
  ids.add(id);
  sessionStorage.setItem(storageKey, JSON.stringify([...ids]));
}
