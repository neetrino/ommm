import { Link } from "@/i18n/navigation";
import { HOME_FOOTER_LEGAL_LINKS } from "@/components/marketing/home/home-footer-section-tokens";

type FooterLegalKey = (typeof HOME_FOOTER_LEGAL_LINKS)[number]["labelKey"];

export type MarketingPublicHomeFooterPoliciesProps = {
  title: string;
  navAria: string;
  labels: Record<FooterLegalKey, string>;
  blockClassName: string;
  titleClassName: string;
  navClassName: string;
  linkClassName: string;
};

/** Footer policies — title + stacked links, right-aligned. */
export function MarketingPublicHomeFooterPolicies({
  title,
  navAria,
  labels,
  blockClassName,
  titleClassName,
  navClassName,
  linkClassName,
}: MarketingPublicHomeFooterPoliciesProps) {
  return (
    <div className={blockClassName}>
      <p className={titleClassName}>{title}</p>
      <nav className={navClassName} aria-label={navAria}>
        {HOME_FOOTER_LEGAL_LINKS.map((item) => (
          <Link key={item.labelKey} href={item.href} className={linkClassName}>
            {labels[item.labelKey]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
