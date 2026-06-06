import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { UserPackagesSection } from "@/components/account/user-packages-section";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { serverApiJson } from "@/lib/server-api";
import type { UserMembershipRow } from "@/lib/user-package-types";

export default async function UserPackagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const m = await getTranslations({ locale, namespace: "marketing" });
  const cookie = (await headers()).get("cookie") ?? "";

  const membershipsRes = await serverApiJson<UserMembershipRow[]>("/packages/me", cookie);
  const memberships = membershipsRes.ok ? membershipsRes.data : [];

  return (
    <MemberContentFrame>
      <UserPackagesSection
        locale={locale}
        description={m("packagesPageLead")}
        memberships={memberships}
        apiOk={membershipsRes.ok}
      />
    </MemberContentFrame>
  );
}
