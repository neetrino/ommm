"use client";

import Image from "next/image";
import {
  ADMIN_COACH_CLASS_BADGE_CLASS,
  coachClassBadgeToneById,
} from "@/components/admin/admin-coach-list-badges";
import type { CoachClassOption } from "@/components/admin/admin-coach-form-helpers";
import type { AdminCoachDirectoryRow } from "@/components/admin/admin-coaches-types";
import {
  coachCardDisplayName,
  coachCardInitials,
} from "@/components/coaches/coach-card-display";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

const COACH_AVATAR_IMAGE_SIZE_PX = 48;

export const COACH_LIST_AVATAR_CLASS = "h-10 w-10 text-sm";
export const COACH_BOARD_AVATAR_CLASS = "h-12 w-12 text-sm";

export const ADMIN_COACH_CLASS_BADGE_BOARD_CLASS =
  "inline-flex max-w-full shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em]";

type CoachDirectoryAvatarProps = {
  coach: AdminCoachDirectoryRow;
  sizeClassName?: string;
};

export function CoachDirectoryAvatar({
  coach,
  sizeClassName = COACH_LIST_AVATAR_CLASS,
}: CoachDirectoryAvatarProps) {
  const src =
    coach.user.avatarUrl !== null
      ? resolveApiAssetUrl(coach.user.avatarUrl) ?? coach.user.avatarUrl
      : null;
  const frameClassName = `flex shrink-0 items-center justify-center rounded-full bg-sand-100 font-semibold text-sage-800 ${sizeClassName}`;

  if (src !== null) {
    return (
      <Image
        src={src}
        alt=""
        width={COACH_AVATAR_IMAGE_SIZE_PX}
        height={COACH_AVATAR_IMAGE_SIZE_PX}
        className={`${frameClassName} object-cover`}
        unoptimized
      />
    );
  }

  return <div className={frameClassName}>{coachCardInitials(coach.user)}</div>;
}

type CoachClassBadgesProps = {
  assignedClassTypeIds: readonly string[];
  classOptions: readonly CoachClassOption[];
  badgeClassName?: string;
};

export function CoachClassBadges({
  assignedClassTypeIds,
  classOptions,
  badgeClassName = ADMIN_COACH_CLASS_BADGE_CLASS,
}: CoachClassBadgesProps) {
  if (assignedClassTypeIds.length === 0) {
    return <span className="text-sm text-sage-400">—</span>;
  }

  const namesById = new Map(classOptions.map((option) => [option.id, option.name]));

  return (
    <>
      {assignedClassTypeIds.map((classTypeId) => (
        <span
          key={classTypeId}
          className={`${badgeClassName} ${coachClassBadgeToneById(classTypeId, classOptions)}`}
        >
          {namesById.get(classTypeId) ?? classTypeId}
        </span>
      ))}
    </>
  );
}

export function coachDirectoryDisplayName(coach: AdminCoachDirectoryRow): string {
  return coachCardDisplayName(coach.user);
}
