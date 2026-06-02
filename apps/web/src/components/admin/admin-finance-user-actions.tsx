"use client";

import { useTranslations } from "next-intl";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import { AdminRowIconButton, AdminRowIconGroup } from "@/components/ui/admin-row-icon-button";
import { PencilGlyph } from "@/components/ui/admin-action-glyphs";

type Props = {
  row: ClientRow;
  onEdit: () => void;
  onChanged: () => void;
};

export function AdminFinanceUserActions({ row, onEdit, onChanged }: Props) {
  const t = useTranslations("adminPages.clients");
  void row;
  void onChanged;

  return (
    <AdminRowIconGroup>
      <AdminRowIconButton
        ariaLabel={t("editClient")}
        title={t("editClient")}
        className="ommm-admin-row-icon-button-lg"
        onClick={onEdit}
      >
        <PencilGlyph className="h-5 w-5 shrink-0" />
      </AdminRowIconButton>
    </AdminRowIconGroup>
  );
}
