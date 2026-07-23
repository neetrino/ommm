"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { PACKAGES_SUBSCRIBE_PARAM } from "@/lib/auth-redirect";

type UsePackageSubscribeUrlStateResult = {
  subscribePlanId: string | null;
  openSubscribe: (planId: string) => void;
  closeSubscribe: () => void;
};

/** Shared across hook instances — card click and modal host update in the same frame. */
let pendingSubscribePlanId: string | null = null;
const pendingSubscribeListeners = new Set<() => void>();

function emitPendingSubscribeChange(): void {
  pendingSubscribeListeners.forEach((listener) => listener());
}

function setPendingSubscribePlanId(planId: string | null): void {
  pendingSubscribePlanId = planId;
  emitPendingSubscribeChange();
}

function readPendingSubscribePlanId(): string | null {
  return pendingSubscribePlanId;
}

function subscribePendingSubscribePlanId(onStoreChange: () => void): () => void {
  pendingSubscribeListeners.add(onStoreChange);
  return () => {
    pendingSubscribeListeners.delete(onStoreChange);
  };
}

/** Live query string — avoids stale `useSearchParams` snapshots after `router.refresh()`. */
function readLocationSearchParams(): URLSearchParams {
  if (typeof window === "undefined") {
    return new URLSearchParams();
  }
  return new URLSearchParams(window.location.search);
}

/** Syncs confirm-subscription modal state with `?subscribe=planId` in the URL. */
export function usePackageSubscribeUrlState(): UsePackageSubscribeUrlStateResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const optimisticPlanId = useSyncExternalStore(
    subscribePendingSubscribePlanId,
    readPendingSubscribePlanId,
    () => null,
  );

  const urlPlanId = searchParams.get(PACKAGES_SUBSCRIBE_PARAM)?.trim() ?? null;
  const subscribePlanId = optimisticPlanId ?? urlPlanId;

  useEffect(() => {
    if (optimisticPlanId !== null && urlPlanId === optimisticPlanId) {
      setPendingSubscribePlanId(null);
    }
  }, [optimisticPlanId, urlPlanId]);

  const replaceSubscribeParam = useCallback(
    (planId: string | null) => {
      const params = readLocationSearchParams();
      if (planId !== null && planId.length > 0) {
        params.set(PACKAGES_SUBSCRIBE_PARAM, planId);
      } else {
        params.delete(PACKAGES_SUBSCRIBE_PARAM);
      }
      const query = params.toString();
      router.replace(query.length > 0 ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const openSubscribe = useCallback(
    (planId: string) => {
      setPendingSubscribePlanId(planId);
      replaceSubscribeParam(planId);
    },
    [replaceSubscribeParam],
  );

  const closeSubscribe = useCallback(() => {
    setPendingSubscribePlanId(null);
    replaceSubscribeParam(null);
  }, [replaceSubscribeParam]);

  return {
    subscribePlanId,
    openSubscribe,
    closeSubscribe,
  };
}
