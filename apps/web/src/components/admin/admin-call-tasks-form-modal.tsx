"use client";

import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import {
  joinContactName,
  splitContactName,
} from "@/components/admin/admin-call-tasks-form-name";
import type { CallTaskRow } from "@/components/admin/admin-call-tasks-query";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { CancelGlyph } from "@/components/ui/admin-action-glyphs";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { PhoneInputField } from "@/components/ui/phone-input-field";

const NAME_FIELD_MAX_LENGTH = 60;

export type CallTaskFormDraft = {
  firstName: string;
  lastName: string;
  phone: string;
  comment: string;
  dueOn: string;
};

export function emptyCallTaskDraft(): CallTaskFormDraft {
  return { firstName: "", lastName: "", phone: "", comment: "", dueOn: "" };
}

export function draftFromCallTask(row: CallTaskRow): CallTaskFormDraft {
  const names = splitContactName(row.contactName);
  return {
    firstName: names.firstName,
    lastName: names.lastName,
    phone: row.phone,
    comment: row.comment,
    dueOn: row.dueOnDate,
  };
}

export function contactNameFromDraft(draft: CallTaskFormDraft): string {
  return joinContactName(draft.firstName, draft.lastName);
}

type AdminCallTasksFormModalProps = {
  mode: "create" | "edit";
  draft: CallTaskFormDraft;
  busy: boolean;
  onChange: (next: CallTaskFormDraft) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function AdminCallTasksFormModal({
  mode,
  draft,
  busy,
  onChange,
  onClose,
  onSubmit,
}: AdminCallTasksFormModalProps) {
  const t = useTranslations("adminPages.calls");
  const titleId = "call-task-form-title";

  return (
    <OmmModalPortal
      isOpen
      onClose={onClose}
      backdropAriaLabel={t("close")}
      ariaLabelledBy={titleId}
      closeDisabled={busy}
      overlayClassName="ommm-modal-overlay z-[110] items-center p-4"
      centered
      panelClassName={`${adminChrome.panel} max-h-[90vh] w-full max-w-lg overflow-y-auto`}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id={titleId} className={adminChrome.panelHeading}>
          {mode === "create" ? t("createTitle") : t("editTitle")}
        </h2>
        <button
          type="button"
          className="shrink-0 rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45"
          aria-label={t("close")}
          disabled={busy}
          onClick={onClose}
        >
          <CancelGlyph className="h-5 w-5" />
        </button>
      </div>
      <form
        className="mt-4 flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <CallTaskFormFields draft={draft} busy={busy} onChange={onChange} />
        <div className="mt-2 flex justify-end gap-2">
          <OmmButton type="button" variant="ghost" disabled={busy} onClick={onClose}>
            {t("close")}
          </OmmButton>
          <OmmButton type="submit" variant="primary" disabled={busy}>
            {busy ? t("saving") : t("save")}
          </OmmButton>
        </div>
      </form>
    </OmmModalPortal>
  );
}

function CallTaskNameFields({
  draft,
  busy,
  onChange,
}: {
  draft: CallTaskFormDraft;
  busy: boolean;
  onChange: (next: CallTaskFormDraft) => void;
}) {
  const t = useTranslations("adminPages.calls");

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("firstName")}</span>
        <input
          className="ommm-input"
          value={draft.firstName}
          disabled={busy}
          required
          maxLength={NAME_FIELD_MAX_LENGTH}
          placeholder={t("firstNamePlaceholder")}
          autoComplete="given-name"
          onChange={(event) => onChange({ ...draft, firstName: event.target.value })}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("lastName")}</span>
        <input
          className="ommm-input"
          value={draft.lastName}
          disabled={busy}
          required
          maxLength={NAME_FIELD_MAX_LENGTH}
          placeholder={t("lastNamePlaceholder")}
          autoComplete="family-name"
          onChange={(event) => onChange({ ...draft, lastName: event.target.value })}
        />
      </label>
    </div>
  );
}

function CallTaskFormFields({
  draft,
  busy,
  onChange,
}: {
  draft: CallTaskFormDraft;
  busy: boolean;
  onChange: (next: CallTaskFormDraft) => void;
}) {
  const t = useTranslations("adminPages.calls");

  return (
    <>
        <CallTaskNameFields draft={draft} busy={busy} onChange={onChange} />
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("colPhone")}</span>
        <PhoneInputField
          className="ommm-input"
          value={draft.phone}
          disabled={busy}
          required
          onValueChange={(value) => onChange({ ...draft, phone: value })}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("colDue")}</span>
        <DatePickerInput
          name="dueOn"
          value={draft.dueOn}
          disabled={busy}
          required
          allowManualEntry
          ariaLabel={t("colDue")}
          placeholder={t("datePlaceholder")}
          onChange={(nextValue) => onChange({ ...draft, dueOn: nextValue })}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("colComment")}</span>
        <textarea
          className="ommm-input min-h-[120px] resize-y"
          value={draft.comment}
          placeholder={t("commentPlaceholder")}
          disabled={busy}
          required
          maxLength={4000}
          onChange={(event) => onChange({ ...draft, comment: event.target.value })}
        />
      </label>
    </>
  );
}
