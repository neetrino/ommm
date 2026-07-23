export type StudioSettingsSectionId = "identity" | "location" | "contact";

export const STUDIO_SETTINGS_SECTION_IDS: readonly StudioSettingsSectionId[] = [
  "identity",
  "location",
  "contact",
] as const;

export function isStudioSettingsSectionId(value: string): value is StudioSettingsSectionId {
  return (STUDIO_SETTINGS_SECTION_IDS as readonly string[]).includes(value);
}
