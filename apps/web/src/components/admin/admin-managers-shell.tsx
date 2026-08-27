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
import { AdminCreateManagerForm } from "@/components/admin/admin-create-manager-form";
import { AdminManagersFilters } from "@/components/admin/admin-managers-filters";
import type { AdminManagersFilterValues } from "@/components/admin/admin-managers-types";

const MANAGER_MODAL_QUERY_KEY = "modal";
const MANAGER_MODAL_QUERY_VALUE = "add-manager";
const MANAGER_MODAL_BANNER_MS = 8000;

type AdminManagersShellProps = {
  filterInitialValues: AdminManagersFilterValues;
  children: ReactNode;
};

export function AdminManagersShell({
  filterInitialValues,
  children,
}: AdminManagersShellProps) {
  const t = useTranslations("adminPages.managers");
  const tCreate = useTranslations("adminPages.managers.create");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const titleId = useId();
  const descId = useId();
  const [banner, setBanner] = useState<string | null>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isModalOpen =
    searchParams.get(MANAGER_MODAL_QUERY_KEY) === MANAGER_MODAL_QUERY_VALUE;

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(MANAGER_MODAL_QUERY_KEY);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router, searchParams]);

  const openModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(MANAGER_MODAL_QUERY_KEY, MANAGER_MODAL_QUERY_VALUE);
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  const onManagerCreated = useCallback(
    (welcomeEmailSent: boolean) => {
      if (bannerTimerRef.current !== null) {
        clearTimeout(bannerTimerRef.current);
      }
      closeModal();
      router.refresh();
      setBanner(
        welcomeEmailSent ? tCreate("success") : tCreate("successEmailPending"),
      );
      bannerTimerRef.current = setTimeout(() => {
        setBanner(null);
        bannerTimerRef.current = null;
      }, MANAGER_MODAL_BANNER_MS);
    },
    [closeModal, router, tCreate],
  );

  useEffect(() => {
    return () => {
      if (bannerTimerRef.current !== null) {
        clearTimeout(bannerTimerRef.current);
      }
    };
  }, []);

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
      <AdminManagersFilters
        initialValues={filterInitialValues}
        onAddManager={openModal}
      />
      {children}
      <AdminSheetPortal
        presentation="modal"
        isOpen={isModalOpen}
          onClose={closeModal}
          backdropAriaLabel={t("modalBackdropClose")}
          ariaLabelledBy={titleId}
          ariaDescribedBy={descId}
          modalOverlayClassName="ommm-modal-overlay z-50 items-center p-3 sm:p-4"
          modalPanelClassName={adminFormModalPanelClass("max-w-[min(640px,95vw)]")}
          zIndexClass="z-50"
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className={ADMIN_CREATE_SHEET_HEADER_CLASS}>
              <div>
                <h2 id={titleId} className={adminChrome.panelHeading}>
                  {tCreate("panelTitle")}
                </h2>
                <p id={descId} className="ommm-body-muted mt-1 text-sm">
                  {tCreate("panelLead")}
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
              <AdminCreateManagerForm
                onCreated={onManagerCreated}
                onCancel={closeModal}
              />
            </div>
          </div>
        </AdminSheetPortal>
    </div>
  );
}
