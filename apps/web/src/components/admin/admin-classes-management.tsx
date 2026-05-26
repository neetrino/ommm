"use client";

import { createPortal } from "react-dom";
import { useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminClassForm } from "@/components/admin/admin-class-form";
import {
  CLASS_STATUS_VALUES,
  type AdminClassCoachOption,
  type AdminClassSessionRow,
  type AdminClassTypeOption,
  type ClassStatusValue,
} from "@/components/admin/admin-classes-types";
import { OmmButton } from "@/components/ui/omm-button";

type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit" | "duplicate"; item: AdminClassSessionRow };

type AdminClassesManagementProps = {
  locale: string;
  initialSessions: readonly AdminClassSessionRow[];
  classTypes: readonly AdminClassTypeOption[];
  coaches: readonly AdminClassCoachOption[];
};

function statusBadgeClass(status: ClassStatusValue): string {
  if (status === "ACTIVE") return "border-mint-200/80 bg-mint-50/90 text-sage-800";
  if (status === "FULL") return "border-amber-200/80 bg-amber-50/90 text-amber-800";
  if (status === "CANCELLED") return "border-red-200/80 bg-red-50/90 text-red-800";
  return "border-sand-300/80 bg-sand-100/80 text-sage-700";
}

function AddClassGlyph({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.65} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4m8-4v4M12 11v6m3-3H9" />
    </svg>
  );
}

export function AdminClassesManagement({
  locale,
  initialSessions,
  classTypes,
  coaches,
}: AdminClassesManagementProps) {
  const t = useTranslations("adminPages.classes");
  const [sessions, setSessions] = useState<AdminClassSessionRow[]>(() => [...initialSessions]);
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [banner, setBanner] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [coachFilter, setCoachFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const titleId = useId();
  const descId = useId();

  const levelOptions = useMemo(
    () => Array.from(new Set(sessions.map((row) => row.level).filter((value): value is string => !!value))).sort((a, b) => a.localeCompare(b)),
    [sessions],
  );

  const filtered = useMemo(
    () =>
      sessions.filter((row) => {
        if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
        if (coachFilter !== "ALL" && row.coach.id !== coachFilter) return false;
        if (typeFilter !== "ALL" && row.classType.id !== typeFilter) return false;
        if (levelFilter !== "ALL" && (row.level ?? "") !== levelFilter) return false;
        if (dateFilter.length > 0) {
          const date = new Date(row.startsAt);
          const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;
          if (key !== dateFilter) return false;
        }
        return true;
      }),
    [sessions, statusFilter, coachFilter, typeFilter, levelFilter, dateFilter],
  );

  function upsertSession(next: AdminClassSessionRow): void {
    setSessions((prev) => {
      const exists = prev.some((row) => row.id === next.id);
      if (!exists) return [next, ...prev].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
      return prev.map((row) => (row.id === next.id ? next : row));
    });
  }

  async function cancelSession(id: string) {
    if (!window.confirm(t("confirmCancel"))) return;
    setBusyId(id);
    setBanner(null);
    try {
      const updated = await apiFetch<AdminClassSessionRow>(`/classes/sessions/${id}/cancel`, {
        method: "POST",
      });
      upsertSession(updated);
      setBanner(t("messages.cancelSuccess"));
    } catch (error) {
      setBanner(error instanceof ApiError ? error.message : t("messages.genericError"));
    } finally {
      setBusyId(null);
    }
  }

  const modalTitle =
    modal.mode === "edit" ? t("editTitle") : modal.mode === "duplicate" ? t("duplicateTitle") : t("createTitle");
  const modalLead =
    modal.mode === "edit" ? t("editDescription") : modal.mode === "duplicate" ? t("duplicateDescription") : t("createDescription");

  return (
    <div className="flex flex-col gap-6">
      <div className="ommm-card flex flex-col gap-5 p-5 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
        {banner ? <p className="rounded-2xl border border-mint-200/80 bg-mint-50/90 px-4 py-3 text-sm text-sage-800">{banner}</p> : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select className="ommm-input h-10 min-w-[8rem] py-0 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="ALL">{t("filters.allStatuses")}</option>
              {CLASS_STATUS_VALUES.map((value) => <option key={value} value={value}>{t(`status.${value}`)}</option>)}
            </select>
            <select className="ommm-input h-10 min-w-[8rem] py-0 text-sm" value={coachFilter} onChange={(event) => setCoachFilter(event.target.value)}>
              <option value="ALL">{t("filters.allCoaches")}</option>
              {coaches.map((coach) => <option key={coach.id} value={coach.id}>{coach.name}</option>)}
            </select>
            <select className="ommm-input h-10 min-w-[8rem] py-0 text-sm" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="ALL">{t("filters.allTypes")}</option>
              {classTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
            </select>
            <select className="ommm-input h-10 min-w-[8rem] py-0 text-sm" value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}>
              <option value="ALL">{t("filters.allLevels")}</option>
              {levelOptions.map((level) => <option key={level} value={level}>{level}</option>)}
            </select>
            <input type="date" className="ommm-input h-10 py-0 text-sm" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
          </div>
          <OmmButton type="button" variant="secondary" size="md" onClick={() => setModal({ mode: "create" })} className="inline-flex items-center gap-2" disabled={coaches.length === 0 || classTypes.length === 0}>
            <AddClassGlyph className="h-5 w-5 shrink-0" />
            {t("addClassButton")}
          </OmmButton>
        </div>

        {coaches.length === 0 ? <p className="app-alert-warn text-sm">{t("emptyCoaches")}</p> : null}

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
              {filtered.length === 0 ? (
                <tr className={adminChrome.tr}><td className={adminChrome.tdMuted} colSpan={10}>{t("emptySessions")}</td></tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className={adminChrome.tr}>
                    <td className={adminChrome.tdStrong}>{row.title}</td>
                    <td className={adminChrome.td}>{new Date(row.startsAt).toLocaleDateString(locale)}</td>
                    <td className={adminChrome.td}>{new Date(row.startsAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })} - {new Date(row.endsAt).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className={adminChrome.td}>{row.coach.user.name ?? "—"}</td>
                    <td className={adminChrome.td}>{row._count.bookings}/{row.capacity}</td>
                    <td className={adminChrome.td}>{row.level ?? "—"}</td>
                    <td className={adminChrome.td}>{row.classType.name}</td>
                    <td className={adminChrome.td}>{row.sessionRequirement ? t("sessionsRequired", { count: row.sessionRequirement }) : t("priceAmount", { amount: (row.priceCents / 100).toFixed(2) })}</td>
                    <td className={adminChrome.td}><span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusBadgeClass(row.status)}`}>{t(`status.${row.status}`)}</span></td>
                    <td className={adminChrome.td}>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="rounded-md border border-white/60 bg-white/70 px-2 py-1 text-xs text-sage-800" onClick={() => setModal({ mode: "edit", item: row })}>{t("editButton")}</button>
                        <button type="button" className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-800" onClick={() => { void cancelSession(row.id); }} disabled={busyId === row.id}>{t("cancelAction")}</button>
                        <button type="button" className="rounded-md border border-sand-300 px-2 py-1 text-xs text-sage-800" onClick={() => setModal({ mode: "duplicate", item: row })}>{t("duplicateButton")}</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal.mode !== "closed" && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4" role="presentation">
              <button type="button" className="absolute inset-0 z-0 bg-sage-950/45 backdrop-blur-[2px]" aria-label={t("modalBackdropClose")} onClick={() => setModal({ mode: "closed" })} />
              <div role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId} className="relative z-10 mt-auto max-h-[min(92vh,760px)] w-full max-w-3xl overflow-y-auto rounded-t-[28px] border border-white/60 bg-white/85 p-5 shadow-[0_24px_60px_-28px_rgba(45,40,35,0.35)] backdrop-blur-md sm:mt-0 sm:rounded-[24px] sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 id={titleId} className={adminChrome.panelHeading}>{modalTitle}</h2>
                    <p id={descId} className="ommm-body-muted mt-1 text-sm">{modalLead}</p>
                  </div>
                  <button type="button" className="rounded-full p-2 text-sage-500 hover:bg-white/60 hover:text-sage-900" aria-label={t("modalCloseAria")} onClick={() => setModal({ mode: "closed" })}>✕</button>
                </div>
                <AdminClassForm
                  mode={modal.mode}
                  classTypes={classTypes}
                  coaches={coaches}
                  item={modal.mode === "create" ? undefined : modal.item}
                  onCancel={() => setModal({ mode: "closed" })}
                  onSaved={async () => {
                    const latest = await apiFetch<AdminClassSessionRow[]>("/classes/admin/sessions");
                    setSessions(latest);
                    setBanner(
                      modal.mode === "edit"
                        ? t("messages.updateSuccess")
                        : modal.mode === "duplicate"
                          ? t("messages.duplicateSuccess")
                          : t("messages.createSuccess"),
                    );
                    setModal({ mode: "closed" });
                  }}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
