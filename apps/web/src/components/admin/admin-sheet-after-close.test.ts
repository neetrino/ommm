import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldNotifyDesktopSheetAfterClose } from "@/components/admin/admin-sheet-after-close";

describe("shouldNotifyDesktopSheetAfterClose", () => {
  it("notifies when a desktop sheet transitions from open to closed", () => {
    assert.equal(shouldNotifyDesktopSheetAfterClose(false, true, false), true);
  });

  it("does not notify on phone (exit animation owns dismiss)", () => {
    assert.equal(shouldNotifyDesktopSheetAfterClose(true, true, false), false);
  });

  it("does not notify when already closed or still open", () => {
    assert.equal(shouldNotifyDesktopSheetAfterClose(false, false, false), false);
    assert.equal(shouldNotifyDesktopSheetAfterClose(false, true, true), false);
    assert.equal(shouldNotifyDesktopSheetAfterClose(false, false, true), false);
  });
});
