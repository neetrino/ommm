"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type BroadcastResponse = { ok: boolean; count?: number; mode?: string };

export function AdminNotificationBroadcastForm() {
  const t = useTranslations("forms.adminBroadcast");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [testTo, setTestTo] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setPending(true);
    try {
      const body: Record<string, string> = { subject, html };
      if (testTo.trim() !== "") {
        body.testTo = testTo.trim();
      }
      const res = await apiFetch<BroadcastResponse>(
        "/notifications/admin/broadcast",
        { method: "POST", body: JSON.stringify(body) },
      );
      setStatus(
        res.mode === "test"
          ? t("testSent")
          : t("queued", { count: res.count ?? 0 }),
      );
    } catch (err) {
      setStatus(
        err instanceof ApiError ? err.message : t("sendFailed"),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(ev) => void onSubmit(ev)} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">
          Subject
        </span>
        <input
          className="ommm-input"
          value={subject}
          onChange={(ev) => setSubject(ev.target.value)}
          required
          maxLength={200}
          autoComplete="off"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">
          HTML body
        </span>
        <textarea
          className="ommm-input min-h-[160px] resize-y"
          value={html}
          onChange={(ev) => setHtml(ev.target.value)}
          required
          maxLength={20000}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">
          Test recipient (optional)
        </span>
        <input
          className="ommm-input"
          type="email"
          value={testTo}
          onChange={(ev) => setTestTo(ev.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <span className="text-xs text-sage-500">
          When set, only this address receives the message.
        </span>
      </label>
      {status !== null ? (
        <p className="text-sm text-sage-700" role="status">
          {status}
        </p>
      ) : null}
      <button
        type="submit"
        className="ommm-cta-primary w-full sm:w-auto"
        disabled={pending}
      >
        {pending ? "Sending…" : "Send broadcast"}
      </button>
    </form>
  );
}
