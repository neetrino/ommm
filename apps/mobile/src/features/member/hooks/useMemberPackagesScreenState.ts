import { useCallback, useState } from "react";
import { readStoredAccessToken } from "../../../auth/accessTokenStorage";
import {
  fetchPublicPackages,
  fetchUserMemberships,
  subscribeToPackage,
} from "../../../lib/api/packagesClient";
import { buildAccordionCategoriesFromPlans } from "../../../lib/packages/packagesPageCategoryData";
import type { PackagesPageAccordionCategory } from "../../../lib/packages/packagesPageCategoryData";
import { usePackagesCopy } from "../../../lib/packages/usePackagesCopy";
import { useLocale, useTranslations } from "../../../i18n/I18nProvider";
import type { PublicPackagePlan } from "../../../lib/packages/publicPackagePlan";
import {
  normalizeUserPackageStatus,
  type UserMembershipRow,
} from "../../../lib/packages/userMembership";
import { isArcaCheckoutEnabled, openArcaRedirectUrl } from "../../../lib/payments/arcaCheckout";

export type PackagesScreenMode = "mine" | "catalog";

type UseMemberPackagesScreenStateParams = {
  isSignedIn: boolean;
};

export function useMemberPackagesScreenState({ isSignedIn }: UseMemberPackagesScreenStateParams) {
  const packagesCopy = usePackagesCopy();
  const checkoutLocale = useLocale();
  const tMarketing = useTranslations("marketing");
  const [mode, setMode] = useState<PackagesScreenMode>(isSignedIn ? "mine" : "catalog");
  const [memberships, setMemberships] = useState<UserMembershipRow[]>([]);
  const [categories, setCategories] = useState<PackagesPageAccordionCategory[]>([]);
  const [catalogPlans, setCatalogPlans] = useState<PublicPackagePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribePlanId, setSubscribePlanId] = useState<string | null>(null);
  const [subscribeBusy, setSubscribeBusy] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const loadMine = useCallback(async () => {
    const token = await readStoredAccessToken();
    if (token === null) {
      throw new Error(packagesCopy.loadMembershipsError);
    }
    const rows = await fetchUserMemberships(token);
    setMemberships(rows);
  }, [packagesCopy.loadMembershipsError]);

  const loadCatalog = useCallback(async () => {
    const plans = await fetchPublicPackages();
    setCatalogPlans(plans);
    setCategories(
      buildAccordionCategoriesFromPlans(
        plans,
        tMarketing("packagesCardPriceFromPrefix"),
      ),
    );
  }, [tMarketing]);

  const loadForMode = useCallback(
    async (targetMode: PackagesScreenMode) => {
      setLoading(true);
      setError(null);
      try {
        if (isSignedIn && targetMode === "mine") {
          await loadMine();
        } else {
          await loadCatalog();
        }
      } catch (e) {
        const message =
          e instanceof Error
            ? e.message
            : isSignedIn && targetMode === "mine"
              ? packagesCopy.loadMembershipsError
              : packagesCopy.loadError;
        setError(message);
        if (isSignedIn && targetMode === "mine") {
          setMemberships([]);
        } else {
          setCategories([]);
          setCatalogPlans([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [isSignedIn, loadCatalog, loadMine, packagesCopy.loadError, packagesCopy.loadMembershipsError],
  );

  const load = useCallback(async () => {
    await loadForMode(mode);
  }, [loadForMode, mode]);

  const openCatalog = useCallback(() => {
    setMode("catalog");
    void loadForMode("catalog");
  }, [loadForMode]);

  const openMine = useCallback(() => {
    setMode("mine");
    void loadForMode("mine");
  }, [loadForMode]);

  const openSubscribe = useCallback((planId: string) => {
    setSubscribePlanId(planId);
    setSubscribeError(null);
  }, []);

  const closeSubscribe = useCallback(() => {
    if (subscribeBusy) {
      return;
    }
    setSubscribePlanId(null);
    setSubscribeError(null);
  }, [subscribeBusy]);

  const confirmSubscribe = useCallback(async (): Promise<boolean> => {
    if (subscribePlanId === null) {
      return false;
    }
    const token = await readStoredAccessToken();
    if (token === null) {
      setSubscribeError(packagesCopy.subscribeFailed);
      return false;
    }
    setSubscribeBusy(true);
    setSubscribeError(null);
    try {
      const result = await subscribeToPackage(token, {
        planId: subscribePlanId,
        paymentMethod: "CARD",
        locale: checkoutLocale,
      });
      setSubscribePlanId(null);
      setMode("mine");
      await loadForMode("mine");
      if (
        isArcaCheckoutEnabled() &&
        typeof result.redirectUrl === "string" &&
        result.redirectUrl.length > 0
      ) {
        await openArcaRedirectUrl(result.redirectUrl);
        return true;
      }
      return true;
    } catch (e) {
      setSubscribeError(
        e instanceof Error ? e.message : packagesCopy.subscribeFailed,
      );
      return false;
    } finally {
      setSubscribeBusy(false);
    }
  }, [checkoutLocale, loadForMode, packagesCopy.subscribeFailed, subscribePlanId]);

  const selectedSubscribePlan =
    subscribePlanId === null
      ? null
      : catalogPlans.find((plan) => plan.id === subscribePlanId) ?? null;

  return {
    mode,
    memberships,
    categories,
    loading,
    error,
    subscribePlanId,
    subscribeBusy,
    subscribeError,
    selectedSubscribePlan,
    load,
    openCatalog,
    openMine,
    openSubscribe,
    closeSubscribe,
    confirmSubscribe,
  };
}

export function normalizeMembershipStatus(membership: UserMembershipRow) {
  return normalizeUserPackageStatus(membership.status);
}
