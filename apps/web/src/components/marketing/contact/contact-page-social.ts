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
  },
  {
    id: "facebook",
    iconSrc: CONTACT_PAGE_ASSETS.iconFacebook,
    width: 13,
    height: 23,
  },
] as const satisfies readonly {
  id: ContactSocialPlatform;
  iconSrc: string;
  width: number;
  height: number;
}[];

/** Instagram + Facebook icons — only platforms with studio URLs are returned. */
export function resolveContactSocialIconLinks(
  studioLinks: StudioSocialLink[],
): ContactSocialIconLink[] {
  return CONTACT_SOCIAL_ICON_DEFS.flatMap((definition) => {
    const match = studioLinks.find(
      (link) => link.label.toLowerCase() === definition.id,
    );
    const href = match?.url.trim();
    if (href === undefined || href.length === 0) {
      return [];
    }

    return [
      {
        id: definition.id,
        href,
        iconSrc: definition.iconSrc,
        width: definition.width,
        height: definition.height,
      },
    ];
  });
}
