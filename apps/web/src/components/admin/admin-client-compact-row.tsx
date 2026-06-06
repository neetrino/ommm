"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { AdminClientRowActions } from "@/components/admin/admin-client-row-actions";
import {
  ADMIN_CLIENTS_LIST_ACTIONS_CELL,
  ADMIN_CLIENTS_LIST_CELL,
  ADMIN_CLIENTS_LIST_ROW_ACTIONS_HOVER_REVEAL,
  ADMIN_CLIENTS_LIST_ROW_CLASS,
  ADMIN_CLIENTS_LIST_SPACER_CELL,
} from "@/components/admin/admin-clients-list-layout";
import { AdminListMobileLabel } from "@/components/admin/admin-list-mobile-label";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import { formatDateForUi } from "@/lib/date-display";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

type AdminClientCompactRowProps = {
  row: ClientRow;
  onSelect: (row: ClientRow) => void;
  onChanged: () => void;
};

export function AdminClientCompactRow({ row, onSelect, onChanged }: AdminClientCompactRowProps) {
  const t = useTranslations("adminPages.clients");
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
        <AdminListMobileLabel label={t("title")} />
        <div className="flex items-center gap-3">
          <ClientAvatar row={row} />
          <div className="min-w-0">
            <button
              type="button"
              className="block max-w-full truncate text-left text-sm font-medium text-sage-900 underline-offset-2 hover:underline"
              title={name}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(row);
              }}
            >
              {name}
            </button>
            <p className="mt-0.5 truncate text-xs text-sage-500">{row.phone ?? "—"}</p>
            {row.tags.length > 0 ? (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {row.tags.map((tag) => (
                  <ClientBadge key={tag} label={tag} />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className={`${ADMIN_CLIENTS_LIST_CELL} md:text-center`}>
        <AdminListMobileLabel label="Date of birth" />
        <p className="text-sm text-sage-800">
          {row.dateOfBirth ? formatDateForUi(row.dateOfBirth) : "—"}
        </p>
      </div>

      <div className={`${ADMIN_CLIENTS_LIST_CELL} md:text-center`}>
        <AdminListMobileLabel label="Register date" />
        <p className="text-sm text-sage-800">{formatDateForUi(row.createdAt)}</p>
      </div>

      <div className={`${ADMIN_CLIENTS_LIST_CELL} md:text-center`}>
        <AdminListMobileLabel label="Notes" />
        <p className="text-sm font-medium text-sage-900">{row.noteCount}</p>
        {row.latestNote ? (
          <p className="mt-0.5 truncate text-xs text-sage-500">{row.latestNote.body}</p>
        ) : null}
      </div>

      <div className={ADMIN_CLIENTS_LIST_SPACER_CELL} aria-hidden="true" />

      <div
        className={`${ADMIN_CLIENTS_LIST_ACTIONS_CELL} ${ADMIN_CLIENTS_LIST_ROW_ACTIONS_HOVER_REVEAL}`}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <AdminListMobileLabel label={t("colActions")} />
        <AdminClientRowActions client={row} onChanged={onChanged} />
      </div>
    </article>
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

function ClientBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full border border-mint-200 bg-mint-50 px-2 py-0.5 text-xs text-sage-900">
      {label}
    </span>
  );
}

function fullName(row: { name: string | null; lastName: string | null; email: string }) {
  return [row.name, row.lastName].filter(Boolean).join(" ").trim() || row.email;
}
