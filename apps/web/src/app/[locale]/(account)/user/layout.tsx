import type { ReactNode } from "react";
import { MemberAccountHub } from "@/components/account/member-account-hub";
import { MemberUserMobileViewport } from "@/components/account/member-user-mobile-viewport";
import { UserMemberShellLayout } from "@/components/account/user-member-shell-layout";
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
  const hubProfile = hasMobileSheet ? await loadMemberAccountHubProfile() : null;

  return (
    <UserMemberShellLayout params={params}>
      <MemberUserMobileViewport
        hasMobileSheet={hasMobileSheet}
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
