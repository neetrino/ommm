"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminPackageForm } from "@/components/admin/admin-package-form";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";

const MODAL_QUERY_KEY = "modal";
const MODAL_QUERY_VALUE = "add-package";
const BANNER_MS = 8000;

type AdminPackagesShellProps = {
  toolbar?: ReactNode;
  children: ReactNode;
};

export function AdminPackagesShell({ toolbar, children }: AdminPackagesShellProps) {
  const t = useTranslations("adminPages.packages");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isModalOpen = searchParams.get(MODAL_QUERY_KEY) === MODAL_QUERY_VALUE;

  const closeModal = useCallback(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete(MODAL_QUERY_KEY);
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router, searchParams]);

  const openModal = useCallback(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.set(MODAL_QUERY_KEY, MODAL_QUERY_VALUE);
    router.replace(`${pathname}?${p.toString()}`);
  }, [pathname, router, searchParams]);

  const onCreated = useCallback(() => {
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
      return undefined;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
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
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [closeModal, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen || panelRef.current === null) {
      return;
    }
    const focusable = panelRef.current.querySelector<HTMLElement>('input[name="name"]');
    focusable?.focus();
  }, [isModalOpen]);

  return (
    <>
      <AdminSectionShell
        banner={banner}
        toolbar={
          toolbar ?? (
            <PackagesAddButton onClick={openModal} label={t("addPackageButton")} />
          )
        }
      >
        {children}
      </AdminSectionShell>

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
            className="relative z-10 mt-auto max-h-[min(92vh,760px)] w-full max-w-2xl overflow-y-auto rounded-t-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_24px_60px_-28px_rgba(45,40,35,0.35)] backdrop-blur-md sm:mt-0 sm:rounded-[24px] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
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
            <div className="mt-5">
              <AdminPackageForm onSaved={onCreated} onCancel={closeModal} />
            </div>
          </div>
        </div>
      ) : null}
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
    <div className="flex justify-end">
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
    </div>
  );
}
