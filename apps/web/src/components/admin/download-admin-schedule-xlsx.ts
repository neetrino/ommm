const API_PREFIX = "/api/v1";

export const SCHEDULE_EXPORT_FAILED = "schedule_export_failed";
export const SCHEDULE_EXPORT_TOO_MANY = "schedule_export_too_many";

type DownloadAdminScheduleWorkbookInput = {
  locale: string;
  from: string;
  to: string;
};

/** Downloads every class in the chosen inclusive studio date range. */
export async function downloadAdminScheduleWorkbook(
  input: DownloadAdminScheduleWorkbookInput,
): Promise<void> {
  const params = new URLSearchParams({
    from: input.from,
    to: input.to,
    locale: exportLocale(input.locale),
  });
  const response = await fetch(
    `${API_PREFIX}/classes/admin/sessions/export?${params.toString()}`,
    { credentials: "include", cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error(await exportErrorCode(response));
  }
  const blob = await response.blob();
  const filename =
    filenameFromDisposition(response.headers.get("Content-Disposition")) ??
    "schedule.xlsx";
  saveBlob(blob, filename);
}

function exportLocale(locale: string): "en" | "hy" | "ru" {
  if (locale === "hy" || locale === "ru") {
    return locale;
  }
  return "en";
}

async function exportErrorCode(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: unknown };
    if (body.message === SCHEDULE_EXPORT_TOO_MANY) {
      return SCHEDULE_EXPORT_TOO_MANY;
    }
  } catch {
    return SCHEDULE_EXPORT_FAILED;
  }
  return SCHEDULE_EXPORT_FAILED;
}

function filenameFromDisposition(header: string | null): string | null {
  if (header === null) {
    return null;
  }
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1]);
    } catch {
      return null;
    }
  }
  return /filename="([^"]+)"/.exec(header)?.[1] ?? null;
}

function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
