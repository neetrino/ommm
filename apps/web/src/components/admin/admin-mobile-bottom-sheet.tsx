"use client";

import { createPortal } from "react-dom";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ADMIN_MOBILE_SHEET_MOTION_MS,
  ADMIN_MOBILE_SHEET_OVERLAY_CLASS,
  ADMIN_MOBILE_SHEET_PANEL_CLASS,
  adminMobileSheetPanelStyle,
} from "@/components/admin/admin-mobile-sheet-layout";
import styles from "@/components/admin/admin-mobile-bottom-sheet.module.css";
import { OMM_MODAL_BACKDROP_CLASS } from "@/components/ui/omm-modal";
import { useCloseOnEscape } from "@/hooks/use-close-on-escape";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import { releaseBodyScrollLockEarly } from "@/lib/body-scroll-lock";
import { dismissMobileKeyboard } from "@/lib/dismiss-mobile-keyboard";

const AdminMobileSheetCloseContext = createContext<(() => void) | null>(null);

/** Triggers the animated close on a nested admin mobile sheet. */
export function useAdminMobileSheetClose(): () => void {
  const close = useContext(AdminMobileSheetCloseContext);
  return close ?? (() => undefined);
}

type AdminMobileBottomSheetProps = {
  titleId?: string;
  backdropCloseLabel: string;
  onClose: () => void;
  closeDisabled?: boolean;
  panelStyle?: CSSProperties;
  overlayClassName?: string;
  zIndexClass?: string;
  children: ReactNode;
};

/**
 * Admin mobile bottom sheet — slide-up panel with dimmed backdrop (Ilona-style).
 * Hidden from tablet up; pair with a desktop drawer/modal portal.
 */
export function AdminMobileBottomSheet({
  titleId,
  backdropCloseLabel,
  onClose,
  closeDisabled = false,
  panelStyle,
  overlayClassName,
  zIndexClass = "z-[105]",
  children,
}: AdminMobileBottomSheetProps) {
  const clientMounted = useIsClientMounted();
  const closingRef = useRef(false);
  const [isClosing, setIsClosing] = useState(false);
  const [backdropVisible, setBackdropVisible] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);

  useLockBodyScroll(clientMounted);

  useEffect(() => {
    if (!clientMounted || closingRef.current) {
      return undefined;
    }

    let openFrame: number | undefined;
    const closedFrame = window.requestAnimationFrame(() => {
      setBackdropVisible(false);
      setPanelVisible(false);
      openFrame = window.requestAnimationFrame(() => {
        setBackdropVisible(true);
        setPanelVisible(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(closedFrame);
      if (openFrame !== undefined) {
        window.cancelAnimationFrame(openFrame);
      }
    };
  }, [clientMounted]);

  const requestClose = useCallback(() => {
    if (closingRef.current || closeDisabled) {
      return;
    }

    dismissMobileKeyboard();
    closingRef.current = true;
    setIsClosing(true);
    setPanelVisible(false);
    setBackdropVisible(false);
    window.setTimeout(() => {
      releaseBodyScrollLockEarly();
      onClose();
    }, ADMIN_MOBILE_SHEET_MOTION_MS);
  }, [closeDisabled, onClose]);

  useCloseOnEscape(clientMounted, requestClose, { disabled: closeDisabled || isClosing });

  if (!clientMounted) {
    return null;
  }

  const resolvedPanelStyle = panelStyle ?? adminMobileSheetPanelStyle();
  const overlayClasses = [styles.overlay, ADMIN_MOBILE_SHEET_OVERLAY_CLASS, overlayClassName, zIndexClass]
    .filter(Boolean)
    .join(" ");

  return createPortal(
    <AdminMobileSheetCloseContext.Provider value={requestClose}>
      <div className={overlayClasses} role="presentation">
        <button
          type="button"
          className={[
            OMM_MODAL_BACKDROP_CLASS,
            styles.backdrop,
            backdropVisible ? styles.backdropVisible : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-label={backdropCloseLabel}
          disabled={closeDisabled || isClosing}
          onClick={requestClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={[
            styles.panel,
            ADMIN_MOBILE_SHEET_PANEL_CLASS,
            panelVisible ? styles.panelVisible : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={resolvedPanelStyle}
        >
          {children}
        </div>
      </div>
    </AdminMobileSheetCloseContext.Provider>,
    document.body,
  );
}
