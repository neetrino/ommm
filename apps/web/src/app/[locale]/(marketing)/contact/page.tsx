"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

export default function ContactPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
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
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-3xl font-semibold">Contact</h1>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input name="name" required className="rounded border border-zinc-300 px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Phone
          <input name="phone" required className="rounded border border-zinc-300 px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Subject
          <input name="subject" className="rounded border border-zinc-300 px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Message
          <textarea
            name="message"
            required
            rows={4}
            className="rounded border border-zinc-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-zinc-900 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Send
        </button>
      </form>
      {status ? <p className="mt-4 text-sm text-zinc-600">{status}</p> : null}
    </div>
  );
}
