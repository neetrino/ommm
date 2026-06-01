"use client";

import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmModalBackdrop, OMM_MODAL_OVERLAY_CLASS } from "@/components/ui/omm-modal";

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
    <div className={`${OMM_MODAL_OVERLAY_CLASS} z-[60] items-center p-4`} role="presentation">
      <OmmModalBackdrop onClose={onCancel} ariaLabel={t("cancelButton")} disabled={pending} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="class-type-delete-title"
        className="relative z-10 w-full max-w-md rounded-[24px] border border-white/60 bg-white/90 p-5 shadow-[0_24px_60px_-28px_rgba(45,40,35,0.35)] backdrop-blur-md"
      >
        <h3 id="class-type-delete-title" className="text-base font-semibold text-sage-900">
          {t("deleteDialog.title")}
        </h3>
        <p className="mt-2 text-sm text-sage-700">
          {t("deleteDialog.description", { name: typeName })}
        </p>
        {sessionCount > 0 ? (
          <p className="mt-3 rounded-xl border border-red-200/80 bg-red-50 px-3 py-2 text-sm text-red-900">
            {t("deleteBlocked", { count: sessionCount })}
          </p>
        ) : (
          <p className="mt-3 rounded-xl border border-sand-300/60 bg-sand-50 px-3 py-2 text-xs text-sage-700">
            {t("deleteDialog.warning")}
          </p>
        )}
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <OmmButton type="button" size="sm" variant="ghost" disabled={pending} onClick={onCancel}>
            {t("cancelButton")}
          </OmmButton>
          <OmmButton
            type="button"
            size="sm"
            variant="danger"
            disabled={pending || sessionCount > 0}
            onClick={onConfirm}
          >
            {pending ? t("savingButton") : t("deleteButton")}
          </OmmButton>
        </div>
      </div>
    </div>
  );
}
