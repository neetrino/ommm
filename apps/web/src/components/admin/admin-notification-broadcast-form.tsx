"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
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

export function AdminNotificationBroadcastForm() {
  const t = useTranslations("forms.adminBroadcast");
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
      html: t("templates.newClass.body"),
    },
    policyReminder: {
      subject: t("templates.policyReminder.subject"),
      html: t("templates.policyReminder.body"),
    },
    waitlistOffer: {
      subject: t("templates.waitlistOffer.subject"),
      html: t("templates.waitlistOffer.body"),
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
        <select
          className="ommm-input"
          value={templateKey}
          onChange={(ev) => onTemplateChange(ev.target.value as BroadcastTemplateKey)}
        >
          <option value="custom">{t("templates.custom")}</option>
          <option value="newClass">{t("templates.newClass.label")}</option>
          <option value="policyReminder">{t("templates.policyReminder.label")}</option>
          <option value="waitlistOffer">{t("templates.waitlistOffer.label")}</option>
        </select>
        <span className="text-xs text-sage-500">{t("templateHint")}</span>
      </label>
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">
          {t("audienceLabel")}
        </span>
        <select
          className="ommm-input"
          value={audience}
          onChange={(ev) => setAudience(ev.target.value as BroadcastAudience)}
        >
          <option value="users">{t("audiences.users")}</option>
          <option value="coaches">{t("audiences.coaches")}</option>
          <option value="staff">{t("audiences.staff")}</option>
          <option value="all">{t("audiences.all")}</option>
        </select>
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
