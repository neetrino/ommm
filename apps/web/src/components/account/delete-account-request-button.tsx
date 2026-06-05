"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";

export function DeleteAccountRequestButton() {
  const t = useTranslations("forms.deleteAccountRequest");
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");

  async function requestDeletion() {
    if (busy) {
      return;
    }
    if (!window.confirm(t("confirm"))) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await apiFetch("/users/me/delete-request", {
        method: "POST",
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      });
      setTone("ok");
      setMessage(t("sent"));
    } catch (error) {
      setTone("err");
      if (
        error instanceof ApiError &&
        error.message === "Deletion request already submitted recently"
      ) {
        setMessage(t("recentlySubmitted"));
      } else {
        setMessage(error instanceof ApiError ? error.message : t("failed"));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="w-full text-sm">
      <summary className="cursor-pointer list-none text-sage-500 underline decoration-sage-300/80 underline-offset-4 transition hover:text-red-700 hover:decoration-red-300/80">
        {t("action")}
      </summary>
      <div className="mt-3 space-y-3 rounded-[20px] border border-white/60 bg-white/45 p-4 backdrop-blur-md">
        <textarea
          className="ommm-input min-h-[72px] resize-y text-sm"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t("reasonPlaceholder")}
          maxLength={1000}
          disabled={busy}
          aria-label={t("reasonLabel")}
        />
        <button
          type="button"
          className="text-sm font-medium text-red-700 underline decoration-red-300/60 underline-offset-4 transition hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => void requestDeletion()}
          disabled={busy}
        >
          {busy ? t("sending") : t("action")}
        </button>
        {message ? (
          <p className={`text-xs ${tone === "ok" ? "text-sage-600" : "text-red-800"}`}>
            {message}
          </p>
        ) : null}
      </div>
    </details>
  );
}
