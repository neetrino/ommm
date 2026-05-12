"use client";

import { useState } from "react";
import { OmmButton } from "@/components/ui/omm-button";
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
      <label className="ommm-label flex flex-col gap-2">
        Amount (major units, e.g. 100 = 100.00)
        <input
          value={amount}
          onChange={(ev) => setAmount(ev.target.value)}
          type="number"
          min={1}
          step="0.01"
          className="ommm-input"
          required
        />
      </label>
      <label className="ommm-label flex flex-col gap-2">
        Recipient email (optional)
        <input
          value={recipientEmail}
          onChange={(ev) => setRecipientEmail(ev.target.value)}
          type="email"
          className="ommm-input"
        />
      </label>
      <label className="ommm-label flex flex-col gap-2">
        Recipient name (optional)
        <input
          value={recipientName}
          onChange={(ev) => setRecipientName(ev.target.value)}
          className="ommm-input"
        />
      </label>
      <label className="ommm-label flex flex-col gap-2">
        Message (optional)
        <input
          value={message}
          onChange={(ev) => setMessage(ev.target.value)}
          className="ommm-input"
        />
      </label>
      <OmmButton type="submit" variant="primary" disabled={busy}>
        Pay with Stripe
      </OmmButton>
      {status ? <p className="text-sm text-sage-500">{status}</p> : null}
    </form>
  );
}
