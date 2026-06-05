import Image from "next/image";
import accordionStyles from "@/components/marketing/packages/packages-page-accordion.module.css";
import { PACKAGES_PAGE_ASSETS } from "@/components/marketing/packages/packages-page-assets";
import cardStyles from "@/components/marketing/packages/packages-page-category-cards.module.css";
import { PACKAGES_PAGE_CARD_FIGMA } from "@/components/marketing/packages/packages-page-tokens";

type PackagesPageCardFabImageProps = {
  direction?: "open" | "close";
};

export function PackagesPageCardFabImage({ direction = "open" }: PackagesPageCardFabImageProps) {
  return (
    <Image
      src={PACKAGES_PAGE_ASSETS.cardFab}
      alt=""
      width={PACKAGES_PAGE_CARD_FIGMA.fabSizePx}
      height={PACKAGES_PAGE_CARD_FIGMA.fabSizePx}
      unoptimized
      className={`${accordionStyles.fabImage} ${
        direction === "close" ? accordionStyles.fabImageClose : ""
      }`}
    />
  );
}

type PackagesPageCardFabProps = {
  direction?: "open" | "close";
  ariaLabel: string;
  onClick: () => void;
  className?: string;
};

/** Figma Packages card FAB — node `395:1300` in row `395:1652`. */
export function PackagesPageCardFab({
  direction = "open",
  ariaLabel,
  onClick,
  className,
}: PackagesPageCardFabProps) {
  return (
    <button
      type="button"
      className={className ?? cardStyles.fab}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <PackagesPageCardFabImage direction={direction} />
    </button>
  );
}
