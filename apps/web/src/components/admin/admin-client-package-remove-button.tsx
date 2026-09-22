"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DeleteActionButton } from "@/components/ui/delete-action-button";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";

const REMOVE_CONFIRM_OVERLAY_CLASS = "ommm-modal-overlay z-[120] p-4";

type AdminClientPackageRemoveButtonProps = {
  clientId: string;
  packageId: string;
  onRemoved: () => void;
};

export function AdminClientPackageRemoveButton({
  clientId,
  packageId,
  onRemoved,
}: AdminClientPackageRemoveButtonProps) {
  const t = useTranslations("adminPages.clients");
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmRemove() {
    setPending(true);
    setError(null);
    try {
      await apiFetch(`/clients/${clientId}/packages/${packageId}`, {
        method: "DELETE",
      });
      setOpen(false);
      onRemoved();
    } catch (caught) {
      const fallback = t("packages.removePackageError");
      const message = caught instanceof ApiError ? caught.message : fallback;
      setError(message.length > 0 ? message : fallback);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <DeleteActionButton
        ariaLabel={t("packages.removePackage")}
        title={t("packages.removePackage")}
        disabled={pending}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      />
      <OmmConfirmDialog
        isOpen={open}
        title={t("packages.removePackageTitle")}
        description={t("packages.removePackageDescription")}
        confirmLabel={
          pending ? t("packages.removingPackage") : t("packages.removePackageConfirm")
        }
        cancelLabel={t("cancelButton")}
        backdropAriaLabel={t("modalBackdropClose")}
        tone="danger"
        confirmVariant="danger"
        overlayClassName={REMOVE_CONFIRM_OVERLAY_CLASS}
        pending={pending}
        onConfirm={() => {
          void confirmRemove();
        }}
        onCancel={() => {
          if (!pending) {
            setOpen(false);
          }
        }}
      >
        {error !== null ? <p className="text-sm text-red-800">{error}</p> : null}
      </OmmConfirmDialog>
    </>
  );
}
