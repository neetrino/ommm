"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";

export function DeleteAccountRequestButton() {
  const t = useTranslations("forms.deleteAccountRequest");
  const [busy, setBusy] = useState(false);
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
      await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify({
          name: "Account holder",
          phone: "N/A",
          subject: "Delete account request",
          message: "User requested account deletion from profile settings.",
        }),
      });
      setTone("ok");
      setMessage(t("sent"));
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
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
