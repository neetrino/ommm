"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type AdminMembershipActionsProps = {
  membershipId: string;
};

export function AdminMembershipActions({
  membershipId,
}: AdminMembershipActionsProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");

  async function updateStatus(status: "ACTIVE" | "PAUSED" | "CANCELLED") {
    if (busy) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await apiFetch(`/memberships/admin/${membershipId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setTone("ok");
      setMessage("Membership updated");
      window.location.reload();
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-[13rem] flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md border border-emerald-300 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
          onClick={() => void updateStatus("ACTIVE")}
          disabled={busy}
        >
          Set active
        </button>
        <button
          type="button"
          className="rounded-md border border-amber-300 px-2 py-1 text-xs text-amber-800 hover:bg-amber-50 disabled:opacity-50"
          onClick={() => void updateStatus("PAUSED")}
          disabled={busy}
        >
          Set paused
        </button>
        <button
          type="button"
          className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
          onClick={() => void updateStatus("CANCELLED")}
          disabled={busy}
        >
          Set cancelled
        </button>
      </div>
      {message ? (
        <p className={`text-xs ${tone === "ok" ? "text-sage-700" : "text-red-800"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
