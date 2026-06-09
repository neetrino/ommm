"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const OMMM_CENTER_TOAST_VISIBLE_MS = 3_500;
export const OMMM_CENTER_TOAST_EXIT_MS = 320;

export type OmmmCenterToastTone = "success" | "error";

type OmmmCenterToastProps = {
  message: string | null;
  tone?: OmmmCenterToastTone;
  onDismiss: () => void;
  durationMs?: number;
};

type ToastPhase = "enter" | "exit";

const TONE_PANEL_CLASS: Record<OmmmCenterToastTone, string> = {
  success:
    "border-white/70 bg-white/92 text-sage-900 ring-1 ring-sage-700/8",
  error: "border-red-200/90 bg-red-50/95 text-red-900 ring-1 ring-red-200/60",
};

export function OmmmCenterToast({
  message,
  tone = "success",
  onDismiss,
  durationMs = OMMM_CENTER_TOAST_VISIBLE_MS,
}: OmmmCenterToastProps) {
  const [phase, setPhase] = useState<ToastPhase>("enter");
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!message) {
      return undefined;
    }
    setPhase("enter");

    const exitTimer = window.setTimeout(() => {
      setPhase("exit");
    }, durationMs);

    const hideTimer = window.setTimeout(() => {
      onDismissRef.current();
    }, durationMs + OMMM_CENTER_TOAST_EXIT_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, [durationMs, message]);

  if (!message || typeof document === "undefined") {
    return null;
  }

  const animationClass =
    phase === "exit" ? "ommm-center-toast-out" : "ommm-center-toast-in";

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[115] flex items-center justify-center px-4"
      aria-live="polite"
    >
      <div
        role="status"
        className={`pointer-events-auto flex max-w-sm items-center gap-3 rounded-[28px] border px-6 py-4 text-sm font-medium shadow-[0_24px_50px_-30px_rgba(45,40,35,0.35)] backdrop-blur-md ${TONE_PANEL_CLASS[tone]} ${animationClass}`}
      >
        {tone === "success" ? (
          <span
            aria-hidden
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint-100/90 text-mint-700"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path
                fillRule="evenodd"
                d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.333a1 1 0 0 1-1.435-.02L3.29 9.824a1 1 0 1 1 1.42-1.404l3.176 3.217 6.54-6.625a1 1 0 0 1 1.414-.006Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        ) : null}
        <span className="text-left leading-snug">{message}</span>
      </div>
    </div>,
    document.body,
  );
}
