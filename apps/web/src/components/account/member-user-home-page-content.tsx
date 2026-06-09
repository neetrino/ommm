import { getTranslations } from "next-intl/server";
import { MemberAccountHub } from "@/components/account/member-account-hub";
import { memberAccountHubProfileFromAuthUser } from "@/components/account/member-account-hub-profile";
import { MemberDashboardDeferred } from "@/components/account/account-deferred-server-sections";
import homeViewportStyles from "@/components/account/member-user-home-viewports.module.css";
import { MemberUserHomeSignInPanel } from "@/components/account/member-user-home-sign-in-panel";
import { loadMemberUserHomePageData } from "@/server/member-user-home-page-data";

type MemberUserHomePageContentProps = {
  locale: string;
};

export async function MemberUserHomePageContent({ locale }: MemberUserHomePageContentProps) {
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
      <div className={homeViewportStyles.desktopViewport}>
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
      </div>
      <div className={homeViewportStyles.mobileViewport}>
        <MemberAccountHub locale={locale} {...memberAccountHubProfileFromAuthUser(user)} />
      </div>
    </>
  );
}
