"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { OmmButton } from "@/components/ui/omm-button";

type AdminClassTypeDeleteActionProps = {
  typeName: string;
  sessionCount: number;
  disabled?: boolean;
  pending?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function AdminClassTypeDeleteAction({
  typeName,
  sessionCount,
  disabled = false,
  pending = false,
  onConfirm,
}: AdminClassTypeDeleteActionProps) {
  const t = useTranslations("adminPages.classes.classTypes");
  const [open, setOpen] = useState(false);
  const wasPendingRef = useRef(false);

  useEffect(() => {
    if (wasPendingRef.current && !pending) {
      setOpen(false);
    }
    wasPendingRef.current = pending;
  }, [pending]);

  function closeDialog(): void {
    if (pending) {
      return;
    }
    setOpen(false);
  }

  return (
    <>
      <OmmButton
        type="button"
        size="sm"
        variant="danger"
        disabled={disabled || pending}
        onClick={() => setOpen(true)}
      >
        {pending ? t("savingButton") : t("deleteButton")}
      </OmmButton>

      <OmmConfirmDialog
        isOpen={open}
        title={t("deleteDialog.title")}
        description={t("deleteDialog.description", { name: typeName })}
        confirmLabel={pending ? t("savingButton") : t("deleteButton")}
        cancelLabel={t("cancelButton")}
        backdropAriaLabel={t("modalBackdropClose")}
        tone="danger"
        confirmClassName="ommm-btn-lifecycle-action--danger"
        pending={pending}
        onConfirm={() => {
          void onConfirm();
        }}
        onCancel={closeDialog}
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
      </OmmConfirmDialog>
    </>
  );
}
