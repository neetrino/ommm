import type { ReactNode } from "react";
import { headers } from "next/headers";
import { MemberHubBackdropHost } from "@/components/account/member-hub-backdrop-host";
import { MemberUserMobileViewport } from "@/components/account/member-user-mobile-viewport";
import { UserMemberShellLayout } from "@/components/account/user-member-shell-layout";
import {
  isMemberUserHubSheetPath,
  isMemberUserNotificationsPath,
} from "@/lib/member-user-hub-sheet-paths";
import { OMMM_PATHNAME_HEADER } from "@/lib/ui-locale-constants";
import { loadMemberAccountHubProfile } from "@/server/member-account-hub-profile-data";

export const dynamic = "force-dynamic";

type UserLayoutProps = {
  children: ReactNode;
  sheet?: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function UserLayout({ children, sheet = null, params }: UserLayoutProps) {
  const { locale } = await params;
  const hasMobileSheet = sheet != null;
  const requestPath = (await headers()).get(OMMM_PATHNAME_HEADER) ?? "";
  const onSheetRoute = isMemberUserHubSheetPath(requestPath);
  const onNotificationsRoute = isMemberUserNotificationsPath(requestPath);
  const hubProfile =
    hasMobileSheet || onSheetRoute ? await loadMemberAccountHubProfile() : null;

  return (
    <UserMemberShellLayout params={params}>
      <MemberUserMobileViewport
        hasMobileSheet={hasMobileSheet || onSheetRoute}
        hasDesktopNotificationsSheet={onNotificationsRoute}
        hubBackdrop={
          hasMobileSheet || onSheetRoute ? (
            <MemberHubBackdropHost locale={locale} profile={hubProfile} />
          ) : null
        }
      >
        {children}
      </MemberUserMobileViewport>
      {sheet}
    </UserMemberShellLayout>
  );
}
