import {
  isLazySectionMounted,
  markLazySectionMounted,
} from "@/lib/lazy-section-mount-state";

const HOME_LAZY_SECTION_SCOPE = "home";

export function isHomeLazySectionMounted(id: string): boolean {
  return isLazySectionMounted(HOME_LAZY_SECTION_SCOPE, id);
}

export function markHomeLazySectionMounted(id: string): void {
  markLazySectionMounted(HOME_LAZY_SECTION_SCOPE, id);
}
