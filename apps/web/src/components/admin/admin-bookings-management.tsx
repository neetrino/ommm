"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateForUi, formatDateTimeForUi } from "@/lib/date-display";

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
  membership: {
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
  };
};

const VIEW_KEY = "admin.bookings.view";

export function AdminBookingsManagement({ locale, initial }: Props) {
  const t = useTranslations("adminPages.bookings");
  const router = useRouter();
  const [rows, setRows] = useState<BookingRow[]>(initial.rows);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "monthly" | "weekly" | "daily">(() => {
    if (typeof window === "undefined") {
      return "list";
    }
    try {
      const saved = window.localStorage.getItem(VIEW_KEY);
      if (
        saved === "list" ||
        saved === "monthly" ||
        saved === "weekly" ||
        saved === "daily"
      ) {
        return saved;
      }
    } catch {
      /* ignore */
    }
    return "list";
  });
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
      if (typeof window !== "undefined") {
        window.localStorage.setItem(VIEW_KEY, view);
      }
    } catch {
      /* ignore */
    }
  }, [view]);

  const uniqueClients = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of rows) {
      map.set(row.user.id, row.user.name ?? row.user.email);
    }
    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [rows]);

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
    .filter((row) => row.session.startsAt.slice(0, 10) === selectedDay)
    .sort((a, b) => a.session.startsAt.localeCompare(b.session.startsAt));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Metric title={t("summaryTotal")} value={summary.total} />
        <Metric title={t("summaryBooked")} value={summary.booked} />
        <Metric title={t("summaryCompleted")} value={summary.completed} />
        <Metric title={t("summaryCancelled")} value={summary.cancelled} />
        <Metric title={t("summaryWaitlisted")} value={summary.waitlisted} />
        <Metric title={t("summaryToday")} value={summary.today} />
      </div>

      <div className="grid gap-2 rounded-2xl border border-white/60 bg-white/70 p-3 md:grid-cols-7">
        <input className="ommm-input h-10 md:col-span-2" placeholder={t("filterSearch")} value={search} onChange={(event) => setSearch(event.target.value)} />
        <DatePickerInput name="from" value={from} onChange={setFrom} placeholder={t("filterDateFrom")} />
        <DatePickerInput name="to" value={to} onChange={setTo} placeholder={t("filterDateTo")} />
        <select className="ommm-input h-10" value={classTypeId} onChange={(event) => setClassTypeId(event.target.value)}>
          <option value="">{t("filterClassAll")}</option>
          {initial.filterOptions.classTypes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select className="ommm-input h-10" value={coachId} onChange={(event) => setCoachId(event.target.value)}>
          <option value="">{t("filterCoachAll")}</option>
          {initial.filterOptions.coaches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select className="ommm-input h-10" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">{t("filterStatusAll")}</option>
          <option value="BOOKED">{t("statusBooked")}</option>
          <option value="COMPLETED">{t("statusCompleted")}</option>
          <option value="CANCELLED">{t("statusCancelled")}</option>
          <option value="WAITLISTED">{t("statusWaitlisted")}</option>
        </select>
        <select className="ommm-input h-10 md:col-span-2" value={clientId} onChange={(event) => setClientId(event.target.value)}>
          <option value="">{t("filterClientAll")}</option>
          {uniqueClients.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <div className="flex flex-wrap items-center gap-2 md:col-span-2">
          <OmmButton size="sm" variant={view === "list" ? "primary" : "ghost"} onClick={() => setView("list")}>{t("viewList")}</OmmButton>
          <OmmButton size="sm" variant={view === "monthly" ? "primary" : "ghost"} onClick={() => setView("monthly")}>{t("viewMonthly")}</OmmButton>
          <OmmButton size="sm" variant={view === "weekly" ? "primary" : "ghost"} onClick={() => setView("weekly")}>{t("viewWeekly")}</OmmButton>
          <OmmButton size="sm" variant={view === "daily" ? "primary" : "ghost"} onClick={() => setView("daily")}>{t("viewDaily")}</OmmButton>
          <OmmButton size="sm" variant="subtle" onClick={resetFilters}>{t("resetFilters")}</OmmButton>
        </div>
      </div>

      {statusMessage ? <div className="rounded-xl border border-sand-500/30 bg-white/70 p-3 text-sm text-sage-900">{statusMessage}</div> : null}

      {(view === "list" || view === "daily") && (
        <div className="overflow-x-auto rounded-2xl border border-white/60 bg-white/65">
          <table className="min-w-[72rem] w-full text-left text-sm">
            <thead className="border-b border-white/60 bg-white/40 text-xs uppercase text-sage-500">
              <tr>
                <th className="px-3 py-2">{t("colUserPhone")}</th><th className="px-3 py-2">{t("colClassType")}</th><th className="px-3 py-2">{t("colSessionCount")}</th>
                <th className="px-3 py-2">{t("colPaymentStatus")}</th><th className="px-3 py-2">{t("colAttendanceStatus")}</th><th className="px-3 py-2">{t("colRegisterDate")}</th>
                <th className="px-3 py-2">{t("colChannel")}</th><th className="px-3 py-2">{t("colStatus")}</th><th className="px-3 py-2">{t("colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {(view === "daily" ? dayRows : filteredRows).map((row) => (
                <tr key={`${row.recordType}-${row.id}`} className="border-b border-white/50">
                  <td className="px-3 py-2"><button className="font-medium text-sage-900 underline underline-offset-2" onClick={() => setActiveUserId(row.user.id)}>{row.user.name ?? row.user.email}</button><div className="text-xs text-sage-500">{row.user.phone ?? "—"}</div></td>
                  <td className="px-3 py-2">{row.session.classType.name}<div className="text-xs text-sage-500">{formatDateTimeForUi(row.session.startsAt, locale)}</div></td>
                  <td className="px-3 py-2 text-xs">{row.membership?.isUnlimited ? t("sessionUnlimited") : row.membership?.sessionsRemaining != null ? `${row.membership.sessionsRemaining}${row.membership.sessionsPerMonth != null ? ` / ${row.membership.sessionsPerMonth}` : ""}` : t("sessionNotTracked")}</td>
                  <td className="px-3 py-2"><Badge tone="slate" label={paymentLabel(t, row.paymentStatus)} /></td>
                  <td className="px-3 py-2"><Badge tone="sand" label={attendanceLabel(t, row.attendanceStatus)} /></td>
                  <td className="px-3 py-2">{formatDateForUi(row.registerDate)}</td>
                  <td className="px-3 py-2"><Badge tone="mint" label={row.channel === "APP" ? t("channelApp") : t("channelWebsite")} /></td>
                  <td className="px-3 py-2"><Badge tone="indigo" label={statusLabel(t, row.status)} /></td>
                  <td className="px-3 py-2"><div className="flex flex-wrap gap-1">
                    <OmmButton size="sm" variant="ghost" onClick={() => setActiveBookingId(row.id)}>{t("actionView")}</OmmButton>
                    {row.recordType === "BOOKING" ? <>
                      <OmmButton size="sm" variant="ghost" disabled={busyId === row.id} onClick={() => runRowAction(row.id, async () => { await apiFetch(`/bookings/admin/${row.id}`, { method: "PATCH", body: JSON.stringify({ status: "COMPLETED" }) }); }, t("successMarkedAttended"))}>{t("actionMarkAttended")}</OmmButton>
                      <OmmButton size="sm" variant="danger" disabled={busyId === row.id} onClick={() => { if (window.confirm(t("confirmCancel"))) { void runRowAction(row.id, async () => { await apiFetch(`/bookings/admin/${row.id}`, { method: "PATCH", body: JSON.stringify({ status: "CANCELLED" }) }); setRows((prev) => prev.map((item) => item.id === row.id ? { ...item, status: "CANCELLED" } : item)); }, t("successCancelled")); } }}>{t("actionCancel")}</OmmButton>
                      <OmmButton size="sm" variant="subtle" disabled={busyId === row.id} onClick={() => { const note = window.prompt(t("promptNote")); if (note && note.trim().length > 0) { void runRowAction(row.id, async () => { await apiFetch(`/bookings/${row.id}/notes`, { method: "POST", body: JSON.stringify({ body: note.trim() }) }); }, t("successNote")); } }}>{t("actionAddNote")}</OmmButton>
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

      {view === "monthly" ? <MonthlyPanel rows={filteredRows} selectedDay={selectedDay} onSelect={setSelectedDay} locale={locale} title={t("viewMonthly")} /> : null}
      {view === "weekly" ? <WeeklyPanel rows={filteredRows} selectedDay={selectedDay} onSelect={setSelectedDay} locale={locale} title={t("viewWeekly")} /> : null}

      {activeUserId ? <UserDrawer userId={activeUserId} onClose={() => setActiveUserId(null)} /> : null}
      {activeBookingId ? <BookingDrawer bookingId={activeBookingId} onClose={() => setActiveBookingId(null)} /> : null}
      {moveBooking ? <MoveBookingDialog booking={moveBooking} onClose={() => setMoveBooking(null)} onSubmit={(targetSessionId) => { void runRowAction(moveBooking.id, async () => { await apiFetch(`/bookings/admin/${moveBooking.id}/move`, { method: "PATCH", body: JSON.stringify({ targetSessionId }) }); }, t("successMoved")); setMoveBooking(null); }} /> : null}
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3"><p className="text-xs uppercase tracking-wide text-sage-500">{title}</p><p className="mt-1 text-2xl font-semibold text-sage-900">{value}</p></div>;
}
function Badge({ label, tone }: { label: string; tone: "slate" | "sand" | "mint" | "indigo" }) {
  const styles = tone === "mint" ? "border-mint-200 bg-mint-50 text-sage-900" : tone === "indigo" ? "border-indigo-200 bg-indigo-50 text-indigo-900" : tone === "sand" ? "border-sand-300 bg-sand-50 text-sage-900" : "border-zinc-200 bg-zinc-50 text-zinc-800";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${styles}`}>{label}</span>;
}
function statusLabel(t: ReturnType<typeof useTranslations<"adminPages.bookings">>, value: BookingRow["status"]) { return value === "BOOKED" ? t("statusBooked") : value === "COMPLETED" ? t("statusCompleted") : value === "CANCELLED" ? t("statusCancelled") : value === "WAITLISTED" ? t("statusWaitlisted") : t("statusBooked"); }
function paymentLabel(t: ReturnType<typeof useTranslations<"adminPages.bookings">>, value: BookingRow["paymentStatus"]) { return value === "PAID" ? t("paymentPaid") : value === "CASH" ? t("paymentCash") : value === "REFUNDED" ? t("paymentRefunded") : t("paymentUnpaid"); }
function attendanceLabel(t: ReturnType<typeof useTranslations<"adminPages.bookings">>, value: BookingRow["attendanceStatus"]) { if (value === "ATTENDED") return t("attendanceAttended"); if (value === "NO_SHOW") return t("attendanceNoShow"); if (value === "LATE_CANCEL") return t("attendanceLateCancel"); return t("attendanceNotAttended"); }

function CalendarGrid({ rows, selectedDay, onSelect, title }: { rows: BookingRow[]; selectedDay: string; onSelect: (value: string) => void; title: string }) {
  const days = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of rows) {
      const day = row.session.startsAt.slice(0, 10);
      map.set(day, (map.get(day) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);
  return <div className="rounded-2xl border border-white/60 bg-white/70 p-4"><p className="text-sm font-medium text-sage-900">{title}</p><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">{days.map(([day, count]) => <button key={day} className={`rounded-xl border px-3 py-2 text-left ${day === selectedDay ? "border-indigo-300 bg-indigo-50" : "border-white/70 bg-white/80"}`} onClick={() => onSelect(day)}><p className="text-sm text-sage-900">{formatDateForUi(day)}</p><p className="text-xs text-sage-600">{count}</p></button>)}</div></div>;
}
function MonthlyPanel({ rows, selectedDay, onSelect, locale, title }: { rows: BookingRow[]; selectedDay: string; onSelect: (value: string) => void; locale: string; title: string }) {
  const dayRows = rows.filter((row) => row.session.startsAt.slice(0, 10) === selectedDay).sort((a, b) => a.session.startsAt.localeCompare(b.session.startsAt));
  return <div className="space-y-3"><CalendarGrid rows={rows} selectedDay={selectedDay} onSelect={onSelect} title={title} /><div className="rounded-2xl border border-white/60 bg-white/70 p-3"><p className="text-sm font-medium text-sage-900">{formatDateForUi(selectedDay)}</p><div className="mt-2 space-y-2">{dayRows.length === 0 ? <p className="text-sm text-sage-500">—</p> : dayRows.map((row) => <div key={`${row.recordType}-${row.id}`} className="rounded-xl border border-white/70 bg-white/80 px-3 py-2 text-sm"><div className="font-medium text-sage-900">{row.user.name ?? row.user.email}</div><div className="text-xs text-sage-600">{formatDateTimeForUi(row.session.startsAt, locale)} · {row.session.classType.name}</div></div>)}</div></div></div>;
}
function WeeklyPanel({ rows, selectedDay, onSelect, locale, title }: { rows: BookingRow[]; selectedDay: string; onSelect: (value: string) => void; locale: string; title: string }) {
  const selected = new Date(`${selectedDay}T00:00:00`);
  const mondayOffset = (selected.getDay() + 6) % 7;
  const monday = new Date(selected);
  monday.setDate(selected.getDate() - mondayOffset);
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    const iso = day.toISOString().slice(0, 10);
    return { iso, rows: rows.filter((row) => row.session.startsAt.slice(0, 10) === iso).sort((a, b) => a.session.startsAt.localeCompare(b.session.startsAt)) };
  });
  return <div className="rounded-2xl border border-white/60 bg-white/70 p-4"><p className="text-sm font-medium text-sage-900">{title}</p><div className="mt-3 grid gap-2 lg:grid-cols-7">{days.map((day) => <button key={day.iso} className={`rounded-xl border px-2 py-2 text-left align-top ${day.iso === selectedDay ? "border-indigo-300 bg-indigo-50" : "border-white/70 bg-white/80"}`} onClick={() => onSelect(day.iso)}><p className="text-xs font-medium text-sage-700">{formatDateForUi(day.iso)}</p><div className="mt-1 space-y-1">{day.rows.slice(0, 6).map((row) => <div key={`${row.recordType}-${row.id}`} className="rounded-md bg-white/70 px-2 py-1 text-[11px] text-sage-700">{formatDateTimeForUi(row.session.startsAt, locale).split(" ")[1]} · {row.user.name ?? row.user.email}</div>)}</div></button>)}</div></div>;
}

function UserDrawer({ userId, onClose }: { userId: string; onClose: () => void }) {
  const t = useTranslations("adminPages.bookings");
  const [data, setData] = useState<null | {
    name: string | null;
    email: string;
    phone: string | null;
    memberships?: Array<{ id: string; status: string; sessionsRemaining: number | null; plan: { name: string } }>;
    bookings?: Array<{ id: string; status: string; session: { startsAt: string; classType: { name: string } } }>;
  }>(null);
  useEffect(() => { void apiFetch(`/clients/${userId}`).then((payload) => setData(payload as { name: string | null; email: string; phone: string | null; memberships?: Array<{ id: string; status: string; sessionsRemaining: number | null; plan: { name: string } }>; bookings?: Array<{ id: string; status: string; session: { startsAt: string; classType: { name: string } } }> })).catch(() => setData(null)); }, [userId]);
  return <div className="fixed inset-0 z-40 flex justify-end bg-sage-950/35"><button className="flex-1" onClick={onClose} aria-label={t("close")} /><aside className="h-full w-full max-w-md overflow-auto bg-white p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">{t("userDetailsTitle")}</h3><button onClick={onClose}>x</button></div>{data === null ? <p className="text-sm text-sage-500">{t("emptyUserData")}</p> : <div className="space-y-3 text-sm"><div><p className="font-medium text-sage-900">{data.name ?? data.email}</p><p className="text-sage-600">{data.phone ?? "—"}</p><p className="text-sage-600">{data.email}</p></div><div><p className="text-xs uppercase text-sage-500">{t("membershipInfo")}</p><div className="mt-1 space-y-1">{(data.memberships ?? []).length === 0 ? <p className="text-sage-500">—</p> : (data.memberships ?? []).map((membership) => <p key={membership.id} className="rounded-md bg-sand-50 px-2 py-1 text-xs">{membership.plan.name} · {membership.status} · {membership.sessionsRemaining ?? "∞"}</p>)}</div></div><div><p className="text-xs uppercase text-sage-500">{t("bookingHistory")}</p><div className="mt-1 space-y-1">{(data.bookings ?? []).slice(0, 8).map((booking) => <p key={booking.id} className="rounded-md bg-white/80 px-2 py-1 text-xs">{formatDateTimeForUi(booking.session.startsAt)} · {booking.session.classType.name} · {booking.status}</p>)}</div></div></div>}</aside></div>;
}
function BookingDrawer({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const t = useTranslations("adminPages.bookings");
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
  return <div className="fixed inset-0 z-40 flex justify-end bg-sage-950/35"><button className="flex-1" onClick={onClose} aria-label={t("close")} /><aside className="h-full w-full max-w-md overflow-auto bg-white p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">{t("bookingDetailsTitle")}</h3><button onClick={onClose}>x</button></div>{data === null ? <p className="text-sm text-sage-500">{t("emptyBookingData")}</p> : <div className="space-y-2 text-sm"><p><span className="text-sage-500">{t("colUserPhone")}:</span> {data.user.name ?? data.user.email} · {data.user.phone ?? "—"}</p><p><span className="text-sage-500">{t("colClassType")}:</span> {data.session.classType.name}</p><p><span className="text-sage-500">{t("filterCoachAll")}:</span> {data.session.coach.user.name ?? "—"}</p><p><span className="text-sage-500">{t("colRegisterDate")}:</span> {formatDateForUi(data.createdAt)}</p><p><span className="text-sage-500">{t("colStatus")}:</span> {data.status}</p><p><span className="text-sage-500">{t("colPaymentStatus")}:</span> {data.paymentStatus ?? "—"}</p><p><span className="text-sage-500">{t("colAttendanceStatus")}:</span> {data.attendanceStatus ?? "—"}</p><p><span className="text-sage-500">{t("colChannel")}:</span> {data.channel === "APP" ? t("channelApp") : t("channelWebsite")}</p><div><p className="text-xs uppercase text-sage-500">{t("actionAddNote")}</p><div className="mt-1 space-y-1">{(data.notes ?? []).slice(0, 6).map((note) => <p key={note.id} className="rounded-md bg-sand-50 px-2 py-1 text-xs">{note.author.name ?? "Staff"} · {formatDateForUi(note.createdAt)} · {note.body}</p>)}</div></div></div>}</aside></div>;
}
function MoveBookingDialog({ booking, onClose, onSubmit }: { booking: BookingRow; onClose: () => void; onSubmit: (targetSessionId: string) => void }) {
  const t = useTranslations("adminPages.bookings");
  const [targetSessionId, setTargetSessionId] = useState("");
  const [options, setOptions] = useState<Array<{ id: string; startsAt: string; classType: { name: string }; coach: { user: { name: string | null } } }>>([]);
  useEffect(() => {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + 30);
    const q = `from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}&typeId=${encodeURIComponent(booking.session.classType.id)}`;
    void apiFetch(`/classes/sessions?${q}`).then((payload) => setOptions((payload as Array<{ id: string; startsAt: string; classType: { name: string }; coach: { user: { name: string | null } } }>).filter((row) => row.id !== booking.session.id))).catch(() => setOptions([]));
  }, [booking.session.classType.id, booking.session.id]);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-sage-950/35 p-4"><div className="w-full max-w-lg rounded-2xl border border-white/60 bg-white p-4"><h3 className="text-base font-semibold text-sage-900">{t("actionMove")}</h3><p className="mt-1 text-sm text-sage-600">{booking.user.name ?? booking.user.email} · {booking.session.classType.name}</p><select className="ommm-input mt-3 h-10 w-full" value={targetSessionId} onChange={(event) => setTargetSessionId(event.target.value)}><option value="">{t("selectClassSlot")}</option>{options.map((row) => <option key={row.id} value={row.id}>{formatDateTimeForUi(row.startsAt)} · {row.classType.name} · {row.coach.user.name ?? "—"}</option>)}</select>{options.length === 0 ? <p className="mt-2 text-xs text-sage-500">{t("emptyMoveOptions")}</p> : null}<div className="mt-4 flex justify-end gap-2"><OmmButton size="sm" variant="ghost" onClick={onClose}>{t("close")}</OmmButton><OmmButton size="sm" variant="primary" disabled={targetSessionId === ""} onClick={() => onSubmit(targetSessionId)}>{t("actionMove")}</OmmButton></div></div></div>;
}
