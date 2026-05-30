"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { OmmButton } from "@/components/ui/omm-button";
import { PlusIcon } from "@/components/ui/plus-icon";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateForUi, formatDateTimeForUi } from "@/lib/date-display";

type SessionStatus = "ACTIVE" | "CANCELLED" | "FULL" | "DRAFT";
type ScheduleView = "list" | "monthly" | "weekly" | "daily";
type AvailabilityFilter = "all" | "available" | "full";
type TimeOfDayFilter = "all" | "morning" | "afternoon" | "evening";

export type AdminScheduleSession = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  level: string | null;
  classFormat: string | null;
  status: SessionStatus;
  classType: { id: string; name: string };
  coach: { id: string; user: { name: string | null } };
  _count: { bookings: number };
};

export type AdminScheduleClassType = {
  id: string;
  name: string;
  slug: string;
};

export type AdminScheduleCoach = {
  id: string;
  isActive: boolean;
  user: { name: string | null; lastName: string | null; email: string };
};

type Props = {
  locale: string;
  sessions: AdminScheduleSession[];
  classTypes: AdminScheduleClassType[];
  coaches: AdminScheduleCoach[];
};

type Filters = {
  q: string;
  from: string;
  to: string;
  coachId: string;
  typeId: string;
  level: string;
  status: "" | SessionStatus;
  availability: AvailabilityFilter;
  timeOfDay: TimeOfDayFilter;
};

type FormState = {
  title: string;
  description: string;
  classTypeId: string;
  coachId: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: string;
  level: string;
  status: SessionStatus;
};

const STATUS_OPTIONS: readonly SessionStatus[] = ["DRAFT", "ACTIVE", "FULL", "CANCELLED"];
const SEARCH_DEBOUNCE_MS = 300;

function isoDate(value: Date | string): string {
  return new Date(value).toISOString().slice(0, 10);
}

function timeValue(value: Date | string): string {
  return new Date(value).toTimeString().slice(0, 5);
}

function coachName(coach: AdminScheduleCoach | AdminScheduleSession["coach"]): string {
  if ("lastName" in coach.user) {
    return [coach.user.name, coach.user.lastName].filter(Boolean).join(" ") || coach.user.email;
  }
  return coach.user.name ?? "—";
}

function durationMinutes(row: AdminScheduleSession): number {
  return Math.max(0, Math.round((new Date(row.endsAt).getTime() - new Date(row.startsAt).getTime()) / 60000));
}

function spotsLeft(row: AdminScheduleSession): number {
  return Math.max(row.capacity - row._count.bookings, 0);
}

function initialFilters(): Filters {
  return {
    q: "",
    from: "",
    to: "",
    coachId: "",
    typeId: "",
    level: "",
    status: "",
    availability: "all",
    timeOfDay: "all",
  };
}

function initialForm(
  classTypes: readonly AdminScheduleClassType[],
  coaches: readonly AdminScheduleCoach[],
  row?: AdminScheduleSession,
): FormState {
  const start = row ? new Date(row.startsAt) : new Date();
  const end = row ? new Date(row.endsAt) : new Date(start.getTime() + 60 * 60000);
  return {
    title: row?.title ?? "",
    description: row?.description ?? "",
    classTypeId: row?.classType.id ?? classTypes[0]?.id ?? "",
    coachId: row?.coach.id ?? coaches[0]?.id ?? "",
    date: isoDate(start),
    startTime: timeValue(start),
    endTime: timeValue(end),
    capacity: String(row?.capacity ?? 10),
    level: row?.level ?? "",
    status: row?.status ?? "DRAFT",
  };
}

function formPayload(form: FormState) {
  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    classTypeId: form.classTypeId,
    coachId: form.coachId,
    startsAt: new Date(`${form.date}T${form.startTime}:00`).toISOString(),
    endsAt: new Date(`${form.date}T${form.endTime}:00`).toISOString(),
    capacity: Number(form.capacity),
    level: form.level.trim() || undefined,
    status: form.status,
  };
}

function matchesTimeOfDay(row: AdminScheduleSession, filter: TimeOfDayFilter): boolean {
  if (filter === "all") return true;
  const hour = new Date(row.startsAt).getHours();
  if (filter === "morning") return hour < 12;
  if (filter === "afternoon") return hour >= 12 && hour < 17;
  return hour >= 17;
}

export function AdminScheduleManagement({ locale, sessions, classTypes, coaches }: Props) {
  const t = useTranslations("adminPages.classes");
  const router = useRouter();
  const [rows, setRows] = useState(sessions);
  const [view, setView] = useState<ScheduleView>("list");
  const [filters, setFilters] = useState<Filters>(() => initialFilters());
  const [searchDraft, setSearchDraft] = useState("");
  const [selectedDay, setSelectedDay] = useState(() => isoDate(new Date()));
  const [editing, setEditing] = useState<AdminScheduleSession | "create" | null>(null);
  const [details, setDetails] = useState<AdminScheduleSession | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setFilters((current) => ({ ...current, q: searchDraft }));
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchDraft]);

  const levels = useMemo(() => {
    return Array.from(
      new Set(rows.map((row) => row.level).filter((level): level is string => level !== null)),
    ).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return rows.filter((row) => {
      if (q && !`${row.title} ${row.classType.name} ${coachName(row.coach)}`.toLowerCase().includes(q)) return false;
      if (filters.from && row.startsAt.slice(0, 10) < filters.from) return false;
      if (filters.to && row.startsAt.slice(0, 10) > filters.to) return false;
      if (filters.coachId && row.coach.id !== filters.coachId) return false;
      if (filters.typeId && row.classType.id !== filters.typeId) return false;
      if (filters.level && row.level !== filters.level) return false;
      if (filters.status && row.status !== filters.status) return false;
      if (filters.availability === "available" && spotsLeft(row) <= 0) return false;
      if (filters.availability === "full" && spotsLeft(row) > 0) return false;
      return matchesTimeOfDay(row, filters.timeOfDay);
    });
  }, [filters, rows]);

  const summary = useMemo(() => {
    const now = new Date();
    return {
      total: filteredRows.length,
      active: filteredRows.filter((row) => row.status === "ACTIVE").length,
      upcoming: filteredRows.filter((row) => new Date(row.startsAt) >= now).length,
      full: filteredRows.filter((row) => spotsLeft(row) === 0).length,
      cancelled: filteredRows.filter((row) => row.status === "CANCELLED").length,
      draft: filteredRows.filter((row) => row.status === "DRAFT").length,
    };
  }, [filteredRows]);

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setSearchDraft("");
    setFilters(initialFilters());
  }

  async function runRowAction(row: AdminScheduleSession, action: () => Promise<AdminScheduleSession | void>, ok: string) {
    setBusyId(row.id);
    setMessage(null);
    try {
      const updated = await action();
      if (updated) setRows((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setMessage(ok);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t("messages.genericError"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <SummaryGrid summary={summary} />
      <FiltersPanel
        values={filters}
        searchDraft={searchDraft}
        classTypes={classTypes}
        coaches={coaches}
        levels={levels}
        onSearch={setSearchDraft}
        onChange={updateFilter}
        onReset={resetFilters}
      />
      <ViewToolbar view={view} onView={setView} onCreate={() => setEditing("create")} />
      {message ? <div className="rounded-xl border border-sand-500/30 bg-white/70 p-3 text-sm text-sage-900">{message}</div> : null}
      <ScheduleViews
        locale={locale}
        view={view}
        rows={filteredRows}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        onDetails={setDetails}
        onEdit={setEditing}
        busyId={busyId}
        onCancel={(row) => {
          if (window.confirm(t("confirmCancel"))) {
            void runRowAction(row, () => apiFetch(`/classes/sessions/${row.id}/status`, { method: "POST", body: JSON.stringify({ status: "CANCELLED" }) }), t("messages.cancelSuccess"));
          }
        }}
        onActivate={(row) => {
          if (window.confirm(t("confirmActivate"))) {
            void runRowAction(row, () => apiFetch(`/classes/sessions/${row.id}/status`, { method: "POST", body: JSON.stringify({ status: "ACTIVE" }) }), t("messages.activateSuccess"));
          }
        }}
        onDelete={(row) => {
          if (window.confirm(t("deleteConfirm"))) {
            void runRowAction(row, async () => {
              await apiFetch(`/classes/sessions/${row.id}`, { method: "DELETE" });
              setRows((current) => current.filter((item) => item.id !== row.id));
            }, t("messages.deleteSuccess"));
          }
        }}
        onDuplicate={(row) => setEditing({ ...row, id: "" })}
      />
      {editing ? (
        <SessionModal
          mode={editing === "create" ? "create" : editing.id === "" ? "duplicate" : "edit"}
          row={editing === "create" ? undefined : editing}
          classTypes={classTypes}
          coaches={coaches}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setRows((current) => (current.some((row) => row.id === saved.id) ? current.map((row) => (row.id === saved.id ? saved : row)) : [...current, saved]));
            setMessage(editing === "create" ? t("messages.createSuccess") : editing.id === "" ? t("messages.duplicateSuccess") : t("messages.updateSuccess"));
            setEditing(null);
            router.refresh();
          }}
        />
      ) : null}
      {details ? <DetailsDrawer locale={locale} row={details} onClose={() => setDetails(null)} /> : null}
    </div>
  );
}

function SummaryGrid({ summary }: { summary: Record<"total" | "active" | "upcoming" | "full" | "cancelled" | "draft", number> }) {
  const t = useTranslations("adminPages.classes.summary");
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {(["total", "active", "upcoming", "full", "cancelled", "draft"] as const).map((key) => (
        <div key={key} className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t(key)}</p>
          <p className={adminChrome.metricValue}>{summary[key]}</p>
        </div>
      ))}
    </div>
  );
}

function FiltersPanel(props: {
  values: Filters;
  searchDraft: string;
  classTypes: readonly AdminScheduleClassType[];
  coaches: readonly AdminScheduleCoach[];
  levels: readonly string[];
  onSearch: (value: string) => void;
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onReset: () => void;
}) {
  const t = useTranslations("adminPages.classes");
  const activeCount = Object.values(props.values).filter((value) => value !== "" && value !== "all").length;
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-3">
      <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
        <input className="ommm-input h-10 md:col-span-2" value={props.searchDraft} placeholder={t("filters.searchPlaceholder")} onChange={(event) => props.onSearch(event.target.value)} aria-label={t("filters.searchLabel")} />
        <DatePickerInput name="from" value={props.values.from} onChange={(value) => props.onChange("from", value)} placeholder={t("filters.fromDateLabel")} ariaLabel={t("filters.fromDateLabel")} />
        <DatePickerInput name="to" value={props.values.to} onChange={(value) => props.onChange("to", value)} placeholder={t("filters.toDateLabel")} ariaLabel={t("filters.toDateLabel")} />
        <Select value={props.values.coachId} label={t("filters.coachLabel")} onChange={(value) => props.onChange("coachId", value)} options={props.coaches.map((coach) => ({ value: coach.id, label: coachName(coach) }))} empty={t("filters.allCoaches")} />
        <Select value={props.values.typeId} label={t("filters.typeLabel")} onChange={(value) => props.onChange("typeId", value)} options={props.classTypes.map((type) => ({ value: type.id, label: type.name }))} empty={t("filters.allTypes")} />
        <Select value={props.values.level} label={t("filters.levelLabel")} onChange={(value) => props.onChange("level", value)} options={props.levels.map((level) => ({ value: level, label: level }))} empty={t("filters.allLevels")} />
        <Select value={props.values.status} label={t("filters.statusLabel")} onChange={(value) => props.onChange("status", value as Filters["status"])} options={STATUS_OPTIONS.map((status) => ({ value: status, label: t(`status.${status}`) }))} empty={t("filters.allStatuses")} />
        <Select value={props.values.availability} label={t("filters.availabilityLabel")} onChange={(value) => props.onChange("availability", value as AvailabilityFilter)} options={[{ value: "available", label: t("filters.availableOnly") }, { value: "full", label: t("filters.fullOnly") }]} empty={t("filters.allAvailability")} />
        <Select value={props.values.timeOfDay} label={t("filters.timeOfDayLabel")} onChange={(value) => props.onChange("timeOfDay", value as TimeOfDayFilter)} options={[{ value: "morning", label: t("filters.morning") }, { value: "afternoon", label: t("filters.afternoon") }, { value: "evening", label: t("filters.evening") }]} empty={t("filters.allTimes")} />
      </div>
      <QuickFilters values={props.values} onChange={props.onChange} onReset={props.onReset} activeCount={activeCount} />
    </div>
  );
}

function QuickFilters({ values, onChange, onReset, activeCount }: { values: Filters; onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void; onReset: () => void; activeCount: number }) {
  const t = useTranslations("adminPages.classes");
  const today = isoDate(new Date());
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <OmmButton size="sm" variant={values.from === today && values.to === today ? "primary" : "ghost"} onClick={() => { onChange("from", today); onChange("to", today); }}>{t("quick.today")}</OmmButton>
      <OmmButton size="sm" variant={values.from === today && values.to === isoDate(weekEnd) ? "primary" : "ghost"} onClick={() => { onChange("from", today); onChange("to", isoDate(weekEnd)); }}>{t("quick.thisWeek")}</OmmButton>
      <OmmButton size="sm" variant={values.availability === "available" ? "primary" : "ghost"} onClick={() => onChange("availability", values.availability === "available" ? "all" : "available")}>{t("quick.available")}</OmmButton>
      <OmmButton size="sm" variant={values.availability === "full" ? "primary" : "ghost"} onClick={() => onChange("availability", values.availability === "full" ? "all" : "full")}>{t("quick.full")}</OmmButton>
      <OmmButton size="sm" variant={values.status === "CANCELLED" ? "primary" : "ghost"} onClick={() => onChange("status", values.status === "CANCELLED" ? "" : "CANCELLED")}>{t("quick.cancelled")}</OmmButton>
      <OmmButton size="sm" variant={values.level.toLowerCase() === "beginner" ? "primary" : "ghost"} onClick={() => onChange("level", values.level.toLowerCase() === "beginner" ? "" : "Beginner")}>{t("quick.beginner")}</OmmButton>
      <OmmButton size="sm" variant={values.timeOfDay === "evening" ? "primary" : "ghost"} onClick={() => onChange("timeOfDay", values.timeOfDay === "evening" ? "all" : "evening")}>{t("quick.evening")}</OmmButton>
      <OmmButton size="sm" variant="subtle" onClick={onReset}>{t("filters.reset")}</OmmButton>
      <p className="text-xs text-sage-500">{t("filters.activeCount", { count: activeCount })}</p>
    </div>
  );
}

function Select({ value, label, options, empty, onChange }: { value: string; label: string; options: Array<{ value: string; label: string }>; empty: string; onChange: (value: string) => void }) {
  return (
    <select className="ommm-input h-10" value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}>
      <option value="">{empty}</option>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  );
}

function ViewToolbar({ view, onView, onCreate }: { view: ScheduleView; onView: (view: ScheduleView) => void; onCreate: () => void }) {
  const t = useTranslations("adminPages.classes");
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {(["list", "monthly", "weekly", "daily"] as const).map((next) => (
          <OmmButton key={next} size="sm" variant={view === next ? "primary" : "ghost"} onClick={() => onView(next)}>{t(`views.${next}`)}</OmmButton>
        ))}
      </div>
      <OmmButton size="md" variant="secondary" onClick={onCreate} className="gap-2">
        <PlusIcon className="h-4 w-4 shrink-0" />
        {t("addClassButton")}
      </OmmButton>
    </div>
  );
}

function ScheduleViews(props: {
  locale: string;
  view: ScheduleView;
  rows: AdminScheduleSession[];
  selectedDay: string;
  busyId: string | null;
  onSelectDay: (day: string) => void;
  onDetails: (row: AdminScheduleSession) => void;
  onEdit: (row: AdminScheduleSession) => void;
  onCancel: (row: AdminScheduleSession) => void;
  onActivate: (row: AdminScheduleSession) => void;
  onDelete: (row: AdminScheduleSession) => void;
  onDuplicate: (row: AdminScheduleSession) => void;
}) {
  if (props.view === "monthly") return <MonthlyPanel {...props} />;
  if (props.view === "weekly") return <WeeklyPanel {...props} />;
  const rows = props.view === "daily" ? props.rows.filter((row) => row.startsAt.slice(0, 10) === props.selectedDay) : props.rows;
  return <SessionTable {...props} rows={rows} />;
}

function SessionTable(props: Omit<Parameters<typeof ScheduleViews>[0], "view">) {
  const t = useTranslations("adminPages.classes");
  const rows = [...props.rows].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  if (rows.length === 0) {
    return <div className={adminChrome.panel}><p className="font-medium text-sage-900">{t("empty.filteredTitle")}</p><p className="mt-1 text-sm text-sage-600">{t("empty.filteredBody")}</p></div>;
  }
  return (
    <div className="rounded-[24px] border border-white/60 bg-white/55 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md">
      <table className="w-full table-fixed border-collapse text-left text-xs sm:text-sm">
        <colgroup>
          <col className="w-[17%]" />
          <col className="w-[12%]" />
          <col className="w-[9%]" />
          <col className="w-[11%]" />
          <col className="w-[7%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
          <col className="w-[8%]" />
          <col className="w-[8%]" />
          <col className="w-[8%]" />
        </colgroup>
        <thead className={adminChrome.thead}><tr><th className={adminChrome.th}>{t("colClass")}</th><th className={adminChrome.th}>{t("colType")}</th><th className={adminChrome.th}>{t("colDate")}</th><th className={adminChrome.th}>{t("colTime")}</th><th className={adminChrome.th}>{t("fields.duration")}</th><th className={adminChrome.th}>{t("colCoach")}</th><th className={adminChrome.th}>{t("colCapacity")}</th><th className={adminChrome.th}>{t("colLevel")}</th><th className={adminChrome.th}>{t("colStatus")}</th><th className={adminChrome.th}>{t("colActions")}</th></tr></thead>
        <tbody>{rows.map((row) => <SessionRow key={row.id} row={row} {...props} />)}</tbody>
      </table>
    </div>
  );
}

function SessionRow({ row, locale, busyId, onDetails, onEdit, onCancel, onActivate, onDelete, onDuplicate }: { row: AdminScheduleSession; locale: string; busyId: string | null; onDetails: (row: AdminScheduleSession) => void; onEdit: (row: AdminScheduleSession) => void; onCancel: (row: AdminScheduleSession) => void; onActivate: (row: AdminScheduleSession) => void; onDelete: (row: AdminScheduleSession) => void; onDuplicate: (row: AdminScheduleSession) => void }) {
  const t = useTranslations("adminPages.classes");
  const busy = busyId === row.id;
  return (
    <tr className={adminChrome.tr}>
      <td className={adminChrome.tdStrong}><button className="text-left underline-offset-2 hover:underline" onClick={() => onDetails(row)}>{row.title}</button></td>
      <td className={adminChrome.td}>{row.classType.name}<div className={adminChrome.metaText}>{row.classFormat ?? "—"}</div></td>
      <td className={adminChrome.td}>{formatDateForUi(row.startsAt)}</td>
      <td className={adminChrome.td}>{new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(row.startsAt))} - {new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(row.endsAt))}</td>
      <td className={adminChrome.td}>{durationMinutes(row)}m</td>
      <td className={adminChrome.td}>{coachName(row.coach)}</td>
      <td className={adminChrome.td}>{row._count.bookings}/{row.capacity}<div className={adminChrome.metaText}>{t("fields.spotsLeft", { count: spotsLeft(row) })}</div></td>
      <td className={adminChrome.tdMuted}>{row.level ?? "—"}</td>
      <td className={adminChrome.td}><Badge label={t(`status.${row.status}`)} tone={row.status === "CANCELLED" ? "sand" : row.status === "ACTIVE" ? "mint" : "slate"} /></td>
      <td className={adminChrome.td}><div className="flex flex-wrap gap-1"><OmmButton size="sm" variant="ghost" onClick={() => onDetails(row)}>{t("actions.view")}</OmmButton><OmmButton size="sm" variant="ghost" onClick={() => onEdit(row)}>{t("editButton")}</OmmButton><OmmButton size="sm" variant="subtle" onClick={() => onDuplicate(row)}>{t("duplicateButton")}</OmmButton>{row.status === "CANCELLED" ? <OmmButton size="sm" variant="ghost" disabled={busy} onClick={() => onActivate(row)}>{t("activateAction")}</OmmButton> : <OmmButton size="sm" variant="danger" disabled={busy} onClick={() => onCancel(row)}>{t("cancelAction")}</OmmButton>}<OmmButton size="sm" variant="danger" disabled={busy} onClick={() => onDelete(row)}>{t("actions.delete")}</OmmButton></div></td>
    </tr>
  );
}

function Badge({ label, tone }: { label: string; tone: "slate" | "sand" | "mint" }) {
  const classes = tone === "mint" ? "border-mint-200 bg-mint-50 text-sage-900" : tone === "sand" ? "border-sand-300 bg-sand-50 text-sage-900" : "border-zinc-200 bg-zinc-50 text-zinc-800";
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${classes}`}>{label}</span>;
}

function MonthlyPanel(props: Omit<Parameters<typeof ScheduleViews>[0], "view">) {
  const days = Array.from(new Set(props.rows.map((row) => row.startsAt.slice(0, 10)))).sort();
  const dayRows = props.rows.filter((row) => row.startsAt.slice(0, 10) === props.selectedDay);
  return <div className="space-y-3"><div className={adminChrome.panel}><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">{days.map((day) => <button key={day} className={`rounded-xl border px-3 py-2 text-left ${day === props.selectedDay ? "border-indigo-300 bg-indigo-50" : "border-white/70 bg-white/80"}`} onClick={() => props.onSelectDay(day)}><p className="text-sm text-sage-900">{formatDateForUi(day)}</p><p className="text-xs text-sage-600">{props.rows.filter((row) => row.startsAt.slice(0, 10) === day).length}</p></button>)}</div></div><SessionTable {...props} rows={dayRows} /></div>;
}

function WeeklyPanel(props: Omit<Parameters<typeof ScheduleViews>[0], "view">) {
  const selected = new Date(`${props.selectedDay}T00:00:00`);
  const monday = new Date(selected);
  monday.setDate(selected.getDate() - ((selected.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    const iso = day.toISOString().slice(0, 10);
    return { iso, rows: props.rows.filter((row) => row.startsAt.slice(0, 10) === iso) };
  });
  return <div className="space-y-3"><div className={adminChrome.panel}><div className="grid gap-2 lg:grid-cols-7">{days.map((day) => <button key={day.iso} className={`rounded-xl border px-2 py-2 text-left ${day.iso === props.selectedDay ? "border-indigo-300 bg-indigo-50" : "border-white/70 bg-white/80"}`} onClick={() => props.onSelectDay(day.iso)}><p className="text-xs font-medium text-sage-700">{formatDateForUi(day.iso)}</p><div className="mt-1 space-y-1">{day.rows.slice(0, 4).map((row) => <div key={row.id} className="rounded-md bg-white/70 px-2 py-1 text-[11px] text-sage-700">{timeValue(row.startsAt)} · {row.title}</div>)}</div></button>)}</div></div><SessionTable {...props} rows={props.rows.filter((row) => row.startsAt.slice(0, 10) === props.selectedDay)} /></div>;
}

function SessionModal({ mode, row, classTypes, coaches, onClose, onSaved }: { mode: "create" | "edit" | "duplicate"; row?: AdminScheduleSession; classTypes: readonly AdminScheduleClassType[]; coaches: readonly AdminScheduleCoach[]; onClose: () => void; onSaved: (row: AdminScheduleSession) => void }) {
  const t = useTranslations("adminPages.classes");
  const [form, setForm] = useState(() => initialForm(classTypes, coaches, row));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const payload = formPayload(form);
      const saved = await apiFetch<AdminScheduleSession>(mode === "edit" && row?.id ? `/classes/sessions/${row.id}` : "/classes/sessions", { method: mode === "edit" ? "PATCH" : "POST", body: JSON.stringify(payload) });
      onSaved(saved);
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : t("messages.genericError"));
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-sage-950/35 p-0 sm:items-center sm:p-4"><div className="w-full max-w-2xl rounded-t-[28px] border border-white/60 bg-white p-5 shadow-xl sm:rounded-[24px]"><div className="flex items-start justify-between gap-4"><div><h2 className={adminChrome.panelHeading}>{mode === "create" ? t("createTitle") : mode === "duplicate" ? t("duplicateTitle") : t("editTitle")}</h2><p className="ommm-body-muted mt-1 text-sm">{mode === "duplicate" ? t("duplicateDescription") : mode === "create" ? t("createDescription") : t("editDescription")}</p></div><button className="rounded-full p-2 text-sage-500 hover:bg-sand-50" onClick={onClose} aria-label={t("modalCloseAria")} type="button">x</button></div><form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={(event) => { void submit(event); }}><input className="ommm-input sm:col-span-2" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder={t("form.className")} required /><Select value={form.classTypeId} label={t("form.classType")} empty={t("filters.allTypes")} options={classTypes.map((type) => ({ value: type.id, label: type.name }))} onChange={(value) => setForm((current) => ({ ...current, classTypeId: value }))} /><Select value={form.coachId} label={t("form.coach")} empty={t("filters.allCoaches")} options={coaches.map((coach) => ({ value: coach.id, label: coachName(coach) }))} onChange={(value) => setForm((current) => ({ ...current, coachId: value }))} /><DatePickerInput name="date" value={form.date} onChange={(value) => setForm((current) => ({ ...current, date: value }))} ariaLabel={t("form.date")} required /><TimePickerInput name="startTime" value={form.startTime} onChange={(value) => setForm((current) => ({ ...current, startTime: value }))} required /><TimePickerInput name="endTime" value={form.endTime} onChange={(value) => setForm((current) => ({ ...current, endTime: value }))} required /><input className="ommm-input" type="number" min={1} value={form.capacity} onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))} placeholder={t("form.capacity")} required /><input className="ommm-input" value={form.level} onChange={(event) => setForm((current) => ({ ...current, level: event.target.value }))} placeholder={t("form.level")} /><Select value={form.status} label={t("form.status")} empty={t("filters.allStatuses")} options={STATUS_OPTIONS.map((status) => ({ value: status, label: t(`status.${status}`) }))} onChange={(value) => setForm((current) => ({ ...current, status: value as SessionStatus }))} /><textarea className="ommm-input min-h-24 sm:col-span-2" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder={t("form.description")} />{error ? <p className="app-alert-warn text-sm sm:col-span-2">{error}</p> : null}<div className="flex justify-end gap-2 sm:col-span-2"><OmmButton type="button" size="sm" variant="ghost" onClick={onClose} disabled={pending}>{t("cancelButton")}</OmmButton><OmmButton type="submit" size="sm" variant="primary" disabled={pending}>{pending ? t("savingButton") : mode === "create" ? t("createButton") : t("saveButton")}</OmmButton></div></form></div></div>
  );
}

function DetailsDrawer({ locale, row, onClose }: { locale: string; row: AdminScheduleSession; onClose: () => void }) {
  const t = useTranslations("adminPages.classes");
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-sage-950/35"><button className="flex-1" onClick={onClose} aria-label={t("modalCloseAria")} /><aside className="h-full w-full max-w-md overflow-auto bg-white p-5"><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-sage-900">{row.title}</h3><button onClick={onClose} type="button">x</button></div><div className="space-y-3 text-sm text-sage-700"><p><span className="text-sage-500">{t("colType")}:</span> {row.classType.name}</p><p><span className="text-sage-500">{t("colDate")}:</span> {formatDateTimeForUi(row.startsAt, locale)}</p><p><span className="text-sage-500">{t("form.endTime")}:</span> {formatDateTimeForUi(row.endsAt, locale)}</p><p><span className="text-sage-500">{t("fields.duration")}:</span> {durationMinutes(row)}m</p><p><span className="text-sage-500">{t("colCoach")}:</span> {coachName(row.coach)}</p><p><span className="text-sage-500">{t("colCapacity")}:</span> {row._count.bookings}/{row.capacity} · {t("fields.spotsLeft", { count: spotsLeft(row) })}</p><p><span className="text-sage-500">{t("colLevel")}:</span> {row.level ?? "—"}</p><p><span className="text-sage-500">{t("colStatus")}:</span> {t(`status.${row.status}`)}</p>{row.description ? <p><span className="text-sage-500">{t("form.description")}:</span> {row.description}</p> : null}</div></aside></div>
  );
}
