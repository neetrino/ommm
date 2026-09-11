"use client";

import { useCallback, useId, useState, type ReactNode } from "react";
import {
  ADMIN_MOBILE_SHEET_GRABBER_CLASS,
  ADMIN_MOBILE_SHEET_GRABBER_ROW_CLASS,
  adminMobileSheetPanelStyle,
} from "@/components/admin/admin-mobile-sheet-layout";
import { AdminMobileBottomSheet } from "@/components/admin/admin-mobile-bottom-sheet";
import {
  OMM_DRAWER_OVERLAY_CLASS,
  OmmDrawerPortal,
  OmmModalPortal,
} from "@/components/ui/omm-modal";
import { useMemberHubSheetPhone } from "@/hooks/use-member-hub-sheet-phone";
import {
  OVERLAY_ENTER_EXIT_EXIT_MS,
  useOverlayEnterExitMotion,
} from "@/hooks/use-overlay-enter-exit-motion";

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
  /** Optional override; desktop motion is owned by this portal when omitted. */
  motionState?: "open" | "closed";
  zIndexClass?: string;
  /** Phone: after exit animation. Desktop: after shared enter/exit motion. */
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
 * Desktop open/close uses the same soft enter/exit motion as schedule modals.
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

  if (isOpen && !phoneMounted) {
    setPhoneMounted(true);
  }

  const handleDesktopClosed = useCallback(() => {
    onAfterClose?.();
  }, [onAfterClose]);

  const desktopMotion = useOverlayEnterExitMotion(
    !usePhoneSheet && isOpen,
    handleDesktopClosed,
    { closeDisabled, exitMs: OVERLAY_ENTER_EXIT_EXIT_MS },
  );

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

  if (!desktopMotion.presented) {
    return null;
  }

  const resolvedMotionState =
    motionState ?? (desktopMotion.motionOpen ? "open" : "closed");
  const drawerOverlayWithMotion = [
    drawerOverlayClassName ?? OMM_DRAWER_OVERLAY_CLASS,
    "ommm-overlay-animated",
  ]
    .filter(Boolean)
    .join(" ");
  const modalOverlayWithMotion = [modalOverlayClassName, "ommm-overlay-animated"]
    .filter(Boolean)
    .join(" ");

  if (presentation === "drawer") {
    return (
      <OmmDrawerPortal
        isOpen
        onClose={onClose}
        backdropAriaLabel={backdropAriaLabel}
        ariaLabelledBy={titleId}
        closeDisabled={closeDisabled}
        overlayClassName={drawerOverlayWithMotion}
        backdropClassName={drawerBackdropClassName}
        panelClassName={drawerPanelClassName}
        lockBodyScroll={lockBodyScroll}
        useOverlayPortalRoot={useOverlayPortalRoot}
        closeOnEscape={closeOnEscape}
        motionState={resolvedMotionState}
      >
        {children}
      </OmmDrawerPortal>
    );
  }

  return (
    <OmmModalPortal
      isOpen
      onClose={onClose}
      dialogRole={dialogRole}
      ariaLabelledBy={titleId}
      ariaDescribedBy={ariaDescribedBy}
      closeDisabled={closeDisabled}
      backdropAriaLabel={backdropAriaLabel}
      overlayClassName={modalOverlayWithMotion}
      panelClassName={modalPanelClassName}
      centered
      lockBodyScroll={lockBodyScroll}
      closeOnEscape={closeOnEscape}
      motionState={resolvedMotionState}
      useOverlayPortalRoot={useOverlayPortalRoot}
    >
      {children}
    </OmmModalPortal>
  );
}
