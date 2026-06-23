/** Yandex pin — matches `HOME_FOOTER_ADDRESS_HREF` (25 Pushkin St, Yerevan). */
const CONTACT_MAP_CENTER = {
  lng: 44.512935,
  lat: 40.182167,
  zoom: 17,
} as const;

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}

/** Builds lazy iframe markup for the contact page map block. */
export function buildContactMapIframeHtml(embedSrc: string): string {
  const safeSrc = escapeHtmlAttribute(embedSrc);
  return `<iframe title="Studio location map" src="${safeSrc}" width="100%" height="100%" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
}

function getContactPageDefaultMapEmbedSrc(): string {
  const ll = `${CONTACT_MAP_CENTER.lng},${CONTACT_MAP_CENTER.lat}`;
  const params = new URLSearchParams({
    ll,
    z: String(CONTACT_MAP_CENTER.zoom),
    pt: `${ll},pm2rdm`,
  });
  return `https://yandex.com/map-widget/v1/?${params.toString()}`;
}

/**
 * Studio `mapEmbedUrl` may be a bare embed URL or full iframe HTML.
 * Falls back to the public studio address on Yandex Maps.
 */
export function resolveContactMapEmbedHtml(studioMapEmbedUrl: string | null | undefined): string {
  const trimmed = studioMapEmbedUrl?.trim();
  if (trimmed !== undefined && trimmed.length > 0) {
    if (trimmed.startsWith("<")) {
      return trimmed;
    }
    return buildContactMapIframeHtml(trimmed);
  }

  return buildContactMapIframeHtml(getContactPageDefaultMapEmbedSrc());
}
