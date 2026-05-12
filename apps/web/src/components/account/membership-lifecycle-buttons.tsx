"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type MembershipLifecycleButtonsProps = {
  membershipId: string;
  status: string;
};

export function MembershipLifecycleButtons({
  membershipId,
  status,
}: MembershipLifecycleButtonsProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (status !== "ACTIVE") {
    return null;
  }

  async function pause() {
    setMessage(null);
    setPending(true);
    try {
      await apiFetch(`/memberships/me/${membershipId}/pause`, {
        method: "PATCH",
        body: JSON.stringify({}),
      });
      setMessage("Membership paused.");
    } catch (err) {
      setMessage(
        err instanceof ApiError ? err.message : "Could not pause membership.",
      );
    } finally {
      setPending(false);
    }
  }

  async function cancel() {
    setMessage(null);
    setPending(true);
    try {
      await apiFetch(`/memberships/me/${membershipId}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({}),
      });
      setMessage("Membership cancelled.");
    } catch (err) {
      setMessage(
        err instanceof ApiError ? err.message : "Could not cancel membership.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        className="ommm-cta-ghost text-xs"
        disabled={pending}
        onClick={() => void pause()}
      >
        Pause
      </button>
      <button
        type="button"
        className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-50 disabled:opacity-50"
        disabled={pending}
        onClick={() => void cancel()}
      >
        Cancel
      </button>
      {message !== null ? (
        <p className="w-full text-xs text-sage-600" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
