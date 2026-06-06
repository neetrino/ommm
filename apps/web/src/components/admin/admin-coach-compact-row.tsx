"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ADMIN_COACHES_LIST_ACTIONS_CELL,
  ADMIN_COACHES_LIST_CELL,
  ADMIN_COACHES_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_COACHES_LIST_ROW_CLASS,
  ADMIN_COACHES_LIST_SPACER_CELL,
  ADMIN_COACHES_LIST_STATUS_CELL,
} from "@/components/admin/admin-coaches-list-layout";
import { AdminCoachRowActions } from "@/components/admin/admin-coach-row-actions";
import type { CoachClassOption } from "@/components/admin/admin-coach-form-helpers";
import type { AdminCoachDirectoryRow } from "@/components/admin/admin-coaches-types";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { coachCardDisplayName } from "@/components/coaches/coach-card-display";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

type AdminCoachCompactRowProps = {
  coach: AdminCoachDirectoryRow;
  classTypeOptions: readonly string[];
  classOptions: readonly CoachClassOption[];
  locale: string;
  onSelect: (coach: AdminCoachDirectoryRow) => void;
};

export function AdminCoachCompactRow({
  coach,
  classTypeOptions,
  classOptions,
  locale,
  onSelect,
}: AdminCoachCompactRowProps) {
  const t = useTranslations("adminPages.coaches");
  const displayName = coachCardDisplayName(coach.user);

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={displayName}
      onClick={() => onSelect(coach)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(coach);
        }
      }}
      className={ADMIN_COACHES_LIST_ROW_CLASS}
    >
      <div className={ADMIN_COACHES_LIST_CELL}>
        <AdminListMobileLabel label={t("colCoaches")} />
        <div className="flex items-center gap-3">
          <CoachAvatar coach={coach} />
          <div className="min-w-0">
            <button
              type="button"
              className="block max-w-full truncate text-left text-sm font-medium text-sage-900 underline-offset-2 hover:underline"
              title={displayName}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(coach);
              }}
            >
              {displayName}
            </button>
            <p className="mt-0.5 truncate text-xs text-sage-500">{coach.user.phone ?? "—"}</p>
            <p className="truncate text-xs text-sage-500">{coach.user.email}</p>
          </div>
        </div>
      </div>

      <div className={`${ADMIN_COACHES_LIST_CELL} md:text-center`}>
        <AdminListMobileLabel label={t("colSpecialization")} />
        <p className="text-sm text-sage-800">{coach.specialization ?? "—"}</p>
      </div>

      <div className={`${ADMIN_COACHES_LIST_CELL} md:text-center`}>
        <AdminListMobileLabel label={t("colWorkload")} />
        <p className="text-sm text-sage-800">
          {t("workloadSummary", {
            classes: coach.totalClasses,
            slots: coach.schedule.length,
          })}
        </p>
      </div>

      <div className={ADMIN_COACHES_LIST_STATUS_CELL}>
        <AdminListMobileLabel label={t("colStatus")} />
        <StatusBadge isActive={coach.isActive} />
      </div>

      <div className={ADMIN_COACHES_LIST_SPACER_CELL} aria-hidden="true" />

      <div
        className={`${ADMIN_COACHES_LIST_ACTIONS_CELL} ${ADMIN_COACHES_LIST_ROW_ACTIONS_HOVER_REVEAL}`}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <AdminListMobileLabel label={t("colActions")} />
        <AdminCoachRowActions
          coach={coach}
          classTypeOptions={classTypeOptions}
          classOptions={classOptions}
          locale={locale}
        />
      </div>
    </article>
  );
}

function CoachAvatar({ coach }: { coach: AdminCoachDirectoryRow }) {
  const src =
    coach.user.avatarUrl !== null
      ? resolveApiAssetUrl(coach.user.avatarUrl) ?? coach.user.avatarUrl
      : null;
  if (src !== null) {
    return (
      <Image
        src={src}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
        unoptimized
      />
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-100 text-sm font-semibold text-sage-800">
      {coachCardDisplayName(coach.user).slice(0, 2).toUpperCase()}
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  const t = useTranslations("adminPages.coaches");
  const className = isActive
    ? "border-mint-200 bg-mint-50 text-sage-900"
    : "border-sand-300 bg-sand-50 text-sage-700";

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${className}`}>
      {isActive ? t("filters.statusActive") : t("filters.statusInactive")}
    </span>
  );
}
