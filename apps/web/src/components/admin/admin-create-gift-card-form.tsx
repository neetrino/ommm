"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type AdminCreateGiftCardFormLabels = {
  placeholders: {
    amount: string;
    recipientEmail: string;
    recipientName: string;
    message: string;
  };
  actions: {
    creating: string;
    create: string;
  };
  feedback: {
    created: string;
    failed: string;
  };
};

type AdminCreateGiftCardFormProps = {
  labels: AdminCreateGiftCardFormLabels;
};

export function AdminCreateGiftCardForm({ labels }: AdminCreateGiftCardFormProps) {
  const [amountCents, setAmountCents] = useState("10000");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) {
      return;
    }
    setBusy(true);
    setResult(null);
    try {
      const parsedAmount = Number.parseInt(amountCents, 10);
      await apiFetch("/gift-cards/admin", {
        method: "POST",
        body: JSON.stringify({
          amountCents: parsedAmount,
          recipientEmail: recipientEmail.trim() || undefined,
          recipientName: recipientName.trim() || undefined,
          message: message.trim() || undefined,
        }),
      });
      setTone("ok");
      setResult(labels.feedback.created);
      window.location.reload();
    } catch (error) {
      setTone("err");
      setResult(error instanceof ApiError ? error.message : labels.feedback.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mb-4 grid gap-2 sm:grid-cols-5">
      <input
        type="number"
        min={1}
        className="app-input h-9 text-xs"
        placeholder={labels.placeholders.amount}
        value={amountCents}
        onChange={(event) => setAmountCents(event.target.value)}
        disabled={busy}
      />
      <input
        type="email"
        className="app-input h-9 text-xs"
        placeholder={labels.placeholders.recipientEmail}
        value={recipientEmail}
        onChange={(event) => setRecipientEmail(event.target.value)}
        disabled={busy}
      />
      <input
        type="text"
        className="app-input h-9 text-xs"
        placeholder={labels.placeholders.recipientName}
        value={recipientName}
        onChange={(event) => setRecipientName(event.target.value)}
        disabled={busy}
      />
      <input
        type="text"
        className="app-input h-9 text-xs"
        placeholder={labels.placeholders.message}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        disabled={busy}
      />
      <button
        type="submit"
        className="rounded-md border border-slate-300 px-3 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        disabled={busy}
      >
        {busy ? labels.actions.creating : labels.actions.create}
      </button>
      {result ? (
        <p
          className={`sm:col-span-5 text-xs ${tone === "ok" ? "text-sage-700" : "text-red-800"}`}
        >
          {result}
        </p>
      ) : null}
    </form>
  );
}
