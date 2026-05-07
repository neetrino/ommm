"use client";

import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
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
      <label className="text-sm text-zinc-700">
        Gift code
        <input
          value={code}
          onChange={(ev) => setCode(ev.target.value)}
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          required
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        Redeem
      </button>
      {msg ? <p className="text-sm text-zinc-600">{msg}</p> : null}
    </form>
  );
}
