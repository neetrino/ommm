"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { PACKAGES_SUBSCRIBE_PARAM } from "@/lib/auth-redirect";

type UsePackageSubscribeUrlStateResult = {
  subscribePlanId: string | null;
  openSubscribe: (planId: string) => void;
  closeSubscribe: () => void;
  setSubscribePlanId: (planId: string) => void;
};

/** Syncs confirm-subscription modal state with `?subscribe=planId` in the URL. */
export function usePackageSubscribeUrlState(): UsePackageSubscribeUrlStateResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const subscribePlanId = searchParams.get(PACKAGES_SUBSCRIBE_PARAM)?.trim() ?? null;

  const replaceSubscribeParam = useCallback(
    (planId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (planId !== null && planId.length > 0) {
        params.set(PACKAGES_SUBSCRIBE_PARAM, planId);
      } else {
        params.delete(PACKAGES_SUBSCRIBE_PARAM);
      }
      const query = params.toString();
      router.replace(query.length > 0 ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const openSubscribe = useCallback(
    (planId: string) => {
      replaceSubscribeParam(planId);
    },
    [replaceSubscribeParam],
  );

  const closeSubscribe = useCallback(() => {
    if (subscribePlanId === null) {
      return;
    }
    replaceSubscribeParam(null);
  }, [replaceSubscribeParam, subscribePlanId]);

  const setSubscribePlanId = useCallback(
    (planId: string) => {
      if (planId.length === 0) {
        return;
      }
      replaceSubscribeParam(planId);
    },
    [replaceSubscribeParam],
  );

  return {
    subscribePlanId,
    openSubscribe,
    closeSubscribe,
    setSubscribePlanId,
  };
}
