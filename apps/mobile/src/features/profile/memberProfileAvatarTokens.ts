/** Shared member profile avatar fallback — aligned with web `ommm-member-account-hub-avatar`. */
export const MEMBER_PROFILE_AVATAR_FILL = "rgba(151,144,124,0.77)" as const;
export const MEMBER_PROFILE_AVATAR_INITIALS_COLOR = "#2d3530" as const;

const HUB_REFERENCE_SIZE = 68;
const HUB_REFERENCE_INITIALS_SIZE = 28;

/** Scales initials typography to the avatar diameter. */
export function memberProfileAvatarInitialsFontSize(avatarSize: number): number {
  return Math.round(avatarSize * (HUB_REFERENCE_INITIALS_SIZE / HUB_REFERENCE_SIZE));
}
