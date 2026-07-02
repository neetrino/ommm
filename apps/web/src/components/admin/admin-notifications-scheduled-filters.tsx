"use client";

import type { useTranslations } from "next-intl";
import {
  ADMIN_NOTIFICATIONS_SCHEDULED_AUDIENCE_OPTIONS,
  ADMIN_NOTIFICATIONS_SCHEDULED_QUICK_FILTERS,
  ADMIN_NOTIFICATIONS_SCHEDULED_STATUS_OPTIONS,
  type ScheduledQuickFilter,
} from "@/components/admin/admin-notifications-scheduled-section.constants";
import { adminChrome } from "@/components/admin/admin-chrome";
import type {
  BroadcastAudience,
  ScheduledBroadcastStatus,
} from "@/components/admin/admin-notifications-types";
import type { ScheduledListFilters } from "@/components/admin/admin-notifications-url";
import { AdminFilterResetBar } from "@/components/ui/admin-filter-reset-bar";
import { OmmSelectDropdown, ommOptionsFromTuples } from "@/components/ui/omm-select-dropdown";

type AdminNotificationsScheduledFiltersProps = {
  filters: ScheduledListFilters;
  total: number;
  onSearchChange: (value: string) => void;
  onQuickFilter: (value: ScheduledQuickFilter) => void;
  onPatchFilters: (patch: Partial<ScheduledListFilters>) => void;
  onReset: () => void;
  t: ReturnType<typeof useTranslations<"adminPages.notifications">>;
};

export function AdminNotificationsScheduledFilters({
  filters,
  total,
  onSearchChange,
  onQuickFilter,
  onPatchFilters,
  onReset,
  t,
}: AdminNotificationsScheduledFiltersProps) {
  return (
    <>
      <div>
        <h2 className={adminChrome.sectionTitle}>{t("scheduledHeading")}</h2>
        <p className={adminChrome.metaText}>{t("scheduledHint")}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {ADMIN_NOTIFICATIONS_SCHEDULED_QUICK_FILTERS.map(([value, labelKey]) => (
          <button
            key={value || "all"}
            type="button"
            className={
              filters.quick === value
                ? "rounded-full bg-sage-800 px-3 py-1 text-xs font-medium text-white"
                : "rounded-full border border-white/60 bg-white/55 px-3 py-1 text-xs font-medium text-sage-700"
            }
            onClick={() => onQuickFilter(filters.quick === value ? "" : value)}
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
            value={filters.search}
            onChange={(ev) => onSearchChange(ev.target.value)}
            placeholder={t("filters.searchPlaceholder")}
            autoComplete="off"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.status")}</span>
          <OmmSelectDropdown
            ariaLabel={t("filters.status")}
            label={t(
              ADMIN_NOTIFICATIONS_SCHEDULED_STATUS_OPTIONS.find(([value]) => value === filters.status)?.[1] ??
                "statusAll",
            )}
            value={filters.status}
            options={ommOptionsFromTuples(
              ADMIN_NOTIFICATIONS_SCHEDULED_STATUS_OPTIONS.map(([value, labelKey]) => [
                value,
                t(labelKey),
              ]),
            )}
            onChange={(value) =>
              onPatchFilters({ status: value as ScheduledBroadcastStatus | "" })
            }
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.audience")}</span>
          <OmmSelectDropdown
            ariaLabel={t("filters.audience")}
            label={t(
              ADMIN_NOTIFICATIONS_SCHEDULED_AUDIENCE_OPTIONS.find(
                ([value]) => value === filters.audience,
              )?.[1] ?? "audienceAll",
            )}
            value={filters.audience}
            options={ommOptionsFromTuples(
              ADMIN_NOTIFICATIONS_SCHEDULED_AUDIENCE_OPTIONS.map(([value, labelKey]) => [
                value,
                t(labelKey),
              ]),
            )}
            onChange={(value) =>
              onPatchFilters({ audience: value as BroadcastAudience | "" })
            }
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="ommm-label text-xs uppercase tracking-wide">{t("filters.sort")}</span>
          <OmmSelectDropdown
            ariaLabel={t("filters.sort")}
            label={
              filters.order === "schedule"
                ? t("sortSchedule")
                : filters.order === "oldest"
                  ? t("sortOldest")
                  : t("sortNewest")
            }
            value={filters.order}
            options={[
              { value: "newest", label: t("sortNewest") },
              { value: "oldest", label: t("sortOldest") },
              { value: "schedule", label: t("sortSchedule") },
            ]}
            onChange={(value) =>
              onPatchFilters({ order: value as ScheduledListFilters["order"] })
            }
          />
        </label>
      </div>
      <AdminFilterResetBar
        onReset={onReset}
        label={t("filters.reset")}
        meta={
          <span className={adminChrome.metaText}>
            {t("filters.resultCount", { count: total })}
          </span>
        }
      />
    </>
  );
}
