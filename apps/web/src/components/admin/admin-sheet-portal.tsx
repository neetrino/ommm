"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { shouldNotifyDesktopSheetAfterClose } from "@/components/admin/admin-sheet-after-close";
import {
  ADMIN_MOBILE_SHEET_GRABBER_CLASS,
  ADMIN_MOBILE_SHEET_GRABBER_ROW_CLASS,
  adminMobileSheetPanelStyle,
} from "@/components/admin/admin-mobile-sheet-layout";
import { AdminMobileBottomSheet } from "@/components/admin/admin-mobile-bottom-sheet";
import {
  OmmDrawerPortal,
  OmmModalPortal,
} from "@/components/ui/omm-modal";
import { useMemberHubSheetPhone } from "@/hooks/use-member-hub-sheet-phone";

export type AdminSheetPortalProps = {
  isOpen: boolean;
  onClose: () => void;
  backdropAriaLabel: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  closeDisabled?: boolean;
  dialogRole?: "dialog" | "alertdialog";
  /** Side drawer on tablet+; bottom sheet on phone. */
  presentation: "drawer" | "modal";
  drawerOverlayClassName?: string;
  drawerBackdropClassName?: string;
  drawerPanelClassName?: string;
  modalOverlayClassName?: string;
  modalPanelClassName?: string;
  lockBodyScroll?: boolean;
  useOverlayPortalRoot?: boolean;
  closeOnEscape?: boolean;
  motionState?: "open" | "closed";
  zIndexClass?: string;
  /** Phone: after exit animation. Desktop: on the open → closed transition. */
  onAfterClose?: () => void;
  /**
   * When true with `presentation="modal"`, always use a centered modal
   * (skip the phone bottom sheet).
   */
  forceCenteredModal?: boolean;
  children: ReactNode;
};

/**
 * Responsive admin overlay — Ilona-style bottom sheet on phone, drawer or modal on tablet+.
 */
export function AdminSheetPortal({
  isOpen,
  onClose,
  backdropAriaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  closeDisabled = false,
  dialogRole = "dialog",
  presentation,
  drawerOverlayClassName,
  drawerBackdropClassName,
  drawerPanelClassName,
  modalOverlayClassName = "ommm-modal-overlay z-[110] items-center p-4",
  modalPanelClassName,
  lockBodyScroll = true,
  useOverlayPortalRoot = false,
  closeOnEscape = true,
  motionState,
  zIndexClass = "z-[105]",
  onAfterClose,
  forceCenteredModal = false,
  children,
}: AdminSheetPortalProps) {
  const fallbackTitleId = useId();
  const titleId = ariaLabelledBy ?? fallbackTitleId;
  const isPhone = useMemberHubSheetPhone();
  const usePhoneSheet = isPhone && !forceCenteredModal;
  const [phoneMounted, setPhoneMounted] = useState(isOpen);
  const wasDesktopOpenRef = useRef(isOpen);

  if (isOpen && !phoneMounted) {
    setPhoneMounted(true);
  }

  useEffect(() => {
    const wasOpen = wasDesktopOpenRef.current;
    wasDesktopOpenRef.current = isOpen;
    if (shouldNotifyDesktopSheetAfterClose(usePhoneSheet, wasOpen, isOpen)) {
      onAfterClose?.();
    }
  }, [isOpen, usePhoneSheet, onAfterClose]);

  const handlePhoneExitComplete = useCallback(() => {
    setPhoneMounted(false);
    onAfterClose?.();
  }, [onAfterClose]);

  if (usePhoneSheet) {
    if (!phoneMounted) {
      return null;
    }

    return (
      <AdminMobileBottomSheet
        isOpen={isOpen}
        titleId={titleId}
        backdropCloseLabel={backdropAriaLabel}
        onClose={onClose}
        onExitComplete={handlePhoneExitComplete}
        closeDisabled={closeDisabled}
        panelStyle={adminMobileSheetPanelStyle()}
        zIndexClass={zIndexClass}
      >
        <div className={ADMIN_MOBILE_SHEET_GRABBER_ROW_CLASS}>
          <div className={ADMIN_MOBILE_SHEET_GRABBER_CLASS} aria-hidden />
        </div>
        {children}
      </AdminMobileBottomSheet>
    );
  }

  if (!isOpen) {
    return null;
  }

  if (presentation === "drawer") {
    return (
      <OmmDrawerPortal
        isOpen={isOpen}
        onClose={onClose}
        backdropAriaLabel={backdropAriaLabel}
        ariaLabelledBy={titleId}
        closeDisabled={closeDisabled}
        overlayClassName={drawerOverlayClassName}
        backdropClassName={drawerBackdropClassName}
        panelClassName={drawerPanelClassName}
        lockBodyScroll={lockBodyScroll}
        useOverlayPortalRoot={useOverlayPortalRoot}
        closeOnEscape={closeOnEscape}
        motionState={motionState}
      >
        {children}
      </OmmDrawerPortal>
    );
  }

  return (
    <OmmModalPortal
      isOpen={isOpen}
      onClose={onClose}
      dialogRole={dialogRole}
      ariaLabelledBy={titleId}
      ariaDescribedBy={ariaDescribedBy}
      closeDisabled={closeDisabled}
      backdropAriaLabel={backdropAriaLabel}
      overlayClassName={modalOverlayClassName}
      panelClassName={modalPanelClassName}
      centered
      lockBodyScroll={lockBodyScroll}
      closeOnEscape={closeOnEscape}
      motionState={motionState}
      useOverlayPortalRoot={useOverlayPortalRoot}
    >
      {children}
    </OmmModalPortal>
  );
}
