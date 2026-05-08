"use client";

import { useState } from "react";
import { MarketingPageFrame } from "@/components/layout/marketing-page-frame";
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
    <MarketingPageFrame
      title="Contact"
      lede="Send a message to the studio team. We read every note and reply by phone or email when appropriate."
    >
      <form
        onSubmit={onSubmit}
        className="ommm-card mt-12 flex w-full max-w-lg flex-col gap-4 p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8"
      >
        <label className="flex flex-col gap-2">
          <span className="ommm-label">Name</span>
          <input
            name="name"
            required
            autoComplete="name"
            className="ommm-input"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="ommm-label">Phone</span>
          <input
            name="phone"
            required
            autoComplete="tel"
            className="ommm-input"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="ommm-label">Subject</span>
          <input name="subject" autoComplete="off" className="ommm-input" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="ommm-label">Message</span>
          <textarea
            name="message"
            required
            rows={4}
            className="ommm-input min-h-[120px] resize-y"
          />
        </label>
        <button
          type="submit"
          className="ommm-cta-primary mt-2 w-full sm:w-auto"
          disabled={pending}
        >
          {pending ? "Sending…" : "Send"}
        </button>
      </form>
      {status ? (
        <p
          className={
            status === "Sent"
              ? "mt-4 text-sm font-medium text-sage-800"
              : "mt-4 text-sm text-red-600"
          }
          role="status"
        >
          {status === "Sent"
            ? "Thank you — your message was sent."
            : status}
        </p>
      ) : null}
    </MarketingPageFrame>
  );
}
