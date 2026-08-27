"use client";

import { useTranslations } from "next-intl";
import { ADMIN_LIST_TITLE_TEXT_CLASS } from "@/components/admin/admin-list-table-layout";
import {
  managerAccessKind,
  managerDirectoryDisplayName,
  managerDirectoryInitials,
} from "@/components/admin/admin-manager-display";
import { AdminManagerRowActions } from "@/components/admin/admin-manager-row-actions";
import {
  ADMIN_MANAGERS_ACCESS_BADGE_CLASS,
  ADMIN_MANAGERS_LIST_ACCESS_AREA_CLASS,
  ADMIN_MANAGERS_LIST_ACTIONS_AREA_CLASS,
  ADMIN_MANAGERS_LIST_ACTIONS_CELL,
  ADMIN_MANAGERS_LIST_CELL,
  ADMIN_MANAGERS_LIST_EMAIL_AREA_CLASS,
  ADMIN_MANAGERS_LIST_JOINED_AREA_CLASS,
  ADMIN_MANAGERS_LIST_NAME_AREA_CLASS,
  ADMIN_MANAGERS_LIST_NAME_CELL,
  ADMIN_MANAGERS_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_MANAGERS_LIST_ROW_CLASS,
  ADMIN_MANAGERS_LIST_SUBTITLE_CLASS,
} from "@/components/admin/admin-managers-list-layout";
import type { AdminManagerDirectoryRow } from "@/components/admin/admin-managers-types";
import { formatDateCompactForUi } from "@/lib/date-display";
import { displayPhoneOrFallback } from "@/lib/phone";

type AdminManagerCompactRowProps = {
  manager: AdminManagerDirectoryRow;
  onSelect: (manager: AdminManagerDirectoryRow) => void;
  onChanged: () => void;
};

export function AdminManagerCompactRow({
  manager,
  onSelect,
  onChanged,
}: AdminManagerCompactRowProps) {
  const displayName = managerDirectoryDisplayName(manager);

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={displayName}
      onClick={() => onSelect(manager)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(manager);
        }
      }}
      className={ADMIN_MANAGERS_LIST_ROW_CLASS}
    >
      <ManagerCardFields
        manager={manager}
        displayName={displayName}
        onChanged={onChanged}
      />
    </article>
  );
}

function ManagerCardFields({
  manager,
  displayName,
  onChanged,
}: {
  manager: AdminManagerDirectoryRow;
  displayName: string;
  onChanged: () => void;
}) {
  const t = useTranslations("adminPages.managers");
  const accessKind = managerAccessKind(manager);
  const accessLabel =
    accessKind === "blocked"
      ? t("statusBlocked")
      : accessKind === "invited"
        ? t("statusInvited")
        : t("statusActive");
  const accessTone =
    accessKind === "blocked"
      ? "bg-peach-100 text-sand-700"
      : accessKind === "invited"
        ? "bg-sand-100 text-sand-700"
        : "bg-mint-100 text-sage-800";

  return (
    <>
      <div className={`${ADMIN_MANAGERS_LIST_NAME_CELL} ${ADMIN_MANAGERS_LIST_NAME_AREA_CLASS}`}>
        <div className="flex min-w-0 items-start gap-3 md:items-center">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-700 font-medium text-cream-50 ring-2 ring-white">
            {managerDirectoryInitials(manager)}
          </span>
          <div className="min-w-0 flex-1">
            <p className={ADMIN_LIST_TITLE_TEXT_CLASS}>{displayName}</p>
            {manager.phone?.trim() ? (
              <p className={ADMIN_MANAGERS_LIST_SUBTITLE_CLASS}>
                {displayPhoneOrFallback(manager.phone)}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      <div className={`${ADMIN_MANAGERS_LIST_CELL} ${ADMIN_MANAGERS_LIST_EMAIL_AREA_CLASS}`}>
        <p className="text-sm leading-snug text-sage-800">{manager.email}</p>
      </div>
      <div className={`${ADMIN_MANAGERS_LIST_CELL} ${ADMIN_MANAGERS_LIST_ACCESS_AREA_CLASS}`}>
        <span className={`${ADMIN_MANAGERS_ACCESS_BADGE_CLASS} ${accessTone}`}>{accessLabel}</span>
      </div>
      <div className={`${ADMIN_MANAGERS_LIST_CELL} ${ADMIN_MANAGERS_LIST_JOINED_AREA_CLASS}`}>
        <p className="text-sm tabular-nums text-sage-800">
          {formatDateCompactForUi(manager.createdAt)}
        </p>
      </div>
      <div
        className={`${ADMIN_MANAGERS_LIST_ACTIONS_CELL} ${ADMIN_MANAGERS_LIST_ACTIONS_AREA_CLASS} ${ADMIN_MANAGERS_LIST_ROW_ACTIONS_HOVER_REVEAL}`}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <AdminManagerRowActions manager={manager} onChanged={onChanged} />
      </div>
    </>
  );
}
