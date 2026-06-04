const HOME_LAZY_SECTIONS_MOUNTED_KEY = "ommm:home-lazy-sections-mounted";

function readMountedIds(): ReadonlySet<string> {
  if (typeof sessionStorage === "undefined") {
    return new Set();
  }
  const raw = sessionStorage.getItem(HOME_LAZY_SECTIONS_MOUNTED_KEY);
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
    sessionStorage.removeItem(HOME_LAZY_SECTIONS_MOUNTED_KEY);
    return new Set();
  }
}

export function isHomeLazySectionMounted(id: string): boolean {
  return readMountedIds().has(id);
}

export function markHomeLazySectionMounted(id: string): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  const ids = new Set(readMountedIds());
  ids.add(id);
  sessionStorage.setItem(HOME_LAZY_SECTIONS_MOUNTED_KEY, JSON.stringify([...ids]));
}
