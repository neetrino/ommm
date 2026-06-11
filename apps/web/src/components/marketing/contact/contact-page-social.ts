import { CONTACT_PAGE_ASSETS } from "@/components/marketing/contact/contact-page-assets";
import type { StudioSocialLink } from "@/lib/studio-social-links";

export type ContactSocialPlatform = "instagram" | "facebook";

export type ContactSocialIconLink = {
  id: ContactSocialPlatform;
  href: string;
  iconSrc: string;
  width: number;
  height: number;
};

const CONTACT_SOCIAL_ICON_DEFS = [
  {
    id: "instagram",
    iconSrc: CONTACT_PAGE_ASSETS.iconInstagram,
    width: 23,
    height: 23,
    fallbackHref: "https://instagram.com",
  },
  {
    id: "facebook",
    iconSrc: CONTACT_PAGE_ASSETS.iconFacebook,
    width: 13,
    height: 23,
    fallbackHref: "https://facebook.com",
  },
] as const satisfies readonly {
  id: ContactSocialPlatform;
  iconSrc: string;
  width: number;
  height: number;
  fallbackHref: string;
}[];

/** Instagram + Facebook icons — studio URLs override footer-style fallbacks. */
export function resolveContactSocialIconLinks(
  studioLinks: StudioSocialLink[],
): ContactSocialIconLink[] {
  return CONTACT_SOCIAL_ICON_DEFS.map((definition) => {
    const match = studioLinks.find(
      (link) => link.label.toLowerCase() === definition.id,
    );

    return {
      id: definition.id,
      href: match?.url ?? definition.fallbackHref,
      iconSrc: definition.iconSrc,
      width: definition.width,
      height: definition.height,
    };
  });
}
