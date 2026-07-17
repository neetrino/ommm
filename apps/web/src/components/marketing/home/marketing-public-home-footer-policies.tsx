import { Link } from "@/i18n/navigation";
import {
  resolveHomeFooterLegalLinks,
  type HomeFooterLegalLink,
} from "@/components/marketing/home/home-footer-section-tokens";

type FooterLegalKey = HomeFooterLegalLink["labelKey"];

export type MarketingPublicHomeFooterPoliciesProps = {
  locale: string;
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
  locale,
  title,
  navAria,
  labels,
  blockClassName,
  titleClassName,
  navClassName,
  linkClassName,
}: MarketingPublicHomeFooterPoliciesProps) {
  const legalLinks = resolveHomeFooterLegalLinks(locale);

  return (
    <div className={blockClassName}>
      <p className={titleClassName}>{title}</p>
      <nav className={navClassName} aria-label={navAria}>
        {legalLinks.map((item) => (
          <Link key={item.labelKey} href={item.href} className={linkClassName}>
            {labels[item.labelKey]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
