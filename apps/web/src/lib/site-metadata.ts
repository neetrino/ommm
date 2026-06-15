/** Default site metadata for link previews (Open Graph, Twitter, WhatsApp). */
const SITE_NAME = "Ommm․";
const SITE_DESCRIPTION =
  "Calm studio, personal experience — thoughtful scheduling, packages, and class booking.";

const OG_IMAGE_PATH = "/og-image.png";
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

const LOCAL_DEV_ORIGIN = "http://localhost:3000";

/**
 * Absolute origin for metadata URLs (Open Graph, canonical, etc.).
 * Uses `NEXT_PUBLIC_SITE_URL`, then Vercel preview/production host.
 */
export function resolveSiteMetadataBase(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) {
    return new URL(`${configured}/`);
  }

  const vercelUrl = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
  if (vercelUrl) {
    return new URL(`https://${vercelUrl}/`);
  }

  return new URL(`${LOCAL_DEV_ORIGIN}/`);
}

export const siteMetadata = {
  siteName: SITE_NAME,
  description: SITE_DESCRIPTION,
  ogImage: {
    url: OG_IMAGE_PATH,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    alt: "Ommm studio emblem",
    type: "image/png",
  },
} as const;
