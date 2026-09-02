"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import {
  isWhatsappConnected,
  WHATSAPP_CONNECT_PATH,
  WHATSAPP_CONNECT_QR_PATH,
  WHATSAPP_QR_POLL_MS,
  type WhatsappConnectState,
} from "@/lib/whatsapp-admin";

type SessionActionPath =
  | "/whatsapp/admin/session/restart"
  | "/whatsapp/admin/session/logout";

export function useAdminWhatsappConnect(fallbackError: string) {
  const [session, setSession] = useState<WhatsappConnectState | null>(null);
  const [busy, setBusy] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(
    async (showBusy: boolean, includeQr: boolean) => {
      if (showBusy) {
        setBusy(true);
      }
      setError(null);
      try {
        const next = await apiFetch<WhatsappConnectState>(
          includeQr ? WHATSAPP_CONNECT_QR_PATH : WHATSAPP_CONNECT_PATH,
        );
        setSession(next);
        if (isWhatsappConnected(next.status)) {
          setPolling(false);
        }
      } catch (caught) {
        setPolling(false);
        setError(caught instanceof ApiError ? caught.message : fallbackError);
      } finally {
        if (showBusy) {
          setBusy(false);
        }
      }
    },
    [fallbackError],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void refreshSession(true, false);
    });
  }, [refreshSession]);

  useEffect(() => {
    if (!polling) {
      return;
    }
    const timer = window.setInterval(() => {
      void refreshSession(false, true);
    }, WHATSAPP_QR_POLL_MS);
    return () => window.clearInterval(timer);
  }, [polling, refreshSession]);

  const runSessionAction = useCallback(
    async (path: SessionActionPath) => {
      setBusy(true);
      setError(null);
      try {
        const next = await apiFetch<WhatsappConnectState>(path, {
          method: "POST",
        });
        setSession(next);
        setPolling(
          path === "/whatsapp/admin/session/restart" &&
            !isWhatsappConnected(next.status),
        );
      } catch (caught) {
        setError(caught instanceof ApiError ? caught.message : fallbackError);
      } finally {
        setBusy(false);
      }
    },
    [fallbackError],
  );

  return {
    session,
    busy,
    polling,
    error,
    startQr: () => {
      setPolling(true);
      void refreshSession(true, true);
    },
    restart: () => void runSessionAction("/whatsapp/admin/session/restart"),
    logout: () => void runSessionAction("/whatsapp/admin/session/logout"),
  };
}
