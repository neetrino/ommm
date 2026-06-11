"use client";

import { createPortal } from "react-dom";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  MEMBER_ACCOUNT_HUB_SHEET_BODY_CLASS,
  MEMBER_ACCOUNT_HUB_SHEET_GRABBER_CLASS,
  MEMBER_ACCOUNT_HUB_SHEET_HEADER_CLASS,
  MEMBER_ACCOUNT_HUB_SHEET_MOTION_MS,
  MEMBER_ACCOUNT_HUB_SHEET_TITLE_CLASS,
  memberAccountHubSheetPanelStyle,
} from "@/components/account/member-account-hub-sheet-layout";
import styles from "@/components/account/member-hub-mobile-sheet.module.css";
import { ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS } from "@/components/admin/admin-details-sheet-layout";
import { OMM_MODAL_BACKDROP_CLASS } from "@/components/ui/omm-modal";
import { useCloseOnEscape } from "@/hooks/use-close-on-escape";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import { dismissMobileKeyboard } from "@/lib/dismiss-mobile-keyboard";

const MemberHubMobileSheetCloseContext = createContext<(() => void) | null>(null);

/** Triggers the animated close on a nested member hub mobile sheet. */
export function useMemberHubMobileSheetClose(): () => void {
  const close = useContext(MemberHubMobileSheetCloseContext);
  return close ?? (() => undefined);
}

type MemberHubMobileSheetProps = {
  titleId: string;
  title?: string;
  closeLabel: string;
  backdropCloseLabel: string;
  onClose: () => void;
  closeDisabled?: boolean;
  panelStyle?: CSSProperties;
  /** Skip default grabber/header — children fill the panel. */
  bare?: boolean;
  children: ReactNode;
};

function SheetCloseIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Mobile member hub bottom sheet — iOS-safe slide-up/down via reflow + CSS transitions.
 */
export function MemberHubMobileSheet({
  titleId,
  title,
  closeLabel,
  backdropCloseLabel,
  onClose,
  closeDisabled = false,
  panelStyle,
  bare = false,
  children,
}: MemberHubMobileSheetProps) {
  const clientMounted = useIsClientMounted();
  const panelRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);
  const [isClosing, setIsClosing] = useState(false);
  const [backdropVisible, setBackdropVisible] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);

  useLockBodyScroll(clientMounted);

  const requestClose = useCallback(() => {
    if (closingRef.current || closeDisabled) {
      return;
    }

    dismissMobileKeyboard();
    closingRef.current = true;
    setIsClosing(true);
    setPanelVisible(false);
    setBackdropVisible(false);
    window.setTimeout(onClose, MEMBER_ACCOUNT_HUB_SHEET_MOTION_MS);
  }, [closeDisabled, onClose]);

  useCloseOnEscape(clientMounted, requestClose, { disabled: closeDisabled || isClosing });

  useLayoutEffect(() => {
    if (!clientMounted) {
      return undefined;
    }

    const panel = panelRef.current;
    if (!panel) {
      return undefined;
    }

    panel.style.transition = "none";
    panel.style.transform = "translate3d(0, 100%, 0)";
    void panel.offsetHeight;

    const openFrame = requestAnimationFrame(() => {
      panel.style.transition = "";
      panel.style.transform = "";
      setBackdropVisible(true);
      setPanelVisible(true);
    });

    return () => {
      cancelAnimationFrame(openFrame);
    };
  }, [clientMounted]);

  if (!clientMounted || typeof document === "undefined") {
    return null;
  }

  const resolvedPanelStyle = panelStyle ?? memberAccountHubSheetPanelStyle();

  return createPortal(
    <MemberHubMobileSheetCloseContext.Provider value={requestClose}>
      <div className={[styles.overlay, "ommm-member-hub-sheet-overlay"].join(" ")} role="presentation">
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
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={[
          styles.panel,
          "ommm-member-hub-sheet-panel",
          panelVisible ? styles.panelVisible : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={resolvedPanelStyle}
      >
        {bare ? (
          children
        ) : (
          <>
            <div className={MEMBER_ACCOUNT_HUB_SHEET_GRABBER_CLASS} aria-hidden />
            <header className={MEMBER_ACCOUNT_HUB_SHEET_HEADER_CLASS}>
              <h2 id={titleId} className={MEMBER_ACCOUNT_HUB_SHEET_TITLE_CLASS}>
                {title}
              </h2>
              <button
                type="button"
                className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
                aria-label={closeLabel}
                onClick={requestClose}
                disabled={closeDisabled || isClosing}
              >
                <SheetCloseIcon />
              </button>
            </header>
            <div className={MEMBER_ACCOUNT_HUB_SHEET_BODY_CLASS}>{children}</div>
          </>
        )}
      </div>
      </div>
    </MemberHubMobileSheetCloseContext.Provider>,
    document.body,
  );
}
