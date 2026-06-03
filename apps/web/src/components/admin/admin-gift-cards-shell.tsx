"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminCreateGiftCardForm } from "@/components/admin/admin-create-gift-card-form";
import {
  AdminGiftCardsViewProvider,
  useAdminGiftCardsView,
} from "@/components/admin/admin-gift-cards-view-context";
import { AdminGiftCardsViewSwitcher } from "@/components/admin/admin-gift-cards-view-switcher";
import { OmmButton } from "@/components/ui/omm-button";
import type {
  AdminAssignableUser,
  AdminGiftCardBatchRow,
} from "@/components/admin/admin-gift-cards-types";
import {
  ADMIN_GIFT_CARDS_VIEW_QUERY_KEY,
  type AdminGiftCardsViewMode,
} from "@/lib/admin-gift-cards-view-preference";

const BANNER_MS = 8000;
const MODAL_QUERY_KEY = "modal";
const MODAL_QUERY_VALUE = "create-gift-card";
const EDIT_MODAL_QUERY_VALUE = "edit-gift-card";

function AddGiftCardGlyph({ className }: { className?: string }) {
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
      <path d="M12 2v20M2 12h20" />
    </svg>
  );
}

type AdminGiftCardsShellProps = {
  assignableUsers: readonly AdminAssignableUser[];
  giftCards: readonly AdminGiftCardBatchRow[];
  initialViewMode: AdminGiftCardsViewMode;
  children: ReactNode;
};

export function AdminGiftCardsShell({
  assignableUsers,
  giftCards,
  initialViewMode,
  children,
}: AdminGiftCardsShellProps) {
  return (
    <AdminGiftCardsViewProvider key={initialViewMode} initialViewMode={initialViewMode}>
      <AdminGiftCardsShellInner assignableUsers={assignableUsers} giftCards={giftCards}>
        {children}
      </AdminGiftCardsShellInner>
    </AdminGiftCardsViewProvider>
  );
}

function AdminGiftCardsShellInner({
  assignableUsers,
  giftCards,
  children,
}: Omit<AdminGiftCardsShellProps, "initialViewMode">) {
  const t = useTranslations("adminPages.giftCards");
  const { viewMode, setViewMode } = useAdminGiftCardsView();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalMode = searchParams.get(MODAL_QUERY_KEY);
  const editBatchId = searchParams.get("batchId");
  const isCreateMode = modalMode === MODAL_QUERY_VALUE;
  const isEditMode = modalMode === EDIT_MODAL_QUERY_VALUE && editBatchId !== null;
  const isModalOpen = isCreateMode || isEditMode;
  const editingBatch =
    isEditMode && editBatchId !== null
      ? giftCards.find((batch) => batch.id === editBatchId) ?? null
      : null;

  const setView = useCallback(
    (mode: AdminGiftCardsViewMode) => {
      setViewMode(mode);
      const params = new URLSearchParams(searchParams.toString());
      params.set(ADMIN_GIFT_CARDS_VIEW_QUERY_KEY, mode);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, setViewMode],
  );

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(MODAL_QUERY_KEY);
    params.delete("batchId");
    const query = params.toString();
    router.replace(query.length > 0 ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const openModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(MODAL_QUERY_KEY, MODAL_QUERY_VALUE);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const onCreated = useCallback((createdCount: number) => {
    if (bannerTimerRef.current !== null) {
      clearTimeout(bannerTimerRef.current);
    }
    closeModal();
    router.refresh();
    setBanner(
      createdCount > 1
        ? t("messages.createSuccessMany", { count: createdCount })
        : t("messages.createSuccess"),
    );
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
    const focusable = panelRef.current.querySelector<HTMLElement>('input[name="amountAmd"]');
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex justify-start">
            <AdminGiftCardsViewSwitcher value={viewMode} onChange={setView} />
          </div>
          <div className="flex justify-start sm:justify-end">
            <OmmButton
              type="button"
              variant="secondary"
              size="md"
              onClick={openModal}
              className="inline-flex cursor-pointer items-center gap-2 shadow-sm transition-transform hover:-translate-y-px"
            >
              <AddGiftCardGlyph className="h-5 w-5 shrink-0" />
              {t("createButton")}
            </OmmButton>
          </div>
        </div>

        {children}
      </div>

      {isModalOpen ? (
        <div
          className="ommm-modal-overlay z-50"
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
            className="relative z-10 mt-auto max-h-[min(92vh,760px)] w-full max-w-2xl overflow-y-auto rounded-t-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_24px_60px_-28px_rgba(45,40,35,0.35)] backdrop-blur-md sm:mt-0 sm:rounded-[24px] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className={adminChrome.panelHeading}>
                  {isEditMode ? t("editTitle") : t("createTitle")}
                </h2>
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
              <AdminCreateGiftCardForm
                key={editingBatch?.id ?? "create-gift-card"}
                users={assignableUsers}
                onSaved={onCreated}
                onCancel={closeModal}
                mode={isEditMode ? "edit" : "create"}
                batchId={editingBatch?.id}
                initialValues={
                  editingBatch
                    ? {
                        amountAmd: editingBatch.amountAmd,
                        quantity: editingBatch.totalQuantity,
                        availableQuantity: editingBatch.availableQuantity,
                        minQuantity: Math.max(
                          1,
                          editingBatch.totalQuantity - editingBatch.availableQuantity,
                        ),
                        recipientEmail: editingBatch.recipientEmail ?? "",
                        recipientName: editingBatch.recipientName ?? "",
                        message: editingBatch.message ?? "",
                        expiresAt: editingBatch.expiresAt ?? "",
                      }
                    : undefined
                }
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
