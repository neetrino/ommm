"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminPageHeroActionButton } from "@/components/admin/admin-page-hero-action-button";
import {
  scheduleExportRangeIssue,
  type ScheduleExportRangeIssue,
} from "@/components/admin/admin-schedule-export-range";
import { ADMIN_CENTERED_MODAL_CLOSE_BUTTON_CLASS } from "@/components/admin/admin-details-sheet-layout";
import { ADMIN_CONFIRM_CENTERED_MODAL_PANEL_CLASS } from "@/components/admin/admin-mobile-sheet-layout";
import {
  downloadAdminScheduleWorkbook,
  SCHEDULE_EXPORT_TOO_MANY,
} from "@/components/admin/download-admin-schedule-xlsx";
import { DownloadGlyph } from "@/components/ui/admin-action-glyphs";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { scheduleTodayIsoDate } from "@/lib/local-iso-date";

type ScheduleExportError = "exportFailed" | "exportTooMany";

export function AdminScheduleExportButton({ locale }: { locale: string }) {
  const t = useTranslations("adminPages.classes.export");
  const [open, setOpen] = useState(false);
  const today = scheduleTodayIsoDate();
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const { exporting, error, clearError, exportSchedule } = useScheduleWorkbookDownload(locale);

  return (
    <>
      <AdminPageHeroActionButton
        type="button"
        onClick={() => {
          clearError();
          setOpen(true);
        }}
      >
        <DownloadGlyph className="h-5 w-5 shrink-0" />
        {t("exportExcel")}
      </AdminPageHeroActionButton>
      <AdminScheduleExportDialog
        isOpen={open}
        from={from}
        to={to}
        exporting={exporting}
        error={error}
        onFromChange={setFrom}
        onToChange={setTo}
        onClose={() => {
          if (!exporting) {
            setOpen(false);
          }
        }}
        onExport={() => {
          void exportSchedule(from, to, () => setOpen(false));
        }}
      />
    </>
  );
}

type AdminScheduleExportDialogProps = {
  isOpen: boolean;
  from: string;
  to: string;
  exporting: boolean;
  error: ScheduleExportError | null;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onClose: () => void;
  onExport: () => void;
};

function AdminScheduleExportDialog({
  isOpen,
  from,
  to,
  exporting,
  error,
  onFromChange,
  onToChange,
  onClose,
  onExport,
}: AdminScheduleExportDialogProps) {
  const t = useTranslations("adminPages.classes.export");
  const titleId = useId();
  const issue = scheduleExportRangeIssue(from, to);

  return (
    <OmmModalPortal
      isOpen={isOpen}
      onClose={onClose}
      centered
      closeDisabled={exporting}
      backdropAriaLabel={t("closeAria")}
      ariaLabelledBy={titleId}
      overlayClassName="ommm-modal-overlay z-[110] items-center p-4"
      panelClassName={ADMIN_CONFIRM_CENTERED_MODAL_PANEL_CLASS}
    >
      <ExportDialogHeader titleId={titleId} disabled={exporting} onClose={onClose} />
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <ExportDateField label={t("fromDate")} name="schedule-export-from" value={from} onChange={onFromChange} />
        <ExportDateField label={t("toDate")} name="schedule-export-to" value={to} onChange={onToChange} />
      </div>
      <ExportDialogNotice issue={issue} error={error} />
      <ExportDialogActions
        issue={issue}
        exporting={exporting}
        onClose={onClose}
        onExport={onExport}
      />
    </OmmModalPortal>
  );
}

function ExportDialogHeader({
  titleId,
  disabled,
  onClose,
}: {
  titleId: string;
  disabled: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("adminPages.classes.export");
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 id={titleId} className="font-serif text-2xl font-normal text-sage-900">
          {t("dialogTitle")}
        </h2>
        <p className="mt-1 text-sm text-sage-600">{t("dialogDescription")}</p>
      </div>
      <button
        type="button"
        className={ADMIN_CENTERED_MODAL_CLOSE_BUTTON_CLASS}
        aria-label={t("closeAria")}
        disabled={disabled}
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

function ExportDateField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs text-sage-700">
      <span>{label}</span>
      <DatePickerInput
        name={name}
        value={value}
        onChange={onChange}
        ariaLabel={label}
        allowManualEntry
      />
    </label>
  );
}

function ExportDialogNotice({
  issue,
  error,
}: {
  issue: ScheduleExportRangeIssue | null;
  error: ScheduleExportError | null;
}) {
  const t = useTranslations("adminPages.classes.export");
  const issueMessage =
    issue === "invalid" ? t("rangeInvalid") : issue === "tooLong" ? t("rangeTooLong") : null;
  const errorMessage = error ? t(error) : null;
  if (!issueMessage && !errorMessage) {
    return null;
  }
  return (
    <div className="mt-3 space-y-1">
      {issueMessage ? <p className="text-xs text-red-700">{issueMessage}</p> : null}
      {errorMessage ? (
        <p className="text-xs text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function ExportDialogActions({
  issue,
  exporting,
  onClose,
  onExport,
}: {
  issue: ScheduleExportRangeIssue | null;
  exporting: boolean;
  onClose: () => void;
  onExport: () => void;
}) {
  const t = useTranslations("adminPages.classes.export");
  return (
    <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
      <OmmButton type="button" variant="ghost" size="sm" disabled={exporting} onClick={onClose}>
        {t("cancel")}
      </OmmButton>
      <OmmButton
        type="button"
        variant="primary"
        size="sm"
        className="inline-flex items-center gap-2"
        disabled={issue !== null || exporting}
        aria-busy={exporting}
        onClick={onExport}
      >
        <DownloadGlyph className="h-3.5 w-3.5" />
        {exporting ? t("exporting") : t("exportExcel")}
      </OmmButton>
    </div>
  );
}

function useScheduleWorkbookDownload(locale: string) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<ScheduleExportError | null>(null);

  async function exportSchedule(
    from: string,
    to: string,
    onSuccess: () => void,
  ): Promise<void> {
    setExporting(true);
    setError(null);
    try {
      await downloadAdminScheduleWorkbook({ locale, from, to });
      onSuccess();
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : "";
      setError(code === SCHEDULE_EXPORT_TOO_MANY ? "exportTooMany" : "exportFailed");
    } finally {
      setExporting(false);
    }
  }

  return { exporting, error, clearError: () => setError(null), exportSchedule };
}
