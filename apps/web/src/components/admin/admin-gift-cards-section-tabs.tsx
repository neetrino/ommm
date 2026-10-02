"use client";

import { useCallback, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { AdminBarProducts } from "@/components/admin/admin-bar-products";
import {
  oliveSegmentedSegmentClassName,
  oliveSegmentedThumbClass,
  oliveSegmentedTrackClass,
} from "@/components/ui/olive-segmented-switcher";

export const GIFT_CARDS_SECTION_QUERY_KEY = "section";
export const GIFT_CARDS_BAR_SECTION = "bar";

const SECTIONS = ["cards", "bar"] as const;
const SECTION_COLUMN_COUNT = 2;

export type GiftCardsSection = (typeof SECTIONS)[number];

export function parseGiftCardsSection(value: string | null): GiftCardsSection {
  return value === GIFT_CARDS_BAR_SECTION ? "bar" : "cards";
}

function isAdminGiftCardsPath(pathname: string): boolean {
  return pathname.includes("/admin/gift-cards");
}

export function useGiftCardsSection(): GiftCardsSection {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  if (!isAdminGiftCardsPath(pathname)) {
    return "cards";
  }
  return parseGiftCardsSection(searchParams.get(GIFT_CARDS_SECTION_QUERY_KEY));
}

/** Swaps the gift-card list for Bar when that section is selected. */
export function AdminGiftCardsSection({ children }: { children: ReactNode }) {
  const section = useGiftCardsSection();
  if (section === "bar") {
    return <AdminBarProducts />;
  }
  return children;
}

export function AdminGiftCardsSectionTabs() {
  const t = useTranslations("adminPages.giftCards.sectionTabs");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const section = parseGiftCardsSection(searchParams.get(GIFT_CARDS_SECTION_QUERY_KEY));
  const activeIndex = section === "bar" ? 1 : 0;

  const selectSection = useCallback(
    (next: GiftCardsSection) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "bar") {
        params.set(GIFT_CARDS_SECTION_QUERY_KEY, GIFT_CARDS_BAR_SECTION);
      } else {
        params.delete(GIFT_CARDS_SECTION_QUERY_KEY);
      }
      const query = params.toString();
      router.replace(query.length > 0 ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <div role="tablist" aria-label={t("aria")} className={oliveSegmentedTrackClass(SECTION_COLUMN_COUNT)}>
      <span aria-hidden className={oliveSegmentedThumbClass(SECTION_COLUMN_COUNT, activeIndex)} />
      {SECTIONS.map((item) => {
        const active = section === item;
        return (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => selectSection(item)}
            className={oliveSegmentedSegmentClassName(active, SECTION_COLUMN_COUNT)}
          >
            {t(item)}
          </button>
        );
      })}
    </div>
  );
}
