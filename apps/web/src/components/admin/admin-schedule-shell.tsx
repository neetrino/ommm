"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminScheduleForm } from "@/components/admin/admin-schedule-form";
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
  const panelRef = useRef<HTMLDivElement>(null);
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
    const focusable = panelRef.current.querySelector<HTMLElement>(
      'input[name="className"]',
    );
    focusable?.focus();
  }, [isModalOpen]);

  return (
    <div className="flex flex-col gap-6">
      <div className="ommm-card flex flex-col gap-6 p-5 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8">
        {banner !== null ? (
          <p
            className="rounded-2xl border border-mint-200/80 bg-mint-50/90 px-4 py-3 text-sm text-sage-800 shadow-[0_12px_28px_-18px_rgba(45,40,35,0.18)]"
            role="status"
          >
            {banner}
          </p>
        ) : null}

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

        {children}
      </div>

      {isModalOpen ? (
        <div
          className="ommm-modal-overlay z-50 items-center p-3 sm:p-4"
          role="presentation"
        >
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
            className="relative z-10 w-full max-w-lg rounded-[24px] border border-white/60 bg-white/80 p-5 shadow-[0_24px_60px_-28px_rgba(45,40,35,0.35)] backdrop-blur-md sm:p-6"
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
              <AdminScheduleForm
                mode="create"
                classTypeOptions={classTypeOptions}
                onSaved={onScheduleCreated}
                onCancel={closeModal}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
