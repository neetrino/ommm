import { MemberAccountHubMenuPanel } from "@/components/account/member-account-hub-menu-panel";
import type { MemberAccountHubProfile } from "@/components/account/member-account-hub-profile";
import { MemberContentFrame } from "@/components/layout/member-content-frame";

export type MemberAccountHubProps = MemberAccountHubProfile & {
  locale: string;
};

export function MemberAccountHub(props: MemberAccountHubProps) {
  const { locale: _locale, ...profile } = props;

  return (
    <MemberContentFrame>
      <MemberAccountHubMenuPanel {...profile} />
    </MemberContentFrame>
  );
}
