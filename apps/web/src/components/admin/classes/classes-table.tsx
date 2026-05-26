"use client";

import { useTranslations } from "next-intl";
import type { AdminClassSessionRow } from "@/components/admin/admin-classes-types";
import { adminChrome } from "@/components/admin/admin-chrome";
import { ClassStatusBadge } from "@/components/admin/classes/class-status-badge";

type ClassesTableProps = {
  locale: string;
  sessions: readonly AdminClassSessionRow[];
  hasFilters: boolean;
  refreshing: boolean;
  busyId: string | null;
  onCreate: () => void;
  onEdit: (row: AdminClassSessionRow) => void;
  onCancel: (id: string) => void;
  onDuplicate: (row: AdminClassSessionRow) => void;
  onResetFilters: () => void;
};

function CalendarGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4m8-4v4M3 10h18" />
    </svg>
  );
}

function EditGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 20h4l10-10a2.1 2.1 0 0 0-3-3L5 17v3z" />
    </svg>
  );
}

function CancelGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6m0-6-6 6" />
    </svg>
  );
}

function DuplicateGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <rect x="4" y="4" width="11" height="11" rx="2" />
    </svg>
  );
}

function formatDate(value: string, locale: string): string {
  return new Date(value).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}

function formatTimeRange(startsAt: string, endsAt: string, locale: string): string {
  const start = new Date(startsAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  const end = new Date(endsAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  return `${start} - ${end}`;
}

function priceOrSessions(row: AdminClassSessionRow, t: ReturnType<typeof useTranslations<"adminPages.classes">>): string {
  if (row.sessionRequirement) return t("sessionsRequired", { count: row.sessionRequirement });
  return t("priceAmount", { amount: (row.priceCents / 100).toFixed(2) });
}

function RowActions({
  row,
  busyId,
  onEdit,
  onCancel,
  onDuplicate,
}: {
  row: AdminClassSessionRow;
  busyId: string | null;
  onEdit: (item: AdminClassSessionRow) => void;
  onCancel: (id: string) => void;
  onDuplicate: (item: AdminClassSessionRow) => void;
}) {
  const t = useTranslations("adminPages.classes");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        title={t("editButton")}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/70 bg-white/80 px-3 text-xs font-medium text-sage-800 transition-colors hover:bg-white"
        onClick={() => onEdit(row)}
      >
        <EditGlyph />
        <span>{t("editButton")}</span>
      </button>
      <button
        type="button"
        title={t("cancelAction")}
        disabled={busyId === row.id}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-red-200 bg-red-50/40 px-3 text-xs font-medium text-red-800 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-55"
        onClick={() => onCancel(row.id)}
      >
        <CancelGlyph />
        <span>{t("cancelAction")}</span>
      </button>
      <button
        type="button"
        title={t("duplicateButton")}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-sand-300 bg-white/70 px-3 text-xs font-medium text-sage-700 transition-colors hover:bg-white"
        onClick={() => onDuplicate(row)}
      >
        <DuplicateGlyph />
        <span>{t("duplicateButton")}</span>
      </button>
    </div>
  );
}

function EmptyState({
  hasFilters,
  onCreate,
  onResetFilters,
}: {
  hasFilters: boolean;
  onCreate: () => void;
  onResetFilters: () => void;
}) {
  const t = useTranslations("adminPages.classes");

  if (hasFilters) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[24px] border border-white/70 bg-white/60 px-4 py-10 text-center backdrop-blur-md">
        <p className="text-sm font-medium text-sage-800">{t("empty.filteredTitle")}</p>
        <p className="text-sm text-sage-500">{t("empty.filteredBody")}</p>
        <button
          type="button"
          className="inline-flex h-10 items-center justify-center rounded-full border border-white/80 bg-white/85 px-5 text-sm font-medium text-sage-700 transition-colors hover:bg-white"
          onClick={onResetFilters}
        >
          {t("filters.reset")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-[24px] border border-white/70 bg-white/60 px-4 py-12 text-center backdrop-blur-md">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-sand-200 bg-sand-100/70 text-sage-700">
        <CalendarGlyph />
      </span>
      <p className="text-base font-semibold text-sage-900">{t("empty.noneTitle")}</p>
      <p className="max-w-md text-sm text-sage-500">{t("empty.noneBody")}</p>
      <button type="button" className="ommm-cta-primary" onClick={onCreate}>
        {t("addClassButton")}
      </button>
    </div>
  );
}

function TableLoading() {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/60 p-4 backdrop-blur-md" aria-hidden>
      <div className="grid gap-3">
        <div className="h-10 animate-pulse rounded-xl bg-white/80" />
        <div className="h-10 animate-pulse rounded-xl bg-white/70" />
        <div className="h-10 animate-pulse rounded-xl bg-white/70" />
      </div>
    </div>
  );
}

export function ClassesTable({
  locale,
  sessions,
  hasFilters,
  refreshing,
  busyId,
  onCreate,
  onEdit,
  onCancel,
  onDuplicate,
  onResetFilters,
}: ClassesTableProps) {
  const t = useTranslations("adminPages.classes");

  if (refreshing) {
    return <TableLoading />;
  }

  if (sessions.length === 0) {
    return <EmptyState hasFilters={hasFilters} onCreate={onCreate} onResetFilters={onResetFilters} />;
  }

  return (
    <section className="space-y-4">
      <div className="hidden overflow-hidden rounded-[24px] border border-white/60 bg-white/55 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md lg:block">
        <div className={adminChrome.tableWrap}>
          <table className={adminChrome.table}>
            <thead className={adminChrome.thead}>
              <tr>
                <th className={adminChrome.th}>{t("colClass")}</th>
                <th className={adminChrome.th}>{t("colDate")}</th>
                <th className={adminChrome.th}>{t("colTime")}</th>
                <th className={adminChrome.th}>{t("colCoach")}</th>
                <th className={adminChrome.th}>{t("colCapacity")}</th>
                <th className={adminChrome.th}>{t("colLevel")}</th>
                <th className={adminChrome.th}>{t("colType")}</th>
                <th className={adminChrome.th}>{t("colPriceOrSessions")}</th>
                <th className={adminChrome.th}>{t("colStatus")}</th>
                <th className={adminChrome.th}>{t("colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((row) => (
                <tr key={row.id} className={adminChrome.tr}>
                  <td className={adminChrome.tdStrong}>{row.title}</td>
                  <td className={adminChrome.td}>{formatDate(row.startsAt, locale)}</td>
                  <td className={adminChrome.td}>{formatTimeRange(row.startsAt, row.endsAt, locale)}</td>
                  <td className={adminChrome.td}>{row.coach.user.name ?? t("fallback.notSpecified")}</td>
                  <td className={adminChrome.td}>{`${row._count.bookings}/${row.capacity}`}</td>
                  <td className={adminChrome.td}>{row.level ?? t("fallback.notSpecified")}</td>
                  <td className={adminChrome.td}>{row.classType.name}</td>
                  <td className={adminChrome.td}>{priceOrSessions(row, t)}</td>
                  <td className={adminChrome.td}>
                    <ClassStatusBadge status={row.status} />
                  </td>
                  <td className={adminChrome.td}>
                    <RowActions row={row} busyId={busyId} onEdit={onEdit} onCancel={onCancel} onDuplicate={onDuplicate} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 lg:hidden">
        {sessions.map((row) => (
          <article key={row.id} className="rounded-[22px] border border-white/70 bg-white/70 p-4 shadow-[0_14px_30px_-24px_rgba(45,40,35,0.3)] backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-sage-900">{row.title}</h3>
              <ClassStatusBadge status={row.status} />
            </div>
            <div className="mt-3 grid gap-2 text-xs text-sage-600 sm:grid-cols-2">
              <p><span className="font-medium text-sage-800">{t("colDate")}:</span> {formatDate(row.startsAt, locale)}</p>
              <p><span className="font-medium text-sage-800">{t("colTime")}:</span> {formatTimeRange(row.startsAt, row.endsAt, locale)}</p>
              <p><span className="font-medium text-sage-800">{t("colCoach")}:</span> {row.coach.user.name ?? t("fallback.notSpecified")}</p>
              <p><span className="font-medium text-sage-800">{t("colCapacity")}:</span> {row._count.bookings}/{row.capacity}</p>
              <p><span className="font-medium text-sage-800">{t("colType")}:</span> {row.classType.name}</p>
              <p><span className="font-medium text-sage-800">{t("colLevel")}:</span> {row.level ?? t("fallback.notSpecified")}</p>
              <p className="sm:col-span-2">
                <span className="font-medium text-sage-800">{t("colPriceOrSessions")}:</span> {priceOrSessions(row, t)}
              </p>
            </div>
            <div className="mt-3 border-t border-white/65 pt-3">
              <RowActions row={row} busyId={busyId} onEdit={onEdit} onCancel={onCancel} onDuplicate={onDuplicate} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
