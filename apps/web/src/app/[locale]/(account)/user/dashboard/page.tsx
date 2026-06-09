import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { MemberDashboardDeferred } from "@/components/account/account-deferred-server-sections";
import { MemberUserHomeSignInPanel } from "@/components/account/member-user-home-sign-in-panel";
import { MemberPageLoading } from "@/components/account/member-page-loading";
import { loadMemberUserHomePageData } from "@/server/member-user-home-page-data";

export default async function UserDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const outcome = await loadMemberUserHomePageData(locale);

  if (outcome.kind === "unauthorized") {
    const tCommon = await getTranslations({ locale, namespace: "common" });
    const tDash = await getTranslations({ locale, namespace: "account.dashboard" });
    return (
      <MemberUserHomeSignInPanel
        title={tDash("signIn.title")}
        body={tDash("signIn.body")}
        loginLabel={tCommon("login")}
      />
    );
  }

  const { user, coachProfileId, achievements, nextBooking, waitlistOk, waitlistRows } =
    outcome.data;

  return (
    <Suspense fallback={<MemberPageLoading />}>
      <MemberDashboardDeferred
        locale={locale}
        name={user.name}
        lastName={user.lastName}
        email={user.email}
        nextBooking={nextBooking}
        waitlistOk={waitlistOk}
        waitlistRows={waitlistRows}
        achievements={achievements}
        coachProfileId={coachProfileId}
      />
    </Suspense>
  );
}
