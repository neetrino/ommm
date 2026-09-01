import { MemberDashboard } from "@/components/account/member-dashboard";
import { MemberUserHomeSignInPanel } from "@/components/account/member-user-home-sign-in-panel";
import { loadMemberUserHomePageData } from "@/server/member-user-home-page-data";
import { getTranslations } from "next-intl/server";

export default async function UserDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const outcome = await loadMemberUserHomePageData(locale);

  if (outcome.kind === "unauthorized") {
    const [tCommon, tDash] = await Promise.all([
      getTranslations({ locale, namespace: "common" }),
      getTranslations({ locale, namespace: "account.dashboard" }),
    ]);
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
    <MemberDashboard
      locale={locale}
      name={user.name}
      lastName={user.lastName}
      email={user.email}
      nextBooking={nextBooking}
      waitlistOk={waitlistOk}
      waitlistRows={waitlistRows}
      achievements={achievements}
      coachProfileId={coachProfileId}
      showBackToAccount
    />
  );
}
