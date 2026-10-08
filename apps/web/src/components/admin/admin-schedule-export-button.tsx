"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AdminPageHeroActionButton } from "@/components/admin/admin-page-hero-action-button";
import {
  downloadAdminScheduleWorkbook,
  SCHEDULE_EXPORT_TOO_MANY,
} from "@/components/admin/download-admin-schedule-xlsx";
import { DownloadGlyph } from "@/components/ui/admin-action-glyphs";

type AdminScheduleExportButtonProps = {
  locale: string;
  query: string;
};

type ScheduleExportError = "exportFailed" | "exportTooMany";

export function AdminScheduleExportButton({
  locale,
  query,
}: AdminScheduleExportButtonProps) {
  const t = useTranslations("adminPages.classes.export");
  const { exporting, error, exportSchedule } = useScheduleWorkbookDownload(locale, query);

  return (
    <div className="flex w-full flex-col gap-1 sm:w-auto">
      <AdminPageHeroActionButton
        type="button"
        disabled={exporting}
        aria-busy={exporting}
        onClick={() => {
          void exportSchedule();
        }}
      >
        <DownloadGlyph className="h-5 w-5 shrink-0" />
        {exporting ? t("exporting") : t("exportExcel")}
      </AdminPageHeroActionButton>
      {error ? (
        <p className="text-xs text-red-700" role="alert">
          {t(error)}
        </p>
      ) : null}
    </div>
  );
}

function useScheduleWorkbookDownload(locale: string, query: string) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<ScheduleExportError | null>(null);

  async function exportSchedule(): Promise<void> {
    setExporting(true);
    setError(null);
    try {
      await downloadAdminScheduleWorkbook({ locale, query });
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : "";
      setError(code === SCHEDULE_EXPORT_TOO_MANY ? "exportTooMany" : "exportFailed");
    } finally {
      setExporting(false);
    }
  }

  return { exporting, error, exportSchedule };
}
