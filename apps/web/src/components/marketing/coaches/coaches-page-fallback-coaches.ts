import type { CoachCardData } from "@/components/coaches/coach-card-display";
import { COACHES_PAGE_LAYOUT } from "@/components/marketing/coaches/coaches-page-tokens";

export type CoachesPageSlideCopy = {
  name: string;
  role: string;
  bio: string;
  experience?: string;
};

const PLACEHOLDER_CARD_COUNT =
  COACHES_PAGE_LAYOUT.gridColumns * COACHES_PAGE_LAYOUT.gridRows;

function splitCoachName(fullName: string): { name: string | null; lastName: string | null } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { name: null, lastName: null };
  }
  if (parts.length === 1) {
    return { name: parts[0] ?? null, lastName: null };
  }
  return { name: parts[0] ?? null, lastName: parts.slice(1).join(" ") };
}

function parseExperienceYears(experience: string | undefined): number | null {
  if (!experience) {
    return null;
  }
  const match = experience.match(/(\d+)/);
  if (!match) {
    return null;
  }
  const years = Number.parseInt(match[1], 10);
  return Number.isFinite(years) ? years : null;
}

/** Marketing placeholders — Figma grid `62:2206` (6 cards) when API has no active coaches. */
export function buildCoachesPageFallbackCoaches(
  slides: CoachesPageSlideCopy[],
): CoachCardData[] {
  if (slides.length === 0) {
    return [];
  }

  const source: CoachesPageSlideCopy[] = [...slides];
  while (source.length < PLACEHOLDER_CARD_COUNT) {
    source.push(slides[source.length % slides.length]);
  }

  return source.slice(0, PLACEHOLDER_CARD_COUNT).map((slide, index) => {
    const { name, lastName } = splitCoachName(slide.name);
    return {
      id: `coaches-page-placeholder-${index}`,
      bio: slide.bio,
      specialization: slide.role,
      experienceYears: parseExperienceYears(slide.experience),
      user: {
        name,
        lastName,
        email: `coach-${index + 1}@ommm.space`,
        avatarUrl: null,
      },
    };
  });
}

export function isCoachesPagePlaceholderId(coachId: string): boolean {
  return coachId.startsWith("coaches-page-placeholder-");
}
