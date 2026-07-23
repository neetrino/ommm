import {
  coachCardDisplayName,
  type CoachCardData,
} from "@/components/coaches/coach-card-display";
import type { CoachSlideCopy } from "@/components/marketing/home/featured-coach-slide-card";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";
import { limitCoachesPageGridCards } from "@/components/marketing/coaches/coaches-page-fallback-coaches";

/** Featured Coaches carousel — max slides on the home page. */
export const HOME_FEATURED_COACHES_MAX_SLIDES = 6;

function resolveCoachPortraitSrc(avatarUrl: string | null | undefined): string {
  const trimmed = avatarUrl?.trim();
  return trimmed !== undefined && trimmed.length > 0
    ? trimmed
    : HOME_SECTION_ASSETS.coachPortrait;
}

function withDefaultPortrait(slide: CoachSlideCopy): CoachSlideCopy {
  return {
    ...slide,
    imageSrc: resolveCoachPortraitSrc(slide.imageSrc),
  };
}

function mapCoachToSlide(
  coach: CoachCardData,
  experienceLabel: (years: number) => string,
  fallbackRole: string,
  fallbackBio: string,
): CoachSlideCopy {
  const name = coachCardDisplayName(coach.user);
  const role = coach.specialization?.trim() || fallbackRole;
  const bio = coach.bio?.trim() || fallbackBio;
  const experience =
    coach.experienceYears !== null && coach.experienceYears > 0
      ? experienceLabel(coach.experienceYears)
      : "";

  return {
    name,
    role,
    bio,
    experience,
    imageAlt: name,
    imageSrc: resolveCoachPortraitSrc(coach.user.avatarUrl),
  };
}

/**
 * Builds Featured Coaches slides — real coaches from API when available,
 * otherwise i18n placeholders.
 */
export function buildFeaturedCoachSlides(
  coaches: readonly CoachCardData[],
  fallbackSlides: readonly CoachSlideCopy[],
  experienceLabel: (years: number) => string,
): CoachSlideCopy[] {
  const fallbackRole = fallbackSlides[0]?.role ?? "";
  const fallbackBio = fallbackSlides[0]?.bio ?? "";

  if (coaches.length === 0) {
    return fallbackSlides
      .slice(0, HOME_FEATURED_COACHES_MAX_SLIDES)
      .map(withDefaultPortrait);
  }

  const fromApi = limitCoachesPageGridCards([...coaches]).map((coach) =>
    mapCoachToSlide(coach, experienceLabel, fallbackRole, fallbackBio),
  );

  return fromApi.length > 0
    ? fromApi
    : fallbackSlides.slice(0, HOME_FEATURED_COACHES_MAX_SLIDES).map(withDefaultPortrait);
}

export function resolveCoachSlidePortraitSrc(slide: CoachSlideCopy): string {
  return resolveCoachPortraitSrc(slide.imageSrc);
}
