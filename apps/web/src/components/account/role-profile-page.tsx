import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AccountProfileInfoForm } from "@/components/account/account-profile-info-form";
import { AccountChangePasswordForm } from "@/components/account/account-change-password-form";
import { AccountHomeImageForm } from "@/components/account/account-home-image-form";
import { DeleteAccountButton } from "@/components/account/delete-account-button";
import {
  AccountPageFrame,
  AccountSection,
} from "@/components/layout/account-page-frame";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import { userDisplayInitials } from "@/lib/user-display-initials";
import { serverApiJson } from "@/lib/server-api";

type MeResponse = {
  user: {
    email: string;
    name: string | null;
    lastName: string | null;
    phone: string | null;
    locale: string;
    role: string;
    hasPassword: boolean;
    homeImageUrl?: string | null;
    dateOfBirth?: string | null;
  };
};

type WorkspaceNoteVariant = "admin" | "coach" | "manager" | "contentAdmin";

type RoleProfilePageProps = {
  locale: string;
  showRole?: boolean;
  workspaceNoteVariant?: WorkspaceNoteVariant;
  shellChrome?: "member" | "admin";
};

export async function RoleProfilePage({
  locale,
  showRole = false,
  workspaceNoteVariant,
  shellChrome,
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

  const { user } = res.data;
  const homePreviewUrl = resolveApiAssetUrl(user.homeImageUrl ?? null) ?? null;
  const initials = userDisplayInitials(user.name, user.lastName, user.email);
  const workspaceHeading =
    workspaceNoteVariant !== undefined
      ? tStaff(`workspace.${workspaceNoteVariant}.heading`)
      : null;
  const workspaceBody =
    workspaceNoteVariant !== undefined
      ? tStaff(`workspace.${workspaceNoteVariant}.body`)
      : null;

  const body = (
    <div className="w-full space-y-8">
      <AccountSection title={t("accountInfo")}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="mx-auto w-full max-w-[300px] lg:col-span-4 lg:mx-0 lg:max-w-none xl:col-span-3">
            <AccountHomeImageForm
              initialPreviewUrl={homePreviewUrl}
              initials={initials}
            />
          </div>
          <div className="min-w-0 lg:col-span-8 xl:col-span-9">
            <AccountProfileInfoForm initialUser={user} showRole={showRole} />
          </div>
        </div>
      </AccountSection>

      <AccountSection title={t("security")}>
        <AccountChangePasswordForm hasPassword={user.hasPassword} embedded />
      </AccountSection>

      {workspaceHeading !== null && workspaceBody !== null ? (
        <AccountSection title={workspaceHeading}>
          <p className="ommm-body-muted text-sm">{workspaceBody}</p>
        </AccountSection>
      ) : null}

      <DeleteAccountButton />
    </div>
  );

  if (shellChrome === "admin" || workspaceNoteVariant === "admin") {
    return (
      <AdminContentFrame description={t("description")}>{body}</AdminContentFrame>
    );
  }
  if (shellChrome === "member") {
    return (
      <MemberContentFrame description={t("description")}>{body}</MemberContentFrame>
    );
  }
  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      {body}
    </AccountPageFrame>
  );
}
