"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { adminFormModalPanelClass } from "@/components/admin/admin-mobile-sheet-layout";
import {
  ADMIN_CREATE_SHEET_BODY_SHELL_CLASS,
  ADMIN_CREATE_SHEET_HEADER_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminScheduleForm } from "@/components/admin/admin-schedule-form";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { OmmButton } from "@/components/ui/omm-button";

const SCHEDULE_MODAL_QUERY_KEY = "modal";
const SCHEDULE_MODAL_QUERY_VALUE = "add-schedule";
const BANNER_MS = 8000;

function AddScheduleGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4m8-4v4M12 11v6m3-3H9" />
    </svg>
  );
}

type AdminScheduleShellProps = {
  classTypeOptions: readonly string[];
  children: ReactNode;
};

export function AdminScheduleShell({
  classTypeOptions,
  children,
}: AdminScheduleShellProps) {
  const t = useTranslations("adminPages.schedule");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const titleId = useId();
  const descId = useId();
  const [banner, setBanner] = useState<string | null>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isModalOpen =
    searchParams.get(SCHEDULE_MODAL_QUERY_KEY) === SCHEDULE_MODAL_QUERY_VALUE;

  const closeModal = useCallback(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete(SCHEDULE_MODAL_QUERY_KEY);
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router, searchParams]);

  const openModal = useCallback(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.set(SCHEDULE_MODAL_QUERY_KEY, SCHEDULE_MODAL_QUERY_VALUE);
    router.replace(`${pathname}?${p.toString()}`);
  }, [pathname, router, searchParams]);

  const onScheduleCreated = useCallback(() => {
    if (bannerTimerRef.current !== null) {
      clearTimeout(bannerTimerRef.current);
    }
    closeModal();
    router.refresh();
    setBanner(t("messages.createSuccess"));
    bannerTimerRef.current = setTimeout(() => {
      setBanner(null);
      bannerTimerRef.current = null;
    }, BANNER_MS);
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
    const focusable = document.querySelector<HTMLElement>('input[name="className"]');
    focusable?.focus();
  }, [isModalOpen]);

  return (
    <>
      <AdminSectionShell
        banner={banner}
        toolbar={
          <div className="flex justify-end">
            <OmmButton
              type="button"
              variant="secondary"
              size="md"
              onClick={openModal}
              className="inline-flex items-center gap-2"
            >
              <AddScheduleGlyph className="h-5 w-5 shrink-0" />
              {t("addScheduleButton")}
            </OmmButton>
          </div>
        }
      >
        {children}
      </AdminSectionShell>

      {isModalOpen ? (
        <AdminSheetPortal
          presentation="modal"
          isOpen={isModalOpen}
          onClose={closeModal}
          backdropAriaLabel={t("modalBackdropClose")}
          ariaLabelledBy={titleId}
          ariaDescribedBy={descId}
          modalOverlayClassName="ommm-modal-overlay z-50 items-center p-3 sm:p-4"
          modalPanelClassName={adminFormModalPanelClass("max-w-lg p-5 sm:p-6")}
          zIndexClass="z-50"
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className={ADMIN_CREATE_SHEET_HEADER_CLASS}>
              <div>
                <h2 id={titleId} className={adminChrome.panelHeading}>
                  {t("createTitle")}
                </h2>
                <p id={descId} className="ommm-body-muted mt-1 text-sm">
                  {t("createDescription")}
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
            <div className={`${ADMIN_CREATE_SHEET_BODY_SHELL_CLASS} overflow-y-auto overscroll-y-contain p-5 sm:p-6`}>
              <AdminScheduleForm
                mode="create"
                classTypeOptions={classTypeOptions}
                onSaved={onScheduleCreated}
                onCancel={closeModal}
              />
            </div>
          </div>
        </AdminSheetPortal>
      ) : null}
    </>
  );
}
