import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import {
  hasAutoPromptedForEndsAt,
  markAutoPromptedEndsAt,
} from "@/lib/session-review-auto-prompt-storage";
import {
  isSessionReviewLater,
  markSessionReviewLater,
} from "@/lib/session-review-later-storage";

const memory = new Map<string, string>();

function installSessionStorage(setItem: (key: string, value: string) => void): void {
  const storage: Storage = {
    get length() {
      return memory.size;
    },
    clear: () => {
      memory.clear();
    },
    getItem: (key) => memory.get(key) ?? null,
    key: (index) => [...memory.keys()][index] ?? null,
    removeItem: (key) => {
      memory.delete(key);
    },
    setItem,
  };
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: storage,
  });
}

beforeEach(() => {
  memory.clear();
  installSessionStorage((key, value) => {
    memory.set(key, value);
  });
});

describe("session review auto-prompt storage", () => {
  const older = "2026-08-10T11:00:00.000Z";
  const newer = "2026-08-17T11:00:00.000Z";

  it("prompts until the member closes the modal for that class", () => {
    assert.equal(hasAutoPromptedForEndsAt(newer), false);
    markAutoPromptedEndsAt(newer);
    assert.equal(hasAutoPromptedForEndsAt(newer), true);
    assert.equal(hasAutoPromptedForEndsAt(older), true);
  });

  it("still prompts a class that ended after the one already shown", () => {
    markAutoPromptedEndsAt(older);
    assert.equal(hasAutoPromptedForEndsAt(newer), false);
  });

  it("does not replace a newer stored class with an older close", () => {
    markAutoPromptedEndsAt(newer);
    markAutoPromptedEndsAt(older);
    assert.equal(hasAutoPromptedForEndsAt(newer), true);
  });

  it("treats a storage read failure as not yet prompted", () => {
    installSessionStorage(() => {
      throw new Error("quota");
    });
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: {
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => {
          throw new Error("quota");
        },
      },
    });
    assert.equal(hasAutoPromptedForEndsAt(newer), false);
    assert.doesNotThrow(() => markAutoPromptedEndsAt(newer));
  });
});

describe("session review later storage", () => {
  it("hides a class only after the member chooses later", () => {
    assert.equal(isSessionReviewLater("review-1"), false);
    markSessionReviewLater("review-1");
    assert.equal(isSessionReviewLater("review-1"), true);
    assert.equal(isSessionReviewLater("review-2"), false);
  });

  it("stores each class id once", () => {
    markSessionReviewLater("review-1");
    markSessionReviewLater("review-1");
    assert.equal(memory.get("ommm.session-review.later"), JSON.stringify(["review-1"]));
  });

  it("ignores a corrupted later list", () => {
    memory.set("ommm.session-review.later", "{not-json");
    assert.equal(isSessionReviewLater("review-1"), false);
    memory.set("ommm.session-review.later", JSON.stringify([1, "review-1", null]));
    assert.equal(isSessionReviewLater("review-1"), true);
  });
});
