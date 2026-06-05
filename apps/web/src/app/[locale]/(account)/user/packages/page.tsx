import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { UserPackagesSection } from "@/components/account/user-packages-section";
import { AccountSection } from "@/components/layout/account-page-frame";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { serverApiJson } from "@/lib/server-api";
import type { UserMembershipRow } from "@/lib/user-package-types";

export default async function UserPackagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "userPages.packages" });
  const m = await getTranslations({ locale, namespace: "marketing" });
  const cookie = (await headers()).get("cookie") ?? "";

  const membershipsRes = await serverApiJson<UserMembershipRow[]>("/packages/me", cookie);
  const memberships = membershipsRes.ok ? membershipsRes.data : [];

  return (
    <MemberContentFrame description={m("packagesPageLead")}>
      <div className="max-w-6xl">
        <AccountSection title={t("yourPackages")}>
          <UserPackagesSection
            locale={locale}
            memberships={memberships}
            apiOk={membershipsRes.ok}
          />
        </AccountSection>
      </div>
    </MemberContentFrame>
  );
}
