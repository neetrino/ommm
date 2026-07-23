import { MemberAccountHubMenuPanel } from "@/components/account/member-account-hub-menu-panel";
import { memberAccountHubLayout } from "@/components/account/member-account-hub-layout";
import type { MemberAccountHubProfile } from "@/components/account/member-account-hub-profile";

export type MemberAccountHubProps = MemberAccountHubProfile & {
  locale: string;
};

function withoutLocale(props: MemberAccountHubProps): MemberAccountHubProfile {
  const profile = { ...props };
  delete (profile as Partial<MemberAccountHubProps>).locale;
  return profile;
}

export function MemberAccountHub(props: MemberAccountHubProps) {
  const profile = withoutLocale(props);

  return (
    <div className={memberAccountHubLayout.page}>
      <MemberAccountHubMenuPanel {...profile} />
    </div>
  );
}
