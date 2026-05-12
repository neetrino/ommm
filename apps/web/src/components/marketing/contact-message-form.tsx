"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

export function ContactMessageForm({
  formClassName = "ommm-card mt-12 flex w-full max-w-lg flex-col gap-4 p-6 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8",
}: {
  formClassName?: string;
}) {
  const t = useTranslations("forms.contact");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setErrorMsg(null);
    setSent(false);
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
      setSent(true);
      e.currentTarget.reset();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : t("sendError"));
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <form
        onSubmit={(ev) => void onSubmit(ev)}
        className={formClassName}
      >
        <label className="flex flex-col gap-2">
          <span className="ommm-label">{t("name")}</span>
          <input
            name="name"
            required
            autoComplete="name"
            className="ommm-input"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="ommm-label">{t("phone")}</span>
          <input
            name="phone"
            required
            autoComplete="tel"
            className="ommm-input"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="ommm-label">{t("subject")}</span>
          <input name="subject" autoComplete="off" className="ommm-input" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="ommm-label">{t("message")}</span>
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
          {pending ? t("sending") : t("send")}
        </button>
      </form>
      {sent ? (
        <p className="mt-4 text-sm font-medium text-sage-800" role="status">
          {t("thankYou")}
        </p>
      ) : null}
      {errorMsg ? (
        <p className="mt-4 text-sm text-red-600" role="status">
          {errorMsg}
        </p>
      ) : null}
    </>
  );
}
