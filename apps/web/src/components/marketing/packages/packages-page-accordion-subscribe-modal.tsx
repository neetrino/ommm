"use client";

import dynamic from "next/dynamic";
import { Suspense, useMemo } from "react";
import { toAccordionCategoryGroups } from "@/components/marketing/packages/packages-page-accordion.helpers";
import type { PackagesSubscribeModalHostProps } from "@/components/marketing/packages/packages-page-accordion.types";
import { usePackageSubscribeUrlState } from "@/hooks/use-package-subscribe-url-state";
import { resolvePackageSubscribeCategoryContext } from "@/lib/package-subscribe-category-plans";
import { toPackageSubscribePlanOptions } from "@/lib/package-subscribe-plan-option";

const PackageSubscribePaymentModal = dynamic(
  () =>
    import("@/components/account/package-subscribe-payment-modal").then((mod) => ({
      default: mod.PackageSubscribePaymentModal,
    })),
  { ssr: false },
);

function PackagesPageAccordionSubscribeModalHostInner({
  locale,
  categories,
  audience,
}: PackagesSubscribeModalHostProps) {
  const { subscribePlanId, closeSubscribe } = usePackageSubscribeUrlState();

  const subscribeContext = useMemo(() => {
    if (audience !== "member" || subscribePlanId === null || subscribePlanId.length === 0) {
      return null;
    }
    return resolvePackageSubscribeCategoryContext(
      toAccordionCategoryGroups(categories),
      subscribePlanId,
    );
  }, [audience, categories, subscribePlanId]);

  const subscribeModalPlans = useMemo(
    () =>
      subscribeContext !== null
        ? toPackageSubscribePlanOptions(subscribeContext.subscribablePlans)
        : [],
    [subscribeContext],
  );

  if (audience !== "member" || subscribeContext === null || subscribeModalPlans.length === 0) {
    return null;
  }

  return (
    <PackageSubscribePaymentModal
      isOpen
      locale={locale}
      plans={subscribeModalPlans}
      initialPlanId={subscribeContext.plan.id}
      onClose={closeSubscribe}
    />
  );
}

export function PackagesPageAccordionSubscribeModalHost(props: PackagesSubscribeModalHostProps) {
  return (
    <Suspense fallback={null}>
      <PackagesPageAccordionSubscribeModalHostInner {...props} />
    </Suspense>
  );
}
