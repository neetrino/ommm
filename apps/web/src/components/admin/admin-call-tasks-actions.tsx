"use client";

import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";

type AdminCallTasksActionsProps = {
  pending: boolean;
  busy: boolean;
  onComplete: () => void;
  onEdit: () => void;
  onCancel: () => void;
};

export function AdminCallTasksActions({
  pending,
  busy,
  onComplete,
  onEdit,
  onCancel,
}: AdminCallTasksActionsProps) {
  const t = useTranslations("adminPages.calls");
  if (!pending) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <OmmButton type="button" size="sm" variant="primary" disabled={busy} onClick={onComplete}>
        {t("markDone")}
      </OmmButton>
      <OmmButton type="button" size="sm" variant="ghost" disabled={busy} onClick={onEdit}>
        {t("edit")}
      </OmmButton>
      <OmmButton type="button" size="sm" variant="danger" disabled={busy} onClick={onCancel}>
        {t("cancelTask")}
      </OmmButton>
    </div>
  );
}
