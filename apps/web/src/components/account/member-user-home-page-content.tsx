import { getTranslations } from "next-intl/server";
import { MemberDashboard } from "@/components/account/member-dashboard";
import { MemberUserHomeSignInPanel } from "@/components/account/member-user-home-sign-in-panel";
import { loadMemberUserHomePageData } from "@/server/member-user-home-page-data";

type MemberUserHomePageContentProps = {
  locale: string;
};

/** Member `/user` — same dashboard on mobile and desktop (hub remains for sheet backdrops). */
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
  );
}
