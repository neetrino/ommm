import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";
import { belowFoldImageProps } from "@/lib/image-loading-props";

type FooterLink = {
  href: string;
  label: string;
};

type MarketingPublicHomeFooterProps = {
  locale: string;
};

/**
 * Figma **Footer** `79:433` + illustration `181:1096` (home route only; see `MarketingFooterGate`).
 */
export async function MarketingPublicHomeFooter({ locale }: MarketingPublicHomeFooterProps) {
  const t = await getTranslations({ locale, namespace: "marketingPublic.home" });
  const links = t.raw("footerLinks") as FooterLink[];

  return (
    <footer className="w-full overflow-x-hidden" style={{ backgroundColor: HOME_PAGE_SURFACE.pageBackground }}>
      <div
        className="mx-auto w-full max-w-[1440px] rounded-t-[64px] px-8 py-12 sm:px-12 md:px-16"
        style={{ backgroundColor: HOME_PAGE_SURFACE.footerSurface }}
      >
        <div className="grid grid-cols-1 items-center gap-8 text-center md:grid-cols-[1fr_auto_1fr] md:gap-10 md:text-left">
          <p
            className="text-xl font-semibold leading-7 md:justify-self-start"
            style={{ color: HOME_PAGE_SURFACE.footerWordmark }}
          >
            {t("footerWordmark")}
          </p>
          <nav
            className="flex flex-wrap items-center justify-center gap-6 md:justify-self-center md:gap-10"
            aria-label="Legal and journal"
          >
            {links.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="text-xs font-normal uppercase leading-4 tracking-[2.4px] transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64748b] focus-visible:ring-offset-2"
                style={{ color: HOME_PAGE_SURFACE.footerLinks }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p
            className="text-xs font-normal uppercase leading-4 tracking-[2.4px] md:justify-self-end md:text-right"
            style={{ color: HOME_PAGE_SURFACE.footerLinks }}
          >
            {t("footerCopyright")}
          </p>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1440px] flex-col items-center px-4 pb-10 pt-4 sm:px-8 md:px-16">
        <div className="relative w-full max-w-[662px]" style={{ aspectRatio: "662 / 523" }}>
          <Image
            src={HOME_SECTION_ASSETS.footerIllustration}
            alt={t("footerIllustrationAlt")}
            fill
            sizes="(max-width: 768px) 100vw, 662px"
            className="object-contain"
            {...belowFoldImageProps()}
          />
        </div>
      </div>
    </footer>
  );
}
