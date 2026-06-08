import { getTranslations } from "next-intl/server";
import { MemberAccountHub } from "@/components/account/member-account-hub";
import { memberAccountHubProfileFromAuthUser } from "@/components/account/member-account-hub-profile";
import { MemberDashboard } from "@/components/account/member-dashboard";
import { MemberUserHomeSignInPanel } from "@/components/account/member-user-home-sign-in-panel";
import { loadMemberUserHomePageData } from "@/server/member-user-home-page-data";

/** Member `/user` — desktop dashboard (legacy), mobile account hub. */
export default async function UserAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tDash = await getTranslations({ locale, namespace: "account.dashboard" });
  const outcome = await loadMemberUserHomePageData(locale);

  if (outcome.kind === "unauthorized") {
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
    <>
      <div className="hidden lg:block">
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
        />
      </div>
      <div className="lg:hidden">
        <MemberAccountHub
          locale={locale}
          {...memberAccountHubProfileFromAuthUser(user)}
        />
      </div>
    </>
  );
}
