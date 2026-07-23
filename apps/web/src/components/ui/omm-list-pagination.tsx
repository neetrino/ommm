"use client";

import { useTranslations } from "next-intl";
import {
  clampListPage,
  listPageRange,
  totalListPages,
  type ListPageQueryKeys,
} from "@/lib/list-pagination";

export const OMMM_LIST_PAGINATION_FOOTER_CLASS =
  "flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between";

const PAGINATION_RANGE_WRAP_CLASS = "min-w-0 space-y-1";
const PAGINATION_RANGE_EYEBROW_CLASS =
  "text-xs font-medium uppercase tracking-wide text-sage-500";
const PAGINATION_RANGE_VALUE_CLASS =
  "font-serif text-xl italic leading-none tracking-tight text-sage-900 tabular-nums sm:text-[1.35rem]";

const PAGINATION_TRACK_CLASS = [
  "inline-flex max-w-full items-center gap-0.5 rounded-full border border-white/80 bg-white/92 p-1",
  "shadow-[0_10px_28px_-18px_rgba(45,40,35,0.28)] backdrop-blur-md",
].join(" ");

const PAGINATION_EDGE_BUTTON_CLASS = [
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sage-700",
  "transition-[background-color,box-shadow,transform,color]",
  "hover:bg-sand-100/80 hover:text-sage-900 active:scale-[0.96]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2",
  "focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-35",
].join(" ");

const PAGINATION_DIVIDER_CLASS = "mx-0.5 h-5 w-px shrink-0 bg-sand-200/90";

const PAGINATION_PAGE_BUTTON_BASE = [
  "inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2.5 text-sm font-medium tabular-nums",
  "transition-[background-color,box-shadow,transform,color]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2",
  "focus-visible:ring-offset-paper disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-35",
].join(" ");

const PAGINATION_PAGE_BUTTON_ACTIVE =
  "bg-sand-500 text-white shadow-[0_8px_18px_-12px_rgba(168,130,88,0.75)]";
const PAGINATION_PAGE_BUTTON_IDLE = "text-sage-700 hover:bg-sand-50 hover:text-sage-900";

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
    <nav className={OMMM_LIST_PAGINATION_FOOTER_CLASS} aria-label={t("ariaLabel")}>
      <PaginationRange
        emptyLabel={t("empty")}
        from={range.from}
        prefixLabel={t("rangePrefix")}
        to={range.to}
        total={range.total}
        valueLabel={t("rangeValue", {
          from: range.from,
          to: range.to,
          total: range.total,
        })}
      />
      <div className="flex justify-start sm:justify-end">
        <div className={PAGINATION_TRACK_CLASS} role="group" aria-label={t("pagesAria")}>
          <button
            type="button"
            className={PAGINATION_EDGE_BUTTON_CLASS}
            disabled={disabled || safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
            aria-label={t("prevAria")}
          >
            <PaginationChevronLeft />
          </button>
          <span className={PAGINATION_DIVIDER_CLASS} aria-hidden />
          {pageOptions.map((entry, index) =>
            entry === "ellipsis" ? (
              <span
                key={`gap-${index}`}
                className="px-1 text-sm font-medium text-sage-400"
                aria-hidden
              >
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                className={`${PAGINATION_PAGE_BUTTON_BASE} ${
                  entry === safePage ? PAGINATION_PAGE_BUTTON_ACTIVE : PAGINATION_PAGE_BUTTON_IDLE
                }`}
                disabled={disabled}
                aria-current={entry === safePage ? "page" : undefined}
                aria-label={t("pageAria", { page: entry })}
                onClick={() => onPageChange(entry)}
              >
                {entry}
              </button>
            ),
          )}
          <span className={PAGINATION_DIVIDER_CLASS} aria-hidden />
          <button
            type="button"
            className={PAGINATION_EDGE_BUTTON_CLASS}
            disabled={disabled || safePage >= pageCount}
            onClick={() => onPageChange(safePage + 1)}
            aria-label={t("nextAria")}
          >
            <PaginationChevronRight />
          </button>
        </div>
      </div>
    </nav>
  );
}

function PaginationRange({
  prefixLabel,
  valueLabel,
  emptyLabel,
  from,
}: {
  prefixLabel: string;
  valueLabel: string;
  emptyLabel: string;
  from: number;
  to: number;
  total: number;
}) {
  if (from === 0) {
    return (
      <p className={`${PAGINATION_RANGE_WRAP_CLASS} text-sm text-sage-600`} role="status">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className={PAGINATION_RANGE_WRAP_CLASS} role="status">
      <p className={PAGINATION_RANGE_EYEBROW_CLASS}>{prefixLabel}</p>
      <p className={PAGINATION_RANGE_VALUE_CLASS}>{valueLabel}</p>
    </div>
  );
}

function PaginationChevronLeft() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function PaginationChevronRight() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
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
