import cardStyles from "@/components/marketing/packages/packages-page-category-cards.module.css";
import {
  PACKAGES_PAGE_ACCORDION_FIGMA,
  PACKAGES_PAGE_LAYOUT,
  PACKAGES_PAGE_MOBILE_FIGMA,
  resolvePackagesPageAccordionRowHeightPx,
} from "@/components/marketing/packages/packages-page-tokens";

const DESKTOP_SKELETON_CARD_COUNT = 5;
const MOBILE_SKELETON_CARD_COUNT = 3;

/** Accordion-shaped placeholder while package plans hydrate on the client. */
export function MarketingMembershipPackagesSkeleton() {
  const desktopRowHeightPx = resolvePackagesPageAccordionRowHeightPx();

  return (
    <div className={`w-full min-w-0 animate-pulse ${cardStyles.packagesPageRoot}`} aria-hidden>
      <div className={cardStyles.desktopOnly}>
        <div
          className="flex w-full items-stretch"
          style={{
            gap: `${PACKAGES_PAGE_ACCORDION_FIGMA.accordionGapPx}px`,
            height: `${desktopRowHeightPx}px`,
          }}
        >
          {Array.from({ length: DESKTOP_SKELETON_CARD_COUNT }, (_, index) => (
            <div
              key={index}
              className="rounded-[50px] border border-white/50 bg-white/35"
              style={{
                flex: `0 0 ${PACKAGES_PAGE_LAYOUT.collapsedPanelWidth}`,
                height: "100%",
              }}
            />
          ))}
        </div>
      </div>

      <div className={`${cardStyles.mobileOnly} flex flex-col`} style={{ gap: PACKAGES_PAGE_LAYOUT.mobileAccordionGap }}>
        {Array.from({ length: MOBILE_SKELETON_CARD_COUNT }, (_, index) => (
          <div
            key={index}
            className="rounded-[24px] border border-white/50 bg-white/35"
            style={{ height: `${PACKAGES_PAGE_MOBILE_FIGMA.collapsedCardMinHeightPx}px` }}
          />
        ))}
      </div>
    </div>
  );
}
