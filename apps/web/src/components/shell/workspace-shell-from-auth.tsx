import type { ReactNode } from "react";
import { memberAccountHubProfileFromAuthUser } from "@/components/account/member-account-hub-profile";
import { resolveMarketingHeaderAccount } from "@/lib/resolve-marketing-header-account";
import { isUserDashboardRole } from "@/lib/role-home";
import type { LayoutAuthUser } from "@/server/require-role-layout";
import {
  WorkspaceShell,
  type WorkspaceShellProps,
} from "@/components/shell/workspace-shell";

export type WorkspaceShellFromAuthProps = Omit<
  WorkspaceShellProps,
  "account"
> & {
  authUser: LayoutAuthUser;
};

/** Server wrapper — resolves account menu props then mounts workspace chrome. */
export function WorkspaceShellFromAuth({
  authUser,
  children,
  ...shellProps
}: WorkspaceShellFromAuthProps & { children: ReactNode }) {
  const account = resolveMarketingHeaderAccount(authUser);
  if (!account) {
    return null;
  }

  const memberAccountMenu = isUserDashboardRole(authUser.role)
    ? memberAccountHubProfileFromAuthUser(authUser)
    : null;

  return (
    <WorkspaceShell
      account={account}
      memberAccountMenu={memberAccountMenu}
      {...shellProps}
    >
      {children}
    </WorkspaceShell>
  );
}
