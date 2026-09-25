import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { UserGiftCardRow } from "@/components/account/user-gift-cards-types";
import {
  CUSTOM_GIFT_CARD_MAX_AMD,
  CUSTOM_GIFT_CARD_MIN_AMD,
} from "@/lib/custom-gift-card.constants";
import { customGiftInputError } from "@/lib/custom-gift-checkout";
import {
  GIFT_CELEBRATION_MAX_AGE_DAYS,
  selectUnseenGiftCelebration,
} from "@/lib/gift-celebration";

const NOW = Date.parse("2026-09-25T10:00:00.000Z");

function card(overrides: Partial<UserGiftCardRow> & Pick<UserGiftCardRow, "id" | "createdAt">): UserGiftCardRow {
  return {
    code: "ABC",
    amountCents: 30_000,
    balanceCents: 30_000,
    status: "ACTIVE",
    imageUrl: null,
    recipientEmail: null,
    recipientName: null,
    purchaserName: "Aren",
    message: "For you",
    expiresAt: null,
    ...overrides,
  };
}

describe("customGiftInputError", () => {
  it("requires an amount and a recipient", () => {
    assert.equal(customGiftInputError(null, true), "amountRequired");
    assert.equal(customGiftInputError(CUSTOM_GIFT_CARD_MIN_AMD, false), "recipientRequired");
  });

  it("accepts the minimum and rejects outside the range", () => {
    assert.equal(customGiftInputError(CUSTOM_GIFT_CARD_MIN_AMD, true), null);
    assert.equal(customGiftInputError(CUSTOM_GIFT_CARD_MIN_AMD - 1, true), "amountMin");
    assert.equal(customGiftInputError(CUSTOM_GIFT_CARD_MAX_AMD + 1, true), "amountMax");
  });
});

describe("selectUnseenGiftCelebration", () => {
  it("picks the newest unseen active gift inside the window", () => {
    const older = new Date(NOW - 2 * 24 * 60 * 60 * 1000).toISOString();
    const newer = new Date(NOW - 60 * 60 * 1000).toISOString();
    const chosen = selectUnseenGiftCelebration(
      [
        card({ id: "old", createdAt: older }),
        card({ id: "new", createdAt: newer, purchaserName: "Lilit" }),
        card({ id: "seen", createdAt: newer }),
      ],
      new Set(["seen"]),
      NOW,
    );
    assert.equal(chosen?.id, "new");
  });

  it("skips spent, inactive, and stale gifts", () => {
    const stale = new Date(
      NOW - (GIFT_CELEBRATION_MAX_AGE_DAYS + 1) * 24 * 60 * 60 * 1000,
    ).toISOString();
    const fresh = new Date(NOW - 60 * 60 * 1000).toISOString();
    const chosen = selectUnseenGiftCelebration(
      [
        card({ id: "stale", createdAt: stale }),
        card({ id: "spent", createdAt: fresh, balanceCents: 0 }),
        card({ id: "inactive", createdAt: fresh, status: "REDEEMED" }),
      ],
      new Set(),
      NOW,
    );
    assert.equal(chosen, null);
  });
});
