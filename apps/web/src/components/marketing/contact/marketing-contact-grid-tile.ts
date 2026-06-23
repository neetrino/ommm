import type { ContactSocialPlatform } from "@/components/marketing/contact/contact-page-social";

/** Single contact info tile in the 3×2 grid. */
export type MarketingContactGridTile = {
  key: string;
  label?: string;
  value: string;
  href?: string;
  iconSrc?: string;
  socialIcon?: ContactSocialPlatform;
  variant?: "callout";
};

/** Instagram profile URL → `@handle` for display. */
export function formatInstagramHandle(url: string): string {
  try {
    const segments = new URL(url).pathname.split("/").filter((segment) => segment.length > 0);
    const handle = segments[segments.length - 1];
    return handle !== undefined ? `@${handle}` : "Instagram";
  } catch {
    return "Instagram";
  }
}
