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
import { AdminPackageForm } from "@/components/admin/admin-package-form";
import { AdminCombinedPackageForm } from "@/components/admin/admin-combined-package-form";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import type { AdminPackagesCategoryOption } from "@/components/admin/admin-packages-category-multi-select";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import {
  buildPackagesPathname,
  clearPackageModalQueryKeys,
  PACKAGE_CATEGORY_QUERY_KEY,
  PACKAGE_EDIT_QUERY_KEY,
  PACKAGE_KIND_COMBINED_VALUE,
  PACKAGE_KIND_QUERY_KEY,
  PACKAGE_MODAL_CREATE_VALUE,
  PACKAGE_MODAL_PRICING_VALUE,
  PACKAGE_MODAL_EDIT_TIER_VALUE,
  PACKAGE_MODAL_ADD_TIER_VALUE,
  PACKAGE_MODAL_QUERY_KEY,
  PACKAGE_PRICING_QUERY_KEY,
  parsePackageCreateKind,
} from "@/components/admin/admin-packages-url";
import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";

const BANNER_MS = 8000;

type AdminPackagesShellProps = {
  children: ReactNode;
  packages: readonly AdminPackageRow[];
  allPackages?: readonly AdminPackageRow[];
  classTypeOptions: readonly { id: string; name: string }[];
  categoryOptions: readonly AdminPackagesCategoryOption[];
  defaultCategoryName?: string;
  onPackageCreated?: (saved: AdminPackageRow) => void;
  onPackageUpdated?: (saved: AdminPackageRow) => void;
};

export function AdminPackagesShell({
  children,
  packages,
  allPackages,
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
  const createPackageKind = parsePackageCreateKind(
    isCreateModalOpen ? searchParams.get(PACKAGE_KIND_QUERY_KEY) : undefined,
  );
  const editingPackageId = searchParams.get(PACKAGE_EDIT_QUERY_KEY);
  const pricingPackageId = searchParams.get(PACKAGE_PRICING_QUERY_KEY);
  const categoryIdFromQuery = searchParams.get(PACKAGE_CATEGORY_QUERY_KEY);
  const addTierCategoryName = categoryIdFromQuery?.trim() ?? "";
  const isAddTierModalOpen =
    searchParams.get(PACKAGE_MODAL_QUERY_KEY) === PACKAGE_MODAL_ADD_TIER_VALUE &&
    addTierCategoryName.length > 0;
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
    const categoryKey = normalizePackageCategoryKey(addTierCategoryName);
    return packages.find(
      (pkg) => normalizePackageCategoryKey(pkg.categoryName) === categoryKey,
    );
  }, [addTierCategoryName, isAddTierModalOpen, packages]);
  const configuredTierCount = useMemo(() => {
    if (!isAddTierModalOpen) {
      return 0;
    }
    const categoryKey = normalizePackageCategoryKey(addTierCategoryName);
    return packages.filter(
      (pkg) =>
        normalizePackageCategoryKey(pkg.categoryName) === categoryKey && pkg.priceCents > 0,
    ).length;
  }, [addTierCategoryName, isAddTierModalOpen, packages]);
  const nextDisplayOrder = useMemo(() => {
    if (packages.length === 0) {
      return 1;
    }
    const maxDisplayOrder = Math.max(...packages.map((pkg) => pkg.displayOrder));
    return maxDisplayOrder + 1;
  }, [packages]);
  const initialCategoryName = useMemo(() => {
    if (editingPackage !== undefined && editingPackage.categoryName.trim().length > 0) {
      return editingPackage.categoryName.trim();
    }
    if (pricingPackage !== undefined && pricingPackage.categoryName.trim().length > 0) {
      return pricingPackage.categoryName.trim();
    }
    if (categoryIdFromQuery !== null && categoryIdFromQuery.trim().length > 0) {
      return categoryIdFromQuery.trim();
    }
    if (
      categoryIdFromQuery !== null &&
      categoryOptions.some(
        (option) => normalizePackageCategoryKey(option.id) === normalizePackageCategoryKey(categoryIdFromQuery),
      )
    ) {
      const matched = categoryOptions.find(
        (option) =>
          normalizePackageCategoryKey(option.id) === normalizePackageCategoryKey(categoryIdFromQuery),
      );
      return matched?.id ?? categoryIdFromQuery;
    }
    return categoryOptions[0]?.id ?? defaultCategoryName;
  }, [categoryIdFromQuery, categoryOptions, defaultCategoryName, editingPackage, pricingPackage]);

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    clearPackageModalQueryKeys(params);
    router.replace(buildPackagesPathname(pathname, params));
  }, [pathname, router, searchParams]);

  const setCreatePackageKind = useCallback(
    (kind: "single" | "combined") => {
      if (!isCreateModalOpen) {
        return;
      }
      const params = new URLSearchParams(searchParams.toString());
      const currentKind = parsePackageCreateKind(params.get(PACKAGE_KIND_QUERY_KEY));
      if (currentKind === kind) {
        return;
      }
      if (kind === "combined") {
        params.set(PACKAGE_KIND_QUERY_KEY, PACKAGE_KIND_COMBINED_VALUE);
      } else {
        params.delete(PACKAGE_KIND_QUERY_KEY);
      }
      router.replace(buildPackagesPathname(pathname, params), { scroll: false });
    },
    [isCreateModalOpen, pathname, router, searchParams],
  );

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
      showSuccessBanner(t("messages.createSuccess"));
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
          ? t("messages.tierAddedSuccess")
          : modalMode === "edit-tier"
            ? t("messages.tierUpdatedSuccess")
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
      'input[name="name"], input[name="sessionsCount"]',
    );
    focusable?.focus();
  }, [isModalOpen, modalMode, editingPackageId]);

  const modalTitle =
    modalMode === "edit"
      ? t("editTitle")
      : modalMode === "pricing"
        ? t("pricingTitle")
        : modalMode === "edit-tier"
          ? t("editTierTitle")
          : modalMode === "add-tier"
            ? t("addTierTitle")
            : createPackageKind === "combined"
              ? t("combinedForm.createTitle")
              : t("createTitle");
  const modalDescription =
    modalMode === "edit"
      ? t("editDescription")
      : modalMode === "pricing"
        ? t("pricingDescription")
        : modalMode === "edit-tier"
          ? t("editTierDescription")
          : modalMode === "add-tier"
            ? t("addTierDescription")
            : createPackageKind === "combined"
              ? t("combinedForm.createDescription")
              : t("createDescription");
  const packageModalPanelClass =
    "mt-auto flex max-h-[92vh] w-full max-w-[min(720px,95vw)] flex-col overflow-hidden rounded-t-[28px] border border-white/60 bg-white/85 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)] backdrop-blur-md sm:mt-0 sm:rounded-[28px]";

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

      <OmmModalPortal
        isOpen={isModalOpen}
        onClose={closeModal}
        backdropAriaLabel={t("modalBackdropClose")}
        overlayClassName="ommm-modal-overlay z-[100]"
        panelClassName={packageModalPanelClass}
      >
        <div
          ref={panelRef}
          aria-labelledby={titleId}
          aria-describedby={descId}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex items-start justify-between gap-4 border-b border-white/60 bg-white/55 px-5 py-4 sm:px-7 sm:py-5">
            <div>
              <h2 id={titleId} className={adminChrome.panelHeading}>
                {modalTitle}
              </h2>
              <p id={descId} className="ommm-body-muted mt-1 text-sm">
                {modalDescription}
              </p>
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
          <div className="flex min-h-0 flex-1 flex-col">
            {modalMode === "create" ? (
              <div className="mb-5 flex shrink-0 flex-wrap gap-2 px-5 pt-5 sm:px-7 sm:pt-6">
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    createPackageKind === "single"
                      ? "bg-sand-100 text-sage-900"
                      : "bg-white/80 text-sage-600 hover:bg-white"
                  }`}
                  onClick={() => setCreatePackageKind("single")}
                >
                  {t("packageKindSingle")}
                </button>
                <button
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    createPackageKind === "combined"
                      ? "bg-sand-100 text-sage-900"
                      : "bg-white/80 text-sage-600 hover:bg-white"
                  }`}
                  onClick={() => setCreatePackageKind("combined")}
                >
                  {t("packageKindCombined")}
                </button>
              </div>
            ) : null}
            <div className="flex min-h-0 flex-1 flex-col">
            {modalMode === "create" && createPackageKind === "combined" ? (
              <AdminCombinedPackageForm
                packages={allPackages ?? packages}
                onSaved={onCreated}
                onCancel={closeModal}
              />
            ) : (
            <AdminPackageForm
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
              configuredTierCount={configuredTierCount}
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
            )}
            </div>
          </div>
        </div>
      </OmmModalPortal>
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
