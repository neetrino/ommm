"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";

type BroadcastTemplateKey =
  | "custom"
  | "newClass"
  | "policyReminder"
  | "waitlistOffer";

type Props = {
  recipientEmail: string;
  recipientName: string;
  onClose: () => void;
};

export function AdminFinanceNotifyModal({
  recipientEmail,
  recipientName,
  onClose,
}: Props) {
  const tBroadcast = useTranslations("forms.adminBroadcast");
  const t = useTranslations("adminPages.finance.actions");
  const titleId = useId();
  const [templateKey, setTemplateKey] = useState<BroadcastTemplateKey>("custom");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");

  const getTemplateBody = (key: string) => {
    const value = tBroadcast.raw(key);
    return typeof value === "string" ? value : "";
  };

  function onTemplateChange(nextKey: BroadcastTemplateKey) {
    setTemplateKey(nextKey);
    if (nextKey === "custom") {
      return;
    }
    setSubject(tBroadcast(`templates.${nextKey}.subject`));
    setHtml(getTemplateBody(`templates.${nextKey}.body`));
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) {
      return;
    }
    setPending(true);
    setMessage(null);
    try {
      await apiFetch("/notifications/admin/broadcast", {
        method: "POST",
        body: JSON.stringify({
          subject,
          html,
          audience: "users",
          testTo: recipientEmail,
        }),
      });
      setTone("ok");
      setMessage(t("notifySuccess", { name: recipientName }));
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("notifyFailed"));
    } finally {
      setPending(false);
    }
  }

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="ommm-modal-overlay z-[80] items-center p-4">
      <button
        type="button"
        className="ommm-modal-backdrop"
        aria-label={t("closeModal")}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-lg rounded-[24px] border border-white/60 bg-white p-5 shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-semibold text-sage-900">
          {t("notifyTitle")}
        </h2>
        <p className="mt-1 text-sm text-sage-600">
          {t("notifyLead", { email: recipientEmail })}
        </p>
        <form className="mt-4 space-y-3" onSubmit={(event) => void onSubmit(event)}>
          <OmmSelectDropdown
            ariaLabel={t("templateLabel")}
            label={t("templateLabel")}
            value={templateKey}
            onChange={(value) => onTemplateChange(value as BroadcastTemplateKey)}
            options={[
              { value: "custom", label: tBroadcast("templates.custom") },
              { value: "newClass", label: tBroadcast("templates.newClass.label") },
              { value: "policyReminder", label: tBroadcast("templates.policyReminder.label") },
              { value: "waitlistOffer", label: tBroadcast("templates.waitlistOffer.label") },
            ]}
          />
          <label className="block text-sm text-sage-700">
            <span className="mb-1 block text-xs text-sage-500">{tBroadcast("subjectLabel")}</span>
            <input
              className="ommm-input h-10 w-full"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm text-sage-700">
            <span className="mb-1 block text-xs text-sage-500">{tBroadcast("htmlBodyLabel")}</span>
            <textarea
              className="ommm-input min-h-[7rem] w-full"
              value={html}
              onChange={(event) => setHtml(event.target.value)}
              required
            />
          </label>
          {message ? (
            <p className={`text-sm ${tone === "ok" ? "text-sage-700" : "text-red-800"}`}>
              {message}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <OmmButton type="button" variant="ghost" onClick={onClose} disabled={pending}>
              {t("closeModal")}
            </OmmButton>
            <OmmButton type="submit" variant="primary" disabled={pending}>
              {pending ? t("sending") : t("sendButton")}
            </OmmButton>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
