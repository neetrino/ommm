import type { ReactNode } from "react";
import { resolveMarketingHeaderAccount } from "@/lib/resolve-marketing-header-account";
import type { LayoutAuthUser } from "@/server/require-role-layout";
import { getFilteredMarketingNavLinks } from "@/server/home-sections-visibility";
import {
  WorkspaceShell,
  type WorkspaceShellProps,
} from "@/components/shell/workspace-shell";

export type WorkspaceShellFromAuthProps = Omit<
  WorkspaceShellProps,
  "account" | "marketingNavLinks"
> & {
  authUser: LayoutAuthUser;
};

/** Server wrapper — resolves account menu props then mounts workspace chrome. */
export async function WorkspaceShellFromAuth({
  authUser,
  children,
  ...shellProps
}: WorkspaceShellFromAuthProps & { children: ReactNode }) {
  const account = resolveMarketingHeaderAccount(authUser);
  if (!account) {
    return null;
  }

  const marketingNavLinks = await getFilteredMarketingNavLinks();

  return (
    <WorkspaceShell account={account} marketingNavLinks={marketingNavLinks} {...shellProps}>
      {children}
    </WorkspaceShell>
  );
}
