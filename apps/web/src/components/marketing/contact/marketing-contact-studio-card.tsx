import type { CSSProperties } from "react";
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

type ContactStudioRow = {
  key: string;
  iconSrc: string;
  label: string;
  value: string;
  href?: string;
};

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
} as CSSProperties;

/** Studio contact details card — phone, email, address, hours. */
export function MarketingContactStudioCard({
  heading,
  rows,
  replyCallout,
  socialIconLinks,
  socialLabel,
  socialAria,
}: MarketingContactStudioCardProps) {
  return (
    <article className={`${CONTACT_PAGE_CARD_SHELL_CLASS} ${styles.card}`} style={CARD_STYLE}>
      <h2 className={styles.heading}>{heading}</h2>
      <ul className={styles.list}>
        {rows.map((row, index) => (
          <li key={row.key} className={styles.row}>
            <span className={styles.iconWrap}>
              <Image
                src={row.iconSrc}
                alt=""
                width={CONTACT_PAGE_LAYOUT.iconSizePx}
                height={CONTACT_PAGE_LAYOUT.iconSizePx}
                className={styles.icon}
                unoptimized
                aria-hidden
                {...(index === 0 ? aboveFoldImageProps() : belowFoldImageProps())}
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
          </li>
        ))}
        {socialIconLinks.map((link) => (
          <li key={link.id} className={`${styles.row} ${styles.rowSocial}`}>
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
          </li>
        ))}
      </ul>
      <div className={styles.callout}>
        <ContactStarIcon />
        <p className={styles.calloutText}>{replyCallout}</p>
      </div>
    </article>
  );
}

export { CONTACT_PAGE_ASSETS };
