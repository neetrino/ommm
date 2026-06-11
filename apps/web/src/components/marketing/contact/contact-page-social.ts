import type { StudioSocialLink } from "@/lib/studio-social-links";

export type ContactSocialPlatform = "instagram" | "facebook" | "whatsapp";

export type ContactSocialIconLink = {
  id: ContactSocialPlatform;
  href: string;
};

const CONTACT_SOCIAL_PLATFORM_ORDER: readonly ContactSocialPlatform[] = [
  "instagram",
  "facebook",
  "whatsapp",
];

function resolveSocialHref(
  platform: ContactSocialPlatform,
  studioLinks: StudioSocialLink[],
  whatsappUrl: string | null | undefined,
): string | undefined {
  if (platform === "whatsapp") {
    const href = whatsappUrl?.trim();
    return href !== undefined && href.length > 0 ? href : undefined;
  }

  const match = studioLinks.find((link) => link.label.toLowerCase() === platform);
  const href = match?.url.trim();
  return href !== undefined && href.length > 0 ? href : undefined;
}

/** Social links for the contact page — only platforms with configured URLs are returned. */
export function resolveContactSocialIconLinks(
  studioLinks: StudioSocialLink[],
  whatsappUrl?: string | null,
): ContactSocialIconLink[] {
  return CONTACT_SOCIAL_PLATFORM_ORDER.flatMap((platform) => {
    const href = resolveSocialHref(platform, studioLinks, whatsappUrl);
    if (href === undefined) {
      return [];
    }

    return [{ id: platform, href }];
  });
}
