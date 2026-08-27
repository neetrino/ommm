import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canSubmitPastSessionAttach,
  pastSessionOptionLabel,
  type AdminClientAttachablePastSession,
} from "./admin-client-package-past-session.helpers";

const session: AdminClientAttachablePastSession = {
  id: "session-1",
  startsAt: "2026-08-27T08:00:00.000Z",
  classType: { name: "Reformer" },
  coach: { user: { name: "Anna" } },
  hasExistingVisit: false,
};

describe("admin-client-package-past-session.helpers", () => {
  it("labels a past session without a roster mark", () => {
    const label = pastSessionOptionLabel(session, "en", "Already on roster");
    assert.match(label, /Reformer/);
    assert.match(label, /Anna/);
    assert.equal(label.includes("Already on roster"), false);
  });

  it("appends the roster mark when the visit already exists", () => {
    const label = pastSessionOptionLabel(
      { ...session, hasExistingVisit: true },
      "en",
      "Already on roster",
    );
    assert.match(label, /Already on roster/);
  });

  it("blocks submit until a session is chosen and loading is done", () => {
    assert.equal(
      canSubmitPastSessionAttach({
        sessionId: "",
        loading: false,
        loadError: null,
        submitting: false,
      }),
      false,
    );
    assert.equal(
      canSubmitPastSessionAttach({
        sessionId: "session-1",
        loading: true,
        loadError: null,
        submitting: false,
      }),
      false,
    );
    assert.equal(
      canSubmitPastSessionAttach({
        sessionId: "session-1",
        loading: false,
        loadError: null,
        submitting: false,
      }),
      true,
    );
  });
});
