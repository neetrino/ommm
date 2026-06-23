import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { CONTACT_PAGE_ASSETS } from "@/components/marketing/contact/contact-page-assets";
import {
  CONTACT_PAGE_CARD_SHELL_CLASS,
  CONTACT_PAGE_LAYOUT,
  CONTACT_PAGE_SURFACE,
} from "@/components/marketing/contact/contact-page-tokens";
import { ContactSocialBrandIcon } from "@/components/marketing/contact/contact-social-brand-icon";
import type { ContactSocialIconLink } from "@/components/marketing/contact/contact-page-social";
import styles from "@/components/marketing/contact/marketing-contact-studio-card.module.css";
import { aboveFoldImageProps, belowFoldImageProps } from "@/lib/image-loading-props";

type ContactStudioRowKey = "phone" | "address" | "email" | "hours";

const CONTACT_PRIMARY_ROW_KEYS: readonly ContactStudioRowKey[] = [
  "phone",
  "address",
  "email",
];

type ContactStudioRow = {
  key: ContactStudioRowKey;
  iconSrc: string;
  label: string;
  value: string;
  href?: string;
};

function isPrimaryContactRow(key: ContactStudioRowKey): boolean {
  return CONTACT_PRIMARY_ROW_KEYS.includes(key);
}

type MarketingContactStudioCardProps = {
  heading: string;
  rows: ContactStudioRow[];
  replyCallout: string;
  socialIconLinks: ContactSocialIconLink[];
  socialLabel: (network: ContactSocialIconLink["id"]) => string;
  socialAria: (network: string) => string;
};

function ContactStarIcon() {
  return (
    <svg
      width="16"
      height="16"
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
  "--contact-card-padding": `${CONTACT_PAGE_LAYOUT.cardPaddingPx}px`,
  "--contact-card-gap": `${CONTACT_PAGE_LAYOUT.cardGapPx}px`,
  "--contact-icon-size": `${CONTACT_PAGE_LAYOUT.iconSizePx}px`,
  "--contact-icon-bg": CONTACT_PAGE_SURFACE.iconBackground,
  "--contact-callout-radius": `${CONTACT_PAGE_LAYOUT.calloutRadiusPx}px`,
  "--contact-callout-bg": CONTACT_PAGE_SURFACE.calloutBackground,
  "--contact-heading-color": CONTACT_PAGE_SURFACE.headingColor,
  "--contact-label-color": CONTACT_PAGE_SURFACE.labelColor,
  "--contact-value-color": CONTACT_PAGE_SURFACE.valueColor,
  "--contact-mobile-row-gap": `${CONTACT_PAGE_LAYOUT.mobileRowGapPx}px`,
} as CSSProperties;

function ContactStudioRowItem({
  row,
  imagePriority,
  as = "li",
}: {
  row: ContactStudioRow;
  imagePriority: "above" | "below";
  as?: "li" | "div";
}) {
  const Tag = as;
  return (
    <Tag className={styles.row}>
      <span className={styles.iconWrap}>
        <Image
          src={row.iconSrc}
          alt=""
          width={CONTACT_PAGE_LAYOUT.iconSizePx}
          height={CONTACT_PAGE_LAYOUT.iconSizePx}
          className={styles.icon}
          unoptimized
          aria-hidden
          {...(imagePriority === "above" ? aboveFoldImageProps() : belowFoldImageProps())}
        />
      </span>
      <div className={styles.rowBody}>
        <span className={styles.label}>{row.label}</span>
        {row.href !== undefined ? (
          <a
            href={row.href}
            className={styles.valueLink}
            {...(row.href.startsWith("http")
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {row.value}
          </a>
        ) : (
          <span className={styles.value}>{row.value}</span>
        )}
      </div>
    </Tag>
  );
}

function ReplyCallout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.callout}>
      <ContactStarIcon />
      <p className={styles.calloutText}>{children}</p>
    </div>
  );
}

/** Studio contact details card — phone, email, address, hours. */
export function MarketingContactStudioCard({
  heading,
  rows,
  replyCallout,
  socialIconLinks,
  socialLabel,
  socialAria,
}: MarketingContactStudioCardProps) {
  const primaryRows = rows.filter((row) => isPrimaryContactRow(row.key));
  const secondaryRows = rows.filter((row) => !isPrimaryContactRow(row.key));

  return (
    <article className={`${CONTACT_PAGE_CARD_SHELL_CLASS} ${styles.card}`} style={CARD_STYLE}>
      <h2 className={styles.heading}>{heading}</h2>
      <div className={styles.bodyGrid}>
        <ul className={styles.primaryList}>
          {primaryRows.map((row, index) => (
            <ContactStudioRowItem
              key={row.key}
              row={row}
              imagePriority={index === 0 ? "above" : "below"}
            />
          ))}
        </ul>
        <div className={styles.secondaryColumn}>
          {secondaryRows.map((row) => (
            <ContactStudioRowItem key={row.key} row={row} imagePriority="below" as="div" />
          ))}
          {socialIconLinks.map((link) => (
            <div key={link.id} className={styles.row}>
              <span className={styles.iconWrap}>
                <ContactSocialBrandIcon id={link.id} />
              </span>
              <div className={styles.rowBody}>
                <span className={styles.label}>{socialLabel(link.id)}</span>
                <a
                  href={link.href}
                  className={styles.valueLink}
                  aria-label={socialAria(link.id)}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {socialLabel(link.id)}
                </a>
              </div>
            </div>
          ))}
          <ReplyCallout>{replyCallout}</ReplyCallout>
        </div>
      </div>
    </article>
  );
}

export { CONTACT_PAGE_ASSETS };
