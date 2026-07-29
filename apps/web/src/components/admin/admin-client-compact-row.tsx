"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ADMIN_CLIENT_AVATAR_LAYER_CLASS,
  ADMIN_CLIENT_AVATAR_SIZE_CLASS,
  ADMIN_CLIENT_AVATAR_WRAPPER_CLASS,
  ADMIN_CLIENT_TAG_OVERLAY_BADGE_CLASS,
  clientTagBadgeTone,
  clientTagLabelKey,
} from "@/components/admin/admin-client-list-badges";
import { AdminClientPackageBadge } from "@/components/admin/admin-client-package-badge";
import { AdminClientNextBookingCell } from "@/components/admin/admin-client-next-booking-cell";
import { AdminClientRowActions } from "@/components/admin/admin-client-row-actions";
import {
  ADMIN_CLIENTS_LIST_ACTIONS_CELL,
  ADMIN_CLIENTS_LIST_CELL,
  ADMIN_CLIENTS_LIST_DATE_CELL,
  ADMIN_CLIENTS_LIST_NAME_CELL,
  ADMIN_CLIENTS_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_CLIENTS_LIST_ROW_CLASS,
  ADMIN_CLIENTS_LIST_SUBTITLE_CLASS,
  ADMIN_CLIENTS_LIST_TITLE_CLASS,
  ADMIN_CLIENTS_LIST_VALUE_CLASS,
} from "@/components/admin/admin-clients-list-layout";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import type { ClientCapabilities } from "@/lib/backoffice-capabilities";
import { displayPhoneOrFallback } from "@/lib/phone";
import { formatDateCompactForUi, formatDateForUi } from "@/lib/date-display";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

type AdminClientCompactRowProps = {
  row: ClientRow;
  onSelect: (row: ClientRow) => void;
  onChanged: () => void;
  /** @deprecated Prefer `capabilities`. */
  readOnly?: boolean;
  capabilities?: ClientCapabilities;
};

export function AdminClientCompactRow({
  row,
  onSelect,
  onChanged,
  readOnly = false,
  capabilities,
}: AdminClientCompactRowProps) {
  const t = useTranslations("adminPages.clients");
  const name = fullName(row);
  const hideActions = capabilities ? !capabilities.canUpdate : readOnly;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={name}
      onClick={() => onSelect(row)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(row);
        }
      }}
      className={ADMIN_CLIENTS_LIST_ROW_CLASS}
    >
      <div className={ADMIN_CLIENTS_LIST_NAME_CELL}>
        <AdminListMobileLabel label={t("colName")} />
        <div className="flex min-w-0 items-center gap-4 overflow-visible">
          <ClientAvatarWithTags row={row} />
          <div className="min-w-0 flex-1">
            <p className={ADMIN_CLIENTS_LIST_TITLE_CLASS} title={name}>
              {name}
            </p>
            <p className={ADMIN_CLIENTS_LIST_SUBTITLE_CLASS}>{displayPhoneOrFallback(row.phone)}</p>
          </div>
        </div>
      </div>

      <div className={ADMIN_CLIENTS_LIST_DATE_CELL}>
        <AdminListMobileLabel label={t("fieldBirthday")} />
        <p className={ADMIN_CLIENTS_LIST_VALUE_CLASS}>
          {row.dateOfBirth ? formatDateForUi(row.dateOfBirth) : "—"}
        </p>
      </div>

      <div className={ADMIN_CLIENTS_LIST_DATE_CELL}>
        <AdminListMobileLabel label={t("colJoined")} />
        <p className={ADMIN_CLIENTS_LIST_VALUE_CLASS}>{formatDateCompactForUi(row.createdAt)}</p>
      </div>

      <div className={`${ADMIN_CLIENTS_LIST_CELL} min-w-0`}>
        <AdminListMobileLabel label={t("colMembership")} />
        <AdminClientPackageBadge row={row} />
      </div>

      <div className={`${ADMIN_CLIENTS_LIST_CELL} min-w-0`}>
        <AdminListMobileLabel label={t("colBooking")} />
        <AdminClientNextBookingCell row={row} />
      </div>

      {hideActions ? null : (
        <div
          className={`${ADMIN_CLIENTS_LIST_ACTIONS_CELL} ${ADMIN_CLIENTS_LIST_ROW_ACTIONS_HOVER_REVEAL}`}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <AdminListMobileLabel label={t("colActions")} />
          <AdminClientRowActions
            client={row}
            onChanged={onChanged}
            onEdit={() => onSelect(row)}
          />
        </div>
      )}
    </article>
  );
}

function ClientAvatarWithTags({ row }: { row: ClientRow }) {
  const t = useTranslations("adminPages.clients");
  const primaryTag = row.tags[0];

  return (
    <div className={ADMIN_CLIENT_AVATAR_WRAPPER_CLASS}>
      <div className={ADMIN_CLIENT_AVATAR_LAYER_CLASS}>
        <ClientAvatar row={row} />
      </div>
      {primaryTag ? (
        <span
          className={`${ADMIN_CLIENT_TAG_OVERLAY_BADGE_CLASS} ${clientTagBadgeTone(primaryTag)}`}
        >
          {t(clientTagLabelKey(primaryTag))}
        </span>
      ) : null}
    </div>
  );
}

function ClientAvatar({ row }: { row: ClientRow }) {
  const src = resolveApiAssetUrl(row.avatarUrl);
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={48}
        height={48}
        className={`${ADMIN_CLIENT_AVATAR_SIZE_CLASS} rounded-full object-cover`}
        unoptimized
      />
    );
  }
  const initials = fullName(row)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-sand-100 text-base font-semibold text-sage-800">
      {initials || "?"}
    </div>
  );
}

function fullName(row: { name: string | null; lastName: string | null; email: string }) {
  return [row.name, row.lastName].filter(Boolean).join(" ").trim() || row.email;
}
