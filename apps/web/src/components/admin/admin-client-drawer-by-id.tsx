"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminClientDrawer } from "@/components/admin/admin-client-drawer";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_ELEVATED_CLASS,
  ADMIN_NESTED_WIDE_DRAWER_PANEL_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import type { ClientDetail, ClientRow } from "@/components/admin/admin-clients-types";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { apiFetch } from "@/lib/api";

type AdminClientDrawerByIdProps = {
  clientId: string | null;
  locale: string;
  onClose: () => void;
  onChanged?: () => void;
  /** Stack above nested confirm dialogs (e.g. package delete modal). */
  useOverlayPortalRoot?: boolean;
};

export function AdminClientDrawerById({
  clientId,
  locale,
  onClose,
  onChanged,
  useOverlayPortalRoot = false,
}: AdminClientDrawerByIdProps) {
  if (!clientId) {
    return null;
  }

  return (
    <AdminClientDrawerByIdContent
      key={clientId}
      clientId={clientId}
      locale={locale}
      onClose={onClose}
      onChanged={onChanged}
      useOverlayPortalRoot={useOverlayPortalRoot}
    />
  );
}

function AdminClientDrawerByIdContent({
  clientId,
  locale,
  onClose,
  onChanged,
  useOverlayPortalRoot = false,
}: {
  clientId: string;
  locale: string;
  onClose: () => void;
  onChanged?: () => void;
  useOverlayPortalRoot?: boolean;
}) {
  const [client, setClient] = useState<ClientRow | null>(null);
  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void apiFetch<ClientDetail>(`/clients/${encodeURIComponent(clientId)}`)
      .then((payload) => {
        if (!cancelled) {
          setClient(payload.activity);
          setDetail(payload);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setClient(null);
          setDetail(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (loading || client === null || detail === null) {
    return (
      <AdminClientDrawerLoadingShell
        onClose={onClose}
        useOverlayPortalRoot={useOverlayPortalRoot}
      />
    );
  }

  return (
    <AdminClientDrawer
      client={client}
      locale={locale}
      onClose={onClose}
      onChanged={onChanged ?? (() => undefined)}
      useOverlayPortalRoot={useOverlayPortalRoot}
      initialDetail={detail}
    />
  );
}

function AdminClientDrawerLoadingShell({
  onClose,
  useOverlayPortalRoot,
}: {
  onClose: () => void;
  useOverlayPortalRoot: boolean;
}) {
  const t = useTranslations("adminPages.clients");
  const titleId = useId();
  const isNestedOverlay = useOverlayPortalRoot;

  return (
    <OmmDrawerPortal
      isOpen
      onClose={onClose}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      overlayClassName={
        isNestedOverlay
          ? ADMIN_DETAILS_SHEET_OVERLAY_ELEVATED_CLASS
          : ADMIN_DETAILS_SHEET_OVERLAY_CLASS
      }
      panelClassName={
        isNestedOverlay ? ADMIN_NESTED_WIDE_DRAWER_PANEL_CLASS : ADMIN_WIDE_DRAWER_PANEL_CLASS
      }
      lockBodyScroll={!isNestedOverlay}
      useOverlayPortalRoot={useOverlayPortalRoot}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-end">
          <h2 id={titleId} className="sr-only">
            {t("drawer.loading")}
          </h2>
          <button
            type="button"
            className={ADMIN_DETAILS_SHEET_HEADER_CLOSE_BUTTON_CLASS}
            aria-label={t("modalCloseAria")}
            onClick={onClose}
          >
            ×
          </button>
        </div>
      </header>
      <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
        <p className="text-sm text-sage-600">{t("drawer.loading")}</p>
      </div>
    </OmmDrawerPortal>
  );
}
