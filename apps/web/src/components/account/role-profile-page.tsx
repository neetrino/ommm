import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AccountProfileInfoForm } from "@/components/account/account-profile-info-form";
import { AccountChangePasswordForm } from "@/components/account/account-change-password-form";
import { AccountHomeImageForm } from "@/components/account/account-home-image-form";
import { DeleteAccountButton } from "@/components/account/delete-account-button";
import { AccountSection } from "@/components/layout/account-section";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
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
  coachProfileId?: string | null;
  coachBio?: string | null;
};

type WorkspaceNoteVariant = "admin" | "coach" | "manager" | "contentAdmin";

type RoleProfilePageProps = {
  locale: string;
  showRole?: boolean;
  workspaceNoteVariant?: WorkspaceNoteVariant;
  shellChrome?: "member" | "admin";
  embeddedInSheet?: boolean;
};

export async function RoleProfilePage({
  locale,
  showRole = false,
  workspaceNoteVariant,
  shellChrome,
  embeddedInSheet = false,
}: RoleProfilePageProps) {
  const t = await getTranslations({ locale, namespace: "userPages.profile" });
  const tStaff = await getTranslations({ locale, namespace: "staffProfile" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<MeResponse>("/users/me", cookie);

  if (!res.ok) {
    return (
      <div className="ommm-container">
        <div className="app-alert-warn">{t("signInPrompt")}</div>
      </div>
    );
  }

  const { user } = res.data;
  const coachProfileId = res.data.coachProfileId ?? null;
  const coachBio = user.role === "COACH" ? (res.data.coachBio ?? null) : null;
  const homePreviewUrl = resolveApiAssetUrl(user.homeImageUrl ?? null) ?? null;
  const workspaceHeading =
    workspaceNoteVariant !== undefined
      ? tStaff(`workspace.${workspaceNoteVariant}.heading`)
      : null;
  const workspaceBody =
    workspaceNoteVariant !== undefined
      ? tStaff(`workspace.${workspaceNoteVariant}.body`)
      : null;

  const isMemberProfile = shellChrome === "member";

  const body = (
    <div className="w-full space-y-8">
      <AccountSection title={t("accountInfo")}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="mx-auto w-full max-w-[300px] lg:col-span-4 lg:mx-0 lg:max-w-none xl:col-span-3">
            <AccountHomeImageForm initialPreviewUrl={homePreviewUrl} />
          </div>
          <div className="min-w-0 lg:col-span-8 xl:col-span-9">
            <AccountProfileInfoForm
              initialUser={user}
              showRole={showRole}
              coachProfileId={user.role === "COACH" ? coachProfileId : null}
              initialBio={user.role === "COACH" ? coachBio : undefined}
            />
          </div>
        </div>
      </AccountSection>

      <AccountSection title={t("security")}>
        <AccountChangePasswordForm
          hasPassword={user.hasPassword}
          embedded
          mobileSubmitAlignEnd={isMemberProfile}
        />
      </AccountSection>

      {workspaceHeading !== null && workspaceBody !== null ? (
        <AccountSection title={workspaceHeading}>
          <p className="ommm-body-muted text-sm">{workspaceBody}</p>
        </AccountSection>
      ) : null}

      {user.role !== "COACH" ? (
        <DeleteAccountButton
          appearance="dangerButton"
          wrapperClassName={isMemberProfile ? "max-md:w-full max-md:items-end" : ""}
        />
      ) : null}
    </div>
  );

  if (shellChrome === "admin" || workspaceNoteVariant === "admin") {
    return (
      <AdminContentFrame>
        <div className="space-y-4">
          <AdminPageHero title={t("title")} description={t("description")} />
          {body}
        </div>
      </AdminContentFrame>
    );
  }

  if (embeddedInSheet) {
    return body;
  }

  return (
    <MemberContentFrame>
      <div className="space-y-4">
        <AdminPageHero title={t("title")} description={t("description")} />
        {body}
      </div>
    </MemberContentFrame>
  );
}
