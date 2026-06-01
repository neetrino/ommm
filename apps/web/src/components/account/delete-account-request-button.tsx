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
    <div className="flex flex-col items-start gap-2">
      <label className="flex w-full max-w-md flex-col gap-1">
        <span className="text-xs text-sage-600">{t("reasonLabel")}</span>
        <textarea
          className="ommm-input min-h-[96px] resize-y"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t("reasonPlaceholder")}
          maxLength={1000}
          disabled={busy}
        />
      </label>
      <button
        type="button"
        className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
        onClick={() => void requestDeletion()}
        disabled={busy}
      >
        {busy ? t("sending") : t("action")}
      </button>
      {message ? (
        <p className={`text-xs ${tone === "ok" ? "text-sage-700" : "text-red-800"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
