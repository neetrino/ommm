import cardStyles from "@/components/marketing/packages/packages-page-category-cards.module.css";
import accordionStyles from "@/components/marketing/packages/packages-page-accordion.module.css";
import { DEFAULT_DESKTOP_CARDS_PER_ROW } from "@/components/marketing/packages/packages-page-accordion.constants";
import {
  PACKAGES_PAGE_ACCORDION_FIGMA,
  PACKAGES_PAGE_LAYOUT,
  PACKAGES_PAGE_MOBILE_FIGMA,
  resolvePackagesPageAccordionRowHeightPx,
} from "@/components/marketing/packages/packages-page-tokens";

const DESKTOP_SKELETON_CARD_COUNT = 5;
const MOBILE_SKELETON_CARD_COUNT = 3;

function buildSkeletonRowWidths(cardsInRow: number, cardsPerRow: number): string {
  if (cardsInRow >= cardsPerRow) {
    return "100%";
  }

  return `calc(
    (
        (100% - (${cardsPerRow} - 1) * var(--packages-page-accordion-gap))
        / ${cardsPerRow}
      ) * ${cardsInRow} +
      (${cardsInRow} - 1) * var(--packages-page-accordion-gap)
  )`;
}

function buildDesktopSkeletonRows(
  cardCount: number,
  cardsPerRow: number,
): readonly (readonly number[])[] {
  const rows: number[][] = [];
  for (let index = 0; index < cardCount; index += cardsPerRow) {
    rows.push(
      Array.from({ length: Math.min(cardsPerRow, cardCount - index) }, (_, offset) => index + offset),
    );
  }
  return rows;
}

/** Accordion-shaped placeholder while package plans hydrate on the client. */
export function MarketingMembershipPackagesSkeleton() {
  const desktopRowHeightPx = resolvePackagesPageAccordionRowHeightPx();
  const desktopRows = buildDesktopSkeletonRows(
    DESKTOP_SKELETON_CARD_COUNT,
    DEFAULT_DESKTOP_CARDS_PER_ROW,
  );

  return (
    <div className={`w-full min-w-0 animate-pulse ${cardStyles.packagesPageRoot}`} aria-hidden>
      <div className={cardStyles.desktopOnly}>
        <div
          className={accordionStyles.accordionRows}
          style={{ ["--packages-page-accordion-gap" as string]: PACKAGES_PAGE_LAYOUT.accordionGap }}
        >
          {desktopRows.map((row, rowIndex) => {
            const isIncompleteRow = row.length < DEFAULT_DESKTOP_CARDS_PER_ROW;

            return (
              <div
                key={`skeleton-row-${rowIndex}`}
                className={[
                  accordionStyles.accordionRow,
                  isIncompleteRow ? accordionStyles.accordionRowCentered : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  gap: `${PACKAGES_PAGE_ACCORDION_FIGMA.accordionGapPx}px`,
                  height: `${desktopRowHeightPx}px`,
                  width: isIncompleteRow
                    ? buildSkeletonRowWidths(row.length, DEFAULT_DESKTOP_CARDS_PER_ROW)
                    : "100%",
                  marginInline: isIncompleteRow ? "auto" : undefined,
                }}
              >
                {row.map((cardIndex) => (
                  <div
                    key={cardIndex}
                    className="rounded-[50px] border border-white/50 bg-white/35"
                    style={{
                      flex: "1 1 0%",
                      minWidth: 0,
                      height: "100%",
                    }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={`${cardStyles.mobileOnly} flex flex-col`}
        style={{ gap: PACKAGES_PAGE_LAYOUT.mobileAccordionGap }}
      >
        {Array.from({ length: MOBILE_SKELETON_CARD_COUNT }, (_, index) => (
          <div
            key={index}
            className="rounded-[24px] border border-white/50 bg-white/35"
            style={{ minHeight: `${PACKAGES_PAGE_MOBILE_FIGMA.collapsedCardMinHeightPx}px` }}
          />
        ))}
      </div>
    </div>
  );
}
