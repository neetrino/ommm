"use client";

import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type Props = {
  sessionId: string;
};

export function JoinWaitlistButton({ sessionId }: Props) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function join() {
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch(`/waitlist/sessions/${sessionId}`, { method: "POST" });
      router.refresh();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Could not join waitlist");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={() => void join()}
        className="rounded-lg border border-amber-600 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-50 disabled:opacity-50"
      >
        Join waitlist
      </button>
      {msg ? <p className="text-xs text-amber-800">{msg}</p> : null}
    </div>
  );
}
