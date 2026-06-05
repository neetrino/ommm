import Image from "next/image";
import accordionStyles from "@/components/marketing/packages/packages-page-accordion.module.css";
import { PACKAGES_PAGE_ASSETS } from "@/components/marketing/packages/packages-page-assets";
import cardStyles from "@/components/marketing/packages/packages-page-category-cards.module.css";
import { PACKAGES_PAGE_CARD_FIGMA } from "@/components/marketing/packages/packages-page-tokens";

type PackagesPageCardFabImageProps = {
  direction?: "open" | "close";
  sizePx?: number;
  /** Mobile accordion uses down/up arrows instead of right/left. */
  orientation?: "horizontal" | "vertical" | "vertical-animated" | "horizontal-animated";
};

function resolveFabImageClass(
  direction: "open" | "close",
  orientation: "horizontal" | "vertical" | "vertical-animated" | "horizontal-animated",
): string {
  const classes = [accordionStyles.fabImage];

  if (orientation === "vertical-animated") {
    classes.push(accordionStyles.fabImageVerticalAnimated);
    return classes.join(" ");
  }

  if (orientation === "horizontal-animated") {
    classes.push(accordionStyles.fabImageHorizontalAnimated);
    return classes.join(" ");
  }

  if (orientation === "vertical") {
    classes.push(
      direction === "close"
        ? accordionStyles.fabImageVerticalClose
        : accordionStyles.fabImageVerticalOpen,
    );
    return classes.join(" ");
  }

  if (direction === "close") {
    classes.push(accordionStyles.fabImageClose);
  }

  return classes.join(" ");
}

export function PackagesPageCardFabImage({
  direction = "open",
  sizePx,
  orientation = "horizontal",
}: PackagesPageCardFabImageProps) {
  const dimension = sizePx ?? PACKAGES_PAGE_CARD_FIGMA.fabSizePx;

  return (
    <Image
      src={PACKAGES_PAGE_ASSETS.cardFab}
      alt=""
      width={dimension}
      height={dimension}
      unoptimized
      className={resolveFabImageClass(direction, orientation)}
    />
  );
}

type PackagesPageCardFabProps = {
  direction?: "open" | "close";
  ariaLabel: string;
  onClick: () => void;
  className?: string;
  imageSizePx?: number;
  orientation?: "horizontal" | "vertical" | "vertical-animated" | "horizontal-animated";
};

/** Figma Packages card FAB — node `395:1300` in row `395:1652`. */
export function PackagesPageCardFab({
  direction = "open",
  ariaLabel,
  onClick,
  className,
  imageSizePx,
  orientation = "horizontal",
}: PackagesPageCardFabProps) {
  return (
    <button
      type="button"
      className={className ?? cardStyles.fab}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <PackagesPageCardFabImage
        direction={direction}
        sizePx={imageSizePx}
        orientation={orientation}
      />
    </button>
  );
}
