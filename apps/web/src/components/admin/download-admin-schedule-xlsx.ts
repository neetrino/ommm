import { downloadXlsxFromApi, xlsxExportLocale } from "@/lib/download-xlsx";

export const SCHEDULE_EXPORT_FAILED = "schedule_export_failed";
export const SCHEDULE_EXPORT_TOO_MANY = "schedule_export_too_many";

type DownloadAdminScheduleWorkbookInput = {
  locale: string;
  /** Inclusive studio days. Omit both to export every class. */
  from?: string;
  to?: string;
};

/** Downloads classes for a date range, or every class when no range is set. */
export async function downloadAdminScheduleWorkbook(
  input: DownloadAdminScheduleWorkbookInput,
): Promise<void> {
  const params = new URLSearchParams({
    locale: xlsxExportLocale(input.locale),
  });
  if (input.from && input.to) {
    params.set("from", input.from);
    params.set("to", input.to);
  }
  try {
    await downloadXlsxFromApi(
      `/classes/admin/sessions/export?${params.toString()}`,
      "schedule.xlsx",
    );
  } catch (cause) {
    const code = cause instanceof Error ? cause.message : "";
    throw new Error(code === SCHEDULE_EXPORT_TOO_MANY ? SCHEDULE_EXPORT_TOO_MANY : SCHEDULE_EXPORT_FAILED);
  }
}
