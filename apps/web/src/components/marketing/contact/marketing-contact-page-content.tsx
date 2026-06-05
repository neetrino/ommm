import { getTranslations } from "next-intl/server";
import { ContactMessageFormDeferred } from "@/components/marketing/marketing-deferred-sections";
import { MarketingLazyMapEmbed } from "@/components/marketing/contact/marketing-lazy-map-embed";
import { CONTACT_PAGE_ASSETS } from "@/components/marketing/contact/contact-page-assets";
import { MarketingContactAnimatedSections } from "@/components/marketing/contact/marketing-contact-animated-sections";
import { MarketingContactStudioCard } from "@/components/marketing/contact/marketing-contact-studio-card";
import { fetchPublicJsonCached } from "@/lib/cached-public-api";
import { isMarketingMemberUser } from "@/lib/marketing-audience";
import { userDisplayName } from "@/lib/user-display-name";
import { getOptionalLayoutAuthUser } from "@/server/require-role-layout";

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

function parseSocialLinks(raw: string | null): { label: string; url: string }[] {
  if (raw === null || raw.trim() === "") {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter(
        (row): row is { label: string; url: string } =>
          typeof row === "object" &&
          row !== null &&
          "label" in row &&
          "url" in row &&
          typeof (row as { label: unknown }).label === "string" &&
          typeof (row as { url: unknown }).url === "string",
      )
      .map((row) => ({ label: row.label, url: row.url }));
  } catch {
    return [];
  }
}

function pickStudioValue(
  value: string | null | undefined,
  fallback: string,
): string {
  const trimmed = value?.trim();
  return trimmed !== undefined && trimmed.length > 0 ? trimmed : fallback;
}

type MarketingContactPageContentProps = {
  locale: string;
};

export async function MarketingContactPageContent({
  locale,
}: MarketingContactPageContentProps) {
  const t = await getTranslations({ locale, namespace: "marketingPages.contact" });
  const [studioRes, authUser] = await Promise.all([
    fetchPublicJsonCached<StudioPublic>("/studio"),
    getOptionalLayoutAuthUser(),
  ]);
  const studio = studioRes.ok ? studioRes.data : null;
  const social = studio !== null ? parseSocialLinks(studio.socialLinksJson) : [];

  const phone = pickStudioValue(studio?.contactPhone, t("fallbackPhone"));
  const email = pickStudioValue(studio?.contactEmail, t("fallbackEmail"));
  const address = pickStudioValue(studio?.address, t("fallbackAddress"));
  const hours = pickStudioValue(studio?.workingHours, t("fallbackHours"));

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
      value: address,
    },
    {
      key: "hours",
      iconSrc: CONTACT_PAGE_ASSETS.iconHours,
      label: t("hours"),
      value: hours,
    },
  ];

  const mapEmbed =
    studio !== null &&
    studio.mapEmbedUrl !== null &&
    studio.mapEmbedUrl.trim() !== "" ? (
      <MarketingLazyMapEmbed heading={t("mapHeading")} embedHtml={studio.mapEmbedUrl} />
    ) : undefined;

  const memberPrefill =
    authUser !== null && isMarketingMemberUser(authUser)
      ? {
          name: userDisplayName(authUser.name, authUser.lastName, authUser.email),
          email: authUser.email,
          phone: authUser.phone ?? "",
        }
      : undefined;

  return (
    <MarketingContactAnimatedSections
      studioCard={
        <MarketingContactStudioCard
          heading={t("studioHeading")}
          rows={studioRows}
          replyCallout={t("replyCallout")}
          socialLinks={social}
        />
      }
      messageForm={<ContactMessageFormDeferred prefill={memberPrefill} />}
      mapEmbed={mapEmbed}
    />
  );
}
