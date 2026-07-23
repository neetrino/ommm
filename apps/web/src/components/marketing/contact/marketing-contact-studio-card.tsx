import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import {
  CONTACT_PAGE_CARD_SHELL_CLASS,
  CONTACT_PAGE_CARD_DESKTOP_SHADOW,
  CONTACT_PAGE_LAYOUT,
  CONTACT_PAGE_SURFACE,
} from "@/components/marketing/contact/contact-page-tokens";
import { ContactSocialBrandIcon } from "@/components/marketing/contact/contact-social-brand-icon";
import type { MarketingContactGridTile } from "@/components/marketing/contact/marketing-contact-grid-tile";
import styles from "@/components/marketing/contact/marketing-contact-studio-card.module.css";
import { aboveFoldImageProps, belowFoldImageProps } from "@/lib/image-loading-props";
import { renderAtSignText } from "@/lib/render-at-sign-text";

type MarketingContactStudioCardProps = {
  tiles: MarketingContactGridTile[];
};

const CARD_STYLE = {
  "--contact-grid-gap": `${CONTACT_PAGE_LAYOUT.gridGapPx}px`,
  "--contact-mobile-row-gap": `${CONTACT_PAGE_LAYOUT.mobileRowGapPx}px`,
  "--contact-tile-padding": `${CONTACT_PAGE_LAYOUT.tilePaddingPx}px`,
  "--contact-tile-padding-mobile": `${CONTACT_PAGE_LAYOUT.tilePaddingMobilePx}px`,
  "--contact-tile-row-gap": `${CONTACT_PAGE_LAYOUT.tileRowGapPx}px`,
  "--contact-tile-row-gap-mobile": `${CONTACT_PAGE_LAYOUT.tileRowGapMobilePx}px`,
  "--contact-tile-min-height": `${CONTACT_PAGE_LAYOUT.tileMinHeightPx}px`,
  "--contact-tile-min-height-mobile":
    CONTACT_PAGE_LAYOUT.tileMinHeightMobilePx === 0
      ? "auto"
      : `${CONTACT_PAGE_LAYOUT.tileMinHeightMobilePx}px`,
  "--contact-icon-size-desktop": `${CONTACT_PAGE_LAYOUT.iconSizePx}px`,
  "--contact-icon-size-mobile": `${CONTACT_PAGE_LAYOUT.iconSizeMobilePx}px`,
  "--contact-icon-size": `${CONTACT_PAGE_LAYOUT.iconSizeMobilePx}px`,
  "--contact-icon-bg": CONTACT_PAGE_SURFACE.iconBackground,
  "--contact-label-color": CONTACT_PAGE_SURFACE.labelColor,
  "--contact-value-color": CONTACT_PAGE_SURFACE.valueColor,
  "--contact-tile-hover-lift": `-${CONTACT_PAGE_LAYOUT.tileHoverLiftPx}px`,
  "--contact-tile-hover-duration": `${CONTACT_PAGE_LAYOUT.tileHoverDurationMs}ms`,
  "--contact-card-desktop-shadow": CONTACT_PAGE_CARD_DESKTOP_SHADOW,
  "--contact-card-shadow-bleed": `${CONTACT_PAGE_LAYOUT.cardShadowBleedPx}px`,
} as CSSProperties;

function contactValueClassName(tile: MarketingContactGridTile): string | undefined {
  if (tile.key === "phone") {
    return styles.valuePhone;
  }

  if (tile.key === "email" || tile.key === "instagram") {
    return styles.valueInline;
  }

  return undefined;
}

function contactTileValueContent(tile: MarketingContactGridTile): ReactNode {
  if (tile.key === "email" || tile.key === "instagram") {
    return renderAtSignText(tile.value, styles.atSign);
  }

  return tile.value;
}

function ContactTileValue({ tile }: { tile: MarketingContactGridTile }) {
  const valueClassName = contactValueClassName(tile);
  const content = contactTileValueContent(tile);

  if (tile.href !== undefined) {
    return (
      <a
        href={tile.href}
        className={
          valueClassName !== undefined
            ? `${styles.valueLink} ${valueClassName}`
            : styles.valueLink
        }
        {...(tile.href.startsWith("http")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {content}
      </a>
    );
  }

  return (
    <p className={valueClassName !== undefined ? `${styles.value} ${valueClassName}` : styles.value}>
      {content}
    </p>
  );
}

function ContactGridTileCard({
  tile,
  imagePriority,
}: {
  tile: MarketingContactGridTile;
  imagePriority: "above" | "below";
}) {
  return (
    <article
      className={`${CONTACT_PAGE_CARD_SHELL_CLASS} ${styles.tile}`}
      data-contact-tile-key={tile.key}
    >
      <span className={styles.iconWrap}>
        {tile.socialIcon !== undefined ? (
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
        <ContactTileValue tile={tile} />
      </div>
    </article>
  );
}

/** Contact page — glass tile grid (address, email, Instagram, hours). */
export function MarketingContactStudioCard({ tiles }: MarketingContactStudioCardProps) {
  const desktopParity = tiles.length % 2 === 0 ? "even" : "odd";

  return (
    <div
      className={styles.grid}
      style={CARD_STYLE}
      data-contact-tile-count={tiles.length}
      data-contact-desktop-parity={desktopParity}
    >
      {tiles.map((tile, index) => (
        <ContactGridTileCard
          key={tile.key}
          tile={tile}
          imagePriority={index < 2 ? "above" : "below"}
        />
      ))}
    </div>
  );
}
