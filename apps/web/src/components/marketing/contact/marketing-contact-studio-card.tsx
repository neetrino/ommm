import type { CSSProperties } from "react";
import Image from "next/image";
import {
  CONTACT_PAGE_CARD_SHELL_CLASS,
  CONTACT_PAGE_LAYOUT,
  CONTACT_PAGE_SURFACE,
} from "@/components/marketing/contact/contact-page-tokens";
import { ContactSocialBrandIcon } from "@/components/marketing/contact/contact-social-brand-icon";
import type { MarketingContactGridTile } from "@/components/marketing/contact/marketing-contact-grid-tile";
import styles from "@/components/marketing/contact/marketing-contact-studio-card.module.css";
import { aboveFoldImageProps, belowFoldImageProps } from "@/lib/image-loading-props";

type MarketingContactStudioCardProps = {
  tiles: MarketingContactGridTile[];
};

function ContactStarIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.calloutIcon}
      aria-hidden
    >
      <path
        d="M8 1.5L9.4 5.8H14L10.3 8.4L11.7 12.7L8 10.1L4.3 12.7L5.7 8.4L2 5.8H6.6L8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const CARD_STYLE = {
  "--contact-grid-gap": `${CONTACT_PAGE_LAYOUT.gridGapPx}px`,
  "--contact-mobile-row-gap": `${CONTACT_PAGE_LAYOUT.mobileRowGapPx}px`,
  "--contact-tile-padding": `${CONTACT_PAGE_LAYOUT.tilePaddingPx}px`,
  "--contact-tile-padding-mobile": `${CONTACT_PAGE_LAYOUT.tilePaddingMobilePx}px`,
  "--contact-tile-row-gap": `${CONTACT_PAGE_LAYOUT.tileRowGapPx}px`,
  "--contact-tile-min-height": `${CONTACT_PAGE_LAYOUT.tileMinHeightPx}px`,
  "--contact-icon-size": `${CONTACT_PAGE_LAYOUT.iconSizePx}px`,
  "--contact-icon-bg": CONTACT_PAGE_SURFACE.iconBackground,
  "--contact-callout-tile-bg": CONTACT_PAGE_SURFACE.calloutTileBackground,
  "--contact-label-color": CONTACT_PAGE_SURFACE.labelColor,
  "--contact-value-color": CONTACT_PAGE_SURFACE.valueColor,
  "--contact-tile-hover-lift": `-${CONTACT_PAGE_LAYOUT.tileHoverLiftPx}px`,
  "--contact-tile-hover-duration": `${CONTACT_PAGE_LAYOUT.tileHoverDurationMs}ms`,
} as CSSProperties;

function ContactTileValue({
  tile,
  isCallout,
}: {
  tile: MarketingContactGridTile;
  isCallout: boolean;
}) {
  if (tile.href !== undefined) {
    return (
      <a
        href={tile.href}
        className={isCallout ? styles.calloutValue : styles.valueLink}
        {...(tile.href.startsWith("http")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {tile.value}
      </a>
    );
  }

  return (
    <p className={isCallout ? styles.calloutValue : styles.value}>{tile.value}</p>
  );
}

function ContactGridTileCard({
  tile,
  imagePriority,
}: {
  tile: MarketingContactGridTile;
  imagePriority: "above" | "below";
}) {
  const isCallout = tile.variant === "callout";

  return (
    <article
      className={`${CONTACT_PAGE_CARD_SHELL_CLASS} ${styles.tile}${isCallout ? ` ${styles.tileCallout}` : ""}`}
    >
      <span className={styles.iconWrap}>
        {isCallout ? (
          <ContactStarIcon />
        ) : tile.socialIcon !== undefined ? (
          <ContactSocialBrandIcon id={tile.socialIcon} />
        ) : tile.iconSrc !== undefined ? (
          <Image
            src={tile.iconSrc}
            alt=""
            width={CONTACT_PAGE_LAYOUT.iconSizePx}
            height={CONTACT_PAGE_LAYOUT.iconSizePx}
            className={styles.icon}
            unoptimized
            aria-hidden
            {...(imagePriority === "above" ? aboveFoldImageProps() : belowFoldImageProps())}
          />
        ) : null}
      </span>
      <div className={styles.body}>
        {tile.label !== undefined ? <span className={styles.label}>{tile.label}</span> : null}
        <ContactTileValue tile={tile} isCallout={isCallout} />
      </div>
    </article>
  );
}

/** Contact page — 3×2 glass tile grid (phone, email, Instagram / address, hours, reply). */
export function MarketingContactStudioCard({ tiles }: MarketingContactStudioCardProps) {
  return (
    <div className={styles.grid} style={CARD_STYLE}>
      {tiles.map((tile, index) => (
        <ContactGridTileCard
          key={tile.key}
          tile={tile}
          imagePriority={index < 3 ? "above" : "below"}
        />
      ))}
    </div>
  );
}
