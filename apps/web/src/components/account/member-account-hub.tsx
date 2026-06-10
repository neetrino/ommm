import { MemberAccountHubMenuPanel } from "@/components/account/member-account-hub-menu-panel";
import { memberAccountHubLayout } from "@/components/account/member-account-hub-layout";
import type { MemberAccountHubProfile } from "@/components/account/member-account-hub-profile";

export type MemberAccountHubProps = MemberAccountHubProfile & {
  locale: string;
};

export function MemberAccountHub({ locale, ...profile }: MemberAccountHubProps) {
  void locale;

  return (
    <div className={memberAccountHubLayout.page}>
      <MemberAccountHubMenuPanel {...profile} />
    </div>
  );
}
