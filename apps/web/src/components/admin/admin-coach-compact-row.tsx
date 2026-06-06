"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ADMIN_COACH_CLASS_BADGE_CLASS,
  coachClassBadgeTone,
} from "@/components/admin/admin-coach-list-badges";
import { AdminCoachRowActions } from "@/components/admin/admin-coach-row-actions";
import {
  ADMIN_COACHES_LIST_ACTIONS_CELL,
  ADMIN_COACHES_LIST_CELL,
  ADMIN_COACHES_LIST_ROW_CLASS,
  ADMIN_COACHES_LIST_SPACER_CELL,
  ADMIN_COACHES_LIST_TAGS_CELL,
  ADMIN_COACHES_LIST_WORKLOAD_CELL,
} from "@/components/admin/admin-coaches-list-layout";
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
  readOnly?: boolean;
};

export function AdminCoachCompactRow({
  coach,
  classTypeOptions,
  classOptions,
  locale,
  onSelect,
  readOnly = false,
}: AdminCoachCompactRowProps) {
  const t = useTranslations("adminPages.coaches");
  const displayName = coachCardDisplayName(coach.user);
  const classLabels = classNamesForCoach(coach.assignedClassTypeIds, classOptions);

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
        <div className="flex min-w-0 items-center gap-3">
          <CoachAvatar coach={coach} />
          <div className="min-w-0 flex-1">
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
            <p className="mt-0.5 truncate text-xs text-sage-500">
              {coach.user.phone ?? coach.user.email}
            </p>
          </div>
        </div>
      </div>

      <div className={ADMIN_COACHES_LIST_CELL}>
        <AdminListMobileLabel label={t("colSpecialization")} />
        <p className="text-sm text-sage-800">{coach.specialization ?? "—"}</p>
      </div>

      <div className={ADMIN_COACHES_LIST_TAGS_CELL}>
        <AdminListMobileLabel label={t("colTags")} />
        <CoachClassLabels labels={classLabels} />
      </div>

      <div className={ADMIN_COACHES_LIST_WORKLOAD_CELL}>
        <AdminListMobileLabel label={t("colWorkload")} />
        <p className="text-sm text-sage-800">
          {t("workloadSummary", {
            classes: coach.totalClasses,
            slots: coach.schedule.length,
          })}
        </p>
      </div>

      {readOnly ? null : (
        <div className={ADMIN_COACHES_LIST_SPACER_CELL} aria-hidden="true" />
      )}

      {readOnly ? null : (
        <div
          className={ADMIN_COACHES_LIST_ACTIONS_CELL}
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
      )}
    </article>
  );
}

function CoachClassLabels({ labels }: { labels: readonly string[] }) {
  if (labels.length === 0) {
    return <span className="text-sm text-sage-400">—</span>;
  }

  return (
    <>
      {labels.map((label, index) => (
        <span
          key={`${label}-${index}`}
          className={`${ADMIN_COACH_CLASS_BADGE_CLASS} ${coachClassBadgeTone(index)}`}
        >
          {label}
        </span>
      ))}
    </>
  );
}

function classNamesForCoach(
  classIds: readonly string[],
  classOptions: readonly CoachClassOption[],
): string[] {
  const namesById = new Map(classOptions.map((option) => [option.id, option.name]));
  return classIds.map((id) => namesById.get(id) ?? id);
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
