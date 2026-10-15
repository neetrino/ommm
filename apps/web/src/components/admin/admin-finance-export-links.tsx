"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  AdminCsvExportMenu,
  type AdminCsvExportMenuItem,
} from "@/components/admin/admin-csv-export-menu";
import { downloadXlsxFromApi, xlsxExportLocale } from "@/lib/download-xlsx";

const PAYMENTS_EXPORT_PATH = "/payments/admin/export";
const GIFT_CREDITS_EXPORT_PATH = "/reports/gift-credits.xlsx";
const PAYMENTS_EXPORT_TOO_MANY = "payments_export_too_many";

type AdminFinanceExportLinksProps = {
  /** Active finance filters as admin API params; the workbook contains only matching rows. */
  paymentsParams: URLSearchParams;
  /** Date-range params for the gift-credit ledger; omit to hide that report. */
  giftCreditsParams?: URLSearchParams;
  menuAriaLabel: string;
  paymentsLabel: string;
  giftCreditsLabel?: string;
};

type ExportError = "exportFailed" | "exportTooMany";

function exportPath(path: string, params: URLSearchParams, locale: string): string {
  const query = new URLSearchParams(params);
  query.set("locale", xlsxExportLocale(locale));
  return `${path}?${query.toString()}`;
}

/** Finance Excel export — select a report, then click download to export the filtered rows. */
export function AdminFinanceExportLinks({
  paymentsParams,
  giftCreditsParams,
  menuAriaLabel,
  paymentsLabel,
  giftCreditsLabel,
}: AdminFinanceExportLinksProps) {
  const t = useTranslations("adminPages.finance");
  const locale = useLocale();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ExportError | null>(null);

  async function runExport(path: string, fallbackFilename: string): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await downloadXlsxFromApi(path, fallbackFilename);
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : "";
      setError(code === PAYMENTS_EXPORT_TOO_MANY ? "exportTooMany" : "exportFailed");
    } finally {
      setBusy(false);
    }
  }

  const items: AdminCsvExportMenuItem[] = [
    {
      label: paymentsLabel,
      onDownload: () =>
        void runExport(exportPath(PAYMENTS_EXPORT_PATH, paymentsParams, locale), "payments.xlsx"),
    },
  ];
  if (giftCreditsLabel && giftCreditsParams) {
    items.push({
      label: giftCreditsLabel,
      onDownload: () =>
        void runExport(
          exportPath(GIFT_CREDITS_EXPORT_PATH, giftCreditsParams, locale),
          "gift-credits.xlsx",
        ),
    });
  }

  return (
    <div className="relative">
      <AdminCsvExportMenu triggerAriaLabel={menuAriaLabel} items={items} busy={busy} />
      {error ? (
        <p
          role="alert"
          className="absolute right-0 top-full z-10 mt-1 w-max max-w-xs rounded-lg bg-white/95 px-2 py-1 text-xs text-red-700 shadow-sm"
        >
          {t(error)}
        </p>
      ) : null}
    </div>
  );
}
