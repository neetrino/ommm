"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ADMIN_NOTIFICATIONS_LIST_CELL,
  ADMIN_NOTIFICATIONS_LIST_EMPHASIZED_HEADER,
  ADMIN_NOTIFICATIONS_LIST_HEADER_CLASS,
  ADMIN_NOTIFICATIONS_LIST_ROW_CLASS,
  ADMIN_NOTIFICATIONS_LIST_TABLE_CLASS,
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
import { formatDateTimeForUi } from "@/lib/date-display";
import type { BroadcastAudience, DeliveryRow } from "./admin-notifications-types";

type Props = {
  locale: string;
  items: DeliveryRow[];
  loadFailed: boolean;
};

type DeliveryQuickFilter = "" | "scheduled" | "immediate" | "sent-today";

const audienceOptions: Array<[BroadcastAudience | "", string]> = [
  ["", "audienceAll"],
  ["users", "audienceUsers"],
  ["coaches", "audienceCoaches"],
  ["staff", "audienceStaff"],
  ["all", "audienceAllRoles"],
];

const sortOptions = [
  ["newest", "sortNewest"],
  ["oldest", "sortOldest"],
] as const;

function isToday(iso: string): boolean {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function AdminNotificationsDeliveriesSection({ locale, items, loadFailed }: Props) {
  const t = useTranslations("adminPages.notifications");
  const [search, setSearch] = useState("");
  const [audience, setAudience] = useState<BroadcastAudience | "">("");
  const [channel, setChannel] = useState("");
  const [timing, setTiming] = useState<"" | "scheduled" | "immediate">("");
  const [order, setOrder] = useState<"newest" | "oldest">("newest");
  const [quick, setQuick] = useState<DeliveryQuickFilter>("");

  const channels = useMemo(() => {
    const unique = new Set(items.map((item) => item.channel).filter(Boolean));
    return [...unique].sort();
  }, [items]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    let rows = items.filter((row) => {
      if (needle !== "") {
        const haystack = `${row.subject} ${row.recipientEmail} ${row.channel}`.toLowerCase();
        if (!haystack.includes(needle)) {
          return false;
        }
      }
      if (audience !== "" && row.audience !== audience) {
        return false;
      }
      if (channel !== "" && row.channel !== channel) {
        return false;
      }
      if (timing === "scheduled" && !row.scheduled) {
        return false;
      }
      if (timing === "immediate" && row.scheduled) {
        return false;
      }
      if (quick === "scheduled" && !row.scheduled) {
        return false;
      }
      if (quick === "immediate" && row.scheduled) {
        return false;
      }
      if (quick === "sent-today" && !isToday(row.createdAt)) {
        return false;
      }
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return order === "newest" ? bTime - aTime : aTime - bTime;
    });
    return rows;
  }, [audience, channel, items, order, quick, search, timing]);

  function resetFilters() {
    setSearch("");
    setAudience("");
    setChannel("");
    setTiming("");
    setOrder("newest");
    setQuick("");
  }

  const quickFilters: Array<[DeliveryQuickFilter, string]> = [
    ["", "quickAll"],
    ["sent-today", "quickSentToday"],
    ["scheduled", "quickScheduledDeliveries"],
    ["immediate", "quickImmediateDeliveries"],
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className={adminChrome.sectionTitle}>{t("deliveryListHeading")}</h2>
        <p className={adminChrome.metaText}>{t("deliveryListHint")}</p>
      </div>
      {loadFailed ? <p className="app-alert-warn text-sm">{t("loadFailedDeliveries")}</p> : null}
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
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
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
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.channel")}</span>
          <OmmSelectDropdown
            ariaLabel={t("filters.channel")}
            label={channel === "" ? t("filters.channelAll") : channel}
            value={channel}
            options={[
              { value: "", label: t("filters.channelAll") },
              ...channels.map((value) => ({ value, label: value })),
            ]}
            onChange={setChannel}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.timing")}</span>
          <OmmSelectDropdown
            ariaLabel={t("filters.timing")}
            label={
              timing === "scheduled"
                ? t("scheduledTag")
                : timing === "immediate"
                  ? t("immediateTag")
                  : t("filters.timingAll")
            }
            value={timing}
            options={[
              { value: "", label: t("filters.timingAll") },
              { value: "scheduled", label: t("scheduledTag") },
              { value: "immediate", label: t("immediateTag") },
            ]}
            onChange={(value) => setTiming(value as "" | "scheduled" | "immediate")}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.sort")}</span>
          <OmmSelectDropdown
            ariaLabel={t("filters.sort")}
            label={t(sortOptions.find(([value]) => value === order)?.[1] ?? "sortNewest")}
            value={order}
            options={sortOptions.map(([value, labelKey]) => ({ value, label: t(labelKey) }))}
            onChange={(value) => setOrder(value as "newest" | "oldest")}
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
      <div className={ADMIN_NOTIFICATIONS_LIST_TABLE_CLASS}>
        <div className={ADMIN_NOTIFICATIONS_LIST_HEADER_CLASS}>
          <span className={ADMIN_NOTIFICATIONS_LIST_EMPHASIZED_HEADER}>{t("table.sentAt")}</span>
          <span>{t("table.subject")}</span>
          <span className={ADMIN_NOTIFICATIONS_LIST_EMPHASIZED_HEADER}>{t("table.recipient")}</span>
          <span className={ADMIN_NOTIFICATIONS_LIST_EMPHASIZED_HEADER}>{t("table.audience")}</span>
          <span className={ADMIN_NOTIFICATIONS_LIST_EMPHASIZED_HEADER}>{t("table.channel")}</span>
          <span className={ADMIN_NOTIFICATIONS_LIST_EMPHASIZED_HEADER}>{t("table.timing")}</span>
        </div>
        {filtered.length === 0 ? (
          <p className="rounded-[24px] border border-white/80 bg-white/95 px-5 py-8 text-center text-sm text-sage-600">
            {items.length === 0 ? t("deliveryListEmpty") : t("filters.noMatches")}
          </p>
        ) : (
          filtered.slice(0, 100).map((row) => (
            <article key={row.id} className={ADMIN_NOTIFICATIONS_LIST_ROW_CLASS}>
              <div className={ADMIN_NOTIFICATIONS_LIST_CELL}>
                <AdminListMobileLabel label={t("table.sentAt")} />
                <p className="text-sm text-sage-600">{formatDateTimeForUi(row.createdAt, locale)}</p>
              </div>
              <div className={ADMIN_NOTIFICATIONS_LIST_CELL}>
                <AdminListMobileLabel label={t("table.subject")} />
                <p className="text-sm font-medium text-sage-900">{row.subject}</p>
              </div>
              <div className={ADMIN_NOTIFICATIONS_LIST_CELL}>
                <AdminListMobileLabel label={t("table.recipient")} />
                <p className="truncate font-mono text-xs text-sage-900">{row.recipientEmail}</p>
              </div>
              <div className={ADMIN_NOTIFICATIONS_LIST_CELL}>
                <AdminListMobileLabel label={t("table.audience")} />
                <p className="text-sm text-sage-800">{row.audience}</p>
              </div>
              <div className={ADMIN_NOTIFICATIONS_LIST_CELL}>
                <AdminListMobileLabel label={t("table.channel")} />
                <p className="text-sm text-sage-800">{row.channel}</p>
              </div>
              <div className={ADMIN_NOTIFICATIONS_LIST_CELL}>
                <AdminListMobileLabel label={t("table.timing")} />
                <p className="text-sm text-sage-800">
                  {row.scheduled ? t("scheduledTag") : t("immediateTag")}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
      <p className={adminChrome.metaText}>{t("deliveryNote")}</p>
    </section>
  );
}
