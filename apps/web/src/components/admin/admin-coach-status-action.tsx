"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmButton } from "@/components/ui/omm-button";

type AdminCoachStatusActionProps = {
  coachId: string;
  isActive: boolean;
  labels: {
    activate: string;
    deactivate: string;
    saving: string;
    confirmActivate: string;
    confirmDeactivate: string;
    activated: string;
    deactivated: string;
    failed: string;
  };
  onChanged?: () => void;
};

export function AdminCoachStatusAction({
  coachId,
  isActive,
  labels,
  onChanged,
}: AdminCoachStatusActionProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const nextIsActive = !isActive;

  async function submit(): Promise<void> {
    if (busy) {
      return;
    }
    const confirmMessage = nextIsActive
      ? labels.confirmActivate
      : labels.confirmDeactivate;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      await apiFetch(`/coaches/${coachId}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: nextIsActive }),
      });
      setMessage(nextIsActive ? labels.activated : labels.deactivated);
      onChanged?.();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : labels.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <OmmButton
        type="button"
        size="sm"
        variant={isActive ? "danger" : "subtle"}
        disabled={busy}
        onClick={() => {
          void submit();
        }}
      >
        {busy ? labels.saving : isActive ? labels.deactivate : labels.activate}
      </OmmButton>
      {message !== null ? (
        <p className="max-w-[12rem] text-xs text-sage-500" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
