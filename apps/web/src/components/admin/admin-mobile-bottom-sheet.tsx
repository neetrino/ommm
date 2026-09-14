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
  ADMIN_MOBILE_SHEET_GRABBER_CLASS,
  ADMIN_MOBILE_SHEET_GRABBER_ROW_CLASS,
  ADMIN_MOBILE_SHEET_MOTION_MS,
  ADMIN_MOBILE_SHEET_OVERLAY_CLASS,
  ADMIN_MOBILE_SHEET_PANEL_CLASS,
  adminMobileSheetPanelStyle,
} from "@/components/admin/admin-mobile-sheet-layout";
import { useAdminMobileSheetDragClose } from "@/components/admin/use-admin-mobile-sheet-drag-close";
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
  isOpen: boolean;
  titleId?: string;
  backdropCloseLabel: string;
  onClose: () => void;
  /** Fired after the slide-down exit animation completes. */
  onExitComplete?: () => void;
  closeDisabled?: boolean;
  panelStyle?: CSSProperties;
  overlayClassName?: string;
  zIndexClass?: string;
  children: ReactNode;
};

function scheduleSheetMotionFrame(callback: () => void): number {
  return window.requestAnimationFrame(() => {
    window.requestAnimationFrame(callback);
  });
}

/**
 * Admin mobile bottom sheet — slide-up panel with dimmed backdrop (Ilona-style).
 * Hidden from tablet up; pair with a desktop drawer/modal portal.
 */
export function AdminMobileBottomSheet({
  isOpen,
  titleId,
  backdropCloseLabel,
  onClose,
  onExitComplete,
  closeDisabled = false,
  panelStyle,
  overlayClassName,
  zIndexClass = "z-[105]",
  children,
}: AdminMobileBottomSheetProps) {
  const clientMounted = useIsClientMounted();
  const closingRef = useRef(false);
  const exitFrameRef = useRef<number | undefined>(undefined);
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [backdropVisible, setBackdropVisible] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);

  useLockBodyScroll(isRendered);

  if (isOpen && !isRendered) {
    setIsRendered(true);
  }
  if (isOpen && isClosing) {
    setIsClosing(false);
  }

  useEffect(() => {
    if (isOpen) {
      closingRef.current = false;
    }
  }, [isOpen]);

  const finishExit = useCallback(
    (notifyParent: boolean) => {
      releaseBodyScrollLockEarly();
      closingRef.current = false;
      setIsClosing(false);
      setIsRendered(false);
      onExitComplete?.();
      if (notifyParent) {
        onClose();
      }
    },
    [onClose, onExitComplete],
  );

  const runExitAnimation = useCallback(
    (notifyParent: boolean) => {
      if (closingRef.current) {
        return;
      }

      closingRef.current = true;
      setIsClosing(true);

      if (exitFrameRef.current !== undefined) {
        window.cancelAnimationFrame(exitFrameRef.current);
      }

      exitFrameRef.current = scheduleSheetMotionFrame(() => {
        setPanelVisible(false);
        setBackdropVisible(false);
        exitFrameRef.current = undefined;
      });

      window.setTimeout(() => {
        finishExit(notifyParent);
      }, ADMIN_MOBILE_SHEET_MOTION_MS);
    },
    [finishExit],
  );

  useEffect(() => {
    if (!isRendered || !isOpen || closingRef.current || !clientMounted) {
      return undefined;
    }

    const openFrame = scheduleSheetMotionFrame(() => {
      setBackdropVisible(true);
      setPanelVisible(true);
    });

    return () => {
      window.cancelAnimationFrame(openFrame);
    };
  }, [clientMounted, isOpen, isRendered]);

  useEffect(() => {
    if (!isOpen && isRendered && !closingRef.current) {
      dismissMobileKeyboard();
      runExitAnimation(false);
    }
  }, [isOpen, isRendered, runExitAnimation]);

  useEffect(() => {
    return () => {
      if (exitFrameRef.current !== undefined) {
        window.cancelAnimationFrame(exitFrameRef.current);
      }
    };
  }, []);

  const requestClose = useCallback(() => {
    if (closingRef.current || closeDisabled || isClosing) {
      return;
    }

    dismissMobileKeyboard();
    runExitAnimation(true);
  }, [closeDisabled, isClosing, runExitAnimation]);

  const dragCloseEnabled = isRendered && isOpen && !closeDisabled && !isClosing;
  const { dragOffsetPx, isDragging, grabberHandlers } = useAdminMobileSheetDragClose(
    dragCloseEnabled,
    requestClose,
  );

  useCloseOnEscape(isRendered && isOpen, requestClose, {
    disabled: closeDisabled || isClosing,
  });

  if (!isRendered || !clientMounted) {
    return null;
  }

  const resolvedPanelStyle = panelStyle ?? adminMobileSheetPanelStyle();
  const dragging = isDragging || dragOffsetPx > 0;
  const panelMotionStyle: CSSProperties = dragging
    ? {
        ...resolvedPanelStyle,
        transform: `translate3d(0, ${dragOffsetPx}px, 0)`,
      }
    : resolvedPanelStyle;
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
            isDragging ? styles.panelDragging : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={panelMotionStyle}
        >
          <div
            role="button"
            tabIndex={closeDisabled || isClosing ? -1 : 0}
            aria-label={backdropCloseLabel}
            className={`${ADMIN_MOBILE_SHEET_GRABBER_ROW_CLASS} ${styles.grabberRow}`}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                requestClose();
              }
            }}
            {...grabberHandlers}
          >
            <div className={ADMIN_MOBILE_SHEET_GRABBER_CLASS} />
          </div>
          {children}
        </div>
      </div>
    </AdminMobileSheetCloseContext.Provider>,
    document.body,
  );
}
