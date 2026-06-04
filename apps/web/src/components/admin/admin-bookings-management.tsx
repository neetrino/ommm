"use client";

import type { ComponentType, ReactNode } from "react";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AdminFilterResetBar } from "@/components/ui/admin-filter-reset-bar";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmFilterDropdown } from "@/components/ui/omm-select-dropdown";
import { PlusIcon } from "@/components/ui/plus-icon";
import {
  AdminBookingsViewIcon,
  type BookingsView,
} from "@/components/admin/admin-bookings-view-icons";
import { ApiError, apiFetch } from "@/lib/api";
import { adminChrome } from "@/components/admin/admin-chrome";
import { formatPackagePlanName } from "@/components/admin/admin-packages-display";
import { formatDateForUi, formatDateTimeForUi } from "@/lib/date-display";
import { useCloseOnEscape } from "@/hooks/use-close-on-escape";

const DRAWER_CLOSE_BUTTON_CLASSES =
  "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-sage-500 transition-[background-color,color,transform] hover:bg-sand-50 hover:text-sage-900 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500/40 focus-visible:ring-offset-2";

type AdminBookingSessionSlot = {
  id: string;
  title: string;
  status: "DRAFT" | "ACTIVE" | "FULL" | "CANCELLED";
  startsAt: string;
  endsAt: string;
  capacity: number;
  bookedCount: number;
  spotsLeft: number;
  level: string | null;
  classFormat: string | null;
  classType: { id: string; name: string };
  coach: { id: string; name: string | null };
};

type BookingRow = {
  id: string;
  recordType: "BOOKING" | "WAITLIST";
  status: "BOOKED" | "COMPLETED" | "CANCELLED" | "MISSED" | "WAITLISTED";
  attendanceStatus: "ATTENDED" | "NOT_ATTENDED" | "NO_SHOW" | "LATE_CANCEL" | null;
  paymentStatus: "PAID" | "CASH" | "UNPAID" | "REFUNDED";
  channel: "WEBSITE" | "APP";
  registerDate: string;
  user: { id: string; name: string | null; email: string; phone: string | null };
  session: {
    id: string;
    startsAt: string;
    endsAt: string;
    classType: { id: string; name: string };
    coach: { id: string; name: string | null };
  };
  package: {
    planName: string;
    sessionsRemaining: number | null;
    sessionsPerMonth: number | null;
    isUnlimited: boolean;
  } | null;
  latestNote: { id: string; body: string; authorName: string | null; createdAt: string } | null;
};

type Props = {
  locale: string;
  initial: {
    rows: BookingRow[];
    summary: {
      total: number;
      booked: number;
      completed: number;
      cancelled: number;
      waitlisted: number;
      today: number;
    };
    filterOptions: {
      classTypes: Array<{ id: string; name: string }>;
      coaches: Array<{ id: string; name: string }>;
    };
    sessionSlots: AdminBookingSessionSlot[];
  };
};

const VIEW_KEY = "admin.bookings.view";

export function AdminBookingsManagement({ locale, initial }: Props) {
  const t = useTranslations("adminPages.bookings");
  const router = useRouter();
  const [rows, setRows] = useState<BookingRow[]>(initial.rows);
  const sessionSlots = initial.sessionSlots;
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [view, setView] = useState<BookingsView>("list");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [classTypeId, setClassTypeId] = useState("");
  const [coachId, setCoachId] = useState("");
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState("");
  const [selectedDay, setSelectedDay] = useState(() => new Date().toISOString().slice(0, 10));
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [moveBooking, setMoveBooking] = useState<BookingRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VIEW_KEY);
      if (
        saved === "monthly" ||
        saved === "weekly" ||
        saved === "daily"
      ) {
        startTransition(() => {
          setView(saved);
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setViewAndPersist = useCallback((nextView: BookingsView) => {
    setView(nextView);
    try {
      window.localStorage.setItem(VIEW_KEY, nextView);
    } catch {
      /* ignore */
    }
  }, []);

  const uniqueClients = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of rows) {
      map.set(row.user.id, row.user.name ?? row.user.email);
    }
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [rows]);

  const filteredSessions = useMemo(() => {
    return sessionSlots.filter((session) => {
      if (from) {
        if (new Date(session.startsAt) < new Date(`${from}T00:00:00`)) {
          return false;
        }
      }
      if (to) {
        if (new Date(session.startsAt) > new Date(`${to}T23:59:59`)) {
          return false;
        }
      }
      if (classTypeId && session.classType.id !== classTypeId) {
        return false;
      }
      if (coachId && session.coach.id !== coachId) {
        return false;
      }
      return true;
    });
  }, [sessionSlots, from, to, classTypeId, coachId]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (q.length > 0) {
        const hay = `${row.user.name ?? ""} ${row.user.email} ${row.user.phone ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (from) {
        if (new Date(row.session.startsAt) < new Date(`${from}T00:00:00`)) return false;
      }
      if (to) {
        if (new Date(row.session.startsAt) > new Date(`${to}T23:59:59`)) return false;
      }
      if (classTypeId && row.session.classType.id !== classTypeId) return false;
      if (coachId && row.session.coach.id !== coachId) return false;
      if (clientId && row.user.id !== clientId) return false;
      if (status && row.status !== status) return false;
      return true;
    });
  }, [rows, search, from, to, classTypeId, coachId, clientId, status]);

  const summary = useMemo(() => {
    return {
      total: filteredRows.length,
      booked: filteredRows.filter((row) => row.status === "BOOKED").length,
      completed: filteredRows.filter((row) => row.status === "COMPLETED").length,
      cancelled: filteredRows.filter((row) => row.status === "CANCELLED").length,
      waitlisted: filteredRows.filter((row) => row.status === "WAITLISTED").length,
      today: filteredRows.filter((row) => formatDateForUi(row.session.startsAt) === formatDateForUi(new Date())).length,
    };
  }, [filteredRows]);

  const activeFilterCount = useMemo(
    () =>
      [search.trim(), from, to, classTypeId, coachId, clientId, status].filter(Boolean).length,
    [search, from, to, classTypeId, coachId, clientId, status],
  );

  async function runRowAction(id: string, action: () => Promise<void>, ok: string) {
    setBusyId(id);
    setStatusMessage(null);
    try {
      await action();
      setStatusMessage(ok);
      router.refresh();
    } catch (error) {
      setStatusMessage(error instanceof ApiError ? error.message : t("actionFailed"));
    } finally {
      setBusyId(null);
    }
  }

  function resetFilters() {
    setSearch("");
    setFrom("");
    setTo("");
    setClassTypeId("");
    setCoachId("");
    setClientId("");
    setStatus("");
  }

  const dayRows = filteredRows
    .filter((row) => sessionDayKey(row.session.startsAt) === selectedDay)
    .sort((a, b) => a.session.startsAt.localeCompare(b.session.startsAt));
  const daySessions = filteredSessions
    .filter((session) => sessionDayKey(session.startsAt) === selectedDay)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const bookedSessionIdsForDay = new Set(dayRows.map((row) => row.session.id));
  const openDaySessions = daySessions.filter((session) => !bookedSessionIdsForDay.has(session.id));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title={t("summaryTotal")} value={summary.total} />
        <Metric title={t("summaryBooked")} value={summary.booked} />
        <Metric title={t("summaryWaitlisted")} value={summary.waitlisted} />
        <Metric title={t("summaryToday")} value={summary.today} />
      </div>

      <div className="space-y-3 rounded-2xl border border-white/60 bg-white/70 p-3">
        <div className="grid gap-2 md:grid-cols-6">
          <input className="ommm-input h-10 md:col-span-2" placeholder={t("filterSearch")} value={search} onChange={(event) => setSearch(event.target.value)} />
          <DatePickerInput name="from" value={from} onChange={setFrom} placeholder={t("filterDateFrom")} />
          <OmmFilterDropdown allValue="" value={classTypeId} ariaLabel={t("filterClassAll")} allLabel={t("filterClassAll")} onChange={setClassTypeId} options={initial.filterOptions.classTypes.map((item) => ({ value: item.id, label: item.name }))} />
          <OmmFilterDropdown allValue="" value={coachId} ariaLabel={t("filterCoachAll")} allLabel={t("filterCoachAll")} onChange={setCoachId} options={initial.filterOptions.coaches.map((item) => ({ value: item.id, label: item.name }))} />
          <OmmFilterDropdown allValue="" value={status} ariaLabel={t("filterStatusAll")} allLabel={t("filterStatusAll")} onChange={setStatus} options={[{ value: "BOOKED", label: t("statusBooked") }, { value: "COMPLETED", label: t("statusCompleted") }, { value: "CANCELLED", label: t("statusCancelled") }, { value: "WAITLISTED", label: t("statusWaitlisted") }]} />
          <div className="md:col-span-2">
            <OmmFilterDropdown allValue="" value={clientId} ariaLabel={t("filterClientAll")} allLabel={t("filterClientAll")} onChange={setClientId} options={uniqueClients.map((item) => ({ value: item.id, label: item.label }))} />
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-sage-700/10 pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {(["list", "monthly", "weekly", "daily"] as const).map((nextView) => (
              <OmmButton
                key={nextView}
                size="sm"
                variant={view === nextView ? "primary" : "ghost"}
                className="gap-1.5"
                onClick={() => setViewAndPersist(nextView)}
              >
                <AdminBookingsViewIcon view={nextView} className="h-4 w-4 shrink-0" />
                {t(
                  nextView === "list"
                    ? "viewList"
                    : nextView === "monthly"
                      ? "viewMonthly"
                      : nextView === "weekly"
                        ? "viewWeekly"
                        : "viewDaily",
                )}
              </OmmButton>
            ))}
          </div>
          <div className="w-full sm:ml-auto sm:w-auto">
            <AdminFilterResetBar
              onReset={resetFilters}
              label={t("resetFilters")}
              meta={
                <p className="whitespace-nowrap text-xs text-sage-600" role="status">
                  {t("activeCount", { count: activeFilterCount })}
                </p>
              }
            />
          </div>
        </div>
      </div>

      {statusMessage ? <div className="rounded-xl border border-sand-500/30 bg-white/70 p-3 text-sm text-sage-900">{statusMessage}</div> : null}

      {view === "daily" && openDaySessions.length > 0 ? (
        <div className="space-y-2 rounded-2xl border border-white/60 bg-white/70 p-3">
          <p className="text-sm font-medium text-sage-900">{formatDateForUi(selectedDay)}</p>
          <div className="grid gap-2 md:grid-cols-2">
            {openDaySessions.map((session) => (
              <SessionSlotCard key={session.id} session={session} locale={locale} />
            ))}
          </div>
        </div>
      ) : null}

      {(view === "list" || view === "daily") && (
        <div className="overflow-x-auto overflow-y-hidden rounded-[24px] border border-white/60 bg-white/55 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md">
          <table className="w-full min-w-[74rem] table-fixed border-collapse text-left text-sm">
            <colgroup>
              <col className="w-[16%]" />
              <col className="w-[16%]" />
              <col className="w-[12%]" />
              <col className="w-[13%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[9%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead className={adminChrome.thead}>
              <tr>
                <th className={adminChrome.th}><HeaderLabel icon="user">{t("colUserPhone")}</HeaderLabel></th>
                <th className={adminChrome.th}><HeaderLabel icon="class">{t("colClassType")}</HeaderLabel></th>
                <th className={adminChrome.th}><HeaderLabel icon="payment">{t("colPaymentStatus")}</HeaderLabel></th>
                <th className={adminChrome.th}><HeaderLabel icon="attendance">{t("colAttendanceStatus")}</HeaderLabel></th>
                <th className={adminChrome.th}><HeaderLabel icon="sort">{t("colRegisterDate")}</HeaderLabel></th>
                <th className={adminChrome.th}><HeaderLabel icon="channel">{t("colChannel")}</HeaderLabel></th>
                <th className={adminChrome.th}><HeaderLabel icon="status">{t("colStatus")}</HeaderLabel></th>
                <th className={adminChrome.th}><HeaderLabel icon="actions">{t("colActions")}</HeaderLabel></th>
              </tr>
            </thead>
            <tbody>
              {(view === "daily" ? dayRows : filteredRows).map((row) => (
                <tr key={`${row.recordType}-${row.id}`} className={adminChrome.tr}>
                  <td className={adminChrome.tdStrong}>
                    <button
                      type="button"
                      className="break-words text-left font-medium text-sage-900 underline underline-offset-2"
                      onClick={() => setActiveUserId(row.user.id)}
                    >
                      {row.user.name ?? row.user.email}
                    </button>
                    <div className={adminChrome.metaText}>{row.user.phone ?? "—"}</div>
                  </td>
                  <td className={adminChrome.td}>
                    <span className="break-words">{row.session.classType.name}</span>
                    <div className={adminChrome.metaText}>{formatDateTimeForUi(row.session.startsAt, locale)}</div>
                    {row.package !== null ? (
                      <div className={adminChrome.metaText}>
                        {formatPackagePlanName(
                          row.package.planName,
                          row.package.sessionsPerMonth,
                        )}
                      </div>
                    ) : null}
                  </td>
                  <td className={adminChrome.td}><Badge tone="slate" label={paymentLabel(t, row.paymentStatus)} /></td>
                  <td className={adminChrome.td}><Badge tone="sand" label={attendanceLabel(t, row.attendanceStatus)} /></td>
                  <td className={adminChrome.td}>{formatDateForUi(row.registerDate)}</td>
                  <td className={adminChrome.td}><Badge tone="mint" label={row.channel === "APP" ? t("channelApp") : t("channelWebsite")} /></td>
                  <td className={adminChrome.td}><Badge tone="indigo" label={statusLabel(t, row.status)} /></td>
                  <td className={adminChrome.td}><div className="flex flex-wrap gap-1">
                    <OmmButton size="sm" variant="ghost" onClick={() => setActiveBookingId(row.id)}>{t("actionView")}</OmmButton>
                    {row.recordType === "BOOKING" ? <>
                      <OmmButton size="sm" variant="ghost" disabled={busyId === row.id} onClick={() => runRowAction(row.id, async () => { await apiFetch(`/bookings/admin/${row.id}`, { method: "PATCH", body: JSON.stringify({ status: "COMPLETED" }) }); }, t("successMarkedAttended"))}>{t("actionMarkAttended")}</OmmButton>
                      <OmmButton size="sm" variant="danger" disabled={busyId === row.id} onClick={() => { if (window.confirm(t("confirmCancel"))) { void runRowAction(row.id, async () => { await apiFetch(`/bookings/admin/${row.id}`, { method: "PATCH", body: JSON.stringify({ status: "CANCELLED" }) }); setRows((prev) => prev.map((item) => item.id === row.id ? { ...item, status: "CANCELLED" } : item)); }, t("successCancelled")); } }}>{t("actionCancel")}</OmmButton>
                      <OmmButton size="sm" variant="subtle" className="gap-1.5" disabled={busyId === row.id} onClick={() => { const note = window.prompt(t("promptNote")); if (note && note.trim().length > 0) { void runRowAction(row.id, async () => { await apiFetch(`/bookings/${row.id}/notes`, { method: "POST", body: JSON.stringify({ body: note.trim() }) }); }, t("successNote")); } }}><PlusIcon className="h-3.5 w-3.5 shrink-0" />{t("actionAddNote")}</OmmButton>
                      <OmmButton size="sm" variant="subtle" disabled={busyId === row.id} onClick={() => setMoveBooking(row)}>{t("actionMove")}</OmmButton>
                      <OmmButton size="sm" variant="subtle" disabled={busyId === row.id} onClick={() => { const next = window.prompt(t("promptEditStatus"), row.status); if (next) { void runRowAction(row.id, async () => { await apiFetch(`/bookings/admin/${row.id}`, { method: "PATCH", body: JSON.stringify({ status: next.toUpperCase() }) }); }, t("successEdited")); } }}>{t("actionEdit")}</OmmButton>
                      <OmmButton size="sm" variant="danger" disabled={busyId === row.id} onClick={() => { if (window.confirm(t("confirmDelete"))) { void runRowAction(row.id, async () => { await apiFetch(`/bookings/admin/${row.id}/permanent`, { method: "DELETE" }); setRows((prev) => prev.filter((item) => item.id !== row.id)); }, t("successDeleted")); } }}>{t("actionDelete")}</OmmButton>
                    </> : null}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "monthly" ? (
        <MonthlyPanel
          rows={filteredRows}
          sessions={filteredSessions}
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
          locale={locale}
          title={t("viewMonthly")}
        />
      ) : null}
      {view === "weekly" ? (
        <WeeklyPanel
          rows={filteredRows}
          sessions={filteredSessions}
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
          locale={locale}
          title={t("viewWeekly")}
        />
      ) : null}

      {activeUserId ? <UserDrawer userId={activeUserId} onClose={() => setActiveUserId(null)} /> : null}
      {activeBookingId ? <BookingDrawer bookingId={activeBookingId} onClose={() => setActiveBookingId(null)} /> : null}
      {moveBooking ? <MoveBookingDialog booking={moveBooking} onClose={() => setMoveBooking(null)} onSubmit={(targetSessionId) => { void runRowAction(moveBooking.id, async () => { await apiFetch(`/bookings/admin/${moveBooking.id}/move`, { method: "PATCH", body: JSON.stringify({ targetSessionId }) }); }, t("successMoved")); setMoveBooking(null); }} /> : null}
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3"><p className="text-xs uppercase tracking-wide text-sage-500">{title}</p><p className="mt-1 text-2xl font-semibold text-sage-900">{value}</p></div>;
}

type HeaderIconName = "user" | "class" | "payment" | "attendance" | "sort" | "channel" | "status" | "actions";

function HeaderLabel({ icon, children }: { icon: HeaderIconName; children: ReactNode }) {
  const Glyph = HEADER_GLYPHS[icon];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-sage-700/10 bg-white/60 text-sage-600">
        <Glyph className="h-3.5 w-3.5" />
      </span>
      <span>{children}</span>
    </span>
  );
}

const HEADER_GLYPHS: Record<HeaderIconName, ComponentType<{ className: string }>> = {
  user: UserHeaderGlyph,
  class: ClassHeaderGlyph,
  payment: PaymentHeaderGlyph,
  attendance: AttendanceHeaderGlyph,
  sort: SortHeaderGlyph,
  channel: ChannelHeaderGlyph,
  status: StatusHeaderGlyph,
  actions: ActionsHeaderGlyph,
};

function UserHeaderGlyph({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function ClassHeaderGlyph({ className }: { className: string }) {
  return <HeaderSvg className={className} path="M4 6h16M4 12h16M4 18h10" />;
}

function PaymentHeaderGlyph({ className }: { className: string }) {
  return (
    <HeaderSvg className={className}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M3 10h18M7 15h3" />
    </HeaderSvg>
  );
}

function AttendanceHeaderGlyph({ className }: { className: string }) {
  return (
    <HeaderSvg className={className}>
      <path d="m5 12 4 4L19 6" />
      <circle cx="12" cy="12" r="9" />
    </HeaderSvg>
  );
}

function SortHeaderGlyph({ className }: { className: string }) {
  return <HeaderSvg className={className} path="M8 7h12M8 12h8M8 17h4M4 7v10m0 0 2-2m-2 2-2-2" />;
}

function ChannelHeaderGlyph({ className }: { className: string }) {
  return (
    <HeaderSvg className={className}>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </HeaderSvg>
  );
}

function StatusHeaderGlyph({ className }: { className: string }) {
  return <HeaderSvg className={className} path="M12 3 3 7l9 4 9-4-9-4ZM3 17l9 4 9-4M3 12l9 4 9-4" />;
}

function ActionsHeaderGlyph({ className }: { className: string }) {
  return (
    <HeaderSvg className={className}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </HeaderSvg>
  );
}

function HeaderSvg({ className, path, children }: { className: string; path?: string; children?: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {path ? <path d={path} /> : children}
    </svg>
  );
}

function Badge({ label, tone }: { label: string; tone: "slate" | "sand" | "mint" | "indigo" }) {
  const styles = tone === "mint" ? "border-mint-200 bg-mint-50 text-sage-900" : tone === "indigo" ? "border-indigo-200 bg-indigo-50 text-indigo-900" : tone === "sand" ? "border-sand-300 bg-sand-50 text-sage-900" : "border-zinc-200 bg-zinc-50 text-zinc-800";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${styles}`}>{label}</span>;
}
function statusLabel(t: ReturnType<typeof useTranslations<"adminPages.bookings">>, value: BookingRow["status"]) { return value === "BOOKED" ? t("statusBooked") : value === "COMPLETED" ? t("statusCompleted") : value === "CANCELLED" ? t("statusCancelled") : value === "WAITLISTED" ? t("statusWaitlisted") : t("statusBooked"); }
function paymentLabel(t: ReturnType<typeof useTranslations<"adminPages.bookings">>, value: BookingRow["paymentStatus"]) { return value === "PAID" ? t("paymentPaid") : value === "CASH" ? t("paymentCash") : value === "REFUNDED" ? t("paymentRefunded") : t("paymentUnpaid"); }
function attendanceLabel(t: ReturnType<typeof useTranslations<"adminPages.bookings">>, value: BookingRow["attendanceStatus"]) { if (value === "ATTENDED") return t("attendanceAttended"); if (value === "NO_SHOW") return t("attendanceNoShow"); if (value === "LATE_CANCEL") return t("attendanceLateCancel"); return t("attendanceNotAttended"); }

function sessionDayKey(startsAt: string): string {
  return startsAt.slice(0, 10);
}

function CalendarGrid({
  rows,
  sessions,
  selectedDay,
  onSelect,
  title,
}: {
  rows: BookingRow[];
  sessions: readonly AdminBookingSessionSlot[];
  selectedDay: string;
  onSelect: (value: string) => void;
  title: string;
}) {
  const days = useMemo(() => {
    const map = new Map<string, { bookings: number; sessions: number }>();
    for (const session of sessions) {
      const day = sessionDayKey(session.startsAt);
      const current = map.get(day) ?? { bookings: 0, sessions: 0 };
      current.sessions += 1;
      map.set(day, current);
    }
    for (const row of rows) {
      const day = sessionDayKey(row.session.startsAt);
      const current = map.get(day) ?? { bookings: 0, sessions: 0 };
      current.bookings += 1;
      map.set(day, current);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [rows, sessions]);

  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
      <p className="text-sm font-medium text-sage-900">{title}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {days.map(([day, counts]) => (
          <button
            key={day}
            className={`rounded-xl border px-3 py-2 text-left ${day === selectedDay ? "border-indigo-300 bg-indigo-50" : "border-white/70 bg-white/80"}`}
            onClick={() => onSelect(day)}
          >
            <p className="text-sm text-sage-900">{formatDateForUi(day)}</p>
            <p className="text-xs text-sage-600">
              {counts.sessions} · {counts.bookings}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function SessionSlotCard({
  session,
  locale,
}: {
  session: AdminBookingSessionSlot;
  locale: string;
}) {
  return (
    <div className="rounded-xl border border-mint-200/80 bg-mint-50/60 px-3 py-2 text-sm">
      <div className="font-medium text-sage-900">{session.title}</div>
      <div className="text-xs text-sage-600">
        {formatDateTimeForUi(session.startsAt, locale)} · {session.classType.name} ·{" "}
        {session.coach.name ?? "—"} · {session.spotsLeft}/{session.capacity}
      </div>
    </div>
  );
}

function MonthlyPanel({
  rows,
  sessions,
  selectedDay,
  onSelect,
  locale,
  title,
}: {
  rows: BookingRow[];
  sessions: readonly AdminBookingSessionSlot[];
  selectedDay: string;
  onSelect: (value: string) => void;
  locale: string;
  title: string;
}) {
  const dayRows = rows
    .filter((row) => sessionDayKey(row.session.startsAt) === selectedDay)
    .sort((a, b) => a.session.startsAt.localeCompare(b.session.startsAt));
  const daySessions = sessions
    .filter((session) => sessionDayKey(session.startsAt) === selectedDay)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const bookedSessionIds = new Set(dayRows.map((row) => row.session.id));
  const openSessions = daySessions.filter((session) => !bookedSessionIds.has(session.id));

  return (
    <div className="space-y-3">
      <CalendarGrid
        rows={rows}
        sessions={sessions}
        selectedDay={selectedDay}
        onSelect={onSelect}
        title={title}
      />
      <div className="rounded-2xl border border-white/60 bg-white/70 p-3">
        <p className="text-sm font-medium text-sage-900">{formatDateForUi(selectedDay)}</p>
        <div className="mt-2 space-y-2">
          {dayRows.length === 0 && openSessions.length === 0 ? (
            <p className="text-sm text-sage-500">—</p>
          ) : (
            <>
              {openSessions.map((session) => (
                <SessionSlotCard key={session.id} session={session} locale={locale} />
              ))}
              {dayRows.map((row) => (
                <div
                  key={`${row.recordType}-${row.id}`}
                  className="rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-sm"
                >
                  <div className="font-medium text-sage-900">{row.user.name ?? row.user.email}</div>
                  <div className="text-xs text-sage-600">
                    {formatDateTimeForUi(row.session.startsAt, locale)} · {row.session.classType.name}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function WeeklyPanel({
  rows,
  sessions,
  selectedDay,
  onSelect,
  locale,
  title,
}: {
  rows: BookingRow[];
  sessions: readonly AdminBookingSessionSlot[];
  selectedDay: string;
  onSelect: (value: string) => void;
  locale: string;
  title: string;
}) {
  const selected = new Date(`${selectedDay}T00:00:00`);
  const mondayOffset = (selected.getDay() + 6) % 7;
  const monday = new Date(selected);
  monday.setDate(selected.getDate() - mondayOffset);
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    const iso = day.toISOString().slice(0, 10);
    const dayRows = rows
      .filter((row) => sessionDayKey(row.session.startsAt) === iso)
      .sort((a, b) => a.session.startsAt.localeCompare(b.session.startsAt));
    const daySessions = sessions
      .filter((session) => sessionDayKey(session.startsAt) === iso)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    return { iso, rows: dayRows, sessions: daySessions };
  });

  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-4">
      <p className="text-sm font-medium text-sage-900">{title}</p>
      <div className="mt-3 grid gap-2 lg:grid-cols-7">
        {days.map((day) => (
          <button
            key={day.iso}
            className={`rounded-xl border px-2 py-2 text-left align-top ${day.iso === selectedDay ? "border-indigo-300 bg-indigo-50" : "border-white/70 bg-white/80"}`}
            onClick={() => onSelect(day.iso)}
          >
            <p className="text-xs font-medium text-sage-700">{formatDateForUi(day.iso)}</p>
            <div className="mt-1 space-y-1">
              {day.sessions.slice(0, 4).map((session) => (
                <div
                  key={session.id}
                  className="rounded-md border border-mint-200/70 bg-mint-50/70 px-2 py-1 text-[11px] text-sage-700"
                >
                  {formatDateTimeForUi(session.startsAt, locale).split(" ")[1]} · {session.title}
                </div>
              ))}
              {day.rows.slice(0, 6).map((row) => (
                <div
                  key={`${row.recordType}-${row.id}`}
                  className="rounded-md bg-white/70 px-2 py-1 text-[11px] text-sage-700"
                >
                  {formatDateTimeForUi(row.session.startsAt, locale).split(" ")[1]} ·{" "}
                  {row.user.name ?? row.user.email}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function UserDrawer({ userId, onClose }: { userId: string; onClose: () => void }) {
  const t = useTranslations("adminPages.bookings");
  useCloseOnEscape(true, onClose);
  const [data, setData] = useState<null | {
    name: string | null;
    email: string;
    phone: string | null;
    bookings?: Array<{ id: string; status: string; session: { startsAt: string; classType: { name: string } } }>;
  }>(null);
  useEffect(() => {
    void apiFetch(`/clients/${userId}`)
      .then((payload) =>
        setData(
          payload as {
            name: string | null;
            email: string;
            phone: string | null;
            bookings?: Array<{
              id: string;
              status: string;
              session: { startsAt: string; classType: { name: string } };
            }>;
          },
        ),
      )
      .catch(() => setData(null));
  }, [userId]);
  return (
    <div className="ommm-drawer-overlay z-40">
      <button className="ommm-modal-backdrop" onClick={onClose} aria-label={t("close")} />
      <aside className="relative z-10 h-full w-full max-w-md overflow-auto bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">{t("userDetailsTitle")}</h3>
          <button type="button" className={DRAWER_CLOSE_BUTTON_CLASSES} onClick={onClose}>x</button>
        </div>
        {data === null ? (
          <p className="text-sm text-sage-500">{t("emptyUserData")}</p>
        ) : (
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-sage-900">{data.name ?? data.email}</p>
              <p className="text-sage-600">{data.phone ?? "—"}</p>
              <p className="text-sage-600">{data.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-sage-500">{t("bookingHistory")}</p>
              <div className="mt-1 space-y-1">
                {(data.bookings ?? []).slice(0, 8).map((booking) => (
                  <p key={booking.id} className="rounded-md bg-white/80 px-2 py-1 text-xs">
                    {formatDateTimeForUi(booking.session.startsAt)} · {booking.session.classType.name} · {booking.status}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
function BookingDrawer({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const t = useTranslations("adminPages.bookings");
  useCloseOnEscape(true, onClose);
  const [data, setData] = useState<null | {
    status: string;
    paymentStatus?: string;
    attendanceStatus?: string;
    user: { name: string | null; email: string; phone: string | null };
    session: { startsAt: string; classType: { name: string }; coach: { user: { name: string | null } } };
    channel: "WEBSITE" | "APP";
    notes?: Array<{ id: string; body: string; createdAt: string; author: { name: string | null } }>;
    createdAt: string;
  }>(null);
  useEffect(() => { void apiFetch(`/bookings/admin/${bookingId}`).then((payload) => setData(payload as { status: string; paymentStatus?: string; attendanceStatus?: string; user: { name: string | null; email: string; phone: string | null }; session: { startsAt: string; classType: { name: string }; coach: { user: { name: string | null } } }; channel: "WEBSITE" | "APP"; notes?: Array<{ id: string; body: string; createdAt: string; author: { name: string | null } }>; createdAt: string })).catch(() => setData(null)); }, [bookingId]);
  return <div className="ommm-drawer-overlay z-40"><button className="ommm-modal-backdrop" onClick={onClose} aria-label={t("close")} /><aside className="relative z-10 h-full w-full max-w-md overflow-auto bg-white p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">{t("bookingDetailsTitle")}</h3><button type="button" className={DRAWER_CLOSE_BUTTON_CLASSES} onClick={onClose}>x</button></div>{data === null ? <p className="text-sm text-sage-500">{t("emptyBookingData")}</p> : <div className="space-y-2 text-sm"><p><span className="text-sage-500">{t("colUserPhone")}:</span> {data.user.name ?? data.user.email} · {data.user.phone ?? "—"}</p><p><span className="text-sage-500">{t("colClassType")}:</span> {data.session.classType.name}</p><p><span className="text-sage-500">{t("filterCoachAll")}:</span> {data.session.coach.user.name ?? "—"}</p><p><span className="text-sage-500">{t("colRegisterDate")}:</span> {formatDateForUi(data.createdAt)}</p><p><span className="text-sage-500">{t("colStatus")}:</span> {data.status}</p><p><span className="text-sage-500">{t("colPaymentStatus")}:</span> {data.paymentStatus ?? "—"}</p><p><span className="text-sage-500">{t("colAttendanceStatus")}:</span> {data.attendanceStatus ?? "—"}</p><p><span className="text-sage-500">{t("colChannel")}:</span> {data.channel === "APP" ? t("channelApp") : t("channelWebsite")}</p><div><p className="text-xs uppercase text-sage-500">{t("actionAddNote")}</p><div className="mt-1 space-y-1">{(data.notes ?? []).slice(0, 6).map((note) => <p key={note.id} className="rounded-md bg-sand-50 px-2 py-1 text-xs">{note.author.name ?? "Staff"} · {formatDateForUi(note.createdAt)} · {note.body}</p>)}</div></div></div>}</aside></div>;
}
function MoveBookingDialog({ booking, onClose, onSubmit }: { booking: BookingRow; onClose: () => void; onSubmit: (targetSessionId: string) => void }) {
  const t = useTranslations("adminPages.bookings");
  useCloseOnEscape(true, onClose);
  const [targetSessionId, setTargetSessionId] = useState("");
  const [options, setOptions] = useState<Array<{ id: string; startsAt: string; classType: { name: string }; coach: { user: { name: string | null } } }>>([]);
  useEffect(() => {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 30);
    const q = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}&typeId=${encodeURIComponent(booking.session.classType.id)}`;
    void apiFetch(`/classes/admin/sessions?${q}`)
      .then((payload) =>
        setOptions(
          (
            payload as Array<{
              id: string;
              startsAt: string;
              status: AdminBookingSessionSlot["status"];
              classType: { name: string };
              coach: { user: { name: string | null } };
            }>
          )
            .filter(
              (row) =>
                row.id !== booking.session.id &&
                row.status !== "CANCELLED" &&
                row.status !== "DRAFT",
            )
            .map((row) => ({
              id: row.id,
              startsAt: row.startsAt,
              classType: row.classType,
              coach: { user: { name: row.coach.user.name } },
            })),
        ),
      )
      .catch(() => setOptions([]));
  }, [booking.session.classType.id, booking.session.id]);
  const slotOptions = options.map((row) => ({
    value: row.id,
    label: `${formatDateTimeForUi(row.startsAt)} · ${row.classType.name} · ${row.coach.user.name ?? "—"}`,
  }));

  return (
    <div className="ommm-modal-overlay z-50 items-center p-4" role="presentation">
      <button type="button" className="ommm-modal-backdrop" onClick={onClose} aria-label={t("close")} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/60 bg-white p-4">
        <h3 className="text-base font-semibold text-sage-900">{t("actionMove")}</h3>
        <p className="mt-1 text-sm text-sage-600">
          {booking.user.name ?? booking.user.email} · {booking.session.classType.name}
        </p>
        <div className="mt-3">
          <OmmFilterDropdown
            allValue=""
            value={targetSessionId}
            ariaLabel={t("selectClassSlot")}
            allLabel={t("selectClassSlot")}
            onChange={setTargetSessionId}
            options={slotOptions}
            disabled={slotOptions.length === 0}
          />
        </div>
        {options.length === 0 ? (
          <p className="mt-2 text-xs text-sage-500">{t("emptyMoveOptions")}</p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <OmmButton size="sm" variant="ghost" onClick={onClose}>
            {t("close")}
          </OmmButton>
          <OmmButton
            size="sm"
            variant="primary"
            disabled={targetSessionId === ""}
            onClick={() => onSubmit(targetSessionId)}
          >
            {t("actionMove")}
          </OmmButton>
        </div>
      </div>
    </div>
  );
}
