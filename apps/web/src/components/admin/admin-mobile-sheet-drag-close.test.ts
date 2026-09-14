import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ADMIN_MOBILE_SHEET_DRAG_CLOSE_DISTANCE_PX,
  shouldCloseFromSheetDrag,
} from "./admin-mobile-sheet-layout";

describe("shouldCloseFromSheetDrag", () => {
  it("ignores tiny downward movement", () => {
    assert.equal(shouldCloseFromSheetDrag(4, 80), false);
  });

  it("closes after a long downward drag", () => {
    assert.equal(shouldCloseFromSheetDrag(ADMIN_MOBILE_SHEET_DRAG_CLOSE_DISTANCE_PX, 400), true);
  });

  it("closes on a fast flick before the distance threshold", () => {
    assert.equal(shouldCloseFromSheetDrag(40, 40), true);
  });
});
