import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AccountProfileInfoForm } from "@/components/account/account-profile-info-form";
import { AccountChangePasswordForm } from "@/components/account/account-change-password-form";
import { AccountHomeImageForm } from "@/components/account/account-home-image-form";
import { NotificationPrefsForm } from "@/components/account/notification-prefs-form";
import {
  AccountPageFrame,
  AccountSection,
} from "@/components/layout/account-page-frame";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import { serverApiJson } from "@/lib/server-api";

type NotificationPrefs = {
  bookingReminders: boolean;
  waitlistAlerts: boolean;
  promotions: boolean;
  communityUpdates: boolean;
};

type MeResponse = {
  user: {
    email: string;
    name: string | null;
    lastName: string | null;
    phone: string | null;
    locale: string;
    role: string;
    homeImageUrl?: string | null;
  };
  notificationPrefs: NotificationPrefs;
};

type WorkspaceNoteVariant = "admin" | "coach" | "manager";

type RoleProfilePageProps = {
  locale: string;
  showRole?: boolean;
  workspaceNoteVariant?: WorkspaceNoteVariant;
};

export async function RoleProfilePage({
  locale,
  showRole = false,
  workspaceNoteVariant,
}: RoleProfilePageProps) {
  const t = await getTranslations({ locale, namespace: "userPages.profile" });
  const tStaff = await getTranslations({ locale, namespace: "staffProfile" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MeResponse>("/users/me", cookie);

  if (!res.ok) {
    return (
      <div className="ommm-container pt-6 sm:pt-8">
        <div className="app-alert-warn">{t("signInPrompt")}</div>
      </div>
    );
  }

  const { user, notificationPrefs } = res.data;
  const homePreviewUrl = resolveApiAssetUrl(user.homeImageUrl ?? null);
  const workspaceHeading =
    workspaceNoteVariant !== undefined
      ? tStaff(`workspace.${workspaceNoteVariant}.heading`)
      : null;
  const workspaceBody =
    workspaceNoteVariant !== undefined
      ? tStaff(`workspace.${workspaceNoteVariant}.body`)
      : null;

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <div className="max-w-4xl space-y-10">
        <AccountSection title={t("accountInfo")}>
          <AccountProfileInfoForm initialUser={user} showRole={showRole} />
        </AccountSection>

        <AccountSection title={t("security")}>
          <AccountChangePasswordForm />
        </AccountSection>

        <AccountSection title={t("homeImage")}>
          <AccountHomeImageForm initialPreviewUrl={homePreviewUrl} />
        </AccountSection>

        <AccountSection title={t("preferences")}>
          <div className="max-w-md">
            <NotificationPrefsForm initial={notificationPrefs} />
          </div>
        </AccountSection>

        {workspaceHeading !== null && workspaceBody !== null ? (
          <AccountSection title={workspaceHeading}>
            <p className="ommm-body-muted">{workspaceBody}</p>
          </AccountSection>
        ) : null}
      </div>
    </AccountPageFrame>
  );
}
