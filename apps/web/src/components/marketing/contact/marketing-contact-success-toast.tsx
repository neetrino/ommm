"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CONTACT_PAGE_LAYOUT } from "@/components/marketing/contact/contact-page-tokens";
import styles from "@/components/marketing/contact/marketing-contact-success-toast.module.css";

type ToastPhase = "enter" | "exit";

type MarketingContactSuccessToastProps = {
  message: string | null;
  onDismiss: () => void;
};

function resolveToastTopOffset(): string {
  const header = document.querySelector("header");
  if (!(header instanceof HTMLElement)) {
    return "calc(4.25rem + 0.75rem)";
  }

  const topPx =
    Math.ceil(header.getBoundingClientRect().height) + CONTACT_PAGE_LAYOUT.successToastTopGapPx;
  return `${topPx}px`;
}

function toastStyle(topOffset: string): CSSProperties {
  return {
    ["--contact-success-toast-top" as string]: topOffset,
    ["--contact-success-toast-enter-ms" as string]: `${CONTACT_PAGE_LAYOUT.successToastEnterMs}ms`,
    ["--contact-success-toast-exit-ms" as string]: `${CONTACT_PAGE_LAYOUT.successToastExitMs}ms`,
  };
}

/** Top success banner — fades in, holds, then fades out after contact form submit. */
export function MarketingContactSuccessToast({
  message,
  onDismiss,
}: MarketingContactSuccessToastProps) {
  const [phase, setPhase] = useState<ToastPhase>("enter");
  const [topOffset, setTopOffset] = useState("calc(4.25rem + 0.75rem)");
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!message) {
      return;
    }

    setPhase("enter");
    setTopOffset(resolveToastTopOffset());
    const exitTimer = window.setTimeout(() => {
      setPhase("exit");
    }, CONTACT_PAGE_LAYOUT.successToastVisibleMs);

    const hideTimer = window.setTimeout(() => {
      onDismissRef.current();
    }, CONTACT_PAGE_LAYOUT.successToastVisibleMs + CONTACT_PAGE_LAYOUT.successToastExitMs);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, [message]);

  if (!message || typeof document === "undefined") {
    return null;
  }

  const animationClass = phase === "exit" ? styles.toastExit : styles.toastEnter;

  return createPortal(
    <div className={styles.shell} aria-live="polite" style={toastStyle(topOffset)}>
      <p role="status" className={`${styles.toast} ${animationClass}`}>
        {message}
      </p>
    </div>,
    document.body,
  );
}
