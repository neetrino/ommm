"use client";

import { useTranslations } from "next-intl";
import {
  clampListPage,
  listPageRange,
  totalListPages,
  type ListPageQueryKeys,
} from "@/lib/list-pagination";
import { OmmButton } from "@/components/ui/omm-button";

export const OMMM_LIST_PAGINATION_FOOTER_CLASS =
  "flex flex-col gap-3 border-t border-white/60 pt-4 sm:flex-row sm:items-center sm:justify-between";

type OmmListPaginationProps = {
  total: number;
  page: number;
  pageSize: number;
  offset: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  namespace?: "adminPages.pagination" | "userPages.pagination";
};

export function OmmListPagination({
  total,
  page,
  pageSize,
  offset,
  onPageChange,
  disabled = false,
  namespace = "adminPages.pagination",
}: OmmListPaginationProps) {
  const t = useTranslations(namespace);
  const pageCount = totalListPages(total, pageSize);
  const safePage = clampListPage(page, total, pageSize);
  const range = listPageRange(offset, pageSize, total);

  if (total <= 0) {
    return null;
  }

  const pageOptions = buildVisiblePages(safePage, pageCount);

  return (
    <nav
      className={OMMM_LIST_PAGINATION_FOOTER_CLASS}
      aria-label={t("ariaLabel")}
    >
      <p className="text-sm text-sage-600" role="status">
        {range.from === 0
          ? t("empty")
          : t("range", { from: range.from, to: range.to, total: range.total })}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <OmmButton
          size="sm"
          variant="ghost"
          disabled={disabled || safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          aria-label={t("prevAria")}
        >
          {t("prev")}
        </OmmButton>
        <div className="flex items-center gap-1" role="group" aria-label={t("pagesAria")}>
          {pageOptions.map((entry, index) =>
            entry === "ellipsis" ? (
              <span key={`gap-${index}`} className="px-1 text-sm text-sage-400" aria-hidden>
                …
              </span>
            ) : (
              <OmmButton
                key={entry}
                size="sm"
                variant={entry === safePage ? "primary" : "ghost"}
                disabled={disabled}
                aria-current={entry === safePage ? "page" : undefined}
                onClick={() => onPageChange(entry)}
              >
                {entry}
              </OmmButton>
            ),
          )}
        </div>
        <OmmButton
          size="sm"
          variant="ghost"
          disabled={disabled || safePage >= pageCount}
          onClick={() => onPageChange(safePage + 1)}
          aria-label={t("nextAria")}
        >
          {t("next")}
        </OmmButton>
      </div>
    </nav>
  );
}

function buildVisiblePages(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];
  for (let index = 0; index < sorted.length; index += 1) {
    const page = sorted[index];
    const prev = sorted[index - 1];
    if (prev !== undefined && page - prev > 1) {
      result.push("ellipsis");
    }
    result.push(page);
  }
  return result;
}

export type { ListPageQueryKeys };
