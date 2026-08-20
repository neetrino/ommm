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
  const panelRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeModal, isModalOpen]);

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
      {isModalOpen ? (
        <div className="ommm-modal-overlay z-50" role="presentation">
          <button
            type="button"
            className="ommm-modal-backdrop"
            aria-label={t("modalBackdropClose")}
            onClick={closeModal}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="relative z-10 mt-auto flex max-h-[min(92vh,840px)] w-full max-w-[min(640px,95vw)] flex-col overflow-hidden rounded-t-[28px] border border-white/60 bg-white/85 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)] backdrop-blur-md sm:mt-0 sm:rounded-[28px]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/60 bg-white/55 px-5 py-4 sm:px-7 sm:py-5">
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
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <AdminCreateManagerForm
                onCreated={onManagerCreated}
                onCancel={closeModal}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
