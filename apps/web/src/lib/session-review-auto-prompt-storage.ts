const STORAGE_KEY = "ommm.session-review.auto-prompted-ends-at";

function readStoredEndsAt(): string | null {
  if (typeof sessionStorage === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}

/** True when this session already auto-prompted an equally new or newer booking. */
export function hasAutoPromptedForEndsAt(endsAt: string): boolean {
  const previous = readStoredEndsAt();
  return previous !== null && endsAt <= previous;
}

export function markAutoPromptedEndsAt(endsAt: string): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  try {
    const previous = readStoredEndsAt();
    if (previous !== null && endsAt <= previous) {
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, endsAt);
  } catch {
    /* ignore quota / private mode */
  }
}
