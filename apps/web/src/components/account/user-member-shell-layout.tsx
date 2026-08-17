import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { RequiredPhoneCompletionGate } from "@/components/account/required-phone-completion-gate";
import { SessionReviewPromptGate } from "@/components/account/session-review-prompt-gate";
import { ApiUnavailablePanel } from "@/components/server/api-unavailable-panel";
import { WorkspaceShellFromAuth } from "@/components/shell/workspace-shell-from-auth";
import {
  dashboardNavDefinitionsForRole,
  dashboardNotificationRouteForRole,
} from "@/lib/dashboard-nav";
import { USER_ACCOUNT_PATH } from "@/lib/role-home";
import { getCachedUsersMe } from "@/server/cached-users-me";
import {
  redirectIfPreferredAccountLocale,
  redirectIfRoleNotIn,
  requireAuthForLayout,
} from "@/server/require-role-layout";

const USER_ROLES = new Set<string>(["USER"]);

/** Authenticated member (USER) dashboard chrome — `/user/*` namespace. */
export async function UserMemberShellLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [authOutcome, tDash, me] = await Promise.all([
    requireAuthForLayout(locale),
    getTranslations({ locale, namespace: "dashboard" }),
    getCachedUsersMe(),
  ]);
  if (authOutcome.kind === "api_unavailable") {
    return <ApiUnavailablePanel />;
  }
  const { role, userLocale } = authOutcome.auth;
  await redirectIfPreferredAccountLocale(locale, userLocale);
  redirectIfRoleNotIn(locale, role, USER_ROLES);
  const navDefinitions = dashboardNavDefinitionsForRole(role);
  const notificationRoute = dashboardNotificationRouteForRole(role);
  const needsPhoneCompletion = me.ok
    ? Boolean(me.data.needsPhoneCompletion)
    : false;

  return (
    <WorkspaceShellFromAuth
      authUser={authOutcome.auth.authUser}
      brandHref={USER_ACCOUNT_PATH}
      brandLabel={tDash("brand.member.title")}
      brandSubline={tDash("brand.member.subline")}
      variant="member"
      contentMaxClass="w-full"
      navRole="USER"
      navDefinitions={navDefinitions}
      notificationRoute={notificationRoute}
    >
      <RequiredPhoneCompletionGate
        initialNeedsPhoneCompletion={needsPhoneCompletion}
      />
      <SessionReviewPromptGate deferAutoPrompt={needsPhoneCompletion} />
      {children}
    </WorkspaceShellFromAuth>
  );
}
