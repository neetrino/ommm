export type StudioSocialLink = {
  label: string;
  url: string;
};

export type StudioSocialPlatform = "instagram" | "facebook";

export type StudioPublicSettings = {
  studioName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  whatsappUrl: string | null;
  address: string | null;
  mapEmbedUrl: string | null;
  workingHours: string | null;
  socialLinksJson: string | null;
  cancellationHoursNotice: number;
  waitlistOfferMinutes: number;
};

function capitalizePlatform(name: string): string {
  if (name.length === 0) {
    return name;
  }
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Parses studio `socialLinksJson` — object map of platform name → URL.
 */
export function listStudioSocialLinks(json: string | null): StudioSocialLink[] {
  if (json === null || json.trim().length === 0) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return [];
    }

    return Object.entries(parsed)
      .filter((entry): entry is [string, string] => {
        const [platform, url] = entry;
        return (
          typeof platform === "string" &&
          typeof url === "string" &&
          url.trim().length > 0
        );
      })
      .map(([platform, url]) => ({
        label: capitalizePlatform(platform),
        url: url.trim(),
      }));
  } catch {
    return [];
  }
}

function parseSocialLinksRecord(json: string | null): Record<string, string> {
  if (json === null || json.trim().length === 0) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] => {
        const [platform, url] = entry;
        return typeof platform === "string" && typeof url === "string";
      }),
    );
  } catch {
    return {};
  }
}

/** Reads a single platform URL from studio `socialLinksJson`. */
export function getStudioSocialPlatformUrl(
  json: string | null,
  platform: StudioSocialPlatform,
): string {
  const record = parseSocialLinksRecord(json);
  const url = record[platform]?.trim();
  return url !== undefined && url.length > 0 ? url : "";
}

type BuildStudioSocialLinksInput = {
  instagramUrl?: string;
  facebookUrl?: string;
  existingJson: string | null;
};

/** Builds `socialLinksJson` for PATCH /studio, preserving unknown platforms. */
export function buildStudioSocialLinksJson({
  instagramUrl = "",
  facebookUrl = "",
  existingJson,
}: BuildStudioSocialLinksInput): string | null {
  const record = parseSocialLinksRecord(existingJson);

  const instagram = instagramUrl.trim();
  const facebook = facebookUrl.trim();

  if (instagram.length > 0) {
    record.instagram = instagram;
  } else {
    delete record.instagram;
  }

  if (facebook.length > 0) {
    record.facebook = facebook;
  } else {
    delete record.facebook;
  }

  const entries = Object.entries(record).filter(
    ([, url]) => typeof url === "string" && url.trim().length > 0,
  );

  if (entries.length === 0) {
    return null;
  }

  return JSON.stringify(Object.fromEntries(entries));
}
