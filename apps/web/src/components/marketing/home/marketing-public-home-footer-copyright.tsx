import { HOME_FOOTER_COPYRIGHT_COMPANY_HREF } from "@/components/marketing/home/home-footer-section-tokens";
import styles from "@/components/marketing/home/marketing-public-home-footer.module.css";

export type MarketingPublicHomeFooterCopyrightProps = {
  className: string;
  prefix: string;
  suffix: string;
  separator: string;
  createdByLead: string;
  createdByName: string;
  /** Desktop — one line. Mobile — notice, then the credit underneath. */
  layout?: "single-line" | "two-line";
};

/** Footer copyright notice with a bold studio credit. */
export function MarketingPublicHomeFooterCopyright({
  className,
  prefix,
  suffix,
  separator,
  createdByLead,
  createdByName,
  layout = "single-line",
}: MarketingPublicHomeFooterCopyrightProps) {
  const credit = (
    <span className={styles.copyrightCredit}>
      {createdByLead}
      <a
        href={HOME_FOOTER_COPYRIGHT_COMPANY_HREF}
        className={styles.copyrightCompany}
        target="_blank"
        rel="noopener noreferrer"
      >
        {createdByName}
      </a>
    </span>
  );

  if (layout === "two-line") {
    return (
      <p className={className}>
        <span className={styles.copyrightNotice}>
          {prefix}
          {suffix}
        </span>
        {credit}
      </p>
    );
  }

  return (
    <p className={className}>
      {prefix}
      {suffix}
      {separator}
      {credit}
    </p>
  );
}
