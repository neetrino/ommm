import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { CONTACT_PAGE_ASSETS } from "@/components/marketing/contact/contact-page-assets";
import { CONTACT_PAGE_CARD_SHELL_CLASS } from "@/components/marketing/contact/contact-page-tokens";
import { MarketingContactAnimatedSections } from "@/components/marketing/contact/marketing-contact-animated-sections";
import { MarketingContactMapSection } from "@/components/marketing/contact/marketing-contact-map-section";
import { resolveContactMapEmbedHtml } from "@/components/marketing/contact/contact-page-map";
import {
  formatInstagramHandle,
  type MarketingContactGridTile,
} from "@/components/marketing/contact/marketing-contact-grid-tile";
import { MarketingContactStudioCard } from "@/components/marketing/contact/marketing-contact-studio-card";
import styles from "@/components/marketing/contact/marketing-contact-page-content.module.css";
import { MarketingScrollReveal } from "@/components/marketing/marketing-scroll-reveal";
import { fetchPublicStudioCached } from "@/lib/fetch-public-studio";
import { resolveContactSocialIconLinks } from "@/components/marketing/contact/contact-page-social";
import { HOME_FOOTER_ADDRESS_HREF } from "@/components/marketing/home/home-footer-section-tokens";
import {
  listStudioSocialLinks,
  type StudioPublicSettings,
} from "@/lib/studio-social-links";

type MarketingContactLocaleProps = {
  locale: string;
};

type MarketingContactPageLayoutProps = MarketingContactLocaleProps & {
  studioFetch?: ReturnType<typeof fetchPublicStudioCached>;
};

type ContactPublicDefaults = {
  email: string;
  address: string;
  addressHref: string;
  hours?: string;
};

function MarketingContactStudioCardPlaceholder() {
  return (
    <div
      aria-hidden
      className="grid min-h-[clamp(16rem,40vw,22rem)] grid-cols-1 gap-4 opacity-60 min-[744px]:grid-cols-2"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className={`${CONTACT_PAGE_CARD_SHELL_CLASS} min-h-[7.5rem]`}
        />
      ))}
    </div>
  );
}

function buildContactGridTiles(
  studio: StudioPublicSettings | null,
  labels: {
    email: string;
    address: string;
    hours: string;
    instagram: string;
  },
  publicContact: ContactPublicDefaults,
  instagramHref?: string,
): MarketingContactGridTile[] {
  const tiles: MarketingContactGridTile[] = [];

  const address = publicContact.address.trim();
  if (address.length > 0) {
    tiles.push({
      key: "address",
      label: labels.address,
      value: address,
      href: publicContact.addressHref,
      iconSrc: CONTACT_PAGE_ASSETS.iconLocation,
    });
  }

  const email = publicContact.email.trim();
  if (email.length > 0) {
    tiles.push({
      key: "email",
      label: labels.email,
      value: email,
      href: `mailto:${email}`,
      iconSrc: CONTACT_PAGE_ASSETS.iconMail,
    });
  }

  if (instagramHref !== undefined && instagramHref.length > 0) {
    tiles.push({
      key: "instagram",
      label: labels.instagram,
      value: formatInstagramHandle(instagramHref),
      href: instagramHref,
      socialIcon: "instagram",
    });
  }

  const hours = publicContact.hours?.trim() || studio?.workingHours?.trim();
  if (hours !== undefined && hours.length > 0) {
    tiles.push({
      key: "hours",
      label: labels.hours,
      value: hours,
      iconSrc: CONTACT_PAGE_ASSETS.iconHours,
    });
  }

  return tiles;
}

/** Contact cards — studio + map stream in parallel. */
export function MarketingContactPageLayout({
  locale,
  studioFetch,
}: MarketingContactPageLayoutProps) {
  return (
    <div className={styles.pageContent}>
      <MarketingContactAnimatedSections
        studioCard={
          <Suspense fallback={<MarketingContactStudioCardPlaceholder />}>
            <MarketingContactStudioSection locale={locale} studioFetch={studioFetch} />
          </Suspense>
        }
      />
      <Suspense fallback={null}>
        <MarketingContactMapEmbedSection studioFetch={studioFetch} />
      </Suspense>
    </div>
  );
}

async function MarketingContactStudioSection({
  locale,
  studioFetch,
}: MarketingContactPageLayoutProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.contact" });
  const tHome = await getTranslations({ locale, namespace: "marketingPublic.home" });
  const studioRes = await (studioFetch ?? fetchPublicStudioCached());
  const studio = studioRes.ok ? studioRes.data : null;
  const social = studio !== null ? listStudioSocialLinks(studio.socialLinksJson) : [];
  const socialIconLinks = resolveContactSocialIconLinks(social, studio?.whatsappUrl);
  const instagramLink = socialIconLinks.find((link) => link.id === "instagram");
  const tiles = buildContactGridTiles(
    studio,
    {
      email: t("email"),
      address: t("address"),
      hours: t("hours"),
      instagram: t("instagram"),
    },
    {
      email: tHome("footerEmail"),
      address: tHome("footerAddress"),
      addressHref: HOME_FOOTER_ADDRESS_HREF,
      hours: t("fallbackHours"),
    },
    instagramLink?.href,
  );

  return <MarketingContactStudioCard tiles={tiles} />;
}

async function MarketingContactMapEmbedSection({
  studioFetch,
}: Pick<MarketingContactPageLayoutProps, "studioFetch">) {
  const studioRes = await (studioFetch ?? fetchPublicStudioCached());
  const studioMapEmbedUrl = studioRes.ok ? studioRes.data.mapEmbedUrl : null;
  const embedHtml = resolveContactMapEmbedHtml(studioMapEmbedUrl);

  return (
    <MarketingScrollReveal index={1} gridColumns={1}>
      <MarketingContactMapSection embedHtml={embedHtml} />
    </MarketingScrollReveal>
  );
}
