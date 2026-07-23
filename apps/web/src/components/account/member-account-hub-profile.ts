import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import { userDisplayInitials } from "@/lib/user-display-initials";
import { userDisplayName } from "@/lib/user-display-name";

/** Serialized member identity for the account hub menu (client-safe). */
export type MemberAccountHubProfile = {
  displayName: string;
  email: string;
  initials: string;
  imageSrc: string | null;
};

export function memberAccountHubProfileFromAuthUser(user: {
  name: string | null;
  lastName: string | null;
  email: string;
  homeImageUrl?: string | null;
}): MemberAccountHubProfile {
  return {
    displayName: userDisplayName(user.name, user.lastName, user.email),
    email: user.email,
    initials: userDisplayInitials(user.name, user.lastName, user.email),
    imageSrc: resolveApiAssetUrl(user.homeImageUrl ?? null) ?? null,
  };
}
