"use client";

import { useTranslations } from "next-intl";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { ADMIN_LIST_TITLE_TEXT_CLASS } from "@/components/admin/admin-list-table-layout";
import {
  managerAccessKind,
  managerDirectoryDisplayName,
  managerDirectoryInitials,
} from "@/components/admin/admin-manager-display";
import { AdminManagerRowActions } from "@/components/admin/admin-manager-row-actions";
import {
  ADMIN_MANAGERS_LIST_ACTIONS_CELL,
  ADMIN_MANAGERS_LIST_CELL,
  ADMIN_MANAGERS_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_MANAGERS_LIST_ROW_CLASS,
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
  const t = useTranslations("adminPages.managers");
  const displayName = managerDirectoryDisplayName(manager);
  const accessKind = managerAccessKind(manager);
  const accessLabel =
    accessKind === "blocked"
      ? t("statusBlocked")
      : accessKind === "invited"
        ? t("statusInvited")
        : t("statusActive");

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
      <div className={ADMIN_MANAGERS_LIST_CELL}>
        <AdminListMobileLabel label={t("colManagers")} />
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-100 font-medium text-sage-800">
            {managerDirectoryInitials(manager)}
          </span>
          <div className="min-w-0 flex-1">
            <p className={ADMIN_LIST_TITLE_TEXT_CLASS} title={displayName}>
              {displayName}
            </p>
            <p className="mt-0.5 truncate text-xs text-sage-500">
              {displayPhoneOrFallback(manager.phone)}
            </p>
          </div>
        </div>
      </div>
      <div className={ADMIN_MANAGERS_LIST_CELL}>
        <AdminListMobileLabel label={t("colEmail")} />
        <p className="truncate text-sm text-sage-800" title={manager.email}>
          {manager.email}
        </p>
      </div>
      <div className={ADMIN_MANAGERS_LIST_CELL}>
        <AdminListMobileLabel label={t("colAccess")} />
        <p className="text-sm text-sage-800">{accessLabel}</p>
      </div>
      <div className={ADMIN_MANAGERS_LIST_CELL}>
        <AdminListMobileLabel label={t("colJoined")} />
        <p className="text-sm tabular-nums text-sage-800">
          {formatDateCompactForUi(manager.createdAt)}
        </p>
      </div>
      <div
        className={`${ADMIN_MANAGERS_LIST_ACTIONS_CELL} ${ADMIN_MANAGERS_LIST_ROW_ACTIONS_HOVER_REVEAL}`}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <AdminListMobileLabel label={t("colActions")} />
        <AdminManagerRowActions manager={manager} onChanged={onChanged} />
      </div>
    </article>
  );
}
