import { headers } from "next/headers";
import {
  memberAccountHubProfileFromAuthUser,
  type MemberAccountHubProfile,
} from "@/components/account/member-account-hub-profile";
import { serverApiJson } from "@/lib/server-api";

type MeResponse = {
  user: {
    name: string | null;
    lastName: string | null;
    email: string;
    homeImageUrl?: string | null;
  };
};

/** Lightweight `/users/me` read for the mobile hub backdrop behind section sheets. */
export async function loadMemberAccountHubProfile(): Promise<MemberAccountHubProfile | null> {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MeResponse>("/users/me", cookie);

  if (!res.ok) {
    return null;
  }

  return memberAccountHubProfileFromAuthUser(res.data.user);
}
