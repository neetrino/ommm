"use client";

import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import type { CallTaskRow } from "@/components/admin/admin-call-tasks-query";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { PhoneInputField } from "@/components/ui/phone-input-field";

export type CallTaskFormDraft = {
  contactName: string;
  phone: string;
  comment: string;
  dueOn: string;
};

export function emptyCallTaskDraft(): CallTaskFormDraft {
  return { contactName: "", phone: "", comment: "", dueOn: "" };
}

export function draftFromCallTask(row: CallTaskRow): CallTaskFormDraft {
  return {
    contactName: row.contactName,
    phone: row.phone,
    comment: row.comment,
    dueOn: row.dueOnDate,
  };
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
      <h2 id={titleId} className={adminChrome.panelHeading}>
        {mode === "create" ? t("createTitle") : t("editTitle")}
      </h2>
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
      <label className="flex flex-col gap-1">
        <span className="ommm-label text-xs uppercase tracking-wide">{t("colContact")}</span>
        <input
          className="ommm-input"
          value={draft.contactName}
          disabled={busy}
          required
          maxLength={120}
          placeholder={t("contactPlaceholder")}
          onChange={(event) => onChange({ ...draft, contactName: event.target.value })}
        />
      </label>
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
          disabled={busy}
          required
          maxLength={4000}
          onChange={(event) => onChange({ ...draft, comment: event.target.value })}
        />
      </label>
    </>
  );
}
