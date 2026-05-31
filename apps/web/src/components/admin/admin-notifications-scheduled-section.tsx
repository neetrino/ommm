"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import { OmmSelectDropdown, ommOptionsFromTuples } from "@/components/ui/omm-select-dropdown";
import { ApiError, apiFetch } from "@/lib/api";
import { formatDateTimeForUi } from "@/lib/date-display";
import {
  AdminScheduledBroadcastEditModal,
  toDateTimeLocalValue,
  type ScheduledEditDraft,
} from "@/components/admin/admin-scheduled-broadcast-edit-modal";
import type {
  BroadcastAudience,
  ScheduledBroadcast,
  ScheduledBroadcastStatus,
} from "./admin-notifications-types";

type Props = {
  locale: string;
  items: ScheduledBroadcast[];
  loadFailed: boolean;
  onRefresh: () => void;
};

type ScheduledQuickFilter = "" | "pending" | "failed" | "sent";

const statusOptions: Array<[ScheduledBroadcastStatus | "", string]> = [
  ["", "statusAll"],
  ["PENDING", "statusPending"],
  ["SENT", "statusSent"],
  ["FAILED", "statusFailed"],
  ["CANCELLED", "statusCancelled"],
];

const audienceOptions: Array<[BroadcastAudience | "", string]> = [
  ["", "audienceAll"],
  ["users", "audienceUsers"],
  ["coaches", "audienceCoaches"],
  ["staff", "audienceStaff"],
  ["all", "audienceAllRoles"],
];

export function AdminNotificationsScheduledSection({
  locale,
  items,
  loadFailed,
  onRefresh,
}: Props) {
  const t = useTranslations("adminPages.notifications");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ScheduledBroadcastStatus | "">("");
  const [audience, setAudience] = useState<BroadcastAudience | "">("");
  const [order, setOrder] = useState<"newest" | "oldest" | "schedule">("newest");
  const [quick, setQuick] = useState<ScheduledQuickFilter>("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<ScheduledBroadcast | null>(null);
  const [editDraft, setEditDraft] = useState<ScheduledEditDraft>({
    subject: "",
    html: "",
    audience: "users",
    onlyPromotionsOptIn: false,
    scheduleAt: "",
  });

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    let rows = items.filter((row) => {
      if (needle !== "" && !`${row.subject} ${row.html}`.toLowerCase().includes(needle)) {
        return false;
      }
      if (status !== "" && row.status !== status) {
        return false;
      }
      if (audience !== "" && row.audience !== audience) {
        return false;
      }
      if (quick === "pending" && row.status !== "PENDING") {
        return false;
      }
      if (quick === "failed" && row.status !== "FAILED") {
        return false;
      }
      if (quick === "sent" && row.status !== "SENT") {
        return false;
      }
      return true;
    });
    rows = [...rows].sort((a, b) => {
      if (order === "schedule") {
        return new Date(a.scheduleAt).getTime() - new Date(b.scheduleAt).getTime();
      }
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return order === "newest" ? bTime - aTime : aTime - bTime;
    });
    return rows;
  }, [audience, items, order, quick, search, status]);

  function resetFilters() {
    setSearch("");
    setStatus("");
    setAudience("");
    setOrder("newest");
    setQuick("");
  }

  function openEdit(row: ScheduledBroadcast) {
    setEditing(row);
    setEditDraft({
      subject: row.subject,
      html: row.html,
      audience: row.audience,
      onlyPromotionsOptIn: row.onlyPromotionsOptIn,
      scheduleAt: toDateTimeLocalValue(row.scheduleAt),
    });
    setMessage(null);
  }

  async function cancel(id: string) {
    setBusyId(id);
    setMessage(null);
    try {
      await apiFetch(`/notifications/admin/scheduled/${id}`, { method: "DELETE" });
      setMessage(t("messages.scheduleCancelled"));
      onRefresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t("messages.cancelFailed"));
    } finally {
      setBusyId(null);
    }
  }

  async function saveEdit() {
    if (!editing) {
      return;
    }
    if (editDraft.scheduleAt.trim() === "") {
      setMessage(t("messages.chooseScheduleFirst"));
      return;
    }
    setBusyId(editing.id);
    setMessage(null);
    try {
      await apiFetch(`/notifications/admin/scheduled/${editing.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          subject: editDraft.subject,
          html: editDraft.html,
          audience: editDraft.audience,
          onlyPromotionsOptIn: editDraft.onlyPromotionsOptIn,
          scheduleAt: new Date(editDraft.scheduleAt).toISOString(),
        }),
      });
      setMessage(t("messages.scheduleUpdated"));
      setEditing(null);
      onRefresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t("messages.updateFailed"));
    } finally {
      setBusyId(null);
    }
  }

  const quickFilters: Array<[ScheduledQuickFilter, string]> = [
    ["", "quickAll"],
    ["pending", "quickScheduledPending"],
    ["failed", "quickFailed"],
    ["sent", "quickSentScheduled"],
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className={adminChrome.sectionTitle}>{t("scheduledHeading")}</h2>
        <p className={adminChrome.metaText}>{t("scheduledHint")}</p>
      </div>
      {loadFailed ? <p className="app-alert-warn text-sm">{t("loadFailedScheduled")}</p> : null}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map(([value, labelKey]) => (
          <button
            key={value || "all"}
            type="button"
            className={
              quick === value
                ? "rounded-full bg-sage-800 px-3 py-1 text-xs font-medium text-white"
                : "rounded-full border border-white/60 bg-white/55 px-3 py-1 text-xs font-medium text-sage-700"
            }
            onClick={() => setQuick(value)}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="flex flex-col gap-1 xl:col-span-2">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.search")}</span>
          <input
            className="ommm-input"
            value={search}
            onChange={(ev) => setSearch(ev.target.value)}
            placeholder={t("filters.searchPlaceholder")}
            autoComplete="off"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.status")}</span>
          <OmmSelectDropdown
            ariaLabel={t("filters.status")}
            label={t(statusOptions.find(([value]) => value === status)?.[1] ?? "statusAll")}
            value={status}
            options={ommOptionsFromTuples(
              statusOptions.map(([value, labelKey]) => [value, t(labelKey)]),
            )}
            onChange={(value) => setStatus(value as ScheduledBroadcastStatus | "")}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.audience")}</span>
          <OmmSelectDropdown
            ariaLabel={t("filters.audience")}
            label={t(audienceOptions.find(([value]) => value === audience)?.[1] ?? "audienceAll")}
            value={audience}
            options={ommOptionsFromTuples(
              audienceOptions.map(([value, labelKey]) => [value, t(labelKey)]),
            )}
            onChange={(value) => setAudience(value as BroadcastAudience | "")}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.sort")}</span>
          <OmmSelectDropdown
            ariaLabel={t("filters.sort")}
            label={
              order === "schedule"
                ? t("sortSchedule")
                : order === "oldest"
                  ? t("sortOldest")
                  : t("sortNewest")
            }
            value={order}
            options={[
              { value: "newest", label: t("sortNewest") },
              { value: "oldest", label: t("sortOldest") },
              { value: "schedule", label: t("sortSchedule") },
            ]}
            onChange={(value) => setOrder(value as "newest" | "oldest" | "schedule")}
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="ommm-cta-ghost text-xs" onClick={resetFilters}>
          {t("filters.reset")}
        </button>
        <span className={adminChrome.metaText}>{t("filters.resultCount", { count: filtered.length })}</span>
      </div>
      <div className={adminChrome.tableWrap}>
        <table className={adminChrome.table}>
          <thead className={adminChrome.thead}>
            <tr>
              <th className={adminChrome.th}>{t("table.subject")}</th>
              <th className={adminChrome.th}>{t("table.audience")}</th>
              <th className={adminChrome.th}>{t("table.scheduledFor")}</th>
              <th className={adminChrome.th}>{t("table.status")}</th>
              <th className={adminChrome.th}>{t("table.createdAt")}</th>
              <th className={adminChrome.th}>{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className={adminChrome.tdMuted} colSpan={6}>
                  {items.length === 0 ? t("scheduledEmpty") : t("filters.noMatches")}
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className={adminChrome.tr}>
                  <td className={adminChrome.tdStrong}>{row.subject}</td>
                  <td className={adminChrome.td}>{row.audience}</td>
                  <td className={adminChrome.tdMuted}>
                    {formatDateTimeForUi(row.scheduleAt, locale)}
                  </td>
                  <td className={adminChrome.td}>{row.status}</td>
                  <td className={adminChrome.tdMuted}>
                    {formatDateTimeForUi(row.createdAt, locale)}
                  </td>
                  <td className={adminChrome.td}>
                    <div className="flex flex-wrap gap-2">
                      {row.status === "PENDING" ? (
                        <>
                          <button
                            type="button"
                            className="ommm-cta-ghost text-xs"
                            disabled={busyId !== null}
                            onClick={() => openEdit(row)}
                          >
                            {t("actions.edit")}
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-50 disabled:opacity-50"
                            disabled={busyId !== null}
                            onClick={() => void cancel(row.id)}
                          >
                            {t("actions.cancel")}
                          </button>
                        </>
                      ) : (
                        <span className={adminChrome.metaText}>—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {message ? (
        <p className="text-sm text-sage-700" role="status">
          {message}
        </p>
      ) : null}
      {editing ? (
        <AdminScheduledBroadcastEditModal
          editing={editing}
          draft={editDraft}
          busy={busyId !== null}
          onDraftChange={setEditDraft}
          onSave={() => void saveEdit()}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </section>
  );
}
