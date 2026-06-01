"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export const ADMIN_CENTER_TOAST_VISIBLE_MS = 3500;
export const ADMIN_CENTER_TOAST_EXIT_MS = 320;

export type AdminCenterToastTone = "ok" | "err";

type AdminCenterToastProps = {
  message: string | null;
  tone?: AdminCenterToastTone;
  onDismiss: () => void;
  durationMs?: number;
};

type ToastPhase = "enter" | "exit";

export function AdminCenterToast({
  message,
  tone = "ok",
  onDismiss,
  durationMs = ADMIN_CENTER_TOAST_VISIBLE_MS,
}: AdminCenterToastProps) {
  const [phase, setPhase] = useState<ToastPhase>("enter");
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => {
      setPhase("exit");
    }, durationMs);

    const hideTimer = window.setTimeout(() => {
      onDismissRef.current();
    }, durationMs + ADMIN_CENTER_TOAST_EXIT_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, [durationMs, message]);

  if (!message || typeof document === "undefined") {
    return null;
  }

  const toneClass =
    tone === "ok"
      ? "border-mint-200/90 bg-mint-50/95 text-sage-900"
      : "border-red-200/90 bg-red-50/95 text-red-900";

  const animationClass =
    phase === "exit" ? "ommm-admin-center-toast-out" : "ommm-admin-center-toast-in";

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center px-4"
      aria-live="polite"
    >
      <div
        role="status"
        className={`pointer-events-auto max-w-sm rounded-2xl border px-8 py-5 text-center text-sm font-medium shadow-[0_24px_60px_-24px_rgba(45,40,35,0.35)] backdrop-blur-md ${toneClass} ${animationClass}`}
      >
        {message}
      </div>
    </div>,
    document.body,
  );
}
