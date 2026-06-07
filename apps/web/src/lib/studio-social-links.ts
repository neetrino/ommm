export type StudioSocialLink = {
  label: string;
  url: string;
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
