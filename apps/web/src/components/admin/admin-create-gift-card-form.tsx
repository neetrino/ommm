"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmButton } from "@/components/ui/omm-button";

type AdminCreateGiftCardFormProps = {
  onSaved: () => void;
  onCancel: () => void;
};

export function AdminCreateGiftCardForm({ onSaved, onCancel }: AdminCreateGiftCardFormProps) {
  const t = useTranslations("adminPages.giftCards");
  const submitLockRef = useRef(false);
  const [amountCents, setAmountCents] = useState("10000");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || submitLockRef.current) {
      return;
    }
    const parsedAmount = Number.parseInt(amountCents, 10);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 1) {
      setTone("err");
      setResult(t("amountInvalid"));
      return;
    }

    submitLockRef.current = true;
    setBusy(true);
    setResult(null);
    try {
      await apiFetch("/gift-cards/admin", {
        method: "POST",
        body: JSON.stringify({
          amountCents: parsedAmount,
          recipientEmail: recipientEmail.trim() || undefined,
          recipientName: recipientName.trim() || undefined,
          message: message.trim() || undefined,
          expiresAt: expiresAt.trim() || undefined,
        }),
      });
      onSaved();
    } catch (error) {
      setTone("err");
      setResult(error instanceof ApiError ? error.message : t("genericError"));
      submitLockRef.current = false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldAmount")}</span>
        <input
          name="amountCents"
          type="number"
          min={1}
          className="ommm-input"
          placeholder={t("fieldAmountPlaceholder")}
          value={amountCents}
          onChange={(event) => setAmountCents(event.target.value)}
          disabled={busy}
          required
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldRecipientEmail")}</span>
        <input
          type="email"
          className="ommm-input"
          placeholder={t("fieldRecipientEmailPlaceholder")}
          value={recipientEmail}
          onChange={(event) => setRecipientEmail(event.target.value)}
          disabled={busy}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldRecipientName")}</span>
        <input
          type="text"
          className="ommm-input"
          placeholder={t("fieldRecipientNamePlaceholder")}
          value={recipientName}
          onChange={(event) => setRecipientName(event.target.value)}
          disabled={busy}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldExpiration")}</span>
        <input
          type="date"
          className="ommm-input"
          value={expiresAt}
          onChange={(event) => setExpiresAt(event.target.value)}
          disabled={busy}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("fieldMessage")}</span>
        <textarea
          className="ommm-input min-h-24 resize-y"
          placeholder={t("fieldMessagePlaceholder")}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          disabled={busy}
        />
      </label>
      {result ? (
        <p
          className={`text-sm ${tone === "ok" ? "text-sage-700" : "text-red-800"}`}
          role="status"
        >
          {result}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <OmmButton type="submit" variant="primary" size="md" disabled={busy}>
          {busy ? t("savingButton") : t("saveButton")}
        </OmmButton>
        <OmmButton type="button" variant="ghost" size="md" onClick={onCancel} disabled={busy}>
          {t("cancelButton")}
        </OmmButton>
      </div>
    </form>
  );
}
