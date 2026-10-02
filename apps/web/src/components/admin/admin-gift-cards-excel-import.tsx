"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminPageHeroActionButton } from "@/components/admin/admin-page-hero-action-button";
import type { GiftImportIssueCode } from "@/components/admin/admin-gift-cards-excel-import.types";
import { ApiError, apiFetchFormData } from "@/lib/api";

type GiftImportResult = {
  createdBatches: number;
  createdCards: number;
  issues: readonly { rowNumber: number; code: GiftImportIssueCode }[];
};

type AdminGiftCardsExcelImportProps = {
  onImported: (message: string) => void;
};

const TEMPLATE_FILENAME = "gift-cards-import.xlsx";
const ISSUE_PREVIEW_LIMIT = 3;

export function AdminGiftCardsExcelImport({ onImported }: AdminGiftCardsExcelImportProps) {
  const t = useTranslations("adminPages.giftCards");
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (file === undefined || busy) {
      return;
    }
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await apiFetchFormData<GiftImportResult>("/gift-cards/admin/import", formData);
      onImported(summarizeImport(result, t));
    } catch (error) {
      onImported(importFailureMessage(error, t));
    } finally {
      setBusy(false);
      if (inputRef.current !== null) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex w-full flex-col gap-1 sm:w-auto">
      <div className="flex items-center gap-2">
        <AdminPageHeroActionButton
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? t("importing") : t("importExcel")}
        </AdminPageHeroActionButton>
        <button
          type="button"
          className="shrink-0 text-sm font-medium text-sage-700 underline-offset-2 hover:underline"
          onClick={() => void downloadTemplate()}
        >
          {t("importTemplate")}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        aria-label={t("importExcel")}
        onChange={(event) => void onFile(event.target.files?.[0])}
      />
    </div>
  );
}

function summarizeImport(
  result: GiftImportResult,
  t: ReturnType<typeof useTranslations<"adminPages.giftCards">>,
): string {
  if (result.createdCards === 0) {
    return issuePreview(result.issues, t) || t("importFailed");
  }
  if (result.issues.length === 0) {
    return t("importSuccess", { count: result.createdCards });
  }
  return `${t("importPartial", {
    created: result.createdCards,
    skipped: result.issues.length,
  })} ${issuePreview(result.issues, t)}`;
}

function issuePreview(
  issues: GiftImportResult["issues"],
  t: ReturnType<typeof useTranslations<"adminPages.giftCards">>,
): string {
  return issues
    .slice(0, ISSUE_PREVIEW_LIMIT)
    .map((issue) =>
      t("importErrors.row", {
        row: issue.rowNumber,
        reason: t(`importErrors.${issue.code}`),
      }),
    )
    .join(" ");
}

function importFailureMessage(
  error: unknown,
  t: ReturnType<typeof useTranslations<"adminPages.giftCards">>,
): string {
  if (!(error instanceof ApiError)) {
    return t("importFailed");
  }
  if (error.message === "gift_import_not_xlsx") {
    return t("importErrors.gift_import_not_xlsx");
  }
  if (error.message === "gift_import_unreadable") {
    return t("importErrors.gift_import_unreadable");
  }
  if (error.message === "gift_import_too_large") {
    return t("importErrors.gift_import_too_large");
  }
  if (error.message === "gift_import_required") {
    return t("importErrors.gift_import_required");
  }
  return t("importFailed");
}

async function downloadTemplate(): Promise<void> {
  const response = await fetch("/api/v1/gift-cards/admin/import/template", {
    credentials: "include",
  });
  if (!response.ok) {
    return;
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = TEMPLATE_FILENAME;
  link.click();
  URL.revokeObjectURL(url);
}
