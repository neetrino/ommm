import {
  memberAccountHubProfileFromAuthUser,
  type MemberAccountHubProfile,
} from "@/components/account/member-account-hub-profile";
import { getCachedUsersMe } from "@/server/cached-users-me";

/** Lightweight `/users/me` read for the mobile hub backdrop behind section sheets. */
export async function loadMemberAccountHubProfile(): Promise<MemberAccountHubProfile | null> {
  const me = await getCachedUsersMe();

  if (!me.ok) {
    return null;
  }

  return memberAccountHubProfileFromAuthUser({
    name: me.data.user.name ?? null,
    lastName: me.data.user.lastName ?? null,
    email: me.data.user.email ?? "",
    homeImageUrl: me.data.user.homeImageUrl ?? null,
  });
}
