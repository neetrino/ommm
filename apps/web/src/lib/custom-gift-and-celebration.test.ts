import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { UserGiftCardRow } from "@/components/account/user-gift-cards-types";
import {
  CUSTOM_GIFT_CARD_MAX_AMD,
  CUSTOM_GIFT_CARD_MIN_AMD,
} from "@/lib/custom-gift-card.constants";
import {
  customGiftFieldIssues,
  customGiftInputError,
  customGiftAmountBelowMin,
} from "@/lib/custom-gift-checkout";
import { giftPayableAmd, PHYSICAL_GIFT_CARD_FEE_AMD } from "@/lib/gift-card-medium";
import {
  dismissGiftCelebration,
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
  it("requires an amount and a recipient email", () => {
    assert.equal(customGiftInputError(null, true), "amountRequired");
    assert.equal(customGiftInputError(CUSTOM_GIFT_CARD_MIN_AMD, false), "recipientRequired");
  });

  it("reports every required field and skips the optional note", () => {
    assert.deepEqual(customGiftFieldIssues(null, false), {
      amount: "amountRequired",
      recipient: "recipientRequired",
    });
    assert.deepEqual(customGiftFieldIssues(CUSTOM_GIFT_CARD_MIN_AMD, true), {
      amount: null,
      recipient: null,
    });
  });

  it("flags a typed amount under the 30,000 floor", () => {
    assert.equal(customGiftAmountBelowMin(""), false);
    assert.equal(customGiftAmountBelowMin("15000"), true);
    assert.equal(customGiftAmountBelowMin("70000"), false);
  });

  it("accepts the minimum and rejects outside the range", () => {
    assert.equal(customGiftInputError(CUSTOM_GIFT_CARD_MIN_AMD, true), null);
    assert.equal(customGiftInputError(CUSTOM_GIFT_CARD_MIN_AMD - 1, true), "amountMin");
    assert.equal(customGiftInputError(CUSTOM_GIFT_CARD_MAX_AMD + 1, true), "amountMax");
  });
});

describe("giftPayableAmd", () => {
  it("adds the print fee only when the card is physical", () => {
    assert.equal(giftPayableAmd({ faceAmd: 30_000, medium: "DIGITAL" }), 30_000);
    assert.equal(
      giftPayableAmd({ faceAmd: 30_000, medium: "PHYSICAL" }),
      30_000 + PHYSICAL_GIFT_CARD_FEE_AMD,
    );
    assert.equal(giftPayableAmd({ faceAmd: null, medium: "PHYSICAL" }), null);
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

  it("stays closed after the member dismisses it once", () => {
    const store = new Map<string, string>();
    const previousWindow = globalThis.window;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          getItem: (key: string) => store.get(key) ?? null,
          setItem: (key: string, value: string) => {
            store.set(key, value);
          },
        },
      },
    });
    try {
      const fresh = card({ id: "gift", createdAt: new Date(NOW).toISOString() });
      assert.equal(selectUnseenGiftCelebration([fresh], new Set(), NOW)?.id, "gift");
      dismissGiftCelebration();
      assert.equal(selectUnseenGiftCelebration([fresh], new Set(), NOW), null);
    } finally {
      if (previousWindow === undefined) {
        Reflect.deleteProperty(globalThis, "window");
      } else {
        Object.defineProperty(globalThis, "window", {
          configurable: true,
          value: previousWindow,
        });
      }
    }
  });
});
