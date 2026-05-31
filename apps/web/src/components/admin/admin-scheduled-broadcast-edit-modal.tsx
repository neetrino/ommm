"use client";

import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import { OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";
import type { BroadcastAudience, ScheduledBroadcast } from "./admin-notifications-types";

export type ScheduledEditDraft = {
  subject: string;
  html: string;
  audience: BroadcastAudience;
  onlyPromotionsOptIn: boolean;
  scheduleAt: string;
};

type Props = {
  editing: ScheduledBroadcast;
  draft: ScheduledEditDraft;
  busy: boolean;
  onDraftChange: (next: ScheduledEditDraft) => void;
  onSave: () => void;
  onClose: () => void;
};

export function AdminScheduledBroadcastEditModal({
  editing,
  draft,
  busy,
  onDraftChange,
  onSave,
  onClose,
}: Props) {
  const t = useTranslations("adminPages.notifications");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className={`${adminChrome.panel} max-h-[90vh] w-full max-w-xl overflow-y-auto`}>
        <h3 className={adminChrome.panelHeading}>{t("editScheduledTitle")}</h3>
        <p className={`${adminChrome.metaText} mt-1`}>{editing.subject}</p>
        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">{t("table.subject")}</span>
            <input
              className="ommm-input"
              value={draft.subject}
              onChange={(ev) => onDraftChange({ ...draft, subject: ev.target.value })}
              maxLength={200}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">{t("editBodyLabel")}</span>
            <textarea
              className="ommm-input min-h-[140px] resize-y"
              value={draft.html}
              onChange={(ev) => onDraftChange({ ...draft, html: ev.target.value })}
              maxLength={20000}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.audience")}</span>
            <OmmSelectDropdown
              ariaLabel={t("filters.audience")}
              label={draft.audience}
              value={draft.audience}
              options={[
                { value: "users", label: t("audienceUsers") },
                { value: "coaches", label: t("audienceCoaches") },
                { value: "staff", label: t("audienceStaff") },
                { value: "all", label: t("audienceAllRoles") },
              ]}
              onChange={(value) =>
                onDraftChange({ ...draft, audience: value as BroadcastAudience })
              }
            />
          </label>
          {draft.audience === "users" ? (
            <label className="flex items-center gap-2 text-xs text-sage-700">
              <input
                type="checkbox"
                checked={draft.onlyPromotionsOptIn}
                onChange={(ev) =>
                  onDraftChange({ ...draft, onlyPromotionsOptIn: ev.target.checked })
                }
              />
              <span>{t("promotionsOnlyLabel")}</span>
            </label>
          ) : null}
          <label className="flex flex-col gap-1">
            <span className="ommm-label text-xs uppercase tracking-wide">{t("table.scheduledFor")}</span>
            <input
              className="ommm-input"
              type="datetime-local"
              value={draft.scheduleAt}
              onChange={(ev) => onDraftChange({ ...draft, scheduleAt: ev.target.value })}
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="ommm-cta-primary"
            disabled={busy}
            onClick={onSave}
          >
            {t("actions.save")}
          </button>
          <button type="button" className="ommm-cta-ghost" disabled={busy} onClick={onClose}>
            {t("actions.close")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function toDateTimeLocalValue(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
