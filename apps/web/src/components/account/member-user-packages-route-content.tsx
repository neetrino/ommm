import { headers } from "next/headers";
import { UserPackagesSection } from "@/components/account/user-packages-section";
import { serverApiJson } from "@/lib/server-api";
import type { UserMembershipRow } from "@/lib/user-package-types";

type MemberUserPackagesRouteContentProps = {
  locale: string;
  embeddedInSheet?: boolean;
};

export async function MemberUserPackagesRouteContent({
  locale,
  embeddedInSheet = false,
}: MemberUserPackagesRouteContentProps) {
  const cookie = (await headers()).get("cookie") ?? "";
  const membershipsRes = await serverApiJson<UserMembershipRow[]>("/packages/me", cookie);
  const memberships = membershipsRes.ok ? membershipsRes.data : [];

  return (
    <UserPackagesSection
      locale={locale}
      memberships={memberships}
      apiOk={membershipsRes.ok}
      embeddedInSheet={embeddedInSheet}
    />
  );
}
