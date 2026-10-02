import type { UserGiftCardRow } from "@/components/account/user-gift-cards-types";

const STORAGE_KEY = "ommm.gift-celebration.seen.v1";
const MAX_SEEN_IDS = 200;
const DAY_MS = 24 * 60 * 60 * 1000;

/** How long a received gift stays eligible for the welcome overlay. */
export const GIFT_CELEBRATION_MAX_AGE_DAYS = 90;

export function readSeenGiftCelebrationIds(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new Set();
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export function markGiftCelebrationSeen(id: string): void {
  const next = [id, ...readSeenGiftCelebrationIds()];
  const unique = [...new Set(next)].slice(0, MAX_SEEN_IDS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
}

/** Newest unseen active gift inside the celebration window. */
export function selectUnseenGiftCelebration(
  cards: readonly UserGiftCardRow[],
  seenIds: ReadonlySet<string>,
  nowMs: number,
): UserGiftCardRow | null {
  const cutoff = nowMs - GIFT_CELEBRATION_MAX_AGE_DAYS * DAY_MS;
  const unseen = cards.filter((card) => isCelebrationCandidate(card, seenIds, cutoff));
  unseen.sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  return unseen[0] ?? null;
}

function isCelebrationCandidate(
  card: UserGiftCardRow,
  seenIds: ReadonlySet<string>,
  cutoffMs: number,
): boolean {
  if (seenIds.has(card.id) || card.status !== "ACTIVE" || card.balanceCents <= 0) {
    return false;
  }
  const createdMs = Date.parse(card.createdAt);
  return Number.isFinite(createdMs) && createdMs >= cutoffMs;
}
