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
import {
  AdminCreateClientForm,
  type AdminCreateClientResult,
} from "@/components/admin/admin-create-client-form";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import {
  CLIENT_MODAL_QUERY_KEY,
  CLIENT_MODAL_QUERY_VALUE,
} from "@/components/admin/admin-clients-modal";
import { VIEW_CLIENT_QUERY_KEY } from "@/components/admin/admin-clients-query";
import {
  adminClientCapabilities,
  type ClientCapabilities,
} from "@/lib/backoffice-capabilities";

const CLIENT_MODAL_BANNER_MS = 8000;

type AdminClientsShellProps = {
  children: (api: { openAddUserModal: () => void }) => ReactNode;
  onClientCreated?: (client: ClientRow) => void;
  /** @deprecated Prefer `capabilities`. */
  readOnly?: boolean;
  capabilities?: ClientCapabilities;
};

export function AdminClientsShell({
  children,
  onClientCreated,
  readOnly = false,
  capabilities,
}: AdminClientsShellProps) {
  const caps =
    capabilities ??
    (readOnly
      ? {
          ...adminClientCapabilities(),
          canCreate: false,
          canUpdate: false,
          canDelete: false,
          canAddNotes: false,
          canAssignPackage: false,
          canCreateBooking: false,
          canCancelBooking: false,
        }
      : adminClientCapabilities());
  const t = useTranslations("adminPages.clients");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isModalOpen =
    searchParams.get(CLIENT_MODAL_QUERY_KEY) === CLIENT_MODAL_QUERY_VALUE;

  const closeModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(CLIENT_MODAL_QUERY_KEY);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const openModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(CLIENT_MODAL_QUERY_KEY, CLIENT_MODAL_QUERY_VALUE);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleClientCreated = useCallback(
    ({ client, welcomeEmailSent }: AdminCreateClientResult) => {
      onClientCreated?.(client);
      if (bannerTimerRef.current !== null) {
        clearTimeout(bannerTimerRef.current);
      }
      const displayName = client.name ?? client.email;
      setBanner(
        welcomeEmailSent
          ? t("create.listBannerSuccess", { name: displayName })
          : t("create.listBannerEmailFailed", { name: displayName }),
      );
      bannerTimerRef.current = setTimeout(() => {
        setBanner(null);
        bannerTimerRef.current = null;
      }, CLIENT_MODAL_BANNER_MS);

      const params = new URLSearchParams(searchParams.toString());
      params.delete(CLIENT_MODAL_QUERY_KEY);
      params.set(VIEW_CLIENT_QUERY_KEY, client.id);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [onClientCreated, pathname, router, searchParams, t],
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
    <>
      {banner !== null ? (
        <p
          className="mb-4 rounded-xl border border-mint-200/80 bg-mint-50/90 px-4 py-3 text-sm text-sage-800 shadow-sm"
          role="status"
        >
          {banner}
        </p>
      ) : null}

      {children({ openAddUserModal: openModal })}

      {isModalOpen && caps.canCreate ? (
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
            className="relative z-10 mt-auto flex max-h-[min(92vh,840px)] w-full max-w-[min(720px,95vw)] flex-col overflow-hidden rounded-t-[28px] border border-white/60 bg-white/85 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)] backdrop-blur-md sm:mt-0 sm:rounded-[28px]"
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
            <div className="flex min-h-0 flex-1 flex-col">
              <AdminCreateClientForm
                onCreated={handleClientCreated}
                onCancel={closeModal}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
