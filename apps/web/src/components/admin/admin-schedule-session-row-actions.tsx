"use client";

import { useTranslations } from "next-intl";
import {
  ADMIN_SCHEDULE_STATUS_BADGE_CLASS,
  sessionStatusBadgeTone,
} from "@/components/admin/admin-schedule-session-list-badges";
import {
  ADMIN_ACTION_ICON_CLASS,
  CancelGlyph,
  CheckCircleGlyph,
} from "@/components/ui/admin-action-glyphs";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";
import { OmmButton } from "@/components/ui/omm-button";

type SessionStatus = "ACTIVE" | "CANCELLED" | "FULL" | "DRAFT";

type SessionRowRef = {
  id: string;
  status: SessionStatus;
};

type AdminScheduleSessionRowActionsProps<TRow extends SessionRowRef> = {
  variant?: "list" | "sheet";
  row: TRow;
  busy: boolean;
  includeDelete?: boolean;
  onEdit?: (row: TRow) => void;
  onDuplicate?: (row: TRow) => void;
  onCancel: (row: TRow) => void;
  onActivate: (row: TRow) => void;
  onDelete?: (row: TRow) => void;
};

export function AdminScheduleSessionRowActions<TRow extends SessionRowRef>({
  variant = "list",
  row,
  busy,
  includeDelete = false,
  onEdit,
  onDuplicate,
  onCancel,
  onActivate,
  onDelete,
}: AdminScheduleSessionRowActionsProps<TRow>) {
  const t = useTranslations("adminPages.classes");
  const isCancelled = row.status === "CANCELLED";
  const statusLabel = t(`status.${row.status}`);

  if (variant === "list") {
    return (
      <div
        className="flex items-center justify-end gap-2"
        role="group"
        aria-label={t("colActions")}
      >
        <span className={`${ADMIN_SCHEDULE_STATUS_BADGE_CLASS} ${sessionStatusBadgeTone(row.status)}`}>
          {statusLabel}
        </span>
        {isCancelled ? (
          <AdminRowIconButton
            ariaLabel={t("activateAction")}
            title={t("activateAction")}
            onClick={(event) => {
              event.stopPropagation();
              onActivate(row);
            }}
            disabled={busy}
          >
            <CheckCircleGlyph className={ADMIN_ACTION_ICON_CLASS} />
          </AdminRowIconButton>
        ) : (
          <AdminRowIconButton
            ariaLabel={t("cancelAction")}
            title={t("cancelAction")}
            variant="danger"
            onClick={(event) => {
              event.stopPropagation();
              onCancel(row);
            }}
            disabled={busy}
          >
            <CancelGlyph className={ADMIN_ACTION_ICON_CLASS} />
          </AdminRowIconButton>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-wrap items-center justify-end gap-2">
      {onEdit ? (
        <OmmButton type="button" size="sm" variant="secondary" disabled={busy} onClick={() => onEdit(row)}>
          {t("editButton")}
        </OmmButton>
      ) : null}
      {onDuplicate ? (
        <OmmButton type="button" size="sm" variant="ghost" disabled={busy} onClick={() => onDuplicate(row)}>
          {t("duplicateButton")}
        </OmmButton>
      ) : null}
      {isCancelled ? (
        <OmmButton type="button" size="sm" variant="secondary" disabled={busy} onClick={() => onActivate(row)}>
          {t("activateAction")}
        </OmmButton>
      ) : (
        <OmmButton type="button" size="sm" variant="ghost" disabled={busy} onClick={() => onCancel(row)}>
          {t("cancelAction")}
        </OmmButton>
      )}
      {includeDelete && onDelete ? (
        <OmmButton type="button" size="sm" variant="danger" disabled={busy} onClick={() => onDelete(row)}>
          {t("actions.delete")}
        </OmmButton>
      ) : null}
    </div>
  );
}
