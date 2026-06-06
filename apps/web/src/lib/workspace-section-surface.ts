/**
 * Global workspace page-section surface (admin + member accounts).
 *
 * - `"plain"` — page content on shell background; form blocks use `ommm-account-section`.
 * - `"card"` — one glass wrapper around entire page body (`AdminContentFrame` / `MemberContentFrame`).
 *
 * Flip this single constant to preview the card layer on **all** workspace pages at once.
 */
export type WorkspaceSectionSurface = "plain" | "card";

export const WORKSPACE_SECTION_SURFACE: WorkspaceSectionSurface = "plain";

export function isWorkspacePageSectionCardEnabled(): boolean {
  return WORKSPACE_SECTION_SURFACE === "card";
}

/** Shared glass panel — used only when {@link WORKSPACE_SECTION_SURFACE} is `"card"`. */
export const WORKSPACE_SECTION_CARD_CLASS =
  "ommm-card flex flex-col gap-6 p-5 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] sm:p-8";

/** Profile / form section — skip inner card when page already wrapped globally. */
export function workspaceAccountSectionClass(extraClassName = ""): string {
  const base = isWorkspacePageSectionCardEnabled() ? "" : "ommm-account-section";
  return [base, extraClassName].filter((part) => part.length > 0).join(" ");
}
