"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { adminFormModalPanelClass } from "@/components/admin/admin-mobile-sheet-layout";
import {
  ADMIN_CREATE_SHEET_BODY_SHELL_CLASS,
  ADMIN_CREATE_SHEET_HEADER_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { adminChrome } from "@/components/admin/admin-chrome";
import type { CoachClassOption } from "@/components/admin/admin-coach-form-helpers";
import { AdminCreateCoachForm } from "@/components/admin/admin-create-coach-form";
import { AdminCoachesFilters } from "@/components/admin/admin-coaches-filters";
import type { AdminCoachesFilterValues } from "@/components/admin/admin-coaches-types";
import { AdminCoachesViewProvider, useAdminCoachesView } from "@/components/admin/admin-coaches-view-context";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import {
  adminBackofficeCapabilities,
  type BackofficeCapabilities,
} from "@/lib/backoffice-capabilities";
const COACH_MODAL_QUERY_KEY = "modal";
const COACH_MODAL_QUERY_VALUE = "add-coach";
const COACH_MODAL_BANNER_MS = 8000;

type AdminCoachesShellProps = {
  classTypeOptions: readonly string[];
  classOptions: readonly CoachClassOption[];
  filterInitialValues: AdminCoachesFilterValues;
  children: ReactNode;
  variant?: "full" | "staff";
  staffBanner?: string;
  /** @deprecated Prefer `capabilities`. */
  readOnly?: boolean;
  capabilities?: BackofficeCapabilities;
};

export function AdminCoachesShell({
  classTypeOptions,
  classOptions,
  filterInitialValues,
  children,
  variant = "full",
  staffBanner,
  readOnly = false,
  capabilities,
}: AdminCoachesShellProps) {
  const caps =
    capabilities ??
    (readOnly
      ? { ...adminBackofficeCapabilities(), canCreate: false, canUpdate: false, canDelete: false }
      : adminBackofficeCapabilities());
  return (
    <AdminCoachesViewProvider>
      <AdminCoachesShellInner
        classTypeOptions={classTypeOptions}
        classOptions={classOptions}
        filterInitialValues={filterInitialValues}
        variant={variant}
        staffBanner={staffBanner}
        capabilities={caps}
      >
        {children}
      </AdminCoachesShellInner>
    </AdminCoachesViewProvider>
  );
}

function AdminCoachesShellInner({
  classTypeOptions,
  classOptions,
  filterInitialValues,
  children,
  variant = "full",
  staffBanner,
  capabilities,
}: AdminCoachesShellProps & { capabilities: BackofficeCapabilities }) {
  const caps = capabilities;
  const isStaff = variant === "staff";
  const t = useTranslations("adminPages.coaches");
  const { viewMode, setViewMode } = useAdminCoachesView();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const titleId = useId();
  const descId = useId();
  const [banner, setBanner] = useState<string | null>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isModalOpen =
    searchParams.get(COACH_MODAL_QUERY_KEY) === COACH_MODAL_QUERY_VALUE;

  const closeModal = useCallback(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete(COACH_MODAL_QUERY_KEY);
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router, searchParams]);

  const openModal = useCallback(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.set(COACH_MODAL_QUERY_KEY, COACH_MODAL_QUERY_VALUE);
    router.replace(`${pathname}?${p.toString()}`);
  }, [pathname, router, searchParams]);

  const onCoachCreated = useCallback(() => {
    if (bannerTimerRef.current !== null) {
      clearTimeout(bannerTimerRef.current);
    }
    closeModal();
    router.refresh();
    setBanner(t("create.success"));
    bannerTimerRef.current = setTimeout(() => {
      setBanner(null);
      bannerTimerRef.current = null;
    }, COACH_MODAL_BANNER_MS);
  }, [closeModal, router, t]);

  useEffect(() => {
    return () => {
      if (bannerTimerRef.current !== null) {
        clearTimeout(bannerTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }
    const focusable = document.querySelector<HTMLElement>('input[name="name"]');
    focusable?.focus();
  }, [isModalOpen]);

  const filters = (
    <AdminCoachesFilters
      initialValues={filterInitialValues}
      classTypeOptions={classTypeOptions}
      viewMode={viewMode}
      onViewChange={setViewMode}
      onAddCoach={caps.canCreate ? openModal : undefined}
      variant={isStaff ? "embedded" : "full"}
    />
  );

  const operationalBanner = banner ?? staffBanner ?? null;

  if (isStaff) {
    return (
      <StaffListPageLayout
        title={t("title")}
        banner={operationalBanner}
        search={filters}
      >
        {children}
      </StaffListPageLayout>
    );
  }

  return (
    <div className="flex flex-col">
      {banner !== null ? (
        <p
          className="mb-4 rounded-xl border border-mint-200/80 bg-mint-50/90 px-4 py-3 text-sm text-sage-800 shadow-sm"
          role="status"
        >
          {banner}
        </p>
      ) : null}

      {filters}

      {children}

      {caps.canCreate ? (
        <AdminSheetPortal
          presentation="modal"
          isOpen={isModalOpen}
          onClose={closeModal}
          backdropAriaLabel={t("modalBackdropClose")}
          ariaLabelledBy={titleId}
          ariaDescribedBy={descId}
          modalOverlayClassName="ommm-modal-overlay z-50 items-center p-3 sm:p-4"
          modalPanelClassName={adminFormModalPanelClass("max-w-[min(940px,95vw)]")}
          zIndexClass="z-50"
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className={ADMIN_CREATE_SHEET_HEADER_CLASS}>
              <div>
                <h2 id={titleId} className={adminChrome.panelHeading}>
                  {t("create.panelTitle")}
                </h2>
                <p id={descId} className="ommm-body-muted mt-1 text-sm">
                  {t("create.panelLead")}
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
            <div className={ADMIN_CREATE_SHEET_BODY_SHELL_CLASS}>
              <AdminCreateCoachForm
                classOptions={classOptions}
                onCreated={onCoachCreated}
                onCancel={closeModal}
              />
            </div>
          </div>
        </AdminSheetPortal>
      ) : null}
    </div>
  );
}
