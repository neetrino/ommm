"use client";

import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type Props = {
  sessionId: string;
  label?: string;
  dropInLabel?: string;
  priceCents: number;
};

export function BookSessionButton({
  sessionId,
  label = "Book",
  dropInLabel = "Pay & book (drop-in)",
  priceCents,
}: Props) {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function bookFreeOrMembership() {
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch(`/bookings/sessions/${sessionId}`, { method: "POST" });
      router.refresh();
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Could not book");
    } finally {
      setBusy(false);
    }
  }

  async function bookDropIn() {
    setBusy(true);
    setMsg(null);
    try {
      const { url } = await apiFetch<{ url: string | null }>(
        `/payments/checkout/dropin/${sessionId}`,
        { method: "POST" },
      );
      if (url) {
        window.location.href = url;
        return;
      }
      setMsg("Checkout unavailable");
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Could not start checkout");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void bookFreeOrMembership()}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {label}
        </button>
        {priceCents > 0 ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void bookDropIn()}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:border-zinc-400 disabled:opacity-50"
          >
            {dropInLabel}
          </button>
        ) : null}
      </div>
      {msg ? <p className="text-xs text-amber-800">{msg}</p> : null}
    </div>
  );
}
