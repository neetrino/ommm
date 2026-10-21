import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldOpenMenuAbove } from "./use-floating-menu-position";

const MIN_MENU_HEIGHT = 140;

describe("shouldOpenMenuAbove", () => {
  it("opens above when that side is requested and has room", () => {
    assert.equal(
      shouldOpenMenuAbove({
        preferPlacement: "top",
        availableAbove: 420,
        availableBelow: 180,
        minMenuHeight: MIN_MENU_HEIGHT,
      }),
      true,
    );
  });

  it("falls back below when the top side cannot fit", () => {
    assert.equal(
      shouldOpenMenuAbove({
        preferPlacement: "top",
        availableAbove: 40,
        availableBelow: 320,
        minMenuHeight: MIN_MENU_HEIGHT,
      }),
      false,
    );
  });

  it("keeps auto menus below when the space under the field already fits", () => {
    assert.equal(
      shouldOpenMenuAbove({
        preferPlacement: "auto",
        availableAbove: 420,
        availableBelow: 180,
        minMenuHeight: MIN_MENU_HEIGHT,
      }),
      false,
    );
  });
});
