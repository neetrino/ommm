"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminPackageDeletionBlockersPanel } from "@/components/admin/admin-package-deletion-blockers-panel";
import { AdminClientDrawerById } from "@/components/admin/admin-client-drawer-by-id";
import type { PackageDeletionBlockersResponse } from "@/components/admin/admin-package-deletion-blocker-types";
import {
  buildPackagesPathname,
  PACKAGE_DELETE_MEMBER_QUERY_KEY,
  PACKAGE_DELETE_SHOW_MEMBERS_QUERY_KEY,
} from "@/components/admin/admin-packages-url";
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

function readShowMembersFromUrl(searchParams: URLSearchParams): boolean {
  return (
    searchParams.get(PACKAGE_DELETE_SHOW_MEMBERS_QUERY_KEY) === "1" ||
    searchParams.get(PACKAGE_DELETE_MEMBER_QUERY_KEY) !== null
  );
}

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const memberIdFromUrl = searchParams.get(PACKAGE_DELETE_MEMBER_QUERY_KEY);
  const showMembersFromUrl = readShowMembersFromUrl(searchParams);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  type BlockersCache = {
    packageId: string;
    blockers: PackageDeletionBlockersResponse | null;
  };

  const [blockersCache, setBlockersCache] = useState<BlockersCache | null>(null);
  const shouldLoadBlockers = isOpen && packageId.length > 0;
  const loadingBlockers =
    shouldLoadBlockers &&
    (blockersCache === null || blockersCache.packageId !== packageId);
  const blockers =
    blockersCache?.packageId === packageId ? blockersCache.blockers : null;
  const [showMemberList, setShowMemberList] = useState(showMembersFromUrl);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(memberIdFromUrl);
  const [prevMemberIdFromUrl, setPrevMemberIdFromUrl] = useState(memberIdFromUrl);
  const [prevShowMembersFromUrl, setPrevShowMembersFromUrl] = useState(showMembersFromUrl);

  if (memberIdFromUrl !== prevMemberIdFromUrl) {
    setPrevMemberIdFromUrl(memberIdFromUrl);
    setSelectedMemberId(memberIdFromUrl);
  }

  if (showMembersFromUrl !== prevShowMembersFromUrl) {
    setPrevShowMembersFromUrl(showMembersFromUrl);
    setShowMemberList(showMembersFromUrl);
  }

  const replaceSearchParams = useCallback(
    (mutator: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutator(params);
      router.replace(buildPackagesPathname(pathname, params), { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (!shouldLoadBlockers) {
      return undefined;
    }
    let cancelled = false;
    void apiFetch<PackageDeletionBlockersResponse>(
      `/packages/admin/plans/${encodeURIComponent(packageId)}/deletion-blockers`,
    )
      .then((payload) => {
        if (!cancelled) {
          setBlockersCache({ packageId, blockers: payload });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBlockersCache({ packageId, blockers: null });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [packageId, shouldLoadBlockers]);

  if (!isOpen) {
    return null;
  }

  const trimmedName = packageName.trim();
  const blockerCount = blockers?.count ?? 0;
  const hasBlockers = blockerCount > 0;
  const deleteDisabled = pending || hasBlockers;
  const memberDrawerOpen = selectedMemberId !== null;

  async function loadBlockers(showList: boolean): Promise<void> {
    setBlockersCache(null);
    try {
      const payload = await apiFetch<PackageDeletionBlockersResponse>(
        `/packages/admin/plans/${encodeURIComponent(packageId)}/deletion-blockers`,
      );
      setBlockersCache({ packageId, blockers: payload });
      if (showList && payload.count > 0) {
        setShowMemberList(true);
        replaceSearchParams((params) => {
          params.set(PACKAGE_DELETE_SHOW_MEMBERS_QUERY_KEY, "1");
        });
      }
    } catch {
      setBlockersCache({ packageId, blockers: null });
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
    setSelectedMemberId(null);
    onClose();
  }

  function handleViewMembers(): void {
    setShowMemberList(true);
    replaceSearchParams((params) => {
      params.set(PACKAGE_DELETE_SHOW_MEMBERS_QUERY_KEY, "1");
    });
  }

  function handleMemberClick(memberId: string): void {
    setSelectedMemberId(memberId);
    setShowMemberList(true);
    replaceSearchParams((params) => {
      params.set(PACKAGE_DELETE_SHOW_MEMBERS_QUERY_KEY, "1");
      params.set(PACKAGE_DELETE_MEMBER_QUERY_KEY, memberId);
    });
  }

  function handleMemberClose(): void {
    setSelectedMemberId(null);
    replaceSearchParams((params) => {
      params.delete(PACKAGE_DELETE_MEMBER_QUERY_KEY);
    });
  }

  return (
    <>
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
        lockBodyScroll={!memberDrawerOpen}
        closeOnEscape={!memberDrawerOpen}
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
                onMemberClick={handleMemberClick}
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
      <AdminClientDrawerById
        clientId={selectedMemberId}
        locale={locale}
        onClose={handleMemberClose}
        onChanged={() => void loadBlockers(true)}
        useOverlayPortalRoot
      />
    </>
  );
}
