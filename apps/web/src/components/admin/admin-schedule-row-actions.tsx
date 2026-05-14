"use client";

import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { ApiError, apiFetch } from "@/lib/api";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminScheduleForm } from "@/components/admin/admin-schedule-form";
import type { AdminScheduleItem } from "@/components/admin/admin-schedule-types";
import { OmmButton } from "@/components/ui/omm-button";

const EDIT_SCHEDULE_QUERY_KEY = "editSchedule";

function PencilGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function CloseGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

type AdminScheduleRowActionsProps = {
  item: AdminScheduleItem;
  classTypeOptions: readonly string[];
};

export function AdminScheduleRowActions({
  item,
  classTypeOptions,
}: AdminScheduleRowActionsProps) {
  const t = useTranslations("adminPages.schedule");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const isOpen = searchParams.get(EDIT_SCHEDULE_QUERY_KEY) === item.id;

  const closeModal = useCallback(() => {
    if (busy) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete(EDIT_SCHEDULE_QUERY_KEY);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [busy, pathname, router, searchParams]);

  function openModal() {
    const params = new URLSearchParams(searchParams.toString());
    params.set(EDIT_SCHEDULE_QUERY_KEY, item.id);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    setMessage(null);
  }

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
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
  }, [closeModal, isOpen]);

  useEffect(() => {
    if (!isOpen || panelRef.current === null) {
      return;
    }
    const focusable = panelRef.current.querySelector<HTMLElement>(
      'input[name="className"]',
    );
    focusable?.focus();
  }, [isOpen]);

  async function run(action: () => Promise<void>, okLabel: string) {
    if (busy) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setTone("ok");
      setMessage(okLabel);
      closeModal();
      router.refresh();
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("messages.genericError"));
    } finally {
      setBusy(false);
    }
  }

  function onSaved() {
    setTone("ok");
    setMessage(t("messages.updateSuccess"));
    const params = new URLSearchParams(searchParams.toString());
    params.delete(EDIT_SCHEDULE_QUERY_KEY);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
    router.refresh();
  }

  async function toggleStatus() {
    await run(
      () =>
        apiFetch(`/schedule/admin/${item.id}`, {
          method: "PATCH",
          body: JSON.stringify({ isActive: !item.isActive }),
        }),
      item.isActive ? t("messages.disabledSuccess") : t("messages.enabledSuccess"),
    );
  }

  async function onDelete() {
    if (!window.confirm(t("deleteConfirm"))) {
      return;
    }
    await run(
      () =>
        apiFetch(`/schedule/admin/${item.id}`, {
          method: "DELETE",
        }),
      t("messages.deleteSuccess"),
    );
  }

  return (
    <>
      <div className="flex min-w-0 flex-col items-center gap-1">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/70 text-sage-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-sage-900 active:scale-95 active:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50"
            aria-label={t("editButtonAria")}
            title={t("editButtonAria")}
            onClick={openModal}
            disabled={busy}
          >
            <PencilGlyph className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-white/70 text-red-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-red-900 active:scale-95 active:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50"
            aria-label={t("deleteButtonAria")}
            title={t("deleteButtonAria")}
            onClick={() => {
              void onDelete();
            }}
            disabled={busy}
          >
            <TrashGlyph className="h-4 w-4" />
          </button>
        </div>
        <OmmButton
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 rounded-lg px-2 text-[10px]"
          onClick={() => {
            void toggleStatus();
          }}
          disabled={busy}
        >
          {item.isActive ? t("disableButton") : t("enableButton")}
        </OmmButton>
      </div>

      {message ? (
        <div
          role="status"
          className={`fixed bottom-4 right-4 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-[0_12px_32px_-20px_rgba(45,40,35,0.4)] backdrop-blur-md ${
            tone === "ok"
              ? "border-mint-200/80 bg-mint-50/95 text-sage-900"
              : "border-red-200/80 bg-red-50/95 text-red-900"
          }`}
        >
          {message}
        </div>
      ) : null}

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4"
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
                className="relative z-10 mt-auto w-full max-w-2xl rounded-t-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_24px_60px_-28px_rgba(45,40,35,0.35)] backdrop-blur-md sm:mt-0 sm:rounded-[24px] sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 id={titleId} className={adminChrome.panelHeading}>
                      {t("editTitle")}
                    </h2>
                    <p id={descId} className="ommm-body-muted mt-1 text-sm">
                      {t("editDescription")}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                    aria-label={t("modalCloseAria")}
                    onClick={closeModal}
                    disabled={busy}
                  >
                    <CloseGlyph className="h-5 w-5" />
                  </button>
                </div>

                <AdminScheduleForm
                  mode="edit"
                  classTypeOptions={classTypeOptions}
                  item={item}
                  onSaved={onSaved}
                  onCancel={closeModal}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
