"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";

const DELETE_ACCOUNT_REQUEST_BUTTON_CLASSES =
  "inline-flex cursor-pointer items-center justify-center rounded-md border border-red-300 bg-white/80 px-3 py-2 text-sm font-medium text-red-700 transition-[background-color,border-color,box-shadow,color,transform] hover:border-red-400 hover:bg-red-50 hover:text-red-900 hover:shadow-sm active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

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
        className={DELETE_ACCOUNT_REQUEST_BUTTON_CLASSES}
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
