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
import { listStudioSocialLinks } from "@/lib/studio-social-links";

type StudioPublic = {
  studioName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  whatsappUrl: string | null;
  address: string | null;
  mapEmbedUrl: string | null;
  workingHours: string | null;
  socialLinksJson: string | null;
};

type MarketingContactLocaleProps = {
  locale: string;
};

function pickStudioValue(
  value: string | null | undefined,
  fallback: string,
): string {
  const trimmed = value?.trim();
  return trimmed !== undefined && trimmed.length > 0 ? trimmed : fallback;
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
  const studioRes = await fetchPublicJsonCached<StudioPublic>("/studio");
  const studio = studioRes.ok ? studioRes.data : null;
  const social = studio !== null ? listStudioSocialLinks(studio.socialLinksJson) : [];

  const phone = pickStudioValue(studio?.contactPhone, t("fallbackPhone"));
  const email = pickStudioValue(studio?.contactEmail, t("fallbackEmail"));

  const studioRows = [
    {
      key: "phone",
      iconSrc: CONTACT_PAGE_ASSETS.iconPhone,
      label: t("phone"),
      value: phone,
      href: `tel:${phone.replace(/\s+/g, "")}`,
    },
    {
      key: "email",
      iconSrc: CONTACT_PAGE_ASSETS.iconMail,
      label: t("email"),
      value: email,
      href: `mailto:${email}`,
    },
    {
      key: "address",
      iconSrc: CONTACT_PAGE_ASSETS.iconLocation,
      label: t("address"),
      value: pickStudioValue(studio?.address, t("fallbackAddress")),
    },
    {
      key: "hours",
      iconSrc: CONTACT_PAGE_ASSETS.iconHours,
      label: t("hours"),
      value: pickStudioValue(studio?.workingHours, t("fallbackHours")),
    },
  ];

  return (
    <MarketingContactStudioCard
      heading={t("studioHeading")}
      rows={studioRows}
      replyCallout={t("replyCallout")}
      socialLinks={social}
    />
  );
}

async function MarketingContactMapEmbedSection({ locale }: MarketingContactLocaleProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.contact" });
  const studioRes = await fetchPublicJsonCached<StudioPublic>("/studio");
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
