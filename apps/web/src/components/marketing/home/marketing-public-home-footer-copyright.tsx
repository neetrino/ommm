import { HOME_FOOTER_COPYRIGHT_COMPANY_HREF } from "@/components/marketing/home/home-footer-section-tokens";
import styles from "@/components/marketing/home/marketing-public-home-footer.module.css";

export type MarketingPublicHomeFooterCopyrightProps = {
  className: string;
  prefix: string;
  companyPart1: string;
  companyPart2: string;
  suffix: string;
};

/** Figma footer — single-line copyright with linked company name. */
export function MarketingPublicHomeFooterCopyright({
  className,
  prefix,
  companyPart1,
  companyPart2,
  suffix,
}: MarketingPublicHomeFooterCopyrightProps) {
  return (
    <p className={className}>
      {prefix}
      <a
        href={HOME_FOOTER_COPYRIGHT_COMPANY_HREF}
        className={styles.copyrightCompany}
        target="_blank"
        rel="noopener noreferrer"
      >
        {companyPart1} {companyPart2}
      </a>
      {suffix}
    </p>
  );
}
