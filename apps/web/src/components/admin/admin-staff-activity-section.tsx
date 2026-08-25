"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { OmmListPagination } from "@/components/ui/omm-list-pagination";
import { markStaffActivityRead } from "@/hooks/use-staff-activity-inbox";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateTimeForUi } from "@/lib/date-display";
import { formatTimeForUi } from "@/lib/format-time-display";
import { parseListPageParams, syncListPageQuery } from "@/lib/list-pagination";
import type {
  StaffActivityListPayload,
  StaffActivityRow,
} from "@/lib/staff-activity-types";
import { STAFF_ACTIVITY_PAGE_TAKE } from "@/lib/staff-activity-types";
import { STUDIO_TIMEZONE } from "@/lib/studio-timezone";

export function AdminStaffActivitySection() {
  const t = useTranslations("staffActivityPages");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const listPage = useMemo(
    () =>
      parseListPageParams(Object.fromEntries(searchParams.entries()), {
        defaultPageSize: STAFF_ACTIVITY_PAGE_TAKE,
      }),
    [searchParams],
  );
  const [payload, setPayload] = useState<StaffActivityListPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<StaffActivityListPayload>(
        `/staff-activity?take=${listPage.take}&offset=${listPage.offset}`,
      );
      setPayload(data);
      void markStaffActivityRead();
    } catch (caught) {
      setPayload(null);
      setError(caught instanceof ApiError ? caught.message : t("loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [listPage.offset, listPage.take, t]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  const items = payload?.items ?? [];
  const total = payload?.total ?? 0;

  return (
    <StaffListPageLayout title={t("title")} description={t("description")}>
      {loading ? (
        <p className="sr-only" aria-live="polite">
          {t("loading")}
        </p>
      ) : null}
      {error ? <p className="text-sm text-amber-900">{error}</p> : null}
      {!loading && !error && items.length === 0 ? (
        <p className="rounded-2xl border border-sand-200/80 bg-white/80 px-5 py-10 text-center text-sm text-sage-600">
          {t("empty")}
        </p>
      ) : null}
      <ul className="divide-y divide-sage-100/80 rounded-2xl border border-sand-200/70 bg-white/80 px-4">
        {items.map((row) => (
          <StaffActivityPageRow key={row.id} row={row} locale={locale} />
        ))}
      </ul>
      {total > listPage.pageSize ? (
        <OmmListPagination
          total={total}
          page={listPage.page}
          pageSize={listPage.pageSize}
          offset={listPage.offset}
          onPageChange={(page) => {
            const params = new URLSearchParams(searchParams.toString());
            syncListPageQuery(params, page, listPage.pageSize);
            const query = params.toString();
            router.replace(query.length > 0 ? `?${query}` : "?");
          }}
        />
      ) : null}
    </StaffListPageLayout>
  );
}

function StaffActivityPageRow({
  row,
  locale,
}: {
  row: StaffActivityRow;
  locale: string;
}) {
  const t = useTranslations("staffActivityPages");
  const sessionWhen = formatSessionLabel(locale, row.sessionStartsAt);
  return (
    <li className="flex flex-col gap-1 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">
          {row.type === "BOOKING_CREATED" ? t("typeBooked") : t("typeCancelled")}
        </p>
        <p className="mt-1 text-sm font-semibold text-sage-900">{row.memberName}</p>
        <p className="mt-0.5 text-sm text-sage-700">{row.className}</p>
        <p className="mt-0.5 text-xs text-sage-500">{sessionWhen}</p>
      </div>
      <p className="shrink-0 text-xs text-sage-400">
        {formatDateTimeForUi(row.createdAt, locale)}
      </p>
    </li>
  );
}

function formatSessionLabel(locale: string, startsAt: string): string {
  const start = new Date(startsAt);
  const date = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: STUDIO_TIMEZONE,
  }).format(start);
  return `${date} · ${formatTimeForUi(start, locale)}`;
}
