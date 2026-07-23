"use client";

import { useState } from "react";
import { AdminSmallActionButton } from "@/components/admin/admin-small-action-button";
import { ApiError, apiFetch } from "@/lib/api";

type AdminPackageStatusActionsProps = {
  userPackageId: string;
};

export function AdminPackageStatusActions({
  userPackageId,
}: AdminPackageStatusActionsProps) {
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
      await apiFetch(`/packages/admin/${userPackageId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setTone("ok");
      setMessage("Package updated");
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
        <AdminSmallActionButton
          tone="success"
          onClick={() => void updateStatus("ACTIVE")}
          disabled={busy}
        >
          Set active
        </AdminSmallActionButton>
        <AdminSmallActionButton
          tone="warning"
          onClick={() => void updateStatus("PAUSED")}
          disabled={busy}
        >
          Set paused
        </AdminSmallActionButton>
        <AdminSmallActionButton
          tone="danger"
          onClick={() => void updateStatus("CANCELLED")}
          disabled={busy}
        >
          Set cancelled
        </AdminSmallActionButton>
      </div>
      {message ? (
        <p className={`text-xs ${tone === "ok" ? "text-sage-700" : "text-red-800"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
