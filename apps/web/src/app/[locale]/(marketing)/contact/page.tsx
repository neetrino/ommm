"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

export default function ContactPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus(null);
    setPending(true);
    try {
      await apiFetch<{ ok: boolean }>("/contact", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          subject: form.get("subject") || undefined,
          message: form.get("message"),
        }),
      });
      setStatus("Sent");
      e.currentTarget.reset();
    } catch (err) {
      setStatus(err instanceof ApiError ? err.message : "Error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:py-20">
      <h1 className="app-page-heading">Contact</h1>
      <p className="app-lede">
        Send a message to the studio team. We read every note and reply by phone
        or email when appropriate.
      </p>
      <form onSubmit={onSubmit} className="app-surface-card mt-10 flex flex-col gap-4 p-6 sm:p-8">
        <label className="flex flex-col gap-2">
          <span className="app-label">Name</span>
          <input name="name" required autoComplete="name" className="app-input" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="app-label">Phone</span>
          <input
            name="phone"
            required
            autoComplete="tel"
            className="app-input"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="app-label">Subject</span>
          <input name="subject" autoComplete="off" className="app-input" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="app-label">Message</span>
          <textarea
            name="message"
            required
            rows={4}
            className="app-input min-h-[120px] resize-y"
          />
        </label>
        <button type="submit" className="app-btn-primary mt-2" disabled={pending}>
          {pending ? "Sending…" : "Send"}
        </button>
      </form>
      {status ? (
        <p
          className={
            status === "Sent"
              ? "mt-4 text-sm font-medium text-emerald-800"
              : "mt-4 text-sm text-red-600"
          }
          role="status"
        >
          {status === "Sent"
            ? "Thank you — your message was sent."
            : status}
        </p>
      ) : null}
    </div>
  );
}
