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
import type { CoachClassOption } from "@/components/admin/admin-coach-form-helpers";
import { AdminCreateCoachForm } from "@/components/admin/admin-create-coach-form";
import { OmmButton } from "@/components/ui/omm-button";

const COACH_MODAL_QUERY_KEY = "modal";
const COACH_MODAL_QUERY_VALUE = "add-coach";
const COACH_MODAL_BANNER_MS = 8000;

function AddCoachGlyph({ className }: { className?: string }) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6m3-3h-6" />
    </svg>
  );
}

type AdminCoachesShellProps = {
  classTypeOptions: readonly string[];
  classOptions: readonly CoachClassOption[];
  children: ReactNode;
};

export function AdminCoachesShell({
  classTypeOptions,
  classOptions,
  children,
}: AdminCoachesShellProps) {
  const t = useTranslations("adminPages.coaches");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
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
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") {
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
      'input[name="name"]',
    );
    focusable?.focus();
  }, [isModalOpen]);

  return (
    <div className="flex flex-col gap-6">
      {banner !== null ? (
        <p
          className="rounded-xl border border-mint-200/80 bg-mint-50/90 px-4 py-3 text-sm text-sage-800 shadow-sm"
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
          <AddCoachGlyph className="h-5 w-5 shrink-0" />
          {t("addCoachButton")}
        </OmmButton>
      </div>

      {children}

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 z-0 bg-sage-950/45 backdrop-blur-[2px] transition-opacity"
            aria-label={t("modalBackdropClose")}
            onClick={closeModal}
          />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className={`relative z-10 mt-auto flex max-h-[min(92vh,840px)] w-full max-w-[min(940px,95vw)] flex-col overflow-hidden rounded-t-[28px] border border-white/60 bg-white/85 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)] backdrop-blur-md sm:mt-0 sm:rounded-[28px]`}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/60 bg-white/55 px-5 py-4 sm:px-7 sm:py-5">
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
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <AdminCreateCoachForm
                classTypeOptions={classTypeOptions}
                classOptions={classOptions}
                onCreated={onCoachCreated}
                onCancel={closeModal}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
