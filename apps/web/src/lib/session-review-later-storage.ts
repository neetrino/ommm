const STORAGE_KEY = "ommm.session-review.later";

function readIds(): string[] {
  if (typeof sessionStorage === "undefined") {
    return [];
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function isSessionReviewLater(id: string): boolean {
  return readIds().includes(id);
}

export function markSessionReviewLater(id: string): void {
  const next = Array.from(new Set([...readIds(), id]));
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
