const API_PREFIX = "/api/v1";

export const XLSX_EXPORT_FAILED = "xlsx_export_failed";

export type XlsxExportLocale = "en" | "hy" | "ru";

export function xlsxExportLocale(locale: string): XlsxExportLocale {
  if (locale === "hy" || locale === "ru") {
    return locale;
  }
  return "en";
}

/**
 * Fetches an API workbook with the session cookie and saves it.
 * Throws `Error(code)` where code is the API `message` string, or `XLSX_EXPORT_FAILED`.
 */
export async function downloadXlsxFromApi(path: string, fallbackFilename: string): Promise<void> {
  const response = await fetch(`${API_PREFIX}${path}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(await readExportErrorCode(response));
  }
  const blob = await response.blob();
  const filename =
    filenameFromDisposition(response.headers.get("Content-Disposition")) ?? fallbackFilename;
  saveBlob(blob, filename);
}

async function readExportErrorCode(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: unknown };
    return typeof body.message === "string" ? body.message : XLSX_EXPORT_FAILED;
  } catch {
    return XLSX_EXPORT_FAILED;
  }
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
