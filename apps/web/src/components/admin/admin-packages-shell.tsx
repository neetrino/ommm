"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminPackageForm, resolveAdminPackageFormKey } from "@/components/admin/admin-package-form";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import {
  ADMIN_CREATE_SHEET_BODY_SHELL_CLASS,
  ADMIN_CREATE_SHEET_HEADER_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import type { AdminPackagesCategoryOption } from "@/components/admin/admin-packages-category-multi-select";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import {
  buildPackagesPathname,
  clearPackageModalQueryKeys,
  PACKAGE_CATEGORY_QUERY_KEY,
  PACKAGE_EDIT_QUERY_KEY,
  PACKAGE_MODAL_CREATE_VALUE,
  PACKAGE_MODAL_PRICING_VALUE,
  PACKAGE_MODAL_EDIT_TIER_VALUE,
  PACKAGE_MODAL_ADD_TIER_VALUE,
  PACKAGE_MODAL_QUERY_KEY,
  PACKAGE_PRICING_QUERY_KEY,
} from "@/components/admin/admin-packages-url";

const BANNER_MS = 8000;

type AdminPackagesShellProps = {
  children: ReactNode;
  packages: readonly AdminPackageRow[];
  classTypeOptions: readonly { id: string; name: string }[];
  categoryOptions: readonly AdminPackagesCategoryOption[];
  defaultCategoryName?: string;
  onPackageCreated?: (saved: AdminPackageRow) => void;
  onPackageUpdated?: (saved: AdminPackageRow) => void;
};

export function AdminPackagesShell({
  children,
  packages,
  classTypeOptions,
  categoryOptions,
  defaultCategoryName = "",
  onPackageCreated,
  onPackageUpdated,
}: AdminPackagesShellProps) {
  const t = useTranslations("adminPages.packages");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCreateModalOpen = searchParams.get(PACKAGE_MODAL_QUERY_KEY) === PACKAGE_MODAL_CREATE_VALUE;
  const editingPackageId = searchParams.get(PACKAGE_EDIT_QUERY_KEY);
  const pricingPackageId = searchParams.get(PACKAGE_PRICING_QUERY_KEY);
  const categoryIdFromQuery = searchParams.get(PACKAGE_CATEGORY_QUERY_KEY);
  const addTierCategorySlug = categoryIdFromQuery?.trim() ?? "";
  const isAddTierModalOpen =
    searchParams.get(PACKAGE_MODAL_QUERY_KEY) === PACKAGE_MODAL_ADD_TIER_VALUE &&
    addTierCategorySlug.length > 0;
  const isEditTierModalOpen =
    searchParams.get(PACKAGE_MODAL_QUERY_KEY) === PACKAGE_MODAL_EDIT_TIER_VALUE &&
    pricingPackageId !== null &&
    packages.some((pkg) => pkg.id === pricingPackageId && pkg.priceCents > 0);
  const isPricingModalOpen =
    searchParams.get(PACKAGE_MODAL_QUERY_KEY) === PACKAGE_MODAL_PRICING_VALUE &&
    pricingPackageId !== null &&
    packages.some((pkg) => pkg.id === pricingPackageId);
  const isEditModalOpen =
    editingPackageId !== null && packages.some((pkg) => pkg.id === editingPackageId);
  const isModalOpen =
    isCreateModalOpen ||
    isEditModalOpen ||
    isPricingModalOpen ||
    isEditTierModalOpen ||
    isAddTierModalOpen;
  const modalMode = isEditModalOpen
    ? "edit"
    : isPricingModalOpen
      ? "pricing"
      : isEditTierModalOpen
        ? "edit-tier"
        : isAddTierModalOpen
          ? "add-tier"
          : "create";
  const editingPackage =
    isEditModalOpen && editingPackageId !== null
      ? packages.find((pkg) => pkg.id === editingPackageId)
      : undefined;
  const pricingPackage =
    (isPricingModalOpen || isEditTierModalOpen) && pricingPackageId !== null
      ? packages.find((pkg) => pkg.id === pricingPackageId)
      : undefined;
  const addTierShellPlan =
    isAddTierModalOpen && pricingPackageId !== null
      ? packages.find((pkg) => pkg.id === pricingPackageId && pkg.priceCents <= 0)
      : undefined;
  const addTierCategoryAnchor = useMemo(() => {
    if (!isAddTierModalOpen) {
      return undefined;
    }
    return packages.find((pkg) => pkg.categorySlug === addTierCategorySlug);
  }, [addTierCategorySlug, isAddTierModalOpen, packages]);
  const nextDisplayOrder = useMemo(() => {
    if (packages.length === 0) {
      return 1;
    }
    const maxDisplayOrder = Math.max(...packages.map((pkg) => pkg.displayOrder));
    return maxDisplayOrder + 1;
  }, [packages]);
  const initialCategoryName = useMemo(() => {
    if (isAddTierModalOpen && addTierCategorySlug.length > 0) {
      return addTierCategorySlug;
    }
    if (editingPackage !== undefined && editingPackage.categoryName.trim().length > 0) {
      return editingPackage.categoryName.trim();
    }
    if (pricingPackage !== undefined && pricingPackage.categoryName.trim().length > 0) {
      return pricingPackage.categoryName.trim();
    }
    return categoryOptions[0]?.label ?? defaultCategoryName;
  }, [
    addTierCategorySlug,
    categoryOptions,
    defaultCategoryName,
    editingPackage,
    isAddTierModalOpen,
    pricingPackage,
  ]);
  const modalPackageId =
    modalMode === "pricing" || modalMode === "edit-tier"
      ? pricingPackage?.id
      : modalMode === "add-tier"
        ? addTierShellPlan?.id
        : editingPackage?.id;
  const modalFormKey = resolveAdminPackageFormKey(
    modalMode,
    modalPackageId,
    initialCategoryName,
  );

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    clearPackageModalQueryKeys(params);
    router.replace(buildPackagesPathname(pathname, params));
  }, [pathname, router, searchParams]);

  const showSuccessBanner = useCallback(
    (message: string) => {
      if (bannerTimerRef.current !== null) {
        clearTimeout(bannerTimerRef.current);
      }
      setBanner(message);
      bannerTimerRef.current = setTimeout(() => {
        setBanner(null);
        bannerTimerRef.current = null;
      }, BANNER_MS);
    },
    [],
  );

  const onCreated = useCallback(
    (saved: AdminPackageRow) => {
      onPackageCreated?.(saved);
      showSuccessBanner(t("messages.createGroupSuccess"));
      const params = new URLSearchParams(searchParams.toString());
      clearPackageModalQueryKeys(params);
      router.replace(buildPackagesPathname(pathname, params));
      window.setTimeout(() => {
        router.refresh();
      }, 0);
    },
    [onPackageCreated, pathname, router, searchParams, showSuccessBanner, t],
  );

  const onUpdated = useCallback(
    (saved: AdminPackageRow) => {
      onPackageUpdated?.(saved);
      showSuccessBanner(
        modalMode === "add-tier"
          ? t("messages.pageAddedSuccess")
          : modalMode === "edit-tier"
            ? t("messages.pageUpdatedSuccess")
            : t("messages.updateSuccess"),
      );
      const params = new URLSearchParams(searchParams.toString());
      clearPackageModalQueryKeys(params);
      router.replace(buildPackagesPathname(pathname, params));
      window.setTimeout(() => {
        router.refresh();
      }, 0);
    },
    [modalMode, onPackageUpdated, pathname, router, searchParams, showSuccessBanner, t],
  );

  useEffect(() => {
    return () => {
      if (bannerTimerRef.current !== null) {
        clearTimeout(bannerTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isModalOpen || panelRef.current === null) {
      return;
    }
    const focusable = panelRef.current.querySelector<HTMLElement>(
      'input[name="name"], input[name="durationDays"]',
    );
    focusable?.focus();
  }, [isModalOpen, modalMode, editingPackageId]);

  const modalTitle =
    modalMode === "edit"
      ? t("editTitle")
      : modalMode === "pricing"
        ? t("pricingTitle")
        : modalMode === "edit-tier"
          ? t("editPageTitle")
          : modalMode === "add-tier"
            ? t("addPageTitle")
            : t("createGroupTitle");
  const modalDescription =
    modalMode === "edit"
      ? t("editDescription")
      : modalMode === "pricing"
        ? t("pricingDescription")
        : modalMode === "edit-tier"
          ? t("editPageDescription")
          : modalMode === "add-tier"
            ? t("addPageDescription")
            : t("createGroupDescription");
  const isCreateGroupModal = modalMode === "create";
  const showModalDescription = !isCreateGroupModal;
  const packageModalPanelClass = isCreateGroupModal
    ? "mt-auto flex w-full max-w-[min(480px,95vw)] flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_24px_60px_-28px_rgba(45,40,35,0.4)] backdrop-blur-md sm:mt-0"
    : "mt-auto flex max-h-[92vh] w-full max-w-[min(720px,95vw)] flex-col overflow-hidden rounded-t-[28px] border border-white/60 bg-white/85 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)] backdrop-blur-md sm:mt-0 sm:rounded-[28px]";

  return (
    <>
      <div>
        {banner !== null && banner.length > 0 ? (
          <p
            className="mb-6 rounded-2xl border border-mint-200/80 bg-mint-50/90 px-4 py-3 text-sm text-sage-800 shadow-[0_12px_28px_-18px_rgba(45,40,35,0.18)]"
            role="status"
          >
            {banner}
          </p>
        ) : null}
        {children}
      </div>

      <AdminSheetPortal presentation="modal"
        isOpen={isModalOpen}
        onClose={closeModal}
        backdropAriaLabel={t("modalBackdropClose")}
        modalOverlayClassName="ommm-modal-overlay z-[100]"
        modalPanelClassName={packageModalPanelClass}
      >
          <div
            ref={panelRef}
            aria-labelledby={isCreateGroupModal ? undefined : titleId}
            aria-label={isCreateGroupModal ? t("createGroupTitle") : undefined}
            aria-describedby={showModalDescription ? descId : undefined}
            className="flex flex-col"
          >
          {isCreateGroupModal ? (
            <div className="flex min-h-0 flex-col">
              <AdminPackageForm
                key={modalFormKey}
                mode={modalMode}
                packageId={undefined}
                initialCategoryName={initialCategoryName}
                categoryOptions={categoryOptions}
                classTypeOptions={classTypeOptions}
                initialPackage={undefined}
                nextDisplayOrder={nextDisplayOrder}
                onSaved={onCreated}
                onCancel={closeModal}
                showCloseButton
              />
            </div>
          ) : (
            <>
          <div className={ADMIN_CREATE_SHEET_HEADER_CLASS}>
            <div>
              <h2 id={titleId} className={adminChrome.panelHeading}>
                {modalTitle}
              </h2>
              {showModalDescription ? (
                <p id={descId} className="ommm-body-muted mt-1 text-sm">
                  {modalDescription}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              aria-label={t("modalCloseAria")}
              onClick={closeModal}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                className="h-5 w-5"
                aria-hidden
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className={ADMIN_CREATE_SHEET_BODY_SHELL_CLASS}>
            <AdminPackageForm
              key={modalFormKey}
              mode={modalMode}
              packageId={
                modalMode === "pricing" || modalMode === "edit-tier"
                  ? pricingPackage?.id
                  : modalMode === "add-tier"
                    ? addTierShellPlan?.id
                    : editingPackage?.id
              }
              initialCategoryName={initialCategoryName}
              categoryOptions={categoryOptions}
              classTypeOptions={classTypeOptions}
              initialPackage={
                modalMode === "pricing" || modalMode === "edit-tier"
                  ? pricingPackage
                  : modalMode === "add-tier"
                    ? addTierShellPlan ?? addTierCategoryAnchor
                    : editingPackage
              }
              nextDisplayOrder={nextDisplayOrder}
              onSaved={(saved) => {
                if (
                  modalMode === "edit" ||
                  modalMode === "pricing" ||
                  modalMode === "add-tier" ||
                  modalMode === "edit-tier"
                ) {
                  onUpdated(saved);
                } else {
                  onCreated(saved);
                }
              }}
              onCancel={closeModal}
            />
          </div>
            </>
          )}
        </div>
      </AdminSheetPortal>
    </>
  );
}

export function PackagesAddButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="ommm-admin-add-button inline-flex items-center gap-2"
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.65}
        strokeLinecap="round"
        className="h-5 w-5"
        aria-hidden
      >
        <path d="M12 2v20M2 12h20" />
      </svg>
      {label}
    </button>
  );
}
