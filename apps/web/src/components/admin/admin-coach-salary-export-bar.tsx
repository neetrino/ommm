"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { downloadCoachSalaryWorkbook } from "@/components/admin/download-coach-salary-xlsx";
import type { SalaryExportRangeIssue } from "@/components/admin/admin-coach-salary-export-range";
import { DownloadGlyph } from "@/components/ui/admin-action-glyphs";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmButton } from "@/components/ui/omm-button";

type AdminCoachSalaryExportBarProps = {
  coachProfileId: string;
  locale: string;
  from: string;
  to: string;
  issue: SalaryExportRangeIssue | null;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
};

export function AdminCoachSalaryExportBar({
  coachProfileId,
  locale,
  from,
  to,
  issue,
  onFromChange,
  onToChange,
}: AdminCoachSalaryExportBarProps) {
  const t = useTranslations("adminPages.finance.coachDrawer");
  const tFilters = useTranslations("adminPages.finance.filters");
  const { exporting, failed, exportRange } = useSalaryWorkbookDownload(coachProfileId, locale);
  const issueMessage = issue === "tooLong" ? t("exportRangeTooLong") : null;
  const invalidMessage = issue === "invalid" ? t("exportRangeInvalid") : null;

  return (
    <div className="space-y-2">
      <SalaryExportControls
        fromLabel={tFilters("dateFrom")}
        toLabel={tFilters("dateTo")}
        from={from}
        to={to}
        exportLabel={exporting ? t("exporting") : t("exportExcel")}
        disabled={issue !== null || exporting}
        onFromChange={onFromChange}
        onToChange={onToChange}
        onExport={() => {
          void exportRange(from, to);
        }}
      />
      <ExportRangeNotice
        hint={t("exportRangeHint")}
        invalidMessage={invalidMessage}
        tooLongMessage={issueMessage}
        failedMessage={failed ? t("exportFailed") : null}
      />
    </div>
  );
}

function SalaryExportControls({
  fromLabel,
  toLabel,
  from,
  to,
  exportLabel,
  disabled,
  onFromChange,
  onToChange,
  onExport,
}: {
  fromLabel: string;
  toLabel: string;
  from: string;
  to: string;
  exportLabel: string;
  disabled: boolean;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onExport: () => void;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <ExportDateField label={fromLabel} name="salary-export-from" value={from} onChange={onFromChange} />
        <ExportDateField label={toLabel} name="salary-export-to" value={to} onChange={onToChange} />
      </div>
      <OmmButton
        type="button"
        variant="secondary"
        size="sm"
        className="inline-flex items-center gap-2"
        disabled={disabled}
        onClick={onExport}
      >
        <DownloadGlyph className="h-3.5 w-3.5" />
        {exportLabel}
      </OmmButton>
    </div>
  );
}

function ExportRangeNotice({
  hint,
  invalidMessage,
  tooLongMessage,
  failedMessage,
}: {
  hint: string;
  invalidMessage: string | null;
  tooLongMessage: string | null;
  failedMessage: string | null;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-sage-500">{hint}</p>
      {invalidMessage ? <p className="text-xs text-red-700">{invalidMessage}</p> : null}
      {tooLongMessage ? <p className="text-xs text-red-700">{tooLongMessage}</p> : null}
      {failedMessage ? <p className="text-xs text-red-700">{failedMessage}</p> : null}
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
    <label className="flex w-40 flex-col gap-1.5 text-xs text-sage-700">
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

function useSalaryWorkbookDownload(coachProfileId: string, locale: string) {
  const [exporting, setExporting] = useState(false);
  const [failed, setFailed] = useState(false);

  async function exportRange(from: string, to: string): Promise<void> {
    setExporting(true);
    setFailed(false);
    try {
      await downloadCoachSalaryWorkbook({ coachProfileId, from, to, locale });
    } catch {
      setFailed(true);
    } finally {
      setExporting(false);
    }
  }

  return { exporting, failed, exportRange };
}
