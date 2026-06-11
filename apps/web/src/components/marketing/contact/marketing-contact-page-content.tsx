import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ContactMessageForm } from "@/components/marketing/contact-message-form";
import { CONTACT_PAGE_ASSETS } from "@/components/marketing/contact/contact-page-assets";
import { MarketingContactAnimatedSections } from "@/components/marketing/contact/marketing-contact-animated-sections";
import { MarketingContactMapSection } from "@/components/marketing/contact/marketing-contact-map-section";
import { MarketingContactStudioCard } from "@/components/marketing/contact/marketing-contact-studio-card";
import { MarketingPageContentSkeleton } from "@/components/marketing/marketing-page-content-skeleton";
import { MarketingScrollReveal } from "@/components/marketing/marketing-scroll-reveal";
import { fetchPublicJsonCached } from "@/lib/cached-public-api";
import { resolveContactSocialIconLinks } from "@/components/marketing/contact/contact-page-social";
import {
  listStudioSocialLinks,
  type StudioPublicSettings,
} from "@/lib/studio-social-links";

type MarketingContactLocaleProps = {
  locale: string;
};

type ContactStudioRow = {
  key: string;
  iconSrc: string;
  label: string;
  value: string;
  href?: string;
};

const STUDIO_PUBLIC_CACHE_OPTIONS = { cacheMode: "no-store" as const };

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
    rows.push({
      key: "phone",
      iconSrc: CONTACT_PAGE_ASSETS.iconPhone,
      label: labels.phone,
      value: phone,
      href: `tel:${phone.replace(/\s+/g, "")}`,
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
export function MarketingContactPageLayout({ locale }: MarketingContactLocaleProps) {
  return (
    <>
      <MarketingContactAnimatedSections
        studioCard={
          <Suspense fallback={<MarketingPageContentSkeleton cards={1} />}>
            <MarketingContactStudioSection locale={locale} />
          </Suspense>
        }
        messageForm={<ContactMessageForm />}
      />
      <Suspense fallback={null}>
        <MarketingContactMapEmbedSection locale={locale} />
      </Suspense>
    </>
  );
}

async function MarketingContactStudioSection({ locale }: MarketingContactLocaleProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.contact" });
  const studioRes = await fetchPublicJsonCached<StudioPublicSettings>(
    "/studio",
    STUDIO_PUBLIC_CACHE_OPTIONS,
  );
  const studio = studioRes.ok ? studioRes.data : null;
  const social = studio !== null ? listStudioSocialLinks(studio.socialLinksJson) : [];
  const socialIconLinks = resolveContactSocialIconLinks(social);
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

async function MarketingContactMapEmbedSection({ locale }: MarketingContactLocaleProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.contact" });
  const studioRes = await fetchPublicJsonCached<StudioPublicSettings>(
    "/studio",
    STUDIO_PUBLIC_CACHE_OPTIONS,
  );
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
