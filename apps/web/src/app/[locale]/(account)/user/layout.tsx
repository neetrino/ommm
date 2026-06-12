import type { ReactNode } from "react";
import { headers } from "next/headers";
import { MemberAccountHub } from "@/components/account/member-account-hub";
import { MemberUserMobileViewport } from "@/components/account/member-user-mobile-viewport";
import { UserMemberShellLayout } from "@/components/account/user-member-shell-layout";
import { isMemberUserNotificationsPath } from "@/lib/member-user-hub-sheet-paths";
import { OMMM_PATHNAME_HEADER } from "@/lib/ui-locale-constants";
import { loadMemberAccountHubProfile } from "@/server/member-account-hub-profile-data";

type UserLayoutProps = {
  children: ReactNode;
  sheet?: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function UserLayout({ children, sheet = null, params }: UserLayoutProps) {
  const [{ locale }, requestPath] = await Promise.all([
    params,
    headers().then((value) => value.get(OMMM_PATHNAME_HEADER) ?? ""),
  ]);
  const hasMobileSheet = sheet != null;
  const onNotificationsRoute = isMemberUserNotificationsPath(requestPath);
  const hubProfile = onNotificationsRoute ? await loadMemberAccountHubProfile() : null;

  return (
    <UserMemberShellLayout params={params}>
      <MemberUserMobileViewport
        hasMobileSheet={hasMobileSheet}
        hasDesktopNotificationsSheet={onNotificationsRoute}
        hubBackdrop={
          hubProfile ? (
            <MemberAccountHub locale={locale} {...hubProfile} />
          ) : null
        }
      >
        {children}
      </MemberUserMobileViewport>
      {sheet}
    </UserMemberShellLayout>
  );
}
