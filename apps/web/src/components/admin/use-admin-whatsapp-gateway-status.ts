'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export type WhatsappGatewayReachability = {
  reachable: boolean;
};

export function useAdminWhatsappGatewayStatus(enabled: boolean, refreshKey: number) {
  const [reachable, setReachable] = useState(false);
  const [checking, setChecking] = useState(false);

  if (!enabled && (reachable || checking)) {
    setReachable(false);
    setChecking(false);
  }

  useEffect(() => {
    if (!enabled) {
      return;
    }
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) {
        return;
      }
      setChecking(true);
      void apiFetch<WhatsappGatewayReachability>('/whatsapp/admin/gateway-status')
        .then((result) => {
          if (!cancelled) {
            setReachable(result.reachable);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setReachable(false);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setChecking(false);
          }
        });
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, refreshKey]);

  return { reachable, checking };
}
