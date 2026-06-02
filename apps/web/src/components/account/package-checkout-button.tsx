"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";
import {
  PackageManualPaymentModal,
  type PackageManualPaymentPlan,
} from "@/components/account/package-manual-payment-modal";
import { OmmButton } from "@/components/ui/omm-button";
import { usePathname, useRouter } from "@/i18n/navigation";
import { PACKAGE_CHECKOUT_QUERY_KEY } from "@/lib/package-checkout-query";

type Props = {
  plan: PackageManualPaymentPlan;
  locale: string;
  label?: string;
};

type HostProps = {
  plans: PackageManualPaymentPlan[];
  locale: string;
};

function usePackageCheckoutUrl() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const checkoutPlanId = searchParams.get(PACKAGE_CHECKOUT_QUERY_KEY);

  const openCheckout = useCallback(
    (planId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(PACKAGE_CHECKOUT_QUERY_KEY, planId);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const closeCheckout = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(PACKAGE_CHECKOUT_QUERY_KEY);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return { checkoutPlanId, openCheckout, closeCheckout };
}

function PackageCheckoutButtonInner({ plan, locale, label }: Props) {
  const t = useTranslations("forms.packageCheckout");
  const { openCheckout } = usePackageCheckoutUrl();
  const cta = label ?? t("subscribe");

  return (
    <OmmButton type="button" variant="primary" onClick={() => openCheckout(plan.id)}>
      {cta}
    </OmmButton>
  );
}

export function PackageCheckoutButton(props: Props) {
  const t = useTranslations("forms.packageCheckout");
  const cta = props.label ?? t("subscribe");

  return (
    <Suspense
      fallback={
        <OmmButton type="button" variant="primary" disabled>
          {cta}
        </OmmButton>
      }
    >
      <PackageCheckoutButtonInner {...props} />
    </Suspense>
  );
}

function PackageCheckoutModalHostInner({ plans, locale }: HostProps) {
  const { checkoutPlanId, closeCheckout } = usePackageCheckoutUrl();
  const plan = plans.find((item) => item.id === checkoutPlanId) ?? null;

  if (!plan) {
    return null;
  }

  return (
    <PackageManualPaymentModal
      isOpen
      onClose={closeCheckout}
      plan={plan}
      locale={locale}
    />
  );
}

export function PackageCheckoutModalHost(props: HostProps) {
  return (
    <Suspense fallback={null}>
      <PackageCheckoutModalHostInner {...props} />
    </Suspense>
  );
}
