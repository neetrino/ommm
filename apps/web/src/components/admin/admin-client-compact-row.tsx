"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import {
  ADMIN_CLIENT_TAG_BADGE_CLASS,
  clientTagBadgeTone,
  clientTagLabelKey,
} from "@/components/admin/admin-client-list-badges";
import { AdminClientRowActions } from "@/components/admin/admin-client-row-actions";
import {
  ADMIN_CLIENTS_LIST_ACTIONS_CELL,
  ADMIN_CLIENTS_LIST_CELL,
  ADMIN_CLIENTS_LIST_DATE_CELL,
  ADMIN_CLIENTS_LIST_ROW_CLASS,
  ADMIN_CLIENTS_LIST_SPACER_CELL,
  ADMIN_CLIENTS_LIST_TAGS_CELL,
} from "@/components/admin/admin-clients-list-layout";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import { ADMIN_LIST_TITLE_LINK_CLASS } from "@/components/admin/admin-list-table-layout";
import type { ClientRow, ClientTag } from "@/components/admin/admin-clients-types";
import { formatDateCompactForUi, formatDateForUi } from "@/lib/date-display";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

type AdminClientCompactRowProps = {
  row: ClientRow;
  onSelect: (row: ClientRow) => void;
  onChanged: () => void;
  readOnly?: boolean;
};

export function AdminClientCompactRow({
  row,
  onSelect,
  onChanged,
  readOnly = false,
}: AdminClientCompactRowProps) {
  const t = useTranslations("adminPages.clients");
  const locale = useLocale();
  const name = fullName(row);

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
      <div className={ADMIN_CLIENTS_LIST_CELL}>
        <AdminListMobileLabel label={t("colName")} />
        <div className="flex min-w-0 items-center gap-3">
          <ClientAvatar row={row} />
          <div className="min-w-0 flex-1">
            <button
              type="button"
              className={ADMIN_LIST_TITLE_LINK_CLASS}
              title={name}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(row);
              }}
            >
              {name}
            </button>
            <p className="mt-0.5 truncate text-xs text-sage-500">{row.phone ?? row.email}</p>
          </div>
        </div>
      </div>

      <div className={ADMIN_CLIENTS_LIST_DATE_CELL}>
        <AdminListMobileLabel label={t("fieldBirthday")} />
        <p className="text-sm text-sage-800">
          {row.dateOfBirth ? formatDateForUi(row.dateOfBirth) : "—"}
        </p>
      </div>

      <div className={ADMIN_CLIENTS_LIST_TAGS_CELL}>
        <AdminListMobileLabel label={t("colTags")} />
        <ClientTags tags={row.tags} />
      </div>

      <div className={ADMIN_CLIENTS_LIST_DATE_CELL}>
        <AdminListMobileLabel label={t("colJoined")} />
        <p className="text-sm text-sage-800">{formatDateCompactForUi(row.createdAt, locale)}</p>
      </div>

      {readOnly ? null : (
        <>
          <div className={ADMIN_CLIENTS_LIST_SPACER_CELL} aria-hidden="true" />

          <div
            className={ADMIN_CLIENTS_LIST_ACTIONS_CELL}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <AdminListMobileLabel label={t("colActions")} />
            <AdminClientRowActions client={row} onChanged={onChanged} />
          </div>
        </>
      )}
    </article>
  );
}

function ClientTags({ tags }: { tags: readonly ClientTag[] }) {
  const t = useTranslations("adminPages.clients");

  if (tags.length === 0) {
    return <span className="text-sm text-sage-400">—</span>;
  }

  return (
    <>
      {tags.map((tag) => (
        <span
          key={tag}
          className={`${ADMIN_CLIENT_TAG_BADGE_CLASS} ${clientTagBadgeTone(tag)}`}
        >
          {t(clientTagLabelKey(tag))}
        </span>
      ))}
    </>
  );
}

function ClientAvatar({ row }: { row: ClientRow }) {
  const src = resolveApiAssetUrl(row.avatarUrl);
  if (src) {
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
  const initials = fullName(row)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-100 text-sm font-semibold text-sage-800">
      {initials || "?"}
    </div>
  );
}

function fullName(row: { name: string | null; lastName: string | null; email: string }) {
  return [row.name, row.lastName].filter(Boolean).join(" ").trim() || row.email;
}
