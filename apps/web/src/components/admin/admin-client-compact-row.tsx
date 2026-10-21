"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ADMIN_CLIENT_AVATAR_LAYER_CLASS,
  ADMIN_CLIENT_AVATAR_SIZE_CLASS,
  ADMIN_CLIENT_AVATAR_WRAPPER_CLASS,
  clientTagLabelKey,
  clientTagOverlayBadgeClass,
} from "@/components/admin/admin-client-list-badges";
import { AdminClientPackageBadge } from "@/components/admin/admin-client-package-badge";
import { AdminClientNextBookingCell } from "@/components/admin/admin-client-next-booking-cell";
import { AdminClientRowActions } from "@/components/admin/admin-client-row-actions";
import {
  ADMIN_CLIENTS_LIST_ACTIONS_AREA_CLASS,
  ADMIN_CLIENTS_LIST_ACTIONS_CELL,
  ADMIN_CLIENTS_LIST_BIRTHDAY_AREA_CLASS,
  ADMIN_CLIENTS_LIST_BOOKING_AREA_CLASS,
  ADMIN_CLIENTS_LIST_BOOKING_CELL,
  ADMIN_CLIENTS_LIST_DATE_CELL,
  ADMIN_CLIENTS_LIST_JOINED_AREA_CLASS,
  ADMIN_CLIENTS_LIST_MEMBERSHIP_AREA_CLASS,
  ADMIN_CLIENTS_LIST_MEMBERSHIP_CELL,
  ADMIN_CLIENTS_LIST_NAME_AREA_CLASS,
  ADMIN_CLIENTS_LIST_NAME_CELL,
  ADMIN_CLIENTS_LIST_ROW_CLASS,
  ADMIN_CLIENTS_LIST_ROW_WITH_ACTIONS_CLASS,
  ADMIN_CLIENTS_LIST_SUBTITLE_CLASS,
  ADMIN_CLIENTS_LIST_TITLE_CLASS,
  ADMIN_CLIENTS_LIST_VALUE_CLASS,
} from "@/components/admin/admin-clients-list-layout";
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
  /** Coach directory shows the name only, never the phone. */
  hideContact?: boolean;
};

export function AdminClientCompactRow({
  row,
  onSelect,
  onChanged,
  readOnly = false,
  capabilities,
  hideContact = false,
}: AdminClientCompactRowProps) {
  const name = fullName(row, hideContact);
  const hideActions = capabilities ? !capabilities.canUpdate : readOnly;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={name.length > 0 ? name : "?"}
      onClick={() => onSelect(row)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(row);
        }
      }}
      className={
        hideActions
          ? ADMIN_CLIENTS_LIST_ROW_CLASS
          : `${ADMIN_CLIENTS_LIST_ROW_CLASS} ${ADMIN_CLIENTS_LIST_ROW_WITH_ACTIONS_CLASS}`
      }
    >
      <ClientCardFields
        row={row}
        name={name}
        hideActions={hideActions}
        hideContact={hideContact}
        onChanged={onChanged}
      />
    </article>
  );
}

function ClientCardFields({
  row,
  name,
  hideActions,
  hideContact,
  onChanged,
}: {
  row: ClientRow;
  name: string;
  hideActions: boolean;
  hideContact: boolean;
  onChanged: () => void;
}) {
  return (
    <>
      <ClientNameCell row={row} name={name} hideContact={hideContact} />
      {hideContact ? null : (
        <>
          <div className={`${ADMIN_CLIENTS_LIST_DATE_CELL} ${ADMIN_CLIENTS_LIST_BIRTHDAY_AREA_CLASS}`}>
            <p className={ADMIN_CLIENTS_LIST_VALUE_CLASS}>
              {row.dateOfBirth ? formatDateForUi(row.dateOfBirth) : "—"}
            </p>
          </div>
          <div className={`${ADMIN_CLIENTS_LIST_DATE_CELL} ${ADMIN_CLIENTS_LIST_JOINED_AREA_CLASS}`}>
            <p className={ADMIN_CLIENTS_LIST_VALUE_CLASS}>{formatDateCompactForUi(row.createdAt)}</p>
          </div>
        </>
      )}

      <div
        className={`${ADMIN_CLIENTS_LIST_MEMBERSHIP_CELL} ${ADMIN_CLIENTS_LIST_MEMBERSHIP_AREA_CLASS} min-w-0`}
      >
        <AdminClientPackageBadge row={row} />
      </div>

      <div className={`${ADMIN_CLIENTS_LIST_BOOKING_CELL} ${ADMIN_CLIENTS_LIST_BOOKING_AREA_CLASS} min-w-0`}>
        <AdminClientNextBookingCell row={row} />
      </div>

      {hideActions ? null : (
        <div
          className={`${ADMIN_CLIENTS_LIST_ACTIONS_CELL} ${ADMIN_CLIENTS_LIST_ACTIONS_AREA_CLASS}`}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <AdminClientRowActions client={row} onChanged={onChanged} />
        </div>
      )}
    </>
  );
}

function ClientNameCell({
  row,
  name,
  hideContact,
}: {
  row: ClientRow;
  name: string;
  hideContact: boolean;
}) {
  return (
    <div className={`${ADMIN_CLIENTS_LIST_NAME_CELL} ${ADMIN_CLIENTS_LIST_NAME_AREA_CLASS}`}>
      <div className="flex min-w-0 items-start gap-3 overflow-visible md:items-center md:gap-4">
        <ClientAvatarWithTags row={row} name={name} />
        <div className="min-w-0 flex-1">
          <p className={ADMIN_CLIENTS_LIST_TITLE_CLASS}>{name}</p>
          {hideContact ? null : (
            <p className={ADMIN_CLIENTS_LIST_SUBTITLE_CLASS}>{displayPhoneOrFallback(row.phone)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ClientAvatarWithTags({ row, name }: { row: ClientRow; name: string }) {
  const t = useTranslations("adminPages.clients");
  const primaryTag = row.tags[0];

  return (
    <div className={ADMIN_CLIENT_AVATAR_WRAPPER_CLASS}>
      <div className={ADMIN_CLIENT_AVATAR_LAYER_CLASS}>
        <ClientAvatar name={name} row={row} />
      </div>
      {primaryTag ? (
        <span
          className={clientTagOverlayBadgeClass(primaryTag)}
        >
          {t(clientTagLabelKey(primaryTag))}
        </span>
      ) : null}
    </div>
  );
}

function ClientAvatar({ row, name }: { row: ClientRow; name: string }) {
  const src = resolveApiAssetUrl(row.avatarUrl);
  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={48}
        height={48}
        className={`${ADMIN_CLIENT_AVATAR_SIZE_CLASS} rounded-full object-cover ring-2 ring-white`}
        unoptimized
      />
    );
  }
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-sand-700 text-base font-semibold text-cream-50 ring-2 ring-white">
      {initials || "?"}
    </div>
  );
}

function fullName(
  row: { name: string | null; lastName: string | null; email: string },
  hideContact: boolean,
): string {
  const name = [row.name, row.lastName].filter(Boolean).join(" ").trim();
  if (name.length > 0 || hideContact) {
    return name;
  }
  return row.email;
}
