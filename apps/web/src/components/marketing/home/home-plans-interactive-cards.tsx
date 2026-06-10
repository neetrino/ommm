"use client";

import { Suspense, useCallback, useMemo } from "react";
import { PackageSubscribePaymentModal } from "@/components/account/package-subscribe-payment-modal";
import { HomePackagePlanCardMobile } from "@/components/marketing/home/home-package-plan-card-mobile";
import { HomePackagePlanCardsRow } from "@/components/marketing/home/home-package-plan-card";
import { HomePageReveal } from "@/components/marketing/home/home-page-reveal";
import { HOME_PAGE_SCROLL_REVEAL } from "@/components/marketing/home/home-page-scroll-reveal-tokens";
import type { HomePlanCardCopy } from "@/components/marketing/home/home-plan-card-types";
import styles from "@/components/marketing/home/marketing-public-home-plans-section.module.css";
import type { PublicPackageCategoryCardsAudience } from "@/components/marketing/packages/public-package-category-cards";
import { listPublicPackageCategorySubscribablePlans } from "@/components/marketing/packages/public-package-category-subscribable-plans";
import { usePackageSubscribeUrlState } from "@/hooks/use-package-subscribe-url-state";
import { resolvePackageSubscribeCategoryContext } from "@/lib/package-subscribe-category-plans";
import type { PublicPackageCategoryGroup } from "@/lib/public-package-categories";
import { toPackageSubscribePlanOptions } from "@/lib/package-subscribe-plan-option";

type HomePlansSubscribeSharedProps = {
  audience: PublicPackageCategoryCardsAudience;
  categories: readonly PublicPackageCategoryGroup[];
  cards: readonly HomePlanCardCopy[];
};

function useHomePlanInteractiveCards({
  audience,
  categories,
  cards,
}: HomePlansSubscribeSharedProps) {
  const { openSubscribe } = usePackageSubscribeUrlState();

  const openCategorySubscribe = useCallback(
    (categoryId: string) => {
      const category = categories.find((item) => item.id === categoryId);
      if (category === undefined) {
        return;
      }
      const subscribablePlans = listPublicPackageCategorySubscribablePlans(category);
      const firstPlan = subscribablePlans[0];
      if (firstPlan === undefined) {
        return;
      }
      openSubscribe(firstPlan.id);
    },
    [categories, openSubscribe],
  );

  return useMemo(
    () =>
      cards.map((card) => {
        if (audience === "member") {
          return {
            ...card,
            onActivate: () => openCategorySubscribe(card.id),
          };
        }
        return {
          ...card,
          href: "/membership",
        };
      }),
    [audience, cards, categories, openCategorySubscribe],
  );
}

export function HomePlansMobileCarousel(props: HomePlansSubscribeSharedProps & { carouselAriaLabel: string }) {
  return (
    <Suspense fallback={null}>
      <HomePlansMobileCarouselInner {...props} />
    </Suspense>
  );
}

function HomePlansMobileCarouselInner({
  audience,
  categories,
  cards,
  carouselAriaLabel,
}: HomePlansSubscribeSharedProps & { carouselAriaLabel: string }) {
  const cardProps = useHomePlanInteractiveCards({ audience, categories, cards });

  return (
    <div className={styles.carouselViewport} aria-label={carouselAriaLabel} tabIndex={0}>
      <div className={styles.carouselTrack}>
        {cardProps.map((card, index) => (
          <div key={card.id ?? `plan-mobile-${index}`} className={styles.carouselSlide}>
            <HomePageReveal
              index={index}
              gridColumns={HOME_PAGE_SCROLL_REVEAL.sectionGridColumns}
              className="h-full"
            >
              <HomePackagePlanCardMobile {...card} />
            </HomePageReveal>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomePlansDesktopCards(props: HomePlansSubscribeSharedProps) {
  return (
    <Suspense fallback={null}>
      <HomePlansDesktopCardsInner {...props} />
    </Suspense>
  );
}

function HomePlansDesktopCardsInner({
  audience,
  categories,
  cards,
}: HomePlansSubscribeSharedProps) {
  const cardProps = useHomePlanInteractiveCards({ audience, categories, cards });

  return <HomePackagePlanCardsRow cards={cardProps} />;
}

type HomePlansSubscribeModalHostProps = {
  locale: string;
  audience: PublicPackageCategoryCardsAudience;
  categories: readonly PublicPackageCategoryGroup[];
};

function HomePlansSubscribeModalHostInner({
  locale,
  audience,
  categories,
}: HomePlansSubscribeModalHostProps) {
  const { subscribePlanId, closeSubscribe } = usePackageSubscribeUrlState();

  const subscribeContext = useMemo(() => {
    if (audience !== "member" || subscribePlanId === null || subscribePlanId.length === 0) {
      return null;
    }
    return resolvePackageSubscribeCategoryContext(categories, subscribePlanId);
  }, [audience, categories, subscribePlanId]);

  const subscribeModalPlans = useMemo(
    () =>
      subscribeContext !== null
        ? toPackageSubscribePlanOptions(subscribeContext.subscribablePlans)
        : [],
    [subscribeContext],
  );

  if (subscribeContext === null || subscribeModalPlans.length === 0) {
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

export function HomePlansSubscribeModalHost(props: HomePlansSubscribeModalHostProps) {
  return (
    <Suspense fallback={null}>
      <HomePlansSubscribeModalHostInner {...props} />
    </Suspense>
  );
}
