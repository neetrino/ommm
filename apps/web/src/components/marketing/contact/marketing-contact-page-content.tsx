import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ContactMessageForm } from "@/components/marketing/contact-message-form";
import { CONTACT_PAGE_ASSETS } from "@/components/marketing/contact/contact-page-assets";
import { CONTACT_PAGE_CARD_SHELL_CLASS } from "@/components/marketing/contact/contact-page-tokens";
import { MarketingContactAnimatedSections } from "@/components/marketing/contact/marketing-contact-animated-sections";
import { MarketingContactMapSection } from "@/components/marketing/contact/marketing-contact-map-section";
import { MarketingContactStudioCard } from "@/components/marketing/contact/marketing-contact-studio-card";
import { MarketingScrollReveal } from "@/components/marketing/marketing-scroll-reveal";
import { fetchPublicJsonCached } from "@/lib/cached-public-api";
import { formatPhoneDisplay, formatPhoneTelHref } from "@/lib/phone";
import { resolveContactSocialIconLinks } from "@/components/marketing/contact/contact-page-social";
import {
  listStudioSocialLinks,
  type StudioPublicSettings,
} from "@/lib/studio-social-links";

type MarketingContactLocaleProps = {
  locale: string;
};

type MarketingContactPageLayoutProps = MarketingContactLocaleProps & {
  studioFetch?: ReturnType<typeof fetchPublicJsonCached<StudioPublicSettings>>;
};

type ContactStudioRow = {
  key: string;
  iconSrc: string;
  label: string;
  value: string;
  href?: string;
};

function MarketingContactStudioCardPlaceholder() {
  return (
    <div
      aria-hidden
      className={`${CONTACT_PAGE_CARD_SHELL_CLASS} min-h-[clamp(22rem,55vw,28rem)] opacity-60`}
    />
  );
}

function buildContactStudioRows(
  studio: StudioPublicSettings | null,
  labels: {
    phone: string;
    email: string;
    address: string;
    hours: string;
  },
): ContactStudioRow[] {
  const rows: ContactStudioRow[] = [];

  const phone = studio?.contactPhone?.trim();
  if (phone !== undefined && phone.length > 0) {
    const displayPhone = formatPhoneDisplay(phone);
    rows.push({
      key: "phone",
      iconSrc: CONTACT_PAGE_ASSETS.iconPhone,
      label: labels.phone,
      value: displayPhone,
      href: `tel:${formatPhoneTelHref(phone)}`,
    });
  }

  const email = studio?.contactEmail?.trim();
  if (email !== undefined && email.length > 0) {
    rows.push({
      key: "email",
      iconSrc: CONTACT_PAGE_ASSETS.iconMail,
      label: labels.email,
      value: email,
      href: `mailto:${email}`,
    });
  }

  const address = studio?.address?.trim();
  if (address !== undefined && address.length > 0) {
    rows.push({
      key: "address",
      iconSrc: CONTACT_PAGE_ASSETS.iconLocation,
      label: labels.address,
      value: address,
    });
  }

  const hours = studio?.workingHours?.trim();
  if (hours !== undefined && hours.length > 0) {
    rows.push({
      key: "hours",
      iconSrc: CONTACT_PAGE_ASSETS.iconHours,
      label: labels.hours,
      value: hours,
    });
  }

  return rows;
}

/** Contact cards — form paints immediately; studio + map stream in parallel. */
export function MarketingContactPageLayout({
  locale,
  studioFetch,
}: MarketingContactPageLayoutProps) {
  return (
    <>
      <MarketingContactAnimatedSections
        studioCard={
          <Suspense fallback={<MarketingContactStudioCardPlaceholder />}>
            <MarketingContactStudioSection locale={locale} studioFetch={studioFetch} />
          </Suspense>
        }
        messageForm={<ContactMessageForm />}
      />
      <Suspense fallback={null}>
        <MarketingContactMapEmbedSection locale={locale} studioFetch={studioFetch} />
      </Suspense>
    </>
  );
}

async function MarketingContactStudioSection({
  locale,
  studioFetch,
}: MarketingContactPageLayoutProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.contact" });
  const studioRes = await (studioFetch ?? fetchPublicJsonCached<StudioPublicSettings>("/studio"));
  const studio = studioRes.ok ? studioRes.data : null;
  const social = studio !== null ? listStudioSocialLinks(studio.socialLinksJson) : [];
  const socialIconLinks = resolveContactSocialIconLinks(social, studio?.whatsappUrl);
  const studioRows = buildContactStudioRows(studio, {
    phone: t("phone"),
    email: t("email"),
    address: t("address"),
    hours: t("hours"),
  });

  return (
    <MarketingContactStudioCard
      heading={t("studioHeading")}
      rows={studioRows}
      replyCallout={t("replyCallout")}
      socialIconLinks={socialIconLinks}
      socialLabel={(network) => t(network)}
      socialAria={(network) => t("socialAria", { network })}
    />
  );
}

async function MarketingContactMapEmbedSection({
  locale,
  studioFetch,
}: MarketingContactPageLayoutProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.contact" });
  const studioRes = await (studioFetch ?? fetchPublicJsonCached<StudioPublicSettings>("/studio"));
  const embedHtml = studioRes.ok ? studioRes.data.mapEmbedUrl?.trim() : undefined;

  if (embedHtml === undefined || embedHtml.length === 0) {
    return null;
  }

  return (
    <MarketingScrollReveal index={2} gridColumns={1}>
      <MarketingContactMapSection heading={t("mapHeading")} embedHtml={embedHtml} />
    </MarketingScrollReveal>
  );
}
