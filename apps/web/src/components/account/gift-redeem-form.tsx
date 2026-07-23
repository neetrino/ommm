"use client";

import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

export function GiftRedeemForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch("/gift-cards/redeem", {
        method: "POST",
        body: JSON.stringify({ code: code.trim() }),
      });
      setCode("");
      router.refresh();
      setMsg("Redeemed");
    } catch (err) {
      setMsg(err instanceof ApiError ? err.message : "Redeem failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(ev) => void onSubmit(ev)} className="flex flex-col gap-2">
      <label className="ommm-label flex flex-col gap-2">
        Gift code
        <input
          value={code}
          onChange={(ev) => setCode(ev.target.value)}
          className="ommm-input"
          required
        />
      </label>
      <OmmButton type="submit" variant="primary" disabled={busy}>
        Redeem
      </OmmButton>
      {msg ? <p className="text-sm text-sage-500">{msg}</p> : null}
    </form>
  );
}
