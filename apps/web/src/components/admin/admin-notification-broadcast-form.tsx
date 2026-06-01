"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";
import { ApiError, apiFetch } from "@/lib/api";

type BroadcastResponse = {
  ok: boolean;
  count?: number;
  mode?: string;
  scheduledFor?: string;
};
type BroadcastAudience = "users" | "coaches" | "staff" | "all";
type BroadcastTemplateKey =
  | "custom"
  | "newClass"
  | "policyReminder"
  | "waitlistOffer";
type BroadcastTemplate = { subject: string; html: string };

type AdminNotificationBroadcastFormProps = {
  onSuccess?: () => void;
};

export function AdminNotificationBroadcastForm({
  onSuccess,
}: AdminNotificationBroadcastFormProps) {
  const t = useTranslations("forms.adminBroadcast");
  const getTemplateBody = (key: string) => {
    const value = t.raw(key);
    return typeof value === "string" ? value : "";
  };
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [templateKey, setTemplateKey] = useState<BroadcastTemplateKey>("custom");
  const [testTo, setTestTo] = useState("");
  const [audience, setAudience] = useState<BroadcastAudience>("users");
  const [onlyPromotionsOptIn, setOnlyPromotionsOptIn] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const templates: Record<Exclude<BroadcastTemplateKey, "custom">, BroadcastTemplate> = {
    newClass: {
      subject: t("templates.newClass.subject"),
      html: getTemplateBody("templates.newClass.body"),
    },
    policyReminder: {
      subject: t("templates.policyReminder.subject"),
      html: getTemplateBody("templates.policyReminder.body"),
    },
    waitlistOffer: {
      subject: t("templates.waitlistOffer.subject"),
      html: getTemplateBody("templates.waitlistOffer.body"),
    },
  };

  function onTemplateChange(nextKey: BroadcastTemplateKey) {
    setTemplateKey(nextKey);
    if (nextKey === "custom") {
      return;
    }
    const nextTemplate = templates[nextKey];
    setSubject(nextTemplate.subject);
    setHtml(nextTemplate.html);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setPending(true);
    try {
      const body: Record<string, string | boolean> = {
        subject,
        html,
        audience,
        onlyPromotionsOptIn,
      };
      if (testTo.trim() !== "") {
        body.testTo = testTo.trim();
      }
      if (scheduleAt.trim() !== "") {
        body.scheduleAt = new Date(scheduleAt).toISOString();
      }
      const res = await apiFetch<BroadcastResponse>(
        "/notifications/admin/broadcast",
        { method: "POST", body: JSON.stringify(body) },
      );
      setStatus(
        res.mode === "test"
          ? t("testSent")
          : res.mode === "scheduled"
            ? t("scheduled", { when: scheduleAt })
            : t("queued", { count: res.count ?? 0 }),
      );
      onSuccess?.();
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
          {t("templateLabel")}
        </span>
        <OmmSelectDropdown
          ariaLabel={t("templateLabel")}
          label={
            templateKey === "custom"
              ? t("templates.custom")
              : templateKey === "newClass"
                ? t("templates.newClass.label")
                : templateKey === "policyReminder"
                  ? t("templates.policyReminder.label")
                  : t("templates.waitlistOffer.label")
          }
          value={templateKey}
          options={[
            { value: "custom", label: t("templates.custom") },
            { value: "newClass", label: t("templates.newClass.label") },
            { value: "policyReminder", label: t("templates.policyReminder.label") },
            { value: "waitlistOffer", label: t("templates.waitlistOffer.label") },
          ]}
          onChange={(value) => onTemplateChange(value as BroadcastTemplateKey)}
        />
        <span className="text-xs text-sage-500">{t("templateHint")}</span>
      </label>
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">
          {t("audienceLabel")}
        </span>
        <OmmSelectDropdown
          ariaLabel={t("audienceLabel")}
          label={
            audience === "users"
              ? t("audiences.users")
              : audience === "coaches"
                ? t("audiences.coaches")
                : audience === "staff"
                  ? t("audiences.staff")
                  : t("audiences.all")
          }
          value={audience}
          options={[
            { value: "users", label: t("audiences.users") },
            { value: "coaches", label: t("audiences.coaches") },
            { value: "staff", label: t("audiences.staff") },
            { value: "all", label: t("audiences.all") },
          ]}
          onChange={(value) => setAudience(value as BroadcastAudience)}
        />
      </label>
      {audience === "users" ? (
        <label className="flex items-center gap-2 text-xs text-sage-700">
          <input
            type="checkbox"
            checked={onlyPromotionsOptIn}
            onChange={(ev) => setOnlyPromotionsOptIn(ev.target.checked)}
          />
          <span>{t("promotionsOnlyLabel")}</span>
        </label>
      ) : null}
      <p className="text-xs text-sage-600">{t("deliveryMethodNote")}</p>
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">
          {t("subjectLabel")}
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
          {t("htmlBodyLabel")}
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
          {t("testRecipientLabel")}
        </span>
        <input
          className="ommm-input"
          type="email"
          value={testTo}
          onChange={(ev) => setTestTo(ev.target.value)}
          placeholder={t("testRecipientPlaceholder")}
          autoComplete="email"
        />
        <span className="text-xs text-sage-500">
          {t("testRecipientHint")}
        </span>
      </label>
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">
          {t("scheduleAtLabel")}
        </span>
        <input
          className="ommm-input"
          type="datetime-local"
          value={scheduleAt}
          onChange={(ev) => setScheduleAt(ev.target.value)}
        />
        <span className="text-xs text-sage-500">
          {t("scheduleAtHint")}
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
        {pending ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
