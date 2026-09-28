const API_PREFIX = "/api/v1";

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
    locale: exportLocale(input.locale),
  });
  const path = `/coaches/admin/${encodeURIComponent(input.coachProfileId)}/salary-sessions/export?${params}`;
  const response = await fetch(`${API_PREFIX}${path}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Coach salary export failed");
  }
  const blob = await response.blob();
  const filename =
    filenameFromDisposition(response.headers.get("Content-Disposition")) ??
    `salary-${input.from}-${input.to}.xlsx`;
  saveBlob(blob, filename);
}

function exportLocale(locale: string): "en" | "hy" | "ru" {
  if (locale === "hy" || locale === "ru") {
    return locale;
  }
  return "en";
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
