"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

const DEFAULT_AMOUNT_CENTS = 10_000;

export function GiftPurchaseForm() {
  const [amount, setAmount] = useState(String(DEFAULT_AMOUNT_CENTS / 100));
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(cents) || cents < 100) {
      setStatus("Enter a valid amount");
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const { url } = await apiFetch<{ url: string | null }>(
        "/payments/checkout/gift",
        {
          method: "POST",
          body: JSON.stringify({
            amountCents: cents,
            recipientEmail: recipientEmail.trim() || undefined,
            recipientName: recipientName.trim() || undefined,
            message: message.trim() || undefined,
          }),
        },
      );
      if (url) {
        window.location.href = url;
        return;
      }
      setStatus("Checkout unavailable");
    } catch (err) {
      setStatus(err instanceof ApiError ? err.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(ev) => void onSubmit(ev)} className="flex flex-col gap-3">
      <label className="text-sm text-zinc-700">
        Amount (major units, e.g. 100 = 100.00)
        <input
          value={amount}
          onChange={(ev) => setAmount(ev.target.value)}
          type="number"
          min={1}
          step="0.01"
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
          required
        />
      </label>
      <label className="text-sm text-zinc-700">
        Recipient email (optional)
        <input
          value={recipientEmail}
          onChange={(ev) => setRecipientEmail(ev.target.value)}
          type="email"
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="text-sm text-zinc-700">
        Recipient name (optional)
        <input
          value={recipientName}
          onChange={(ev) => setRecipientName(ev.target.value)}
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <label className="text-sm text-zinc-700">
        Message (optional)
        <input
          value={message}
          onChange={(ev) => setMessage(ev.target.value)}
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        Pay with Stripe
      </button>
      {status ? <p className="text-sm text-zinc-600">{status}</p> : null}
    </form>
  );
}
