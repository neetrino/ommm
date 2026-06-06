"use client";

import { useTranslations } from "next-intl";
import { AdminConfirmSheet } from "@/components/admin/admin-confirm-sheet";

type AdminClassTypesDeleteDialogProps = {
  typeName: string;
  sessionCount: number;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AdminClassTypesDeleteDialog({
  typeName,
  sessionCount,
  pending,
  onCancel,
  onConfirm,
}: AdminClassTypesDeleteDialogProps) {
  const t = useTranslations("adminPages.classes.classTypes");

  return (
    <AdminConfirmSheet
      isOpen
      title={t("deleteDialog.title")}
      description={t("deleteDialog.description", { name: typeName })}
      confirmLabel={pending ? t("savingButton") : t("deleteButton")}
      cancelLabel={t("cancelButton")}
      backdropAriaLabel={t("cancelButton")}
      tone="danger"
      confirmClassName="ommm-btn-lifecycle-action--danger"
      confirmDisabled={sessionCount > 0}
      pending={pending}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      {sessionCount > 0 ? (
        <p className="mt-3 rounded-xl border border-red-200/80 bg-red-50 px-3 py-2 text-sm text-red-900">
          {t("deleteBlocked", { count: sessionCount })}
        </p>
      ) : (
        <p className="mt-3 rounded-xl border border-sand-300/60 bg-sand-50 px-3 py-2 text-xs text-sage-700">
          {t("deleteDialog.warning")}
        </p>
      )}
    </AdminConfirmSheet>
  );
}
