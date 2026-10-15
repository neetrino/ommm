import { downloadXlsxFromApi, xlsxExportLocale } from "@/lib/download-xlsx";

type DownloadCoachSalaryWorkbookInput = {
  coachProfileId: string;
  from: string;
  to: string;
  locale: string;
};

/** Downloads the coach salary workbook for the marked inclusive date range. */
export async function downloadCoachSalaryWorkbook(
  input: DownloadCoachSalaryWorkbookInput,
): Promise<void> {
  const params = new URLSearchParams({
    from: input.from,
    to: input.to,
    locale: xlsxExportLocale(input.locale),
  });
  const path = `/coaches/admin/${encodeURIComponent(input.coachProfileId)}/salary-sessions/export?${params}`;
  await downloadXlsxFromApi(path, `salary-${input.from}-${input.to}.xlsx`);
}
