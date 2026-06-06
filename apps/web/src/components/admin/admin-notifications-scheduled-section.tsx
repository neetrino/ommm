"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_NOTIFICATIONS_SCHEDULED_LIST_ACTIONS_CELL,
  ADMIN_NOTIFICATIONS_SCHEDULED_LIST_CELL,
  ADMIN_NOTIFICATIONS_SCHEDULED_LIST_EMPHASIZED_HEADER,
  ADMIN_NOTIFICATIONS_SCHEDULED_LIST_HEADER_CLASS,
  ADMIN_NOTIFICATIONS_SCHEDULED_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_NOTIFICATIONS_SCHEDULED_LIST_ROW_CLASS,
  ADMIN_NOTIFICATIONS_SCHEDULED_LIST_SPACER_CELL,
  ADMIN_NOTIFICATIONS_SCHEDULED_LIST_TABLE_CLASS,
} from "@/components/admin/admin-finance-notifications-list-layout";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminFilterResetBar } from "@/components/ui/admin-filter-reset-bar";
import { OmmSelectDropdown, ommOptionsFromTuples } from "@/components/ui/omm-select-dropdown";
import { ApiError, apiFetch } from "@/lib/api";
import { combineIsoDateAndTime, formatDateTimeForUi, splitIsoDateTime } from "@/lib/date-display";
import {
  AdminScheduledBroadcastEditModal,
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
    scheduleDate: "",
    scheduleTime: "",
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
    const { date, time } = splitIsoDateTime(row.scheduleAt);
    setEditing(row);
    setEditDraft({
      subject: row.subject,
      html: row.html,
      audience: row.audience,
      onlyPromotionsOptIn: row.onlyPromotionsOptIn,
      scheduleDate: date,
      scheduleTime: time,
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
    const scheduleIso = combineIsoDateAndTime(editDraft.scheduleDate, editDraft.scheduleTime);
    if (scheduleIso === null) {
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
          scheduleAt: scheduleIso,
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
      <AdminFilterResetBar
        onReset={resetFilters}
        label={t("filters.reset")}
        meta={
          <span className={adminChrome.metaText}>
            {t("filters.resultCount", { count: filtered.length })}
          </span>
        }
      />
      <div className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_TABLE_CLASS}>
        <div className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_HEADER_CLASS}>
          <span>{t("table.subject")}</span>
          <span className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_EMPHASIZED_HEADER}>
            {t("table.audience")}
          </span>
          <span className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_EMPHASIZED_HEADER}>
            {t("table.scheduledFor")}
          </span>
          <span className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_EMPHASIZED_HEADER}>
            {t("table.status")}
          </span>
          <span className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_EMPHASIZED_HEADER}>
            {t("table.createdAt")}
          </span>
          <span aria-hidden="true" />
          <span className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_EMPHASIZED_HEADER}>
            {t("table.actions")}
          </span>
        </div>
        {filtered.length === 0 ? (
          <p className="rounded-[24px] border border-white/80 bg-white/95 px-5 py-8 text-center text-sm text-sage-600">
            {items.length === 0 ? t("scheduledEmpty") : t("filters.noMatches")}
          </p>
        ) : (
          filtered.map((row) => (
            <article key={row.id} className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_ROW_CLASS}>
              <div className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_CELL}>
                <AdminListMobileLabel label={t("table.subject")} />
                <p className="text-sm font-medium text-sage-900">{row.subject}</p>
              </div>
              <div className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_CELL}>
                <AdminListMobileLabel label={t("table.audience")} />
                <p className="text-sm text-sage-800">{row.audience}</p>
              </div>
              <div className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_CELL}>
                <AdminListMobileLabel label={t("table.scheduledFor")} />
                <p className="text-sm text-sage-600">{formatDateTimeForUi(row.scheduleAt, locale)}</p>
              </div>
              <div className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_CELL}>
                <AdminListMobileLabel label={t("table.status")} />
                <p className="text-sm text-sage-800">{row.status}</p>
              </div>
              <div className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_CELL}>
                <AdminListMobileLabel label={t("table.createdAt")} />
                <p className="text-sm text-sage-600">{formatDateTimeForUi(row.createdAt, locale)}</p>
              </div>
              <div className={ADMIN_NOTIFICATIONS_SCHEDULED_LIST_SPACER_CELL} aria-hidden="true" />
              <div
                className={`${ADMIN_NOTIFICATIONS_SCHEDULED_LIST_ACTIONS_CELL} ${ADMIN_NOTIFICATIONS_SCHEDULED_LIST_ROW_ACTIONS_HOVER_REVEAL}`}
              >
                <AdminListMobileLabel label={t("table.actions")} />
                {row.status === "PENDING" ? (
                  <div className="flex flex-wrap justify-end gap-2">
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
                  </div>
                ) : (
                  <span className={adminChrome.metaText}>—</span>
                )}
              </div>
            </article>
          ))
        )}
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
