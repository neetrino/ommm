"use client";

import { createPortal } from "react-dom";
import { useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminClassForm } from "@/components/admin/admin-class-form";
import {
  type AdminClassCoachOption,
  type AdminClassSessionRow,
  type AdminClassTypeOption,
} from "@/components/admin/admin-classes-types";
import { ClassesFilters } from "@/components/admin/classes/classes-filters";
import { ClassesSummaryCards } from "@/components/admin/classes/classes-summary-cards";
import { ClassesTable } from "@/components/admin/classes/classes-table";
import { OmmButton } from "@/components/ui/omm-button";

type ModalState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit" | "duplicate"; item: AdminClassSessionRow };

type ConfirmState =
  | { mode: "closed" }
  | { mode: "cancel"; id: string }
  | { mode: "activate"; id: string };

type AdminClassesManagementProps = {
  locale: string;
  initialSessions: readonly AdminClassSessionRow[];
  classTypes: readonly AdminClassTypeOption[];
  coaches: readonly AdminClassCoachOption[];
};

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
  const [confirm, setConfirm] = useState<ConfirmState>({ mode: "closed" });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [coachFilter, setCoachFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [fromDateFilter, setFromDateFilter] = useState("");
  const [toDateFilter, setToDateFilter] = useState("");
  const titleId = useId();
  const descId = useId();
  const confirmTitleId = useId();
  const confirmDescId = useId();

  const levelOptions = useMemo(
    () => Array.from(new Set(sessions.map((row) => row.level).filter((value): value is string => !!value))).sort((a, b) => a.localeCompare(b)),
    [sessions],
  );

  const filtered = useMemo(
    () =>
      sessions.filter((row) => {
        if (searchQuery.trim().length > 0) {
          const query = searchQuery.trim().toLocaleLowerCase();
          const searchPool = `${row.title} ${row.coach.user.name ?? ""} ${row.classType.name} ${row.classFormat ?? ""}`.toLocaleLowerCase();
          if (!searchPool.includes(query)) return false;
        }
        if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
        if (coachFilter !== "ALL" && row.coach.id !== coachFilter) return false;
        if (typeFilter !== "ALL" && row.classType.id !== typeFilter) return false;
        if (levelFilter !== "ALL" && (row.level ?? "") !== levelFilter) return false;
        if (fromDateFilter.length > 0) {
          const startsAtDate = new Date(row.startsAt);
          const fromDate = new Date(fromDateFilter);
          fromDate.setHours(0, 0, 0, 0);
          if (startsAtDate < fromDate) return false;
        }
        if (toDateFilter.length > 0) {
          const startsAtDate = new Date(row.startsAt);
          const toDate = new Date(toDateFilter);
          toDate.setHours(23, 59, 59, 999);
          if (startsAtDate > toDate) return false;
        }
        return true;
      }),
    [sessions, searchQuery, statusFilter, coachFilter, typeFilter, levelFilter, fromDateFilter, toDateFilter],
  );

  function upsertSession(next: AdminClassSessionRow): void {
    setSessions((prev) => {
      const exists = prev.some((row) => row.id === next.id);
      if (!exists) return [next, ...prev].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
      return prev.map((row) => (row.id === next.id ? next : row));
    });
  }

  async function cancelSession(id: string) {
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

  async function activateSession(id: string) {
    setBusyId(id);
    setBanner(null);
    try {
      const updated = await apiFetch<AdminClassSessionRow>(`/classes/sessions/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ status: "ACTIVE" }),
      });
      upsertSession(updated);
      setBanner(t("messages.activateSuccess"));
    } catch (error) {
      setBanner(error instanceof ApiError ? error.message : t("messages.genericError"));
    } finally {
      setBusyId(null);
    }
  }

  async function runConfirmAction() {
    if (confirm.mode === "closed") return;
    const id = confirm.id;
    setConfirm({ mode: "closed" });
    if (confirm.mode === "cancel") {
      await cancelSession(id);
      return;
    }
    await activateSession(id);
  }

  const modalTitle =
    modal.mode === "edit" ? t("editTitle") : modal.mode === "duplicate" ? t("duplicateTitle") : t("createTitle");
  const modalLead =
    modal.mode === "edit" ? t("editDescription") : modal.mode === "duplicate" ? t("duplicateDescription") : t("createDescription");

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    statusFilter !== "ALL" ||
    coachFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    levelFilter !== "ALL" ||
    fromDateFilter.length > 0 ||
    toDateFilter.length > 0;

  const summary = useMemo(() => {
    const total = sessions.length;
    let active = 0;
    let upcoming = 0;
    let full = 0;
    let cancelled = 0;
    let draft = 0;

    for (const row of sessions) {
      if (row.status === "ACTIVE") active += 1;
      if (row.status === "CANCELLED") cancelled += 1;
      if (row.status === "DRAFT") draft += 1;
      if (row.status === "FULL" || row._count.bookings >= row.capacity) full += 1;
      if (row.status === "ACTIVE" || row.status === "FULL") upcoming += 1;
    }

    return { total, active, upcoming, full, cancelled, draft };
  }, [sessions]);

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter("ALL");
    setCoachFilter("ALL");
    setTypeFilter("ALL");
    setLevelFilter("ALL");
    setFromDateFilter("");
    setToDateFilter("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="ommm-card flex flex-col gap-5 p-5 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
        {banner ? <p className="rounded-2xl border border-mint-200/80 bg-mint-50/90 px-4 py-3 text-sm text-sage-800">{banner}</p> : null}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className={adminChrome.sectionTitle}>{t("managementTitle")}</h2>
            <p className="ommm-body-muted mt-2 text-sm sm:text-base">{t("managementDescription")}</p>
          </div>
          <OmmButton type="button" variant="primary" size="md" onClick={() => setModal({ mode: "create" })} className="inline-flex items-center gap-2" disabled={coaches.length === 0 || classTypes.length === 0}>
            <AddClassGlyph className="h-5 w-5 shrink-0" />
            {t("addClassButton")}
          </OmmButton>
        </header>

        <ClassesSummaryCards {...summary} />

        <ClassesFilters
          search={searchQuery}
          status={statusFilter}
          coachId={coachFilter}
          typeId={typeFilter}
          level={levelFilter}
          fromDate={fromDateFilter}
          toDate={toDateFilter}
          levels={levelOptions}
          coaches={coaches}
          classTypes={classTypes}
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onCoachChange={setCoachFilter}
          onTypeChange={setTypeFilter}
          onLevelChange={setLevelFilter}
          onFromDateChange={setFromDateFilter}
          onToDateChange={setToDateFilter}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {coaches.length === 0 ? (
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
            {t("emptyCoaches")}
          </div>
        ) : null}

        <ClassesTable
          locale={locale}
          sessions={filtered}
          hasFilters={hasActiveFilters}
          refreshing={isRefreshing}
          busyId={busyId}
          onCreate={() => setModal({ mode: "create" })}
          onEdit={(row) => setModal({ mode: "edit", item: row })}
          onCancel={(id) => {
            setConfirm({ mode: "cancel", id });
          }}
          onActivate={(id) => {
            setConfirm({ mode: "activate", id });
          }}
          onDuplicate={(row) => setModal({ mode: "duplicate", item: row })}
          onResetFilters={resetFilters}
        />
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
                    setIsRefreshing(true);
                    try {
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
                    } catch (error) {
                      setBanner(error instanceof ApiError ? error.message : t("messages.genericError"));
                    } finally {
                      setIsRefreshing(false);
                    }
                  }}
                />
              </div>
            </div>,
            document.body,
          )
        : null}

      {confirm.mode !== "closed" && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[95] flex items-end justify-center p-0 sm:items-center sm:p-4" role="presentation">
              <button
                type="button"
                className="absolute inset-0 z-0 bg-sage-950/45 backdrop-blur-[2px]"
                aria-label={t("modalBackdropClose")}
                onClick={() => setConfirm({ mode: "closed" })}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={confirmTitleId}
                aria-describedby={confirmDescId}
                className="relative z-10 mt-auto w-full max-w-md rounded-t-[24px] border border-white/60 bg-white/90 p-5 shadow-[0_24px_60px_-28px_rgba(45,40,35,0.35)] backdrop-blur-md sm:mt-0 sm:rounded-[24px]"
              >
                <h3 id={confirmTitleId} className={adminChrome.panelHeading}>
                  {confirm.mode === "cancel" ? t("confirm.cancelTitle") : t("confirm.activateTitle")}
                </h3>
                <p id={confirmDescId} className="ommm-body-muted mt-2 text-sm">
                  {confirm.mode === "cancel" ? t("confirm.cancelDescription") : t("confirm.activateDescription")}
                </p>
                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <OmmButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setConfirm({ mode: "closed" })}
                    disabled={busyId === confirm.id}
                  >
                    {t("cancelButton")}
                  </OmmButton>
                  <OmmButton
                    type="button"
                    variant={confirm.mode === "cancel" ? "danger" : "primary"}
                    size="sm"
                    onClick={() => {
                      void runConfirmAction();
                    }}
                    disabled={busyId === confirm.id}
                  >
                    {confirm.mode === "cancel" ? t("cancelAction") : t("activateAction")}
                  </OmmButton>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
