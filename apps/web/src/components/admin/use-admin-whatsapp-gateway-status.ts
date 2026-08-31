'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export type WhatsappGatewayReachability = {
  reachable: boolean;
};

export function useAdminWhatsappGatewayStatus(enabled: boolean, refreshKey: number) {
  const [reachable, setReachable] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setReachable(false);
      setChecking(false);
      return;
    }
    let cancelled = false;
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
    return () => {
      cancelled = true;
    };
  }, [enabled, refreshKey]);

  return { reachable, checking };
}
