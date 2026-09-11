"use client";

import { useTranslations } from "next-intl";
import { AdminClientCompactRow } from "@/components/admin/admin-client-compact-row";
import {
  ADMIN_CLIENTS_LIST_ACTIONS_HEADER_CELL,
  ADMIN_CLIENTS_LIST_EMPHASIZED_HEADER,
  ADMIN_CLIENTS_LIST_HEADER_CLASS,
  ADMIN_CLIENTS_LIST_TABLE_CLASS,
  ADMIN_CLIENTS_LIST_TABLE_READONLY_CLASS,
} from "@/components/admin/admin-clients-list-layout";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import type { ClientCapabilities } from "@/lib/backoffice-capabilities";

type AdminClientsTableProps = {
  rows: ClientRow[];
  onSelect: (row: ClientRow) => void;
  onChanged: () => void;
  /** @deprecated Prefer `capabilities`. */
  readOnly?: boolean;
  capabilities?: ClientCapabilities;
};

export function AdminClientsTable({
  rows,
  onSelect,
  onChanged,
  readOnly = false,
  capabilities,
}: AdminClientsTableProps) {
  const t = useTranslations("adminPages.clients");
  const hideActions = capabilities ? !capabilities.canUpdate : readOnly;
  const tableClass = hideActions
    ? ADMIN_CLIENTS_LIST_TABLE_READONLY_CLASS
    : ADMIN_CLIENTS_LIST_TABLE_CLASS;

  return (
    <div className={tableClass}>
      <div className={ADMIN_CLIENTS_LIST_HEADER_CLASS}>
        <span>{t("colName")}</span>
        <span className={`${ADMIN_CLIENTS_LIST_EMPHASIZED_HEADER} md:text-center`}>
          {t("fieldBirthday")}
        </span>
        <span className={`${ADMIN_CLIENTS_LIST_EMPHASIZED_HEADER} md:text-center`}>
          {t("colJoined")}
        </span>
        <span className={`${ADMIN_CLIENTS_LIST_EMPHASIZED_HEADER} md:text-center`}>
          {t("colMembership")}
        </span>
        <span className={`${ADMIN_CLIENTS_LIST_EMPHASIZED_HEADER} md:text-center`}>
          {t("colBooking")}
        </span>
        {hideActions ? null : (
          <span className={ADMIN_CLIENTS_LIST_ACTIONS_HEADER_CELL}>{t("colActions")}</span>
        )}
      </div>
      {rows.map((row) => (
        <AdminClientCompactRow
          key={row.id}
          row={row}
          onSelect={onSelect}
          onChanged={onChanged}
          capabilities={capabilities}
          readOnly={hideActions}
        />
      ))}
    </div>
  );
}
