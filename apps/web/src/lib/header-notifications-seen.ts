const SEEN_NOTIFICATION_IDS_KEY = "ommm:header-notifications-seen-ids";

function readStoredIds(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }
  try {
    const raw = window.localStorage.getItem(SEEN_NOTIFICATION_IDS_KEY);
    if (raw === null || raw.trim() === "") {
      return new Set();
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((id): id is string => typeof id === "string" && id.length > 0));
  } catch {
    return new Set();
  }
}

function writeStoredIds(ids: ReadonlySet<string>): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SEEN_NOTIFICATION_IDS_KEY, JSON.stringify([...ids]));
}

/** Waitlist offer entry ids the member has already seen in the header inbox. */
export function readSeenNotificationIds(): Set<string> {
  return readStoredIds();
}

export function markNotificationIdsSeen(ids: readonly string[]): void {
  if (ids.length === 0) {
    return;
  }
  const next = readStoredIds();
  for (const id of ids) {
    next.add(id);
  }
  writeStoredIds(next);
}

export function countUnreadNotificationOffers(
  offeredIds: readonly string[],
  seenIds: ReadonlySet<string>,
): number {
  return offeredIds.filter((id) => !seenIds.has(id)).length;
}
