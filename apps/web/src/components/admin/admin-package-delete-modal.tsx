"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminPackageDeletionBlockersPanel } from "@/components/admin/admin-package-deletion-blockers-panel";
import type { PackageDeletionBlockersResponse } from "@/components/admin/admin-package-deletion-blocker-types";
import { OmmConfirmDialog } from "@/components/ui/omm-confirm-dialog";
import { ApiError, apiFetch } from "@/lib/api";

const DELETE_PACKAGE_CONFIRM_CLASS = "ommm-btn-lifecycle-action--danger";

type AdminPackageDeleteModalProps = {
  isOpen: boolean;
  packageId: string;
  packageName: string;
  locale: string;
  onClose: () => void;
  onDeleted: (packageId: string) => void;
};

export function AdminPackageDeleteModal({
  isOpen,
  packageId,
  packageName,
  locale,
  onClose,
  onDeleted,
}: AdminPackageDeleteModalProps) {
  const t = useTranslations("adminPages.packages");
  const tBlockers = useTranslations("adminPages.packages.deletionBlockers");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockers, setBlockers] = useState<PackageDeletionBlockersResponse | null>(null);
  const [loadingBlockers, setLoadingBlockers] = useState(false);
  const [showMemberList, setShowMemberList] = useState(false);

  useEffect(() => {
    if (!isOpen || packageId.length === 0) {
      return undefined;
    }
    let cancelled = false;
    setLoadingBlockers(true);
    setBlockers(null);
    setShowMemberList(false);
    setError(null);
    void apiFetch<PackageDeletionBlockersResponse>(
      `/packages/admin/plans/${encodeURIComponent(packageId)}/deletion-blockers`,
    )
      .then((payload) => {
        if (cancelled) {
          return;
        }
        setBlockers(payload);
      })
      .catch(() => {
        if (!cancelled) {
          setBlockers(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingBlockers(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, packageId]);

  if (!isOpen) {
    return null;
  }

  const trimmedName = packageName.trim();
  const blockerCount = blockers?.count ?? 0;
  const hasBlockers = blockerCount > 0;
  const deleteDisabled = pending || hasBlockers;

  async function loadBlockers(showList: boolean): Promise<void> {
    setLoadingBlockers(true);
    try {
      const payload = await apiFetch<PackageDeletionBlockersResponse>(
        `/packages/admin/plans/${encodeURIComponent(packageId)}/deletion-blockers`,
      );
      setBlockers(payload);
      if (showList && payload.count > 0) {
        setShowMemberList(true);
      }
    } catch {
      setBlockers(null);
    } finally {
      setLoadingBlockers(false);
    }
  }

  async function onConfirm(): Promise<void> {
    if (deleteDisabled) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      await apiFetch(`/packages/plans/${packageId}`, { method: "DELETE" });
      onDeleted(packageId);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("genericError"));
      await loadBlockers(true);
    } finally {
      setPending(false);
    }
  }

  function handleCancel(): void {
    if (pending) {
      return;
    }
    setError(null);
    setShowMemberList(false);
    onClose();
  }

  function handleViewMembers(): void {
    setShowMemberList(true);
  }

  return (
    <OmmConfirmDialog
      isOpen={isOpen}
      title={t("deletePackageTitle")}
      description={t("deletePackageDescription", { name: trimmedName })}
      confirmLabel={pending ? t("deletingButton") : t("deletePackageConfirmButton")}
      cancelLabel={t("cancelButton")}
      backdropAriaLabel={t("modalBackdropClose")}
      tone="danger"
      confirmClassName={DELETE_PACKAGE_CONFIRM_CLASS}
      pending={pending}
      confirmPending={deleteDisabled}
      onConfirm={() => void onConfirm()}
      onCancel={handleCancel}
    >
      <p className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-900">
        {t("deletePackageWarning")}
      </p>

      {loadingBlockers ? (
        <p className="text-sm text-sage-600">{tBlockers("loading")}</p>
      ) : null}

      {!loadingBlockers && hasBlockers ? (
        <div className="space-y-3">
          <p className="text-sm text-red-800" role="status">
            {tBlockers("blockedSummary", { count: blockerCount })}
          </p>
          {!showMemberList ? (
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-amber-300/90 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-950 transition-colors hover:bg-amber-100/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2"
              onClick={handleViewMembers}
            >
              {tBlockers("viewMembersButton", { count: blockerCount })}
            </button>
          ) : (
            <AdminPackageDeletionBlockersPanel
              blockers={blockers?.memberships ?? []}
              locale={locale}
            />
          )}
        </div>
      ) : null}

      {error !== null ? (
        <div className="space-y-3">
          <p className="text-sm text-red-800" role="alert">
            {error}
          </p>
          {hasBlockers && !showMemberList ? (
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-amber-300/90 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-950 transition-colors hover:bg-amber-100/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2"
              onClick={handleViewMembers}
            >
              {tBlockers("viewMembersButton", { count: blockerCount })}
            </button>
          ) : null}
        </div>
      ) : null}
    </OmmConfirmDialog>
  );
}
