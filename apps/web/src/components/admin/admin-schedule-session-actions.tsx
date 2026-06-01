"use client";

import { useTranslations } from "next-intl";
import {
  ADMIN_ACTION_ICON_CLASS,
  CancelGlyph,
  CheckCircleGlyph,
  CopyGlyph,
  EyeGlyph,
  PencilGlyph,
  TrashGlyph,
} from "@/components/ui/admin-action-glyphs";
import { AdminRowIconButton, AdminRowIconGroup } from "@/components/ui/admin-row-icon-button";

type ScheduleSessionStatus = "ACTIVE" | "CANCELLED" | "FULL" | "DRAFT";

type AdminScheduleSessionActionsProps<TRow extends { id: string; status: ScheduleSessionStatus }> = {
  row: TRow;
  busy: boolean;
  includeDelete?: boolean;
  onDetails: (row: TRow) => void;
  onEdit: (row: TRow) => void;
  onDuplicate: (row: TRow) => void;
  onCancel: (row: TRow) => void;
  onActivate: (row: TRow) => void;
  onDelete?: (row: TRow) => void;
};

export function AdminScheduleSessionActions<TRow extends { id: string; status: ScheduleSessionStatus }>({
  row,
  busy,
  includeDelete = false,
  onDetails,
  onEdit,
  onDuplicate,
  onCancel,
  onActivate,
  onDelete,
}: AdminScheduleSessionActionsProps<TRow>) {
  const t = useTranslations("adminPages.classes");
  const isCancelled = row.status === "CANCELLED";

  return (
    <AdminRowIconGroup>
      <AdminRowIconButton
        ariaLabel={t("actions.view")}
        title={t("actions.view")}
        onClick={() => onDetails(row)}
        disabled={busy}
      >
        <EyeGlyph className={ADMIN_ACTION_ICON_CLASS} />
      </AdminRowIconButton>
      <AdminRowIconButton
        ariaLabel={t("editButton")}
        title={t("editButton")}
        onClick={() => onEdit(row)}
        disabled={busy}
      >
        <PencilGlyph className={ADMIN_ACTION_ICON_CLASS} />
      </AdminRowIconButton>
      <AdminRowIconButton
        ariaLabel={t("duplicateButton")}
        title={t("duplicateButton")}
        variant="subtle"
        onClick={() => onDuplicate(row)}
        disabled={busy}
      >
        <CopyGlyph className={ADMIN_ACTION_ICON_CLASS} />
      </AdminRowIconButton>
      {isCancelled ? (
        <AdminRowIconButton
          ariaLabel={t("activateAction")}
          title={t("activateAction")}
          onClick={() => onActivate(row)}
          disabled={busy}
        >
          <CheckCircleGlyph className={ADMIN_ACTION_ICON_CLASS} />
        </AdminRowIconButton>
      ) : (
        <AdminRowIconButton
          ariaLabel={t("cancelAction")}
          title={t("cancelAction")}
          variant="danger"
          onClick={() => onCancel(row)}
          disabled={busy}
        >
          <CancelGlyph className={ADMIN_ACTION_ICON_CLASS} />
        </AdminRowIconButton>
      )}
      {includeDelete && onDelete ? (
        <AdminRowIconButton
          ariaLabel={t("actions.delete")}
          title={t("actions.delete")}
          variant="danger"
          onClick={() => onDelete(row)}
          disabled={busy}
        >
          <TrashGlyph className={ADMIN_ACTION_ICON_CLASS} />
        </AdminRowIconButton>
      ) : null}
    </AdminRowIconGroup>
  );
}
